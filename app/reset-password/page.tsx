'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/context/LanguageContext'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const { lang } = useLang()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleReset() {
    if (password.length < 6) return setError(lang === 'ko' ? '비밀번호는 6자 이상이어야 해' : 'Password must be at least 6 characters')
    if (password !== confirm) return setError(lang === 'ko' ? '비밀번호가 일치하지 않아' : 'Passwords do not match')
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div className="app-shell">
      <div className="app-card" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>✅</p>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>
          {lang === 'ko' ? '비밀번호가 변경됐어!' : 'Password updated!'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
          {lang === 'ko' ? '새 비밀번호로 로그인해봐.' : 'You can now log in with your new password.'}
        </p>
        <button className="btn-primary" onClick={() => router.push('/login')}>
          {lang === 'ko' ? '로그인하기' : 'Go to login'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="app-card" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>🔒</p>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>
          {lang === 'ko' ? '새 비밀번호 설정' : 'Set new password'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
          {lang === 'ko' ? '새 비밀번호를 입력해줘.' : 'Enter your new password below.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input className="input-field" type="password"
            placeholder={lang === 'ko' ? '새 비밀번호 (6자 이상)' : 'New password (min. 6 characters)'}
            value={password} onChange={e => setPassword(e.target.value)}/>
          <input className="input-field" type="password"
            placeholder={lang === 'ko' ? '비밀번호 확인' : 'Confirm password'}
            value={confirm} onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleReset()}/>
          {error && <p style={{ fontSize: 13, color: '#E24B4A' }}>{error}</p>}
          <button className="btn-primary" onClick={handleReset} disabled={loading}>
            {loading ? '...' : (lang === 'ko' ? '변경하기' : 'Update password')}
          </button>
        </div>
      </div>
    </div>
  )
}
