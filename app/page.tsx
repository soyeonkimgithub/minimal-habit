'use client'
import { useState } from 'react'
import { useHabits } from '@/hooks/useHabits'
import { useHabitLogs } from '@/hooks/useHabitLogs'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const TIME_LABELS: Record<string, string> = {
  morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', anytime: 'Anytime'
}
const TIMES = ['morning', 'afternoon', 'evening', 'anytime']

export default function HomePage() {
  const { habits, loading, addHabit, deleteHabit } = useHabits()
  const { checkedToday, streaks, toggleCheck } = useHabitLogs(habits.map(h => h.id))
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [why, setWhy] = useState('')
  const [timeOfDay, setTimeOfDay] = useState('anytime')
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [shared, setShared] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleAdd() {
    if (!name.trim()) return setError('Please enter a habit name')
    try {
      await addHabit(name, why, timeOfDay)
      setName(''); setWhy(''); setTimeOfDay('anytime')
      setShowForm(false); setError('')
    } catch (e: any) { setError(e.message) }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleShareToday() {
    const habitList = habits.map(h => `✓ ${h.name}`).join('\n')
    const text = `All done today. 🌿\n\n${habitList}\n\nBuilding better habits with Minimal Habit.`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Minimal Habit', text })
      } else {
        await navigator.clipboard.writeText(text)
        setShared(true)
        setTimeout(() => setShared(false), 2500)
      }
    } catch {}
  }

  const allDone = habits.length > 0 && habits.every(h => checkedToday.has(h.id))
  const doneCount = habits.filter(h => checkedToday.has(h.id)).length

  if (loading) return (
    <div className="app-shell">
      <div className="app-card" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="app-card">

        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 style={{ fontSize: 30, lineHeight: 1.15 }}>
              {allDone
                ? 'Done for\ntoday. 🌿'
                : habits.length === 0
                  ? 'Build your\nfirst habit.'
                  : `${doneCount} of ${habits.length}\ndone today.`
              }
            </h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, paddingTop: 4 }}>
            <button onClick={() => router.push('/history')}
              style={{ fontSize: 13, color: 'var(--green-400)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              History
            </button>
            <button onClick={handleLogout}
              style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Log out
            </button>
          </div>
        </div>

        {/* 진행 바 */}
        {habits.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 100 }}>
              <div style={{
                height: 4, borderRadius: 100,
                background: allDone ? 'var(--green-400)' : 'var(--green-100)',
                width: `${(doneCount / habits.length) * 100}%`,
                transition: 'width 0.4s ease'
              }}/>
            </div>
          </div>
        )}

        {/* 습관 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {habits.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
                No habits yet.<br/>Start with one thing that matters.
              </p>
            </div>
          )}

          {habits.map(habit => {
            const checked = checkedToday.has(habit.id)
            const streak = streaks[habit.id] || 0
            return (
              <div key={habit.id} className={`habit-card ${checked ? 'checked' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className={`check-btn ${checked ? 'checked' : ''}`} onClick={() => toggleCheck(habit.id)}>
                    {checked && (
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                        <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 500, fontSize: 14,
                      color: checked ? 'var(--green-600)' : 'var(--text)',
                      textDecoration: checked ? 'line-through' : 'none',
                      opacity: checked ? 0.8 : 1
                    }}>{habit.name}</p>
                    {habit.why && (
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {habit.why}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span className="tag">{TIME_LABELS[habit.time_of_day]}</span>
                    {streak > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--green-400)', fontWeight: 500 }}>{streak}d</span>
                    )}
                    <button onClick={() => setDeleteTarget(habit.id)}
                      style={{ color: 'var(--border)', fontSize: 20, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 오늘 완료 공유 버튼 */}
        {allDone && (
          <button onClick={handleShareToday} style={{
            width: '100%',
            background: shared ? 'var(--green-50)' : 'var(--green-400)',
            color: shared ? 'var(--green-600)' : 'white',
            border: shared ? '1.5px solid var(--green-100)' : 'none',
            borderRadius: 16, padding: '14px 0',
            fontSize: 14, fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer', marginBottom: 12,
            transition: 'all 0.2s ease'
          }}>
            {shared ? '✓ Copied to clipboard!' : '🌿 Share today\'s wins'}
          </button>
        )}

        {/* 습관 추가 폼 */}
        {showForm && (
          <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 16, border: '1px solid var(--border)', marginBottom: 12 }}>
            <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 12, color: 'var(--text)' }}>
              What habit do you want to build?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input-field" placeholder="Habit name" value={name} onChange={e => setName(e.target.value)}/>
              <textarea className="input-field" placeholder="Why does this matter? (optional)" rows={2}
                value={why} onChange={e => setWhy(e.target.value)} style={{ resize: 'none' }}/>
              <div style={{ display: 'flex', gap: 6 }}>
                {TIMES.map(t => (
                  <button key={t} onClick={() => setTimeOfDay(t)} style={{
                    flex: 1, padding: '8px 0', fontSize: 12, borderRadius: 10, border: '1px solid',
                    borderColor: timeOfDay === t ? 'var(--green-100)' : 'var(--border)',
                    background: timeOfDay === t ? 'var(--green-50)' : 'white',
                    color: timeOfDay === t ? 'var(--green-600)' : 'var(--muted)',
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500
                  }}>{TIME_LABELS[t]}</button>
                ))}
              </div>
              {error && <p style={{ color: '#E24B4A', fontSize: 12 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" onClick={() => { setShowForm(false); setError('') }}>Cancel</button>
                <button className="btn-primary" onClick={handleAdd}>Add habit</button>
              </div>
            </div>
          </div>
        )}

        {/* 추가 버튼 */}
        {!showForm && habits.length < 3 && (
          <button onClick={() => setShowForm(true)} style={{
            width: '100%', border: '1.5px dashed var(--green-100)',
            borderRadius: 16, padding: '14px 0', fontSize: 14,
            color: 'var(--green-400)', background: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif'
          }}>+ Add habit</button>
        )}

        {habits.length >= 3 && !showForm && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            3 habits max — less is more.
          </p>
        )}

      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Delete this habit?</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>
              Your past logs will be kept, but this habit will disappear from your list.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button onClick={async () => { await deleteHabit(deleteTarget); setDeleteTarget(null) }}
                style={{ flex: 1, background: '#E24B4A', color: 'white', border: 'none', borderRadius: 12, padding: 13, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
