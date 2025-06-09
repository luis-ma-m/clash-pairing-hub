
import { createClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url?: string
  anonKey?: string
}

/**
 * Resolve Supabase configuration from whatever environment we're running in.
 *
 * - `import.meta.env` is used when available (Vite/browser build).
 * - `process.env` is used for Node/Jest environments and when running on
 *   platforms like Vercel/Netlify which expose runtime env vars.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const meta = typeof import.meta !== 'undefined' ? import.meta : undefined
  const env = (meta?.env ?? {}) as Record<string, string | undefined>

  const url =
    env.VITE_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    process.env.SUPABASE_URL

  const anonKey =
    env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY

  return { url, anonKey }
}

/**
 * Determine if the Supabase configuration appears valid. This is used by the
 * auth pages to decide whether to display the setup instructions.
 */
export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig()

  if (!url || !anonKey) return false

  const invalidPatterns = ['your-project', 'placeholder', 'your-anon-key']
  return (
    !invalidPatterns.some((p) => url.includes(p)) &&
    !invalidPatterns.some((p) => anonKey.includes(p))
  )
}

// Create client even with placeholder values so imports succeed during testing
const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabaseConfig()
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key'
)

export default supabase
