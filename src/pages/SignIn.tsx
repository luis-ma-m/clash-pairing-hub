import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
import { Lock } from 'lucide-react'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasSupabaseConfig, setHasSupabaseConfig] = useState(true)

  useEffect(() => {
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey =
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('your-project') ||
      supabaseKey.includes('your-anon-key')
    ) {
      setHasSupabaseConfig(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/')
  }

  if (!hasSupabaseConfig) return <AuthFallback />

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
