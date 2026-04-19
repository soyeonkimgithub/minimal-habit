'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Lang = 'en' | 'ko'

const translations = {
  en: {
    greeting: 'Hello,',
    tagline_empty: 'Build your first habit.',
    tagline_done: 'Done for today. 🌿',
    tagline_progress: (done: number, total: number) => `${done} of ${total} done today.`,
    history: 'History',
    settings: 'Settings',
    logout: 'Log out',
    add_habit: '+ Add habit',
    three_max: '3 habits max — less is more.',
    what_habit: 'What habit do you want to build?',
    habit_name: 'Habit name',
    why_matter: 'Why does this matter? (optional)',
    cancel: 'Cancel',
    add: 'Add habit',
    delete_title: 'Delete this habit?',
    delete_desc: 'Your past logs will be kept, but this habit will disappear from your list.',
    delete_btn: 'Delete',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    anytime: 'Anytime',
    share_today: '🌿 Share today\'s wins',
    history_title: 'Last 30 days',
    history_sub: 'The pattern reveals the direction.',
    completion: 'completion',
    perfect_days: 'perfect days',
    current_streak: 'current streak',
    heatmap: '30-day heatmap',
    tap_day: 'Tap any day to see details',
    no_habits: 'No habits completed.',
    back: '← Back',
    settings_title: 'Settings',
    settings_sub: 'Manage your account.',
    display_name: 'Display name',
    display_name_placeholder: 'Your name',
    save_name: 'Save name',
    name_saved: '✓ Name saved!',
    change_password: 'Change password',
    current_pw: 'Current password',
    new_pw: 'New password (min. 6 characters)',
    confirm_pw: 'Confirm new password',
    update_pw: 'Update password',
    pw_updated: '✓ Password updated successfully!',
    language: 'Language',
    well_done: (name: string) => `Well done, ${name}! 🌿`,
  },
  ko: {
    greeting: '안녕,',
    tagline_empty: '첫 번째 습관을 만들어봐.',
    tagline_done: '오늘도 해냈어. 🌿',
    tagline_progress: (done: number, total: number) => `오늘 ${total}개 중 ${done}개 완료.`,
    history: '기록',
    settings: '설정',
    logout: '로그아웃',
    add_habit: '+ 습관 추가',
    three_max: '습관은 최대 3개 — 덜 할수록 더 깊어진다.',
    what_habit: '어떤 습관을 만들고 싶어?',
    habit_name: '습관 이름',
    why_matter: '왜 이 습관이야? (선택)',
    cancel: '취소',
    add: '추가',
    delete_title: '이 습관을 삭제할까?',
    delete_desc: '기록은 보존되지만 목록에서 사라져.',
    delete_btn: '삭제',
    morning: '아침',
    afternoon: '낮',
    evening: '저녁',
    anytime: '언제든',
    share_today: '🌿 오늘의 성과 공유하기',
    history_title: '지난 30일',
    history_sub: '흐름을 보면 방향이 보여.',
    completion: '달성률',
    perfect_days: '완벽한 날',
    current_streak: '현재 연속',
    heatmap: '30일 히트맵',
    tap_day: '날짜를 눌러 상세 보기',
    no_habits: '완료한 습관이 없어.',
    back: '← 돌아가기',
    settings_title: '설정',
    settings_sub: '계정을 관리해.',
    display_name: '이름',
    display_name_placeholder: '이름을 입력해',
    save_name: '저장',
    name_saved: '✓ 저장됐어!',
    change_password: '비밀번호 변경',
    current_pw: '현재 비밀번호',
    new_pw: '새 비밀번호 (6자 이상)',
    confirm_pw: '새 비밀번호 확인',
    update_pw: '변경하기',
    pw_updated: '✓ 비밀번호가 변경됐어!',
    language: '언어',
    well_done: (name: string) => `잘했어, ${name}! 🌿`,
  }
}

type Translations = typeof translations.en
const LanguageContext = createContext<{ t: Translations; lang: Lang; setLang: (l: Lang) => void }>({
  t: translations.en,
  lang: 'en',
  setLang: () => {}
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang
    if (saved === 'en' || saved === 'ko') setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LanguageContext.Provider value={{ t: translations[lang], lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
