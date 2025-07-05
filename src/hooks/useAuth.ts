import { useEffect, useState } from 'react'

export function useAuth() {
  const [session, setSession] = useState<{ user: { id: string } } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('userSession')
    if (token) setSession({ user: { id: token } })
    const handler = () => {
      const t = localStorage.getItem('userSession')
      setSession(t ? { user: { id: t } } : null)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return session
}
