'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export function useHabitLogs(habitIds: string[]) {
  const supabase = useRef<SupabaseClient>(createClient()).current
  const [checkedToday, setCheckedToday] = useState<Set<string>>(new Set())
  const [streaks, setStreaks] = useState<Record<string, number>>({})
  const today = new Date().toLocaleDateString('en-CA')

  useEffect(() => {
    if (habitIds.length === 0) return
    fetchLogs()
  }, [habitIds.join(',')])

  async function fetchLogs() {
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .in('habit_id', habitIds)
      .order('logged_date', { ascending: false })

    if (!data) return

    // 오늘 체크 여부
    const todayChecked = new Set(
      data.filter(l => l.logged_date === today).map(l => l.habit_id)
    )
    setCheckedToday(todayChecked)

    // 스트릭 계산
    const streakMap: Record<string, number> = {}
    for (const id of habitIds) {
      const logs = data
        .filter(l => l.habit_id === id)
        .map(l => l.logged_date)
        .sort()
        .reverse()

      let streak = 0
      let cursor = today
      for (const date of logs) {
        if (date === cursor) {
          streak++
          // 하루 전으로
          const d = new Date(cursor)
          d.setDate(d.getDate() - 1)
          cursor = d.toISOString().split('T')[0]
        } else {
          break
        }
      }
      streakMap[id] = streak
    }
    setStreaks(streakMap)
  }

  async function toggleCheck(habitId: string) {
    if (checkedToday.has(habitId)) {
      // 체크 취소
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('logged_date', today)
      setCheckedToday(prev => {
        const next = new Set(prev)
        next.delete(habitId)
        return next
      })
      setStreaks(prev => ({ ...prev, [habitId]: Math.max(0, (prev[habitId] || 1) - 1) }))
    } else {
      // 체크
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, logged_date: today })
      setCheckedToday(prev => new Set(prev).add(habitId))
      setStreaks(prev => ({ ...prev, [habitId]: (prev[habitId] || 0) + 1 }))
    }
  }

  return { checkedToday, streaks, toggleCheck }
}
