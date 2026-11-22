import PostCard from './components/PostCard'
import { posts } from './posts'
import './App.css'

export default function App() {
  return (
    <main className="board">
      <header className="board-header">
        <h1>게시글 목록</h1>
        <span>총 {posts.length}건</span>
      </header>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </main>
  )
}
