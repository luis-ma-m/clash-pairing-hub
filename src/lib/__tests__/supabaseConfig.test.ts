import { hasSupabaseConfig } from '../supabase'

describe('hasSupabaseConfig', () => {
  const originalProcessEnv = { ...process.env } as Record<string, string | undefined>;
  let originalImportMetaEnv: Record<string, string | undefined>;

  beforeEach(() => {
    originalImportMetaEnv = (
      import.meta as { env: Record<string, string | undefined> }
    ).env
    delete process.env.VITE_SUPABASE_URL
    delete process.env.VITE_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_ANON_KEY
  })

  afterEach(() => {
    ;(import.meta as { env: Record<string, string | undefined> }).env =
      originalImportMetaEnv
    process.env.VITE_SUPABASE_URL = originalProcessEnv.VITE_SUPABASE_URL
    process.env.VITE_SUPABASE_ANON_KEY = originalProcessEnv.VITE_SUPABASE_ANON_KEY
    process.env.SUPABASE_URL = originalProcessEnv.SUPABASE_URL
    process.env.SUPABASE_ANON_KEY = originalProcessEnv.SUPABASE_ANON_KEY
  })

  it('returns true when valid values are present', () => {
    ;(import.meta as { env: Record<string, string | undefined> }).env = {
      VITE_SUPABASE_URL: 'https://proj.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anonkey'
    }
    expect(hasSupabaseConfig()).toBe(true)
  })

  it('returns false when values are missing', () => {
    ;(import.meta as { env: Record<string, string | undefined> }).env = {}
    expect(hasSupabaseConfig()).toBe(false)
  })

  it('returns false when values contain placeholders', () => {
    ;(import.meta as { env: Record<string, string | undefined> }).env = {
      VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'your-anon-key'
    }
    expect(hasSupabaseConfig()).toBe(false)
  })
})
