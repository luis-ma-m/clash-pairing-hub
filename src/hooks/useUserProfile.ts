import { useCallback, useEffect, useState } from 'react'
import { getItem } from '@/lib/storage'
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
  const { session } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(() => {
    if (!session?.user) return
    setLoading(true)
    const users = getItem<UserProfile[]>('users') || []
    const data = users.find(u => u.id === session.user!.id) || null
    if (!data) setError('User not found')
    setProfile(data)
    setLoading(false)
  }, [session])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  return { user: profile, loading, error, refresh: fetchProfile }
}
