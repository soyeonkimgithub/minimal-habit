'use client'
import { useRef, useState } from 'react'
import type { Habit } from '@/hooks/useHabits'
import { useLang } from '@/context/LanguageContext'

type Props = {
  mode: 'today' | 'streak'
  streak?: number
  habits: Habit[]
  rate?: number
  displayName?: string
  onClose: () => void
}

export default function ShareCard({ mode, streak = 0, habits, rate = 0, displayName, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const { t, lang } = useLang()

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, backgroundColor: '#F7F6F2', useCORS: true,
      })
      const dateStr = new Date().toLocaleDateString('en-CA')
      const link = document.createElement('a')
      link.download = mode === 'today'
        ? `minimal-habit-today-${dateStr}.png`
        : `minimal-habit-${streak}day-streak-${dateStr}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) { console.error(e) }
    setDownloading(false)
  }

  const today = new Date().toLocaleDateString(
    lang === 'ko' ? 'ko-KR' : 'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }
  )

  const headline = mode === 'today'
    ? (displayName ? t.well_done(displayName) : t.tagline_done)
    : lang === 'ko' ? `${streak}일 연속` : `${streak}-day streak`

  const subtext = mode === 'today'
    ? (lang === 'ko' ? '작은 성취가 쌓여 큰 변화가 돼.' : 'Every small win counts.')
    : streak >= 30
      ? (lang === 'ko' ? '한 달 개근. 대단해.' : 'A full month of consistency.')
      : streak >= 14
        ? (lang === 'ko' ? '2주 연속. 계속 가.' : 'Two weeks strong.')
        : (lang === 'ko' ? '7일 연속. 진짜 습관이 되고 있어.' : '7 days straight. Building something real.')

  const completionLabel = lang === 'ko' ? '30일 달성률' : '30-day completion'

  return (
    <div className="overlay" onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}
        onClick={e => e.stopPropagation()}>

        {/* 카드 */}
        <div ref={cardRef} style={{
          background: '#F7F6F2', borderRadius: 24,
          padding: 32, fontFamily: lang === 'ko' ? 'sans-serif' : 'DM Sans, sans-serif',
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
            <p style={{ fontSize: 48, lineHeight: 1, marginBottom: 12 }}>
              {mode === 'today' ? '🌿' : '🔥'}
            </p>
            <p style={{
              fontSize: 30, lineHeight: 1.2,
              color: '#2C2C2A', marginBottom: 8, fontWeight: 600
            }}>
              {headline}
            </p>
            <p style={{ fontSize: 14, color: '#888780', lineHeight: 1.5 }}>{subtext}</p>
          </div>

          <div style={{ height: 1, background: '#E8E6E0', marginBottom: 20 }}/>

          {/* 습관 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {habits.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#639922',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <svg width="10" height="8" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: 14, color: '#2C2C2A', fontWeight: 500 }}>{h.name}</span>
              </div>
            ))}
          </div>

          {mode === 'streak' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888780', marginBottom: 6 }}>
                <span>{completionLabel}</span>
                <span style={{ color: '#639922', fontWeight: 500 }}>{rate}%</span>
              </div>
              <div style={{ height: 6, background: '#E8E6E0', borderRadius: 100 }}>
                <div style={{ height: 6, background: '#639922', borderRadius: 100, width: `${rate}%` }}/>
              </div>
            </div>
          )}

          <p style={{ fontSize: 12, color: '#B4B2A9' }}>{today}</p>
          <p style={{ fontSize: 12, color: '#639922', marginTop: 4, fontWeight: 500 }}>minimalhabit.com</p>
        </div>

        <button onClick={handleDownload} disabled={downloading} className="btn-primary">
          {downloading ? '...' : `↓ ${lang === 'ko' ? '이미지 저장' : 'Save image'}`}
        </button>

        <button onClick={onClose} style={{
          width: '100%', background: 'white', color: '#5F5E5A',
          border: '1px solid #E8E6E0', borderRadius: 12, padding: 13,
          fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer'
        }}>{t.cancel}</button>
      </div>
    </div>
  )
}
