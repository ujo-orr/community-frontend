import { useState, type FormEvent } from 'react'
import { ApiError } from '../apiError'
import { login } from '../authApi'

const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/

interface LoginFormProps {
  onLogin: (accessToken: string) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  // 로그인 입력 검증 및 인증 결과 반영
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')

    if (email.length > 30 || !emailPattern.test(email)) {
      setError('이메일을 올바른 형식으로 30자 이하로 입력해 주세요.')
      return
    }
    if (!password.trim() || password.length > 72) {
      setError('비밀번호를 72자 이하로 입력해 주세요.')
      return
    }

    setError('')
    setPending(true)
    try {
      const result = await login({ email, password })
      form.reset()
      if (result.status === 'SUCCESS') {
        onLogin(result.accessToken)
      } else {
        setError('탈퇴 처리 대기 중인 계정입니다.')
      }
    } catch (cause) {
      const status = cause instanceof ApiError ? cause.status : 0
      if (status === 401) setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      else if (status === 403) setError('이용이 제한된 계정입니다.')
      else if (status === 400) setError('이메일과 비밀번호의 입력 형식을 확인해 주세요.')
      else setError('로그인 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="board-form" aria-labelledby="login-heading" noValidate onSubmit={handleSubmit}>
      <h2 id="login-heading">로그인</h2>
      <fieldset disabled={pending}>
        <label>이메일<input name="email" type="email" autoComplete="username" maxLength={30} required /></label>
        <label>비밀번호<input name="password" type="password" autoComplete="current-password" maxLength={72} required /></label>
        <button type="submit">{pending ? '로그인 중…' : '로그인'}</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
