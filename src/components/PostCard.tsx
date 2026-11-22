import type { Post } from '../posts'

// Java의 메서드 매개변수처럼 카드가 부모에게서 받는 입력의 타입
interface PostCardProps {
  post: Post
}

// props 객체에서 post를 꺼내 게시글 한 건의 화면을 반환하는 함수형 컴포넌트
export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <footer>{post.author} · <time dateTime={post.date}>{post.date}</time></footer>
    </article>
  )
}
