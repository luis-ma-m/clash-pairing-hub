// src/pages/SignUp.tsx
import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) {
      setError(error.message)
    } else {
      const userId = data.user?.id
      if (userId) {
        await supabase
          .from('users')
          .upsert({
            id: userId,
            email,
            name,
            role: 'user',
            is_active: true,
            last_login: null,
          })
      }
      navigate('/')
    }
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
