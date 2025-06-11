// src/pages/SignIn.tsx
import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import AuthFallback from '@/components/AuthFallback'
import { loginDemo } from '@/lib/demoAuth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasConfig, setHasConfig] = useState(true)

  useEffect(() => {
    // Evaluate Supabase configuration once on mount.
    setHasConfig(isSupabaseConfigured())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    const userId = data.user?.id
    if (userId) {
      await supabase
        .from('users')
        .upsert({
          id: userId,
          email,
          name: data.user.user_metadata?.name ?? null,
          role: 'user',
          is_active: true,
          last_login: new Date().toISOString(),
        })
    }
    navigate('/')
  }

  if (!hasConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Demo Mode</CardTitle>
            <CardDescription>Supabase is not configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => { loginDemo(); navigate('/'); }}>
              Enter Demo Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Access your DebateMinistrator account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </form>
          <p className="text-sm text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
