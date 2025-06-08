// server/server.ts
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { registerAnalyticsRoutes } from './analytics'
import { generateEliminationBracket, updateBracketWithResults } from './pairing/bracket'
import { generateSwissPairings } from './pairing/swiss'

const app = express()
app.use(cors())
app.use(express.json())

// ─── Supabase Client ───────────────────────────────────────────────────────

let SUPABASE_URL = process.env.SUPABASE_URL as string | undefined
let SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string | undefined
let isSupabaseConfigured = true

if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  SUPABASE_URL.includes('placeholder') ||
  SUPABASE_ANON_KEY.includes('placeholder')
) {
  if (process.env.NODE_ENV === 'test') {
    SUPABASE_URL = 'http://localhost'
    SUPABASE_ANON_KEY = 'anon'
  } else {
    console.warn('⚠️  Supabase not configured - API will return mock data')
    isSupabaseConfigured = false
    SUPABASE_URL = 'https://placeholder.supabase.co'
    SUPABASE_ANON_KEY = 'placeholder-key'
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Validation Schemas ────────────────────────────────────────────────────

const teamSchema = z.object({
  name: z.string(),
  organization: z.string(),
  speakers: z.array(z.string()),
  wins: z.number().optional(),
  losses: z.number().optional(),
  speakerPoints: z.number().optional(),
})

const speakerSchema = z.object({
  team_id: z.string(),
  name: z.string(),
  position: z.number().optional(),
})

const roundSchema = z.object({
  tournament_id: z.string(),
  round_number: z.number(),
  status: z.string().optional(),
})

const pairingSchema = z.object({
  round: z.number(),
  room: z.string(),
  proposition: z.string(),
  opposition: z.string(),
  judge: z.string(),
  status: z.string(),
  propWins: z.boolean().nullable().optional(),
})

const debateSchema = z.object({
  room: z.string(),
  proposition: z.string(),
  opposition: z.string(),
  judge: z.string(),
  status: z.string(),
})

const scoreSchema = z.object({
  room: z.string(),
  speaker: z.string(),
  team: z.string(),
  position: z.string(),
  content: z.number(),
  style: z.number(),
  strategy: z.number(),
  total: z.number(),
})

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
})

const tournamentSchema = z.object({
  name: z.string(),
  format: z.string(),
  status: z.string().optional(),
  settings: z.any().optional(),
  owner_id: z.string().uuid().optional(),
})

// ─── Bracket Generation Schema ─────────────────────────────────────────────

const bracketSchema = z.object({
  type: z.enum(['single', 'double']),
})

// ─── Middleware to check Supabase configuration ────────────────────────────

const checkSupabaseConfig = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!isSupabaseConfigured) {
    return res.status(503).json({
      error: 'Supabase not configured',
      message: 'Please connect your Supabase project to enable database functionality',
    })
  }
  next()
}

// ─── Tournaments CRUD ───────────────────────────────────────────────────────

