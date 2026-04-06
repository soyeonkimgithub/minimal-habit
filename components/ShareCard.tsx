'use client'
import { useRef, useState } from 'react'
import type { Habit } from '@/hooks/useHabits'

type Props = {
  mode: 'today' | 'streak'
  streak?: number
  habits: Habit[]
  rate?: number
  onClose: () => void
}

export default function ShareCard({ mode, streak = 0, habits, rate = 0, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [tweeting, setTweeting] = useState(false)

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: mode === 'today' ? '#F7F6F2' : '#F7F6F2',
        useCORS: true,
      })
      const link = document.createElement('a')
      const dateStr = new Date().toISOString().split('T')[0]; link.download = mode === 'today'
        ? `minimal-habit-today-${dateStr}.png`
        : `minimal-habit-${streak}day-streak-${dateStr}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) { console.error(e) }
    setDownloading(false)
  }

  function handleTweet() {
    setTweeting(true)
    const habitList = habits.map(h => `✓ ${h.name}`).join(' · ')
    const text = mode === 'today'
      ? `All done today 🌿\n\n${habitList}\n\n#MinimalHabit #HabitTracking`
      : `${streak} days straight 🔥\n\n${habitList}\n\n#MinimalHabit #HabitTracking`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
    setTimeout(() => setTweeting(false), 1000)
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="overlay" onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}
        onClick={e => e.stopPropagation()}>

        {/* 카드 */}
        <div ref={cardRef} style={{
          background: '#F7F6F2', borderRadius: 24,
          padding: 32, fontFamily: 'DM Sans, sans-serif',
        }}>
          {/* 로고 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: '#EAF3DE', border: '1px solid #C0DD97',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M10 3C10 3 6 7 6 11a4 4 0 008 0c0-4-4-8-4-8z" fill="#639922"/>
                <path d="M10 11V17" stroke="#639922" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, color: '#5F5E5A', fontWeight: 500 }}>Minimal Habit</span>
          </div>

          {/* 메인 */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 48, lineHeight: 1, marginBottom: 8 }}>
              {mode === 'today' ? '🌿' : '🔥'}
            </p>
            <p style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: 36, lineHeight: 1.1,
              color: '#2C2C2A', marginBottom: 6,
              whiteSpace: 'nowrap'
            }}>
              {mode === 'today' ? 'All done today.' : `${streak}-day streak`}
            </p>
            <p style={{ fontSize: 14, color: '#888780' }}>
              {mode === 'today'
                ? 'Every small win counts.'
                : streak >= 30 ? 'A full month of consistency.'
                : streak >= 14 ? 'Two weeks strong.'
                : '7 days straight. Building something real.'}
            </p>
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: '#E8E6E0', marginBottom: 20 }}/>

          {/* 습관 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {habits.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#639922',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="10" height="8" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: 14, color: '#2C2C2A', fontWeight: 500 }}>{h.name}</span>
              </div>
            ))}
          </div>

          {/* streak 모드일 때만 달성률 바 표시 */}
          {mode === 'streak' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888780', marginBottom: 6 }}>
                <span>30-day completion</span>
                <span style={{ color: '#639922', fontWeight: 500 }}>{rate}%</span>
              </div>
              <div style={{ height: 6, background: '#E8E6E0', borderRadius: 100 }}>
                <div style={{ height: 6, background: '#639922', borderRadius: 100, width: `${rate}%` }}/>
              </div>
            </div>
          )}

          <p style={{ fontSize: 12, color: '#B4B2A9' }}>{today}</p>
          <p style={{ fontSize: 12, color: '#639922', marginTop: 4, fontWeight: 500 }}>minimal-habit.vercel.app</p>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleDownload} disabled={downloading}
            className="btn-primary" style={{ flex: 1 }}>
            {downloading ? 'Saving...' : '↓ Save image'}
          </button>
          <button onClick={handleTweet} style={{
            flex: 1, background: '#000', color: 'white',
            border: 'none', borderRadius: 12, padding: 13,
            fontSize: 14, fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif', cursor: 'pointer'
          }}>
            {tweeting ? '...' : '𝕏 Share on X'}
          </button>
        </div>

        <button onClick={onClose} style={{
          width: '100%', background: 'white', color: '#5F5E5A',
          border: '1px solid #E8E6E0', borderRadius: 12, padding: 13,
          fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer'
        }}>Cancel</button>
      </div>
    </div>
  )
}
