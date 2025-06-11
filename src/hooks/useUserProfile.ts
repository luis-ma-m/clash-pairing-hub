import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  avatar_url: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export function useUserProfile() {
  const session = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (error) setError(error.message)
    setProfile(data as UserProfile)
    setLoading(false)
  }, [session])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  return { user: profile, loading, error, refresh: fetchProfile }
}
