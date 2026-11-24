import { useCallback, useEffect, useState } from 'react'
import LoginForm from './components/LoginForm'
import PostCard from './components/PostCard'
import PostComposer from './components/PostComposer'
import type { Post } from './posts'
import { fetchPosts } from './postsApi'
import './App.css'

export default function App() {
  const [page, setPage] = useState<{ content: Post[]; totalElements: number } | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [revision, setRevision] = useState(0)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const handleUnauthorized = useCallback(() => {
    setAccessToken(null)
    setNotice('인증이 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요.')
  }, [])

  function refreshPosts() {
    setStatus('loading')
    setRevision(previous => previous + 1)
  }

  useEffect(() => {
    const controller = new AbortController()

    // 초기 게시글 조회와 화면 상태 반영
    async function loadPosts() {
      try {
        const page = await fetchPosts(controller.signal)
        if (!controller.signal.aborted) {
          setPage(page)
          setStatus('success')
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus('error')
        }
      }
    }

    void loadPosts()
    return () => controller.abort()
  }, [revision])

  return (
    <main className="board">
      <header className="board-header">
        <h1>게시글 목록</h1>
        {page && <span>총 {page.totalElements}건</span>}
      </header>
      {notice && <p role="status">{notice}</p>}
      {!accessToken && (
        <LoginForm onLogin={token => {
          setAccessToken(token)
          setNotice('로그인했습니다.')
        }} />
      )}
      <PostComposer
        accessToken={accessToken}
        onUnauthorized={handleUnauthorized}
        onRefreshPosts={refreshPosts}
      />
      {status === 'loading' && <p role="status">게시글을 불러오는 중입니다.</p>}
      {status === 'error' && (
        <>
          <p role="alert">게시글 목록을 불러오지 못했습니다.</p>
          <button type="button" onClick={refreshPosts}>목록 다시 불러오기</button>
        </>
      )}
      {page && (
        page.content.length > 0 ? (
          <ul className="post-list">
            {page.content.map(post => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        ) : <p>등록된 게시글이 없습니다.</p>
      )}
    </main>
  )
}
