
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Default connection details for the shared Supabase project. These are used
// whenever the environment variables are not provided.
export const DEFAULT_SUPABASE_URL =
  'https://avzduledlmahtvmvgnxy.supabase.co'
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2emR1bGVkbG1haHR2bXZnbnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2Njk5ODYsImV4cCI6MjA2NTI0NTk4Nn0.Ni6j-h6oNcDrC8ppCjBZmzciAZhQx8An_GN-o62Jatk'

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
    process.env.SUPABASE_URL ??
    DEFAULT_SUPABASE_URL

  const anonKey =
    env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    DEFAULT_SUPABASE_ANON_KEY

  return { url, anonKey }
}

/**
 * Determine if the Supabase configuration appears valid. This is used by the
 * auth pages to decide whether to display the setup instructions.
 */
export function hasSupabaseConfig(): boolean {
  const { url, anonKey } = getSupabaseConfig()

  if (!url || !anonKey) return false

  const invalidPatterns = ['your-project', 'placeholder', 'your-anon-key']
  return (
    !invalidPatterns.some((p) => url.includes(p)) &&
    !invalidPatterns.some((p) => anonKey.includes(p))
  )
}

/**
 * Alias of `hasSupabaseConfig` for clarity when used in components.
 */
export function isSupabaseConfigured() {
  return hasSupabaseConfig()
}

// Create client even with default values so imports succeed during testing
const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabaseConfig()
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

// ─── Service Role Client (Server Only) ───────────────────────────────────────

let supabaseAdmin: SupabaseClient | null = null

/**
 * Obtain a Supabase client configured with the service role key. This should
 * only be used in secure server-side environments.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (supabaseAdmin) return supabaseAdmin
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  supabaseAdmin = createClient(url, key)
  return supabaseAdmin
}

export default supabase
