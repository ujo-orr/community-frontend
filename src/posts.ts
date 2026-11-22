// Java의 DTO처럼 게시글 한 건에 필요한 필드와 타입을 정의하는 인터페이스
export interface Post {
  id: number
  title: string
  body: string
  author: string
  date: string
}

// 서버 실행 없이 목록 화면을 연습하기 위한 임시 데이터
export const posts: Post[] = [
  { id: 3, title: '첫 번째 React 화면을 만들었습니다', body: '게시글 하나를 카드로 만들고, 같은 카드를 목록에서 여러 번 사용해 보았습니다.', author: '동욱', date: '2026-11-22' },
  { id: 2, title: 'Props를 메서드 인자로 이해하기', body: '부모가 건네준 게시글을 자식 컴포넌트에서 읽어 제목과 본문을 표시했습니다.', author: '지민', date: '2026-11-21' },
  { id: 1, title: '함께 공부하는 게시판입니다', body: '공부하면서 발견한 점과 기억하고 싶은 예제를 자유롭게 남겨 주세요.', author: '서윤', date: '2026-11-20' },
]
