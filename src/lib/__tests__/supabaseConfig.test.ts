// src/lib/supabase/hasConfig.test.ts
import { hasSupabaseConfig } from '../supabase'

describe('hasSupabaseConfig', () => {
  const originalProcessEnv = { ...process.env }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalImportMetaEnv = { ...(import.meta as any).env }

  beforeEach(() => {
    // Clear both Vite and Node envs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(import.meta as any).env = {}
    delete process.env.VITE_SUPABASE_URL
    delete process.env.VITE_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_ANON_KEY
  })

  afterEach(() => {
    // Restore originals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(import.meta as any).env = originalImportMetaEnv
    process.env = { ...originalProcessEnv }
  })

  it('returns true when valid VITE_ and Node env values are present', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(import.meta as any).env = {
      VITE_SUPABASE_URL: 'https://proj.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anonkey'
    }
    process.env.SUPABASE_URL = 'https://proj.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'anonkey'

    expect(hasSupabaseConfig()).toBe(true)
  })

  it('returns false when no env variables are set', () => {
    expect(hasSupabaseConfig()).toBe(false)
  })

  it('returns false when env values contain placeholders', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(import.meta as any).env = {
      VITE_SUPABASE_URL: 'https://your-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'your-anon-key'
    }
    process.env.SUPABASE_URL = 'https://your-project.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'your-anon-key'

    expect(hasSupabaseConfig()).toBe(false)
  })
})
