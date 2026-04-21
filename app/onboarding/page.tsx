'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/context/LanguageContext'

const steps = [
  {
    emoji: '🌿',
    title_en: 'Start small. Grow deep.',
    title_ko: '작게 시작해. 깊이 성장해.',
    desc_en: 'Most habit apps overwhelm you with features. We do the opposite.',
    desc_ko: '대부분의 습관 앱은 너무 많은 기능으로 압도해. 우린 반대야.',
  },
  {
    emoji: '3️⃣',
    title_en: '3 habits. That\'s the rule.',
    title_ko: '습관은 3개. 그게 규칙이야.',
    desc_en: 'Research shows that trying to build too many habits at once leads to failure. Pick 3. Do them every day.',
    desc_ko: '한 번에 너무 많은 습관을 만들려고 하면 실패해. 3개를 골라. 매일 해.',
  },
  {
    emoji: '🔥',
    title_en: 'Track your streak.',
    title_ko: '연속 기록을 쌓아가.',
    desc_en: 'Check off your habits daily. Watch your streak grow. Share your wins.',
    desc_ko: '매일 습관을 체크해. 스트릭이 쌓이는 걸 봐. 성과를 공유해.',
  },
  {
    emoji: '✨',
    title_en: 'Ready to build?',
    title_ko: '시작할 준비됐어?',
    desc_en: 'It takes 66 days to form a habit. Start today.',
    desc_ko: '습관이 만들어지는 데 66일이 걸려. 오늘 시작해.',
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const { lang } = useLang()
  const current = steps[step]
  const isLast = step === steps.length - 1
  const isFirst = step === 0

  function handleNext() {
    if (isLast) {
      localStorage.setItem('onboarded', 'true')
      router.push('/login')
    } else {
      setStep(s => s + 1)
    }
  }

  function handleSkip() {
    localStorage.setItem('onboarded', 'true')
    router.push('/login')
  }

  return (
    <div className="app-shell">
      <div className="app-card" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingBottom: 48,
      }}>

        {/* 상단 — 뒤로가기 + 스킵 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setStep(s => s - 1)}
            style={{
              fontSize: 13, color: 'var(--muted)',
              background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              opacity: isFirst ? 0 : 1,
              pointerEvents: isFirst ? 'none' : 'auto',
              padding: 0,
            }}>
            {lang === 'ko' ? '← 이전' : '← Back'}
          </button>

          {!isLast && (
            <button onClick={handleSkip} style={{
              fontSize: 13, color: 'var(--muted)',
              background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
            }}>
              {lang === 'ko' ? '건너뛰기' : 'Skip'}
            </button>
          )}
        </div>

        {/* 콘텐츠 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: 72, marginBottom: 32, lineHeight: 1 }}>{current.emoji}</p>
          <h1 style={{ fontSize: 34, lineHeight: 1.25, marginBottom: 16 }}>
            {lang === 'ko' ? current.title_ko : current.title_en}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 320 }}>
            {lang === 'ko' ? current.desc_ko : current.desc_en}
          </p>
        </div>

        {/* 하단 — 점 + 버튼 */}
        <div>
          {/* 클릭 가능한 진행 점 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  borderRadius: 100,
                  background: i === step ? 'var(--green-400)' : 'var(--border)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <button className="btn-primary" onClick={handleNext}>
            {isLast
              ? (lang === 'ko' ? '시작하기 →' : 'Get started →')
              : (lang === 'ko' ? '다음 →' : 'Next →')}
          </button>
        </div>

      </div>
    </div>
  )
}
