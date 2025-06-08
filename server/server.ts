import express from 'express';
import cors from 'cors';
import db, { initDB } from './db';

// Initialize DB (create file and defaults if needed)
initDB();

const app = express();
app.use(cors());
app.use(express.json());

// Helper to persist LowDB changes
const save = () => db.write();

// ─── Teams CRUD ────────────────────────────────────────────────────────────
app.get('/api/teams', async (_req, res) => {
  await db.read();
  res.json(db.data.teams);
});

app.get('/api/teams/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const team = db.data.teams.find(t => t.id === id);
  if (!team) return res.status(404).json({ error: 'Not found' });
  res.json(team);
});

app.post('/api/teams', async (req, res) => {
  await db.read();
  const nextId = Date.now();
  const team = { id: nextId, wins: 0, losses: 0, speakerPoints: 0, ...req.body };
  db.data.teams.push(team);
  await save();
  res.status(201).json(team);
});

app.put('/api/teams/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const idx = db.data.teams.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.teams[idx] = { ...db.data.teams[idx], ...req.body };
  await save();
  res.json(db.data.teams[idx]);
});

app.delete('/api/teams/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const idx = db.data.teams.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = db.data.teams.splice(idx, 1);
  await save();
  res.json(removed);
});

// ─── Pairings CRUD ─────────────────────────────────────────────────────────
app.get('/api/pairings', async (_req, res) => {
  await db.read();
  res.json({ pairings: db.data.pairings, currentRound: db.data.currentRound });
});

app.get('/api/pairings/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const pairing = db.data.pairings.find(p => p.id === id);
  if (!pairing) return res.status(404).json({ error: 'Not found' });
  res.json(pairing);
});

app.post('/api/pairings', async (req, res) => {
  await db.read();
  const pairing = { id: Date.now(), ...req.body };
  db.data.pairings.push(pairing);
  await save();
  res.status(201).json(pairing);
});

app.put('/api/pairings/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const idx = db.data.pairings.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.pairings[idx] = { ...db.data.pairings[idx], ...req.body };
  await save();
  res.json(db.data.pairings[idx]);
});

app.delete('/api/pairings/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const idx = db.data.pairings.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = db.data.pairings.splice(idx, 1);
  await save();
  res.json(removed);
});

// ─── Generate Pairings (placeholder) ───────────────────────────────────────
app.post('/api/pairings/generate', async (_req, res) => {
  // Add your pairing logic here
  res.json({ status: 'ok' });
});

// ─── Debates CRUD ──────────────────────────────────────────────────────────
app.get('/api/debates', async (_req, res) => {
  await db.read();
  res.json(db.data.debates);
});

app.get('/api/debates/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const debate = db.data.debates.find(d => d.id === id);
  if (!debate) return res.status(404).json({ error: 'Not found' });
  res.json(debate);
});

app.post('/api/debates', async (req, res) => {
  await db.read();
  const debate = { id: Date.now(), ...req.body };
  db.data.debates.push(debate);
  await save();
  res.status(201).json(debate);
});

app.put('/api/debates/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const idx = db.data.debates.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.debates[idx] = { ...db.data.debates[idx], ...req.body };
  await save();
  res.json(db.data.debates[idx]);
});

app.delete('/api/debates/:id', async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const idx = db.data.debates.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = db.data.debates.splice(idx, 1);
  await save();
  res.json(removed);
});

// ─── Scores CRUD ───────────────────────────────────────────────────────────
app.get('/api/scores/:room', async (req, res) => {
  await db.read();
  const room = req.params.room;
  const result = db.data.scores.filter(s => s.room === room);
  res.json(result);
});

app.post('/api/scores', async (req, res) => {
  await db.read();
  const entry = { id: Date.now(), ...req.body };
  db.data.scores.push(entry);
  await save();
  res.status(201).json(entry);
});

// ─── Analytics Endpoints ───────────────────────────────────────────────────

// Standings
app.get('/api/analytics/standings', async (_req, res) => {
  await db.read();
  const { teams, pairings, scores } = db.data;
  const map = new Map<string, { team: string; wins: number; losses: number; speakerPoints: number }>();
  teams.forEach(t => map.set(t.name, { team: t.name, wins: 0, losses: 0, speakerPoints: 0 }));
  pairings.forEach(p => {
    if (p.status === 'completed') {
      const prop = map.get(p.proposition)!;
      const opp = map.get(p.opposition)!;
      if (p.propWins) { prop.wins++; opp.losses++; }
      else { prop.losses++; opp.wins++; }
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

// Speaker averages
app.get('/api/analytics/speakers', async (_req, res) => {
  await db.read();
  const { scores } = db.data;
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

// Round performance
app.get('/api/analytics/performance', async (_req, res) => {
  await db.read();
  const { pairings, scores } = db.data;
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
    .sort((a, b) => a.round.localeCompare(b.round));
  res.json(performance);
});

// Summary
app.get('/api/analytics/results', async (_req, res) => {
  await db.read();
  const { pairings } = db.data;
  let propWins = 0, oppWins = 0, ties = 0;
  pairings.forEach(p => {
    if (p.status === 'completed') {
      if (p.propWins === true) propWins++;
      else if (p.propWins === false) oppWins++;
      else ties++;
    }
  });
  res.json({ propWins, oppWins, ties });
});

// Start server
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

export default app;