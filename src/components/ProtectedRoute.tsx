
import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import DemoMode from './DemoMode'
import { isDemoLoggedIn } from '@/lib/demoAuth'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<string | null>(null)
  const [hasConfig, setHasConfig] = useState(true)

  useEffect(() => {
    // Verify Supabase configuration once on mount. If invalid, show demo mode
    // rather than attempting auth calls that will fail.
    if (!isSupabaseConfigured()) {
      setHasConfig(false)
      setLoading(false)
      return
    }

    setSession(localStorage.getItem('userSession'))
    const handler = () => {
      setSession(localStorage.getItem('userSession'))
    }
    window.addEventListener('storage', handler)
    setLoading(false)

    return () => { window.removeEventListener('storage', handler) }
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!hasConfig) {
    if (isDemoLoggedIn()) return children
    return <DemoMode />
  }
  if (!session) return <Navigate to="/signin" replace />
  return children
}
