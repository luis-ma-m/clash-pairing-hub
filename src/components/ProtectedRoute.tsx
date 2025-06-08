
import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthFallback from './AuthFallback'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<null | Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>(null)
  const [hasSupabaseConfig, setHasSupabaseConfig] = useState(true)

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
      setHasSupabaseConfig(false);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      setLoading(false)
    })
    
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    }).catch(() => {
      setHasSupabaseConfig(false);
      setLoading(false);
    })
    
    return () => { subscription.unsubscribe() }
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!hasSupabaseConfig) return <AuthFallback />
  if (!session) return <Navigate to="/signin" replace />
  return children
}
