import { useState } from 'react'
import type { Post } from '../posts'

// Java의 메서드 매개변수처럼 카드가 부모에게서 받는 입력의 타입
interface PostCardProps {
  post: Post
}

// props 객체에서 post를 꺼내 게시글 한 건의 화면을 반환하는 함수형 컴포넌트
export default function PostCard({ post }: PostCardProps) {
  // 카드별 본문 표시 여부와 상태 변경 함수 (초기값 true: 펼침)
  const [isExpanded, setIsExpanded] = useState(true)
  const bodyId = `post-body-${post.id}`

  // 이전 상태의 반대값으로 전환하는 클릭 이벤트 핸들러
  function handleToggle() {
    setIsExpanded(previous => !previous)
  }

  return (
    <article className="post-card">
      <h2>{post.title}</h2>
      <button
        type="button"
        className="post-toggle"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={bodyId}
      >
        {isExpanded ? '본문 접기' : '본문 펼치기'}
      </button>
      <p id={bodyId} hidden={!isExpanded}>{post.body}</p>
      <footer>
        {post.author}
        {post.date !== null && <> · <time dateTime={post.date}>{post.date}</time></>}
      </footer>
    </article>
  )
}
