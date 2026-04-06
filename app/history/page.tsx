'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useHabits } from '@/hooks/useHabits'
import { useRouter } from 'next/navigation'
import ShareCard from '@/components/ShareCard'
import type { SupabaseClient } from '@supabase/supabase-js'

function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })
}

const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function HistoryPage() {
  const supabase = useRef<SupabaseClient>(createClient()).current
  const { habits, loading: habitsLoading } = useHabits()
  const [logs, setLogs] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [showShareCard, setShowShareCard] = useState(false)
  const router = useRouter()
  const days = getLast30Days()
  const today = days[days.length - 1]

  useEffect(() => {
    if (habits.length === 0) { setLoading(false); return }
    fetchLogs()
  }, [habits.map(h => h.id).join(',')])

  async function fetchLogs() {
    const { data } = await supabase
      .from('habit_logs')
      .select('habit_id, logged_date')
      .in('habit_id', habits.map(h => h.id))
      .gte('logged_date', days[0])
    if (!data) return
    const map: Record<string, string[]> = {}
    for (const h of habits) map[h.id] = []
    for (const log of data) { if (map[log.habit_id]) map[log.habit_id].push(log.logged_date) }
    setLogs(map)
    setLoading(false)
  }

  function getRatio(date: string): number {
    if (habits.length === 0) return 0
    return habits.filter(h => logs[h.id]?.includes(date)).length / habits.length
  }

  function getColor(ratio: number, date: string): string {
    if (date > today) return '#F1EFE8'
    if (ratio === 0)  return '#E8E6E0'
    if (ratio < 0.5)  return '#C0DD97'
    if (ratio < 1)    return '#97C459'
    return '#639922'
  }

  function calcStreak(): number {
    let streak = 0
    for (let i = days.length - 1; i >= 0; i--) {
      const d = days[i]
      if (d > today) continue
      if (getRatio(d) === 1) streak++
      else break
    }
    return streak
  }

  const pastDays = days.filter(d => d <= today)
  const perfectDays = pastDays.filter(d => getRatio(d) === 1).length
  const rate = pastDays.length > 0 ? Math.round((perfectDays / pastDays.length) * 100) : 0
  const streak = calcStreak()
  const has7DayStreak = streak >= 7

  const firstDayOfWeek = new Date(days[0]).getDay()
  const paddedDays: (string | null)[] = [...Array(firstDayOfWeek).fill(null), ...days]
  const weeks: (string | null)[][] = []
  for (let i = 0; i < paddedDays.length; i += 7) weeks.push(paddedDays.slice(i, i + 7))

  if (habitsLoading || loading) return (
    <div className="app-shell">
      <div className="app-card" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="app-card">

        <button onClick={() => router.push('/')}
          style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 32, padding: 0, fontFamily: 'DM Sans, sans-serif' }}>
          ← Back
        </button>

        <h1 style={{ fontSize: 30, marginBottom: 6 }}>Last 30 days</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>The pattern reveals the direction.</p>

        {/* 7일 연속 특별 공유 카드 */}
        {has7DayStreak && (
          <div style={{
            background: 'var(--green-50)', border: '1.5px solid var(--green-100)',
            borderRadius: 20, padding: 20, marginBottom: 24, textAlign: 'center'
          }}>
            <p style={{ fontSize: 32, marginBottom: 4 }}>🔥</p>
            <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--green-600)', marginBottom: 4 }}>
              {streak}-day streak
            </p>
            <p style={{ fontSize: 13, color: 'var(--green-600)', opacity: 0.8, marginBottom: 16, lineHeight: 1.5 }}>
              {streak >= 30 ? 'A full month of consistency. Remarkable.'
                : streak >= 14 ? 'Two weeks strong. Keep going.'
                : '7 days straight. You\'re building something real.'}
            </p>
            <button onClick={() => setShowShareCard(true)} style={{
              background: 'var(--green-400)', color: 'white',
              border: 'none', borderRadius: 12, padding: '11px 24px',
              fontSize: 14, fontWeight: 500,
              fontFamily: 'DM Sans, sans-serif', cursor: 'pointer'
            }}>
              Share my {streak}-day streak
            </button>
          </div>
        )}

        {/* 요약 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 32 }}>
          {[
            { value: `${rate}%`, label: 'completion' },
            { value: `${perfectDays}d`, label: 'perfect days' },
            { value: `${streak}d`, label: 'current streak' },
          ].map(({ value, label }) => (
            <div key={label} style={{
              background: 'var(--bg)', borderRadius: 16, padding: '16px 12px',
              border: '1px solid var(--border)', textAlign: 'center'
            }}>
              <p style={{ fontSize: 22, fontFamily: 'DM Serif Display, serif', color: 'var(--green-400)', marginBottom: 2 }}>{value}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* 히트맵 */}
        <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, fontWeight: 500 }}>30-day heatmap</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
            {WEEK_LABELS.map(d => (
              <p key={d} style={{ textAlign: 'center', fontSize: 10, color: '#B4B2A9' }}>{d}</p>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {week.map((date, di) => {
                  if (!date) return <div key={di} style={{ aspectRatio: '1' }}/>
                  const isToday = date === today
                  return (
                    <div key={date} style={{
                      aspectRatio: '1', borderRadius: 6,
                      background: getColor(getRatio(date), date),
                      outline: isToday ? '2px solid #639922' : 'none',
                      outlineOffset: 2
                    }}/>
                  )
                })}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, color: '#B4B2A9' }}>0%</span>
            {['#E8E6E0', '#C0DD97', '#97C459', '#639922'].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: 3, background: c }}/>
            ))}
            <span style={{ fontSize: 10, color: '#B4B2A9' }}>100%</span>
          </div>
        </div>

        {/* 습관별 바 */}
        <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, fontWeight: 500 }}>By habit</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {habits.map(habit => {
              const done = logs[habit.id]?.filter(d => d <= today).length || 0
              const pct = Math.round((done / pastDays.length) * 100)
              return (
                <div key={habit.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text)' }}>{habit.name}</span>
                    <span style={{ color: 'var(--green-400)', fontWeight: 500 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 100 }}>
                    <div style={{ height: 6, background: 'var(--green-400)', borderRadius: 100, width: `${pct}%`, transition: 'width 0.6s ease' }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* 공유 카드 모달 */}
      {showShareCard && (
        <ShareCard
          mode="streak"
          streak={streak}
          habits={habits}
          rate={rate}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  )
}