app.get('/api/tournaments', checkSupabaseConfig, async (_req, res) => {
  const { data, error } = await supabase.from('tournaments').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/api/tournaments/:id', async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.post('/api/tournaments', async (req, res) => {
  const parsed = tournamentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('tournaments')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

app.put('/api/tournaments/:id', async (req, res) => {
  const { id } = req.params
  const parsed = tournamentSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('tournaments')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.delete('/api/tournaments/:id', async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

// ─── Teams CRUD ────────────────────────────────────────────────────────────

app.get('/api/teams', checkSupabaseConfig, async (_req, res) => {
  const { data, error } = await supabase.from('teams').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/api/teams/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.post('/api/teams', async (req, res) => {
  const parsed = teamSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('teams')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

app.put('/api/teams/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = teamSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('teams')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.delete('/api/teams/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { data, error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

// ─── Speakers CRUD ─────────────────────────────────────────────────────────

app.get('/api/speakers', async (_req, res) => {
  const { data, error } = await supabase.from('speakers').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/api/speakers/:id', async (req, res) => {
  const id = req.params.id
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.post('/api/speakers', async (req, res) => {
  const parsed = speakerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('speakers')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

app.put('/api/speakers/:id', async (req, res) => {
  const id = req.params.id
  const parsed = speakerSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('speakers')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.delete('/api/speakers/:id', async (req, res) => {
  const id = req.params.id
  const { data, error } = await supabase
    .from('speakers')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

// ─── Pairings CRUD ─────────────────────────────────────────────────────────

app.get('/api/pairings', async (_req, res) => {
  const { data: pairings, error: pErr } = await supabase.from('pairings').select('*')
  const { data: setting, error: sErr } = await supabase.from('settings').select('currentRound').single()
  if (pErr || sErr) {
    const msg = pErr?.message || sErr?.message
    return res.status(500).json({ error: msg })
  }
  res.json({ pairings: pairings || [], currentRound: setting?.currentRound ?? 1 })
})

app.get('/api/pairings/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { data, error } = await supabase
    .from('pairings')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.post('/api/pairings', async (req, res) => {
  const parsed = pairingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('pairings')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

// ─── Bracket Generation ────────────────────────────────────────────────────

app.post('/api/bracket', async (req, res) => {
  const parsed = bracketSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  const { data: teams, error: tErr } = await supabase.from('teams').select('*')
  if (tErr) return res.status(500).json({ error: tErr.message })

  const bracket = generateEliminationBracket((teams as any[]) || [], parsed.data.type)

  const { data, error } = await supabase
    .from('brackets')
    .insert({ type: parsed.data.type, data: bracket })
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

app.put('/api/pairings/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = pairingSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('pairings')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })

  if (Object.prototype.hasOwnProperty.call(parsed.data, 'propWins')) {
    const { data: bracketRec } = await supabase.from('brackets').select('*').single()
    const { data: allPairings } = await supabase.from('pairings').select('*')
    if (bracketRec && allPairings) {
      const updated = updateBracketWithResults(bracketRec.data, allPairings as any[])
      await supabase.from('brackets').update({ data: updated }).eq('id', bracketRec.id)
    }
  }
  res.json(data)
})

app.delete('/api/pairings/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { data, error } = await supabase
    .from('pairings')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

// ─── Swiss Pairings ────────────────────────────────────────────────────────

app.post('/api/pairings/swiss', async (req, res) => {
  const round = req.body?.round
  if (typeof round !== 'number') {
    return res.status(400).json({ error: 'round is required' })
  }

  const { data: teams, error: tErr } = await supabase.from('teams').select('*')
  if (tErr) return res.status(500).json({ error: tErr.message })

  const pairings = generateSwissPairings(round, teams || [])

  const { data: inserted, error: pErr } = await supabase
    .from('pairings')
    .insert(pairings)
    .select()
  if (pErr) return res.status(400).json({ error: pErr.message })

  await supabase.from('settings').update({ currentRound: round }).eq('id', 1)

  res.status(201).json(inserted)
})

// ─── Rounds CRUD ───────────────────────────────────────────────────────────

app.get('/api/rounds', async (_req, res) => {
  const { data, error } = await supabase.from('rounds').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/api/rounds/:id', async (req, res) => {
  const id = req.params.id
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.post('/api/rounds', async (req, res) => {
  const parsed = roundSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('rounds')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

app.put('/api/rounds/:id', async (req, res) => {
  const id = req.params.id
  const parsed = roundSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('rounds')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.delete('/api/rounds/:id', async (req, res) => {
  const id = req.params.id
  const { data, error } = await supabase
    .from('rounds')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

// ─── Debates CRUD ──────────────────────────────────────────────────────────

app.get('/api/debates', async (_req, res) => {
  const { data, error } = await supabase.from('debates').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/api/debates/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { data, error } = await supabase
    .from('debates')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.post('/api/debates', async (req, res) => {
  const parsed = debateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('debates')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

app.put('/api/debates/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = debateSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('debates')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.delete('/api/debates/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { data, error } = await supabase
    .from('debates')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

// ─── Scores CRUD ───────────────────────────────────────────────────────────

app.get('/api/scores/:room', async (req, res) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('room', req.params.room)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.post('/api/scores', async (req, res) => {
  const parsed = scoreSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('scores')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

// ─── Users CRUD ────────────────────────────────────────────────────────────

app.get('/api/users', async (_req, res) => {
  const { data, error } = await supabase.from('users').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.post('/api/users', async (req, res) => {
  const parsed = userSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('users')
    .insert(parsed.data)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

app.put('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = userSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const { data, error } = await supabase
    .from('users')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.delete('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

// Register analytics routes after CRUD endpoints
if (isSupabaseConfigured) {
  registerAnalyticsRoutes(app, supabase)
}

// ─── Health Check ──────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    supabaseConfigured: isSupabaseConfigured,
    timestamp: new Date().toISOString(),
  })
})

// ─── Start server ─────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on ${PORT}`)
    if (!isSupabaseConfigured) {
      console.log('⚠️  Running in demo mode - connect Supabase for full functionality')
    }
  })
}

export { app, supabase }
export default app
