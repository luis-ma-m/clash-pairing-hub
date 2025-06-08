import { render, screen } from '@testing-library/react'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
  __esModule: true,
}))

import SignIn from '../SignIn'
import SignUp from '../SignUp'

describe('Auth pages configuration checks', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it('shows AuthFallback on SignIn when env vars missing', () => {
    delete process.env.VITE_SUPABASE_URL
    delete process.env.VITE_SUPABASE_ANON_KEY
    render(<SignIn />)
    expect(screen.getByText(/Setup Required/i)).toBeInTheDocument()
  })

  it('shows AuthFallback on SignUp when env vars missing', () => {
    delete process.env.VITE_SUPABASE_URL
    delete process.env.VITE_SUPABASE_ANON_KEY
    render(<SignUp />)
    expect(screen.getByText(/Setup Required/i)).toBeInTheDocument()
  })

  it('renders forms when env vars are present', () => {
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co'
    process.env.VITE_SUPABASE_ANON_KEY = 'key'
    render(<SignIn />)
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument()
  })
})
