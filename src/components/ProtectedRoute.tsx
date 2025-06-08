import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<null | Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      setLoading(false)
    })
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    return () => { subscription.unsubscribe() }
  }, [])

  if (loading) return null
  if (!session) return <Navigate to="/signin" replace />
  return children
}
