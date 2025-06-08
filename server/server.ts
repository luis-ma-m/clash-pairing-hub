// server/server.ts
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { registerAnalyticsRoutes } from './analytics';

const app = express();
app.use(cors());
app.use(express.json());

// ─── Supabase Client ───────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const { data, error } = await supabase
    .from('teams')
    .insert(req.body)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/teams/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('teams')
    .update(req.body)
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
  const { data, error } = await supabase
    .from('pairings')
    .insert(req.body)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/pairings/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('pairings')
    .update(req.body)
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
  const { data, error } = await supabase
    .from('debates')
    .insert(req.body)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/debates/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('debates')
    .update(req.body)
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
  const { data, error } = await supabase
    .from('scores')
    .insert(req.body)
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
  const { data, error } = await supabase
    .from('users')
    .insert(req.body)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('users')
    .update(req.body)
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

// Register analytics routes after CRUD endpoints
registerAnalyticsRoutes(app, supabase);


// ─── Start server ─────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

export { app, supabase };
export default app;
