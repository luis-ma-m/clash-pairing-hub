// src/pages/SignUp.tsx
import React, { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import AuthFallback from '@/components/AuthFallback'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

export default function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasConfig, setHasConfig] = useState(true)

  useEffect(() => {
    // Evaluate Supabase configuration once on mount.
    // Covers both local dev and production/static builds.
    setHasConfig(isSupabaseConfigured())
  }, [])

  interface StoredUser { id: string; email: string; name: string; password: string }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem('users') ?? '[]') as StoredUser[]
    if (users.some((u) => u.email === email)) {
      setError('User already exists')
      return
    }
    const id =
      (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString()
    const newUser = { id, email, name, password }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('userSession', id)
    navigate('/')
  }

  if (!hasConfig) {
    return <AuthFallback />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your DebateMinistrator account</CardDescription>
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
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" type="submit">
              Sign Up
            </Button>
          </form>
          <p className="text-sm text-center">
            Already have an account?{' '}
            <Link to="/signin" className="text-blue-600">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
