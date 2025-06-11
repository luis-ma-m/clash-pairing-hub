// src/lib/supabase/hasConfig.test.ts
/**
 * @jest-environment node
 */
import { hasSupabaseConfig } from '../supabase'

interface MutableImportMeta extends ImportMeta {
  env: ImportMetaEnv & Record<string, string | undefined>
}

const importMeta = import.meta as unknown as MutableImportMeta

describe('hasSupabaseConfig', () => {
  const originalProcessEnv = { ...process.env }
  const originalImportMetaEnv = { ...importMeta.env }

  beforeEach(() => {
    // Clear both Vite and Node envs
    importMeta.env = {} as any
    delete process.env.VITE_SUPABASE_URL
    delete process.env.VITE_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_ANON_KEY
  })

  afterEach(() => {
    // Restore originals
    importMeta.env = originalImportMetaEnv as any
    process.env = { ...originalProcessEnv }
  })

  it('returns true when valid VITE_ and Node env values are present', () => {
    importMeta.env = {
      VITE_SUPABASE_URL: 'https://proj.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anonkey'
    } as any
    process.env.SUPABASE_URL = 'https://proj.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'anonkey'

    expect(hasSupabaseConfig()).toBe(true)
  })

  it('returns false when no env variables are set', () => {
    expect(hasSupabaseConfig()).toBe(false)
  })

  it('returns false when env values contain placeholders', () => {
    importMeta.env = {
      VITE_SUPABASE_URL: 'https://your-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'your-anon-key'
    } as any
    process.env.SUPABASE_URL = 'https://your-project.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'your-anon-key'

    expect(hasSupabaseConfig()).toBe(false)
  })
})
