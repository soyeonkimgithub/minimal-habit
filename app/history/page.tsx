'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useHabits } from '@/hooks/useHabits'
import { useRouter } from 'next/navigation'
import ShareCard from '@/components/ShareCard'
import { useLang } from '@/context/LanguageContext'
import type { Habit } from '@/hooks/useHabits'
import type { SupabaseClient } from '@supabase/supabase-js'

function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toLocaleDateString('en-CA')
  })
}

const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Popup = {
  date: string
  x: number
  y: number
}

export default function HistoryPage() {
  const supabase = useRef<SupabaseClient>(createClient()).current
  const { habits: activeHabits, loading: habitsLoading } = useHabits()
  const [allHabits, setAllHabits] = useState<Habit[]>([])

  useEffect(() => {
    async function fetchAllHabits() {
      const { data } = await supabase
        .from('habits')
        .select('id, name, why, time_of_day, is_active')
      if (data) setAllHabits(data)
    }
    fetchAllHabits()
  }, [])

  const habits = allHabits.length > 0 ? allHabits : activeHabits
  const [logs, setLogs] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [showShareCard, setShowShareCard] = useState(false)
  const { t } = useLang()
  const [displayName, setDisplayName] = useState('')
  const [dailyHabits, setDailyHabits] = useState<Record<string, {id: string, name: string, done: boolean}[]>>({})
  const [popup, setPopup] = useState<Popup | null>(null)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('displayName') || ''
    setDisplayName(saved)
  }, [])
  const days = getLast30Days()
  const today = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    if (allHabits.length === 0) return
    fetchLogs()
  }, [allHabits.map(h => h.id).join(',')])

  useEffect(() => {
    function handleClick() { setPopup(null) }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  async function fetchLogs() {
    const { data } = await supabase
      .from('habit_logs')
      .select('habit_id, logged_date, habit_name')
      .in('habit_id', allHabits.map(h => h.id))
      .gte('logged_date', days[0])
    if (!data) return
    const map: Record<string, string[]> = {}
    for (const h of habits) map[h.id] = []
    for (const log of data) { if (map[log.habit_id]) map[log.habit_id].push(log.logged_date) }
    setLogs(map)

    // 날짜별 실제 habit_name 기록 저장
    const nameMap: Record<string, {id: string, name: string, done: boolean}[]> = {}
    for (const log of data) {
      if (!nameMap[log.logged_date]) nameMap[log.logged_date] = []
      if (log.habit_name) {
        const exists = nameMap[log.logged_date].find(x => x.id === log.habit_id)
        if (!exists) nameMap[log.logged_date].push({ id: log.habit_id, name: log.habit_name, done: true })
      }
    }
    setDailyHabits(nameMap)
    setLoading(false)
  }

  function getRatio(date: string): number {
    const dayLogs = Object.values(logs).filter(dates => dates.includes(date))
    const totalThatDay = Object.keys(logs).filter(id => {
      const habitLogs = logs[id]
      return habitLogs && habitLogs.length > 0
    }).length
    if (totalThatDay === 0) return 0
    // 그날 체크된 수 / 그날 존재했던 습관 수
    const checkedCount = dayLogs.length
    // habit_logs에서 그날 로그 수로 계산
    const allLogsForDay = Object.values(logs).filter(dates => dates.includes(date)).length
    const habitsExistedThatDay = dailyHabits[date]?.length || habits.length
    if (habitsExistedThatDay === 0) return 0
    return allLogsForDay / habitsExistedThatDay
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

  function handleCellClick(e: React.MouseEvent, date: string) {
    if (date > today) return
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setPopup({
      date,
      x: rect.left + rect.width / 2,
      y: rect.top
    })
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  const pastDays = days.filter(d => d <= today)
  const perfectDays = pastDays.filter(d => getRatio(d) === 1).length
  const rate = pastDays.length > 0 ? Math.round((perfectDays / pastDays.length) * 100) : 0
  const streak = calcStreak()
  const has7DayStreak = streak >= 7

  const firstDayOfWeek = new Date(days[0] + 'T00:00:00').getDay()
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
          {t.back}
        </button>

        <h1 style={{ fontSize: 30, marginBottom: 6 }}>{t.history_title}</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>{t.history_sub}</p>

        {/* 7일 연속 공유 카드 */}
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
                : t.back === '← Back' ? '7 days straight. You\'re building something real.' : '7일 연속. 진짜 습관이 되고 있어.'}
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

        {/* 요약 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 32 }}>
          {[
            { value: `${rate}%`, label: t.completion },
            { value: `${perfectDays}d`, label: t.perfect_days },
            { value: `${streak}d`, label: t.current_streak },
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
        <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', marginBottom: 16, position: 'relative' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4, fontWeight: 500 }}>{t.heatmap}</p>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14, opacity: 0.7 }}>{t.tap_day}</p>

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
                  const ratio = getRatio(date)
                  const isToday = date === today
                  const isFuture = date > today
                  return (
                    <div
                      key={date}
                      onClick={(e) => handleCellClick(e, date)}
                      style={{
                        aspectRatio: '1', borderRadius: 6,
                        background: getColor(ratio, date),
                        outline: isToday ? '2px solid #639922' : 'none',
                        outlineOffset: 2,
                        cursor: isFuture ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-end',
                        padding: '2px 3px',
                        transition: 'opacity 0.1s',
                      }}
                    >
                      <span style={{
                        fontSize: 8, lineHeight: 1,
                        color: ratio > 0 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.25)',
                        fontFamily: 'DM Sans, sans-serif',
                        pointerEvents: 'none'
                      }}>
                        {new Date(date + 'T00:00:00').getDate()}
                      </span>
                    </div>
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



      </div>

      {/* 날짜 클릭 팝업 */}
      {popup && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: Math.min(popup.x - 110, window.innerWidth - 240),
            top: popup.y - 140,
            width: 220,
            background: 'white',
            borderRadius: 14,
            padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid var(--border)',
            zIndex: 100,
          }}
        >
          {/* 날짜 */}
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, fontWeight: 500 }}>
            {formatDate(popup.date)}
          </p>

          {/* 습관 목록 — 그날 실제 기록 기준 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dailyHabits[popup.date] && dailyHabits[popup.date].length > 0 ? (
              dailyHabits[popup.date].map(habit => (
                <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: '#639922',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <svg width="9" height="7" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{habit.name}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>No habits completed.</p>
            )}
          </div>

          {/* 꼬리 삼각형 */}
          <div style={{
            position: 'absolute', bottom: -6, left: '50%',
            transform: 'translateX(-50%)',
            width: 12, height: 6,
            background: 'white',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            borderBottom: '1px solid var(--border)'
          }}/>
        </div>
      )}

      {/* 공유 카드 */}
      {showShareCard && (
        <ShareCard
          mode="streak"
          streak={streak}
          habits={activeHabits}
          rate={rate}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  )
}
