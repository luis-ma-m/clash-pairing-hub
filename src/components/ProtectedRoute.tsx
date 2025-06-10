
import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import DemoMode from './DemoMode'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<null | Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>(null)
  const [hasConfig, setHasConfig] = useState(true)

  useEffect(() => {
    // Verify Supabase configuration once on mount. If invalid, show demo mode
    // rather than attempting auth calls that will fail.
    if (!isSupabaseConfigured()) {
      setHasConfig(false)
      setLoading(false)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      setLoading(false)
    })
    
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    }).catch(() => {
      setHasConfig(false);
      setLoading(false);
    })
    
    return () => { subscription.unsubscribe() }
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!hasConfig) return <DemoMode />
  if (!session) return <Navigate to="/signin" replace />
  return children
}
