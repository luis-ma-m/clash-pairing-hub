
import { createClient } from '@supabase/supabase-js'

// Use Node-style environment variables so the module works in both the browser
// (via Vite's `define` option) and in the Jest/Node environment. Referencing
// `import.meta.env` caused the test suite to fail to compile under ts-jest.
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key'

// Create client even with placeholder values to prevent crashes
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export default supabase
