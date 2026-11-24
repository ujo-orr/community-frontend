import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../apiError'
import { createPost, fetchCategories, type Category } from '../postsApi'

interface PostComposerProps {
  accessToken: string | null
  onUnauthorized: () => void
  onRefreshPosts: () => void
}

export default function PostComposer({ accessToken, onUnauthorized, onRefreshPosts }: PostComposerProps) {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [categoryError, setCategoryError] = useState('')
  const [categoryRevision, setCategoryRevision] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    const controller = new AbortController()

    void fetchCategories(accessToken, controller.signal).then(result => {
      if (!controller.signal.aborted) setCategories(result)
    }).catch((cause: unknown) => {
      if (controller.signal.aborted) return
      if (cause instanceof ApiError && cause.status === 401) {
        onUnauthorized()
      } else {
        setCategoryError('카테고리를 불러오지 못했습니다.')
      }
    })

    return () => controller.abort()
  }, [accessToken, categoryRevision, onUnauthorized])

  // 게시글 입력 검증 및 등록 결과 반영
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessToken || pending) return
    setCreated(false)

    if (!title.trim() || title.length > 100) {
      setError('제목을 100자 이하로 입력해 주세요.')
      return
    }
    if (!content.trim() || content.length > 10000) {
      setError('내용을 10,000자 이하로 입력해 주세요.')
      return
    }
    const category = categories?.find(item => String(item.id) === categoryId)
    if (!category) {
      setError('카테고리를 선택해 주세요.')
      return
    }

    setError('')
    setPending(true)
    try {
      await createPost({ title, content, categoryId: category.id }, accessToken)
      setTitle('')
      setContent('')
      setCategoryId('')
      setCreated(true)
      onRefreshPosts()
    } catch (cause) {
      const status = cause instanceof ApiError ? cause.status : 0
      if (status === 401) {
        setCategories(null)
        setCategoryId('')
        onUnauthorized()
      } else if (status === 403) {
        setError('게시글을 작성할 권한이 없습니다.')
      } else if (status === 400) {
        setError('제목, 내용, 카테고리의 입력값을 확인해 주세요.')
      } else if (status === 404) {
        setCategories(null)
        setCategoryId('')
        setCategoryRevision(previous => previous + 1)
        setError('카테고리 목록이 변경되었습니다. 다시 선택해 주세요.')
      } else {
        setError('등록 결과를 확인하지 못했습니다. 목록을 확인한 뒤 다시 시도해 주세요.')
        onRefreshPosts()
      }
    } finally {
      setPending(false)
    }
  }

  if (!accessToken) return null

  return (
    <form className="board-form" aria-labelledby="composer-heading" noValidate onSubmit={handleSubmit}>
      <h2 id="composer-heading">게시글 작성</h2>
      <fieldset disabled={pending}>
        <label>제목<input value={title} onChange={event => setTitle(event.target.value)} maxLength={100} required /></label>
        <label>내용<textarea value={content} onChange={event => setContent(event.target.value)} maxLength={10000} rows={4} required /></label>
        <label>
          카테고리
          <select value={categoryId} onChange={event => setCategoryId(event.target.value)} disabled={!categories?.length} required>
            <option value="">카테고리 선택</option>
            {categories?.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <button type="submit" disabled={!categories?.length}>{pending ? '등록 중…' : '등록'}</button>
      </fieldset>
      {categoryError ? (
        <>
          <p role="alert">{categoryError}</p>
          <button type="button" onClick={() => {
            setCategoryError('')
            setCategoryRevision(previous => previous + 1)
          }}>카테고리 다시 불러오기</button>
        </>
      ) : !categories ? <p role="status">카테고리를 불러오는 중입니다.</p>
        : categories.length === 0 && <p role="status">등록된 카테고리가 없습니다.</p>}
      {error && <p role="alert">{error}</p>}
      {created && <p role="status">게시글을 등록했습니다.</p>}
    </form>
  )
}
