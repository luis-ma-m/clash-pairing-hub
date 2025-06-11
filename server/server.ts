// server/server.ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { registerAnalyticsRoutes } from './analytics'
import { generateEliminationBracket, updateBracketWithResults } from './pairing/bracket'
import { generateSwissPairings } from './pairing/swiss'
import { getSupabaseConfig, hasSupabaseConfig } from '../src/lib/supabase'

const app = express()
app.use(cors())
app.use(express.json())

// ─── Supabase Client ───────────────────────────────────────────────────────

let { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabaseConfig()
let isSupabaseConfigured = hasSupabaseConfig()

if (!isSupabaseConfigured) {
  if (process.env.NODE_ENV === 'test') {
    SUPABASE_URL = 'http://localhost'
    SUPABASE_ANON_KEY = 'anon'
    isSupabaseConfigured = true
  } else {
    console.warn('⚠️  Supabase not configured - API will return mock data')
    SUPABASE_URL = SUPABASE_URL || 'https://placeholder.supabase.co'
    SUPABASE_ANON_KEY = SUPABASE_ANON_KEY || 'placeholder-key'
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Validation Schemas ────────────────────────────────────────────────────

const teamSchema = z.object({
  name: z.string(),
  organization: z.string(),
  tournament_id: z.string(),
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

app.put('/api/tournaments/:id', checkSupabaseConfig, async (req, res) => {
  const { id } = req.params
  const parsed = tournamentSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' })
  }
  const updates = {
    ...parsed.data,
  }
  const { data, error } = await supabase
    .from('tournaments')
    .update(updates)
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

// ─── Tournament Stats ──────────────────────────────────────────────────────

app.get('/api/tournament/stats', async (_req, res) => {
  const { data: setting, error: sErr } = await supabase
    .from('settings')
    .select('currentRound')
    .single()
  const { data: teams, error: tErr } = await supabase.from('teams').select('*')
  const { data: pairings, error: pErr } = await supabase
    .from('pairings')
    .select('*')
  const { data: scores, error: scErr } = await supabase.from('scores').select('*')

  if (sErr || tErr || pErr || scErr) {
    const msg = sErr?.message || tErr?.message || pErr?.message || scErr?.message
    return res.status(500).json({ error: msg })
  }

  const currentRound = setting?.currentRound ?? 1
  const totalRounds = pairings?.reduce((m, p) => Math.max(m, p.round), 0) ?? 0

  const totalDebates = pairings?.length ?? 0
  const avgSpeakerScore = scores && scores.length
    ? scores.reduce((sum, s) => sum + (s.total || 0), 0) / scores.length
    : 0
  const activeTeams = teams?.length ?? 0

  const map = new Map<string, { wins: number; speaker: number }>()
  teams?.forEach(t => map.set(t.name, { wins: 0, speaker: 0 }))
  pairings?.forEach(p => {
    if (p.status === 'completed') {
      const prop = map.get(p.proposition)
      const opp = map.get(p.opposition)
      if (prop && opp) {
        if (p.propWins) {
          prop.wins++
        } else if (p.propWins === false) {
          opp.wins++
        }
      }
    }
  })
  scores?.forEach(s => {
    const e = map.get(s.team)
    if (e) e.speaker += s.total || 0
  })

  const standings = Array.from(map.entries()).map(([team, stat]) => ({
    team,
    wins: stat.wins,
    speakerPoints: stat.speaker,
  }))
  standings.sort(
    (a, b) => b.wins - a.wins || b.speakerPoints - a.speakerPoints
  )
  const currentLeader = standings[0]?.team ?? '-'

  res.json({
    currentRound,
    totalRounds,
    quickStats: {
      totalDebates,
      avgSpeakerScore,
      activeTeams,
      currentLeader,
    },
  })
})

// ─── Teams CRUD ────────────────────────────────────────────────────────────

app.get('/api/teams', checkSupabaseConfig, async (req, res) => {
  const tournamentId = req.query.tournament_id as string | undefined
  let query = supabase.from('teams').select('*')
  if (tournamentId) {
    query = query.eq('tournament_id', tournamentId)
  }
  const { data, error } = await query
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

app.get('/api/speakers', async (req, res) => {
  const teamId = req.query.team_id as string | undefined
  const tournamentId = req.query.tournament_id as string | undefined

  const { data: speakers, error } = await supabase.from('speakers').select('*')
  if (error) return res.status(500).json({ error: error.message })

  let filtered = speakers as any[]

  if (teamId) {
    filtered = filtered.filter(s => s.team_id === teamId)
  } else if (tournamentId) {
    const { data: teams, error: tErr } = await supabase
      .from('teams')
      .select('id')
      .eq('tournament_id', tournamentId)
    if (tErr) return res.status(500).json({ error: tErr.message })
    const teamIds = new Set((teams as any[]).map(t => t.id))
    filtered = filtered.filter(s => teamIds.has(s.team_id))
  }

  res.json(filtered)
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

// ─── Tournament Stats ─────────────────────────────────────────────────────

app.get('/api/tournament/stats', async (_req, res) => {
  const [{ data: pairings, error: pErr }, { data: scores, error: sErr }, { data: teams, error: tErr }, { data: setting, error: setErr }] = await Promise.all([
    supabase.from('pairings').select('*'),
    supabase.from('scores').select('*'),
    supabase.from('teams').select('*'),
    supabase.from('settings').select('currentRound').single()
  ])

  if (pErr || sErr || tErr || setErr) {
    const msg = pErr?.message || sErr?.message || tErr?.message || setErr?.message
    return res.status(500).json({ error: msg })
  }

  const allPairings = (pairings as any[]) || []
  const allScores = (scores as any[]) || []
  const allTeams = (teams as any[]) || []

  const totalDebates = allPairings.length
  const totalRounds = new Set(allPairings.map(p => p.round)).size
  const avgSpeakerScore = allScores.length
    ? allScores.reduce((sum, s) => sum + (s.total || 0), 0) / allScores.length
    : 0

  const map = new Map<string, { team: string; wins: number; speakerPoints: number }>()
  allTeams.forEach(t => map.set(t.name, { team: t.name, wins: 0, speakerPoints: 0 }))
  allPairings.forEach(p => {
    if (!map.has(p.proposition)) map.set(p.proposition, { team: p.proposition, wins: 0, speakerPoints: 0 })
    if (!map.has(p.opposition)) map.set(p.opposition, { team: p.opposition, wins: 0, speakerPoints: 0 })
    if (p.status === 'completed') {
      if (p.propWins === true) map.get(p.proposition)!.wins++
      else if (p.propWins === false) map.get(p.opposition)!.wins++
    }
  })
  allScores.forEach(s => {
    if (!map.has(s.team)) map.set(s.team, { team: s.team, wins: 0, speakerPoints: 0 })
    map.get(s.team)!.speakerPoints += s.total || 0
  })

  const leader = Array.from(map.values()).sort((a, b) => b.wins - a.wins || b.speakerPoints - a.speakerPoints)[0]
  const currentLeader = leader ? leader.team : null

  res.json({
    currentRound: setting?.currentRound ?? 1,
    totalRounds,
    totalDebates,
    avgSpeakerScore,
    currentLeader
  })
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
  const rooms = Array.isArray(req.body?.rooms) ? req.body.rooms : []
  const judges = Array.isArray(req.body?.judges) ? req.body.judges : []
  if (typeof round !== 'number') {
    return res.status(400).json({ error: 'round is required' })
  }

  const { data: teams, error: tErr } = await supabase.from('teams').select('*')
  if (tErr) return res.status(500).json({ error: tErr.message })

  const { data: prev, error: hErr } = await supabase.from('pairings').select('*')
  if (hErr) return res.status(500).json({ error: hErr.message })

  const pairings = await generateSwissPairings(round, teams || [], prev || [], [], rooms, judges)

  const { data: inserted, error: pErr } = await supabase
    .from('pairings')
    .insert(pairings)
    .select()
  if (pErr) return res.status(400).json({ error: pErr.message })

  await supabase.from('settings').update({ currentRound: round }).eq('id', 1)

  res.status(201).json(inserted)
})

// ─── Round Progression ─────────────────────────────────────────────────────

app.post('/api/rounds/progress', async (_req, res) => {
  const { data: setting, error: sErr } = await supabase
    .from('settings')
    .select('currentRound')
    .single()
  if (sErr) return res.status(500).json({ error: sErr.message })

  const round = setting?.currentRound ?? 1

  const { data: pairings, error: pErr } = await supabase
    .from('pairings')
    .select('*')
    .eq('round', round)
  if (pErr) return res.status(500).json({ error: pErr.message })

  if (!pairings?.length) {
    return res.status(400).json({ error: 'No pairings for current round' })
  }

  const incomplete = pairings.some(p => p.status !== 'completed')
  if (incomplete) {
    return res.status(400).json({ error: 'Round not completed' })
  }

  const nextRound = round + 1
  const { error: uErr } = await supabase
    .from('settings')
    .update({ currentRound: nextRound })
    .eq('id', 1)
  if (uErr) return res.status(500).json({ error: uErr.message })

  res.json({ currentRound: nextRound })
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
