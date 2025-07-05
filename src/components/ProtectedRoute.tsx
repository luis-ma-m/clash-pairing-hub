
import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getItem } from '@/lib/storage'

interface SessionData {
  user?: { id: string; email?: string }
}


export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<SessionData | null>(null)

  useEffect(() => {
    const update = () => {
      setSession(getItem<SessionData>('session'))
      setLoading(false)
    }
    update()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', update)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', update)
      }
    }
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!session) return <Navigate to="/signin" replace />
  return children
}
