// src/lib/supabase/hasConfig.test.ts
/**
 * @jest-environment node
 */
import { hasSupabaseConfig } from '../supabase'

// The ImportMetaEnv interface in newer TypeScript versions includes required
// properties like MODE and PROD. To keep this test simple we allow any shape.
interface MutableImportMeta extends ImportMeta {
  env: any
}

const importMeta = import.meta as unknown as MutableImportMeta

describe('hasSupabaseConfig', () => {
  const originalProcessEnv = { ...process.env }
  const originalImportMetaEnv = { ...importMeta.env }

  beforeEach(() => {
    // Clear both Vite and Node envs
    importMeta.env = {}
    delete process.env.VITE_SUPABASE_URL
    delete process.env.VITE_SUPABASE_ANON_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_ANON_KEY
  })

  afterEach(() => {
    // Restore originals
    importMeta.env = originalImportMetaEnv
    process.env = { ...originalProcessEnv }
  })

  it('returns true when valid VITE_ and Node env values are present', () => {
    importMeta.env = {
      VITE_SUPABASE_URL: 'https://proj.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'anonkey'
    }
    process.env.SUPABASE_URL = 'https://proj.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'anonkey'

    expect(hasSupabaseConfig()).toBe(true)
  })

  it('returns true when no env variables are set', () => {
    // Defaults from src/lib/supabase should make the configuration valid even
    // without explicit environment variables.
    expect(hasSupabaseConfig()).toBe(true)
  })

  it('returns false when env values contain placeholders', () => {
    importMeta.env = {
      VITE_SUPABASE_URL: 'https://your-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'your-anon-key'
    }
    process.env.SUPABASE_URL = 'https://your-project.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'your-anon-key'

    expect(hasSupabaseConfig()).toBe(false)
  })
})
