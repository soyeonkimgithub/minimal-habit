'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/context/LanguageContext'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const { lang } = useLang()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!email.trim()) return setError(lang === 'ko' ? '이메일을 입력해줘' : 'Please enter your email')
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <div className="app-shell">
      <div className="app-card" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>📬</p>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>
          {lang === 'ko' ? '이메일을 확인해줘' : 'Check your email'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
          {lang === 'ko'
            ? `${email} 로 비밀번호 재설정 링크를 보냈어.`
            : `We sent a password reset link to ${email}.`}
        </p>
        <button onClick={() => router.push('/login')} className="btn-ghost">
          {lang === 'ko' ? '← 로그인으로' : '← Back to login'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="app-card" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <button onClick={() => router.push('/login')}
          style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 32, padding: 0, fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}>
          {lang === 'ko' ? '← 돌아가기' : '← Back'}
        </button>

        <p style={{ fontSize: 40, marginBottom: 16 }}>🔑</p>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>
          {lang === 'ko' ? '비밀번호를 잊었어?' : 'Forgot your password?'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.6 }}>
          {lang === 'ko'
            ? '이메일을 입력하면 재설정 링크를 보내줄게.'
            : 'Enter your email and we\'ll send you a reset link.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="input-field"
            type="email"
            placeholder={lang === 'ko' ? '이메일' : 'Email'}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p style={{ fontSize: 13, color: '#E24B4A' }}>{error}</p>}
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : (lang === 'ko' ? '재설정 링크 보내기' : 'Send reset link')}
          </button>
        </div>
      </div>
    </div>
  )
}
