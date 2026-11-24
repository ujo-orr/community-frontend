import { ApiError } from './apiError'

interface LoginRequest {
  email: string
  password: string
}

type LoginResult =
  | { status: 'SUCCESS'; accessToken: string }
  | { status: 'WITHDRAWAL_PENDING' }

// 로그인 응답 확인
export async function login(request: LoginRequest): Promise<LoginResult> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new ApiError(response.status)

  const result: unknown = await response.json()
  if (typeof result === 'object' && result !== null && 'status' in result) {
    if (result.status === 'WITHDRAWAL_PENDING') return { status: result.status }
    if (result.status === 'SUCCESS'
      && 'accessToken' in result
      && typeof result.accessToken === 'string'
      && result.accessToken.trim()) {
      return { status: result.status, accessToken: result.accessToken }
    }
  }
  throw new Error('로그인 응답 형식 오류')
}
