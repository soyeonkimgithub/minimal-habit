'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Profile = {
  display_name: string | null
  language: 'en' | 'ko'
}

export function useProfile() {
  const supabase = useRef<SupabaseClient>(createClient()).current
  const [profile, setProfile] = useState<Profile>({ display_name: null, language: 'en' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)

    const { data } = await supabase
      .from('profiles')
      .select('display_name, language')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile({
        display_name: data.display_name,
        language: data.language as 'en' | 'ko'
      })
      // localStorage도 동기화 (기존 코드 호환)
      if (data.display_name) localStorage.setItem('displayName', data.display_name)
      if (data.language) localStorage.setItem('lang', data.language)
    }
    setLoading(false)
  }

  async function updateProfile(updates: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })

    if (!error) {
      setProfile(prev => ({ ...prev, ...updates }))
      // localStorage 동기화
      if (updates.display_name !== undefined) localStorage.setItem('displayName', updates.display_name || '')
      if (updates.language) localStorage.setItem('lang', updates.language)
    }
    return error
  }

  return { profile, loading, updateProfile }
}
