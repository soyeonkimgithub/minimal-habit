'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleChangePassword() {
    setError('')
    setSuccess(false)

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match')
    }

    setLoading(true)

    // 현재 비밀번호 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return setLoading(false)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (signInError) {
      setLoading(false)
      return setError('Current password is incorrect')
    }

    // 새 비밀번호로 변경
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setLoading(false)
  }

  return (
    <div className="app-shell">
      <div className="app-card">

        <button onClick={() => router.push('/')}
          style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 32, padding: 0, fontFamily: 'DM Sans, sans-serif' }}>
          ← Back
        </button>

        <h1 style={{ fontSize: 30, marginBottom: 6 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Manage your account.</p>

        {/* 비밀번호 변경 */}
        <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>
            Change password
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              className="input-field"
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
            <input
              className="input-field"
              type="password"
              placeholder="New password (min. 6 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <input
              className="input-field"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />

            {error && (
              <p style={{ fontSize: 13, color: '#E24B4A' }}>{error}</p>
            )}
            {success && (
              <p style={{ fontSize: 13, color: 'var(--green-400)', fontWeight: 500 }}>
                ✓ Password updated successfully!
              </p>
            )}

            <button
              className="btn-primary"
              onClick={handleChangePassword}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              style={{ marginTop: 4 }}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
