import type { Post } from './posts'
import { ApiError } from './apiError'

export interface Category {
  id: number
  name: string
}

interface PostCreateRequest {
  title: string
  content: string
  categoryId: number
}

function isPositiveId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

function isCategory(value: unknown): value is Category {
  return typeof value === 'object' && value !== null
    && 'id' in value && isPositiveId(value.id)
    && 'name' in value && typeof value.name === 'string'
}

export async function fetchCategories(accessToken: string, signal: AbortSignal): Promise<Category[]> {
  const response = await fetch('/api/categories', {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  })
  if (!response.ok) throw new ApiError(response.status)

  const categories: unknown = await response.json()
  if (!Array.isArray(categories) || !categories.every(isCategory)) {
    throw new Error('카테고리 응답 형식 오류')
  }
  return categories
}

// 인증된 게시글 등록
export async function createPost(request: PostCreateRequest, accessToken: string): Promise<number> {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new ApiError(response.status)

  const id: unknown = await response.json()
  if (!isPositiveId(id)) throw new Error('게시글 등록 응답 형식 오류')
  return id
}

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
