'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message) }
    else { router.push('/'); router.refresh() }
    setLoading(false)
  }

  return (
    <div className="app-shell">
      <div className="app-card flex flex-col justify-center" style={{ minHeight: '100vh' }}>

        {/* 로고 */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--green-50)', border: '1px solid var(--green-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3C10 3 6 7 6 11a4 4 0 008 0c0-4-4-8-4-8z" fill="#639922"/>
              <path d="M10 11V17" stroke="#639922" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 32, marginBottom: 8, lineHeight: 1.1 }}>
            {isSignUp ? 'Start small.\nGrow deep.' : 'Welcome\nback.'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>
            {isSignUp ? 'Up to 3 habits. That\'s the rule.' : 'Your habits are waiting.'}
          </p>
        </div>

        {/* 폼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p style={{ color: '#E24B4A', fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? '...' : isSignUp ? 'Create account' : 'Log in'}
          </button>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '8px 0', cursor: 'pointer', background: 'none', border: 'none' }}>
            {isSignUp ? 'Already have an account → Log in' : 'New here → Create account'}
          </button>
        </div>

      </div>
    </div>
  )
}
