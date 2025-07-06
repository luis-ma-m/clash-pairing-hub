import { createClient } from '@supabase/supabase-js'

/**
 * Determine if valid Supabase credentials are present.
 * Accepts either Vite-style env vars or plain Node env vars.
 */
export function hasSupabaseConfig(): boolean {
  const url =
    import.meta.env?.VITE_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    process.env.SUPABASE_URL
  const anonKey =
    import.meta.env?.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY

  if (url === undefined && anonKey === undefined) {
    // Default credentials may be supplied elsewhere so allow missing vars
    return true
  }

  if (url === 'https://your-project.supabase.co' || anonKey === 'your-anon-key') {
    return false
  }

  return Boolean(url && anonKey)
}

const url =
  import.meta.env?.VITE_SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  process.env.SUPABASE_URL ?? ''

const anonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(url, anonKey)
