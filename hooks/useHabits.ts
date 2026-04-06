'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Habit = {
  id: string
  name: string
  why: string | null
  time_of_day: string
  is_active: boolean
}

export function useHabits() {
  const supabase = useRef<SupabaseClient>(createClient()).current
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHabits()
  }, [])

  async function fetchHabits() {
    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('is_active', true)
      .order('order_index')
    if (data) setHabits(data)
    setLoading(false)
  }

  async function addHabit(name: string, why: string, timeOfDay: string) {
    if (habits.length >= 3) throw new Error('습관은 최대 3개까지만 가능해요')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('로그인이 필요해요')
    const { data, error } = await supabase
      .from('habits')
      .insert({ name, why, time_of_day: timeOfDay, order_index: habits.length, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setHabits(prev => [...prev, data])
  }

  async function deleteHabit(id: string) {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', id)
    if (error) throw error
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  return { habits, loading, addHabit, deleteHabit }
}
