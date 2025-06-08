// server/server.ts
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

// ─── Supabase Client ───────────────────────────────────────────────────────

let SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
let SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (process.env.NODE_ENV === 'test') {
    SUPABASE_URL = 'http://localhost';
    SUPABASE_ANON_KEY = 'anon';
  } else {
    throw new Error('Missing Supabase environment variables');
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Validation Schemas
const teamSchema = z.object({
  name: z.string(),
  organization: z.string(),
  speakers: z.array(z.string()),
  wins: z.number().optional(),
  losses: z.number().optional(),
  speakerPoints: z.number().optional(),
});

const pairingSchema = z.object({
  round: z.number(),
  room: z.string(),
  proposition: z.string(),
  opposition: z.string(),
  judge: z.string(),
  status: z.string(),
  propWins: z.boolean().nullable().optional(),
});

const debateSchema = z.object({
  room: z.string(),
  proposition: z.string(),
  opposition: z.string(),
  judge: z.string(),
  status: z.string(),
});

const scoreSchema = z.object({
  room: z.string(),
  speaker: z.string(),
  team: z.string(),
  position: z.string(),
  content: z.number(),
  style: z.number(),
  strategy: z.number(),
  total: z.number(),
});

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

// ─── Teams CRUD ────────────────────────────────────────────────────────────

app.get('/api/teams', async (_req, res) => {
  const { data, error } = await supabase.from('teams').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/teams/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

app.post('/api/teams', async (req, res) => {
  const parsed = teamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { data, error } = await supabase
    .from('teams')
    .insert(parsed.data)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/teams/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = teamSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { data, error } = await supabase
    .from('teams')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

app.delete('/api/teams/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// ─── Pairings CRUD ─────────────────────────────────────────────────────────

app.get('/api/pairings', async (_req, res) => {
  const { data: pairings, error: pErr } = await supabase.from('pairings').select('*');
  const { data: setting, error: sErr } = await supabase.from('settings').select('currentRound').single();
  if (pErr || sErr) {
    const msg = pErr?.message || sErr?.message;
    return res.status(500).json({ error: msg });
  }
  res.json({ pairings: pairings || [], currentRound: setting?.currentRound ?? 1 });
});

app.get('/api/pairings/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('pairings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

app.post('/api/pairings', async (req, res) => {
  const parsed = pairingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { data, error } = await supabase
    .from('pairings')
    .insert(parsed.data)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/pairings/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = pairingSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { data, error } = await supabase
    .from('pairings')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

app.delete('/api/pairings/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('pairings')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// ─── Debates CRUD ──────────────────────────────────────────────────────────

app.get('/api/debates', async (_req, res) => {
  const { data, error } = await supabase.from('debates').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/debates/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('debates')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

app.post('/api/debates', async (req, res) => {
  const parsed = debateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { data, error } = await supabase
    .from('debates')
    .insert(parsed.data)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/debates/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = debateSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { data, error } = await supabase
    .from('debates')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

app.delete('/api/debates/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('debates')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// ─── Scores CRUD ───────────────────────────────────────────────────────────

app.get('/api/scores/:room', async (req, res) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('room', req.params.room);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/scores', async (req, res) => {
  const parsed = scoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { data, error } = await supabase
    .from('scores')
    .insert(parsed.data)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// ─── Users CRUD ────────────────────────────────────────────────────────────

app.get('/api/users', async (_req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

app.post('/api/users', async (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { data, error } = await supabase
    .from('users')
    .insert(parsed.data)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = userSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  const { data, error } = await supabase
    .from('users')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

app.delete('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// ─── Analytics Endpoints ───────────────────────────────────────────────────

// 1) Standings
app.get('/api/analytics/standings', async (_req, res) => {
  const { data: teams, error: tErr } = await supabase.from('teams').select('*');
  const { data: pairings, error: pErr } = await supabase.from('pairings').select('*');
  const { data: scores, error: sErr } = await supabase.from('scores').select('*');
  if (tErr || pErr || sErr) {
    const msg = tErr?.message || pErr?.message || sErr?.message;
    return res.status(500).json({ error: msg });
  }

  const map = new Map<string, { team: string; wins: number; losses: number; speakerPoints: number }>();
  teams.forEach(t => map.set(t.name, { team: t.name, wins: 0, losses: 0, speakerPoints: 0 }));
  pairings.forEach(p => {
    if (p.status === 'completed') {
      const prop = map.get(p.proposition)!;
      const opp = map.get(p.opposition)!;
      if (p.propWins) { prop.wins++; opp.losses++; }
      else             { prop.losses++; opp.wins++; }
    }
  });
  scores.forEach(s => {
    const e = map.get(s.team);
    if (e) e.speakerPoints += s.total || 0;
  });

  const standings = Array.from(map.values())
    .map(t => ({ ...t, points: t.wins * 3 }))
    .sort((a, b) => b.points - a.points || b.speakerPoints - a.speakerPoints)
    .map((t, i) => ({ ...t, rank: i + 1 }));

  res.json(standings);
});

// 2) Speakers
app.get('/api/analytics/speakers', async (_req, res) => {
  const { data: scores, error } = await supabase.from('scores').select('*');
  if (error) return res.status(500).json({ error: error.message });

  const map = new Map<string, { name: string; team: string; total: number; count: number }>();
  scores.forEach(s => {
    if (!map.has(s.speaker)) map.set(s.speaker, { name: s.speaker, team: s.team, total: 0, count: 0 });
    const e = map.get(s.speaker)!;
    e.total += s.total || 0;
    e.count++;
  });

  const speakers = Array.from(map.values())
    .map(s => ({ ...s, average: s.count ? s.total / s.count : 0 }))
    .sort((a, b) => b.average - a.average)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  res.json(speakers);
});

// 3) Performance
app.get('/api/analytics/performance', async (_req, res) => {
  const { data: pairings, error: pErr } = await supabase.from('pairings').select('*');
  const { data: scores, error: sErr } = await supabase.from('scores').select('*');
  if (pErr || sErr) { return res.status(500).json({ error: (pErr || sErr)!.message }); }

  const rounds = new Map<number, { round: number; total: number; debates: number }>();
  scores.forEach(s => {
    const p = pairings.find(p => p.room === s.room);
    const r = p ? p.round : 1;
    if (!rounds.has(r)) rounds.set(r, { round: r, total: 0, debates: 0 });
    const e = rounds.get(r)!;
    e.total += s.total || 0;
    e.debates++;
  });

  const performance = Array.from(rounds.values())
    .map(r => ({ round: `R${r.round}`, avgScore: r.debates ? r.total / r.debates : 0, debates: r.debates }))
    .sort((a, b) => parseInt(a.round.slice(1)) - parseInt(b.round.slice(1)));

  res.json(performance);
});

// 4) Results summary
app.get('/api/analytics/results', async (_req, res) => {
  const { data: pairings, error } = await supabase.from('pairings').select('*');
  if (error) return res.status(500).json({ error: error.message });

  let propWins = 0, oppWins = 0, ties = 0;
  pairings.forEach(p => {
    if (p.status === 'completed') {
      if (p.propWins === true) propWins++;
      else if (p.propWins === false) oppWins++;
      else                        ties++;
    }
  });

  res.json({ propWins, oppWins, ties });
});

// ─── Start server ─────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

export default app;
