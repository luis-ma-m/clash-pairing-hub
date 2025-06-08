import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import AuthFallback from '@/components/AuthFallback'

export default function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const hasSupabaseConfig =
    !!supabaseUrl &&
    !!supabaseKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseKey.includes('your-anon-key')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else navigate('/')
  }

  if (!hasSupabaseConfig) return <AuthFallback />

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <input className="border p-2 w-full" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border p-2 w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2" type="submit">Sign Up</button>
      </form>
      <p className="mt-4">Already have an account? <Link to="/signin" className="text-blue-600">Sign in</Link></p>
    </div>
  )
}
