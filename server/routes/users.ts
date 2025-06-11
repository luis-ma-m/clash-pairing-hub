import { Router } from 'express'
import { z } from 'zod'
import { getSupabaseAdminClient } from '../../src/lib/supabase'

const router = Router()

// Middleware to verify JWT and attach user info
router.use(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Missing token' })

  const admin = getSupabaseAdminClient()
  if (!admin) return res.status(500).json({ error: 'Supabase not configured' })
  const { data, error } = await (admin.auth as any).getUser?.(token) || { data: { user: null }, error: null }
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' })
  // attach user
  ;(req as any).user = data.user
  next()
})

const updateSchema = z.object({
  name: z.string().optional(),
  avatar_url: z.string().url().nullable().optional(),
  is_active: z.boolean().optional(),
})

router.get('/:id', async (req, res) => {
  const admin = getSupabaseAdminClient()
  if (!admin) return res.status(500).json({ error: 'Supabase not configured' })
  const { data, error } = await admin.from('users').select('*').eq('id', req.params.id).single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

router.put('/:id', async (req, res) => {
  const admin = getSupabaseAdminClient()
  if (!admin) return res.status(500).json({ error: 'Supabase not configured' })
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body' })
  const { data, error } = await admin
    .from('users')
    .update(parsed.data)
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const admin = getSupabaseAdminClient()
  if (!admin) return res.status(500).json({ error: 'Supabase not configured' })
  const { data, error } = await admin
    .from('users')
    .update({ is_active: false })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

router.get('/', async (_req, res) => {
  const admin = getSupabaseAdminClient()
  if (!admin) return res.status(500).json({ error: 'Supabase not configured' })
  const { data, error } = await admin.from('users').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
