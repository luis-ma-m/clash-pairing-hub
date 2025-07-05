// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { getItem, setItem, removeItem } from '@/lib/storage'

interface SessionData {
  user?: { id: string; email?: string }
}

export function useAuth() {
  const [session, setSession] = useState<SessionData | null>(() =>
    getItem<SessionData>('session')
  )

  useEffect(() => {
    const handleStorage = () => {
      setSession(getItem<SessionData>('session'))
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage)
      }
    }
  }, [])

  const login = (s: SessionData) => {
    setItem('session', s)
    setSession(s)
  }

  const logout = () => {
    removeItem('session')
    setSession(null)
  }

  return { session, login, logout }
}
