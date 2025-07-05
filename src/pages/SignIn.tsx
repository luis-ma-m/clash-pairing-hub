// src/pages/SignIn.tsx
import React, { useState } from 'react'
import { getItem, setItem } from '@/lib/storage'
import { useNavigate, Link } from 'react-router-dom'
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

interface SessionData {
  user?: { id: string; email?: string }
}

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // For now, accept any credentials and store a simple session
    const user = { id: email, email }
    setItem('session', { user })

    // Ensure we have a users list in storage
    const users = getItem<Record<string, unknown>[]>('users') || []
    if (!users.find(u => u.id === user.id)) {
      users.push({
        id: user.id,
        email,
        name: '',
        role: 'user',
        is_active: true,
      })
      setItem('users', users)
    }

    navigate('/')
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
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
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
