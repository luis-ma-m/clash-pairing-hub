// src/lib/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { getItem, setItem, removeItem } from '@/lib/storage'

interface SessionData {
  user?: {
    id: string
    email?: string
  }
}

/**
 * A hook for managing a simple session object in local storage.
 */
export function useAuth() {
  // Initialize from storage (or null)
  const [session, setSession] = useState<SessionData | null>(() =>
    getItem<SessionData>('session')
  )

  // Listen for storage events so multiple tabs stay in sync
  useEffect(() => {
    const handleStorage = () => {
      const s = getItem<SessionData>('session')
      setSession(s)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage)
      return () => {
        window.removeEventListener('storage', handleStorage)
      }
    }
  }, [])

  /**
   * Log in by writing the session to storage and updating state.
   */
  const login = (s: SessionData) => {
    setItem('session', s)
    setSession(s)
  }

  /**
   * Log out by removing the session from storage and clearing state.
   */
  const logout = () => {
    removeItem('session')
    setSession(null)
  }

  return { session, login, logout }
}
