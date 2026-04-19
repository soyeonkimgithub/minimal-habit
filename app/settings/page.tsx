'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/context/LanguageContext'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const { t, lang, setLang } = useLang()

  const [displayName, setDisplayName] = useState('')
  const [nameSaved, setNameSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('displayName') || ''
    setDisplayName(saved)
  }, [])

  function handleSaveName() {
    localStorage.setItem('displayName', displayName)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  async function handleChangePassword() {
    setPwError('')
    setPwSuccess(false)
    if (newPassword.length < 6) return setPwError('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return setPwError('Passwords do not match')
    setPwLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return setPwLoading(false)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email, password: currentPassword
    })
    if (signInError) {
      setPwLoading(false)
      return setPwError('Current password is incorrect')
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) { setPwError(updateError.message) }
    else {
      setPwSuccess(true)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }
    setPwLoading(false)
  }

  return (
    <div className="app-shell">
      <div className="app-card">

        <button onClick={() => router.push('/')}
          style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 32, padding: 0, fontFamily: 'DM Sans, sans-serif' }}>
          {t.back}
        </button>

        <h1 style={{ fontSize: 30, marginBottom: 6 }}>{t.settings_title}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>{t.settings_sub}</p>

        {/* 이름 설정 */}
        <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>
            {t.display_name}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input-field"
              placeholder={t.display_name_placeholder}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              style={{ flex: 1 }}
            />
            <button onClick={handleSaveName}
              style={{
                background: 'var(--green-400)', color: 'white',
                border: 'none', borderRadius: 12, padding: '0 20px',
                fontSize: 14, fontWeight: 500,
                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
              {t.save_name}
            </button>
          </div>
          {nameSaved && (
            <p style={{ fontSize: 13, color: 'var(--green-400)', marginTop: 8, fontWeight: 500 }}>
              {t.name_saved}
            </p>
          )}
        </div>

        {/* 언어 설정 */}
        <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>
            {t.language}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['en', 'ko'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                flex: 1, padding: '10px 0', fontSize: 14, borderRadius: 12, border: '1px solid',
                borderColor: lang === l ? 'var(--green-100)' : 'var(--border)',
                background: lang === l ? 'var(--green-50)' : 'white',
                color: lang === l ? 'var(--green-600)' : 'var(--muted)',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: lang === l ? 500 : 400
              }}>
                {l === 'en' ? '🇺🇸 English' : '🇰🇷 한국어'}
              </button>
            ))}
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>
            {t.change_password}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input-field" type="password" placeholder={t.current_pw}
              value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}/>
            <input className="input-field" type="password" placeholder={t.new_pw}
              value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
            <input className="input-field" type="password" placeholder={t.confirm_pw}
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
            {pwError && <p style={{ fontSize: 13, color: '#E24B4A' }}>{pwError}</p>}
            {pwSuccess && <p style={{ fontSize: 13, color: 'var(--green-400)', fontWeight: 500 }}>{t.pw_updated}</p>}
            <button className="btn-primary" onClick={handleChangePassword}
              disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
              style={{ marginTop: 4 }}>
              {pwLoading ? '...' : t.update_pw}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
