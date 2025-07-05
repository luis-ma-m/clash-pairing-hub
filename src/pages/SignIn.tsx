// src/pages/SignIn.tsx
import React, { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
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

  interface StoredUser { id: string; email: string; name?: string; password: string }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem('users') ?? '[]') as StoredUser[]
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) {
      setError('Invalid email or password')
      return
    }
    localStorage.setItem('userSession', user.id)
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
