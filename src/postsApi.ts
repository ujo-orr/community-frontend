import type { Post } from './posts'

interface PostResponse {
  id: number
  title: string
  content: string
  writerName: string
  createdAt: string | null
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
}

function isPostResponse(value: unknown): value is PostResponse {
  return typeof value === 'object' && value !== null
    && 'id' in value && typeof value.id === 'number' && Number.isSafeInteger(value.id)
    && 'title' in value && typeof value.title === 'string'
    && 'content' in value && typeof value.content === 'string'
    && 'writerName' in value && typeof value.writerName === 'string'
    && 'createdAt' in value && (typeof value.createdAt === 'string' || value.createdAt === null)
}

function isPostPage(value: unknown): value is PageResponse<PostResponse> {
  return typeof value === 'object' && value !== null
    && 'totalElements' in value && typeof value.totalElements === 'number'
    && Number.isSafeInteger(value.totalElements) && value.totalElements >= 0
    && 'content' in value && Array.isArray(value.content) && value.content.every(isPostResponse)
}

// 게시글 첫 페이지 조회 및 카드 데이터 변환
export async function fetchPosts(signal: AbortSignal): Promise<PageResponse<Post>> {
  const response = await fetch('/api/posts', { signal })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const page: unknown = await response.json()
  if (!isPostPage(page)) {
    throw new Error('게시글 응답 형식 오류')
  }

  return {
    content: page.content.map(post => ({
      id: post.id,
      title: post.title,
      body: post.content,
      author: post.writerName,
      date: post.createdAt?.slice(0, 10) ?? null,
    })),
    totalElements: page.totalElements,
  }
}
