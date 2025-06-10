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

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }),
  __esModule: true,
}))

import SignIn from '../SignIn'
import SignUp from '../SignUp'

describe.skip('Auth pages configuration checks', () => {
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
