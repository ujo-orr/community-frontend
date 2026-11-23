import { useEffect, useState } from 'react'
import PostCard from './components/PostCard'
import type { Post } from './posts'
import { fetchPosts } from './postsApi'
import './App.css'

type PostsState =
  | { status: 'loading' }
  | { status: 'success'; posts: Post[]; totalElements: number }
  | { status: 'error' }

export default function App() {
  const [state, setState] = useState<PostsState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    // 초기 게시글 조회와 화면 상태 반영
    async function loadPosts() {
      try {
        const page = await fetchPosts(controller.signal)
        if (!controller.signal.aborted) {
          setState({
            status: 'success',
            posts: page.content,
            totalElements: page.totalElements,
          })
        }
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: 'error' })
        }
      }
    }

    void loadPosts()
    return () => controller.abort()
  }, [])

  return (
    <main className="board">
      <header className="board-header">
        <h1>게시글 목록</h1>
        {state.status === 'success' && <span>총 {state.totalElements}건</span>}
      </header>
      {state.status === 'loading' && <p role="status">게시글을 불러오는 중입니다.</p>}
      {state.status === 'error' && (
        <p role="alert">게시글을 불러오지 못했습니다. 서버 연결을 확인한 뒤 새로고침해 주세요.</p>
      )}
      {state.status === 'success' && (
        state.posts.length > 0 ? (
          <ul className="post-list">
            {state.posts.map(post => (
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
