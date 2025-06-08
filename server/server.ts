import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// Path to JSON database
const DB_FILE = path.join(process.cwd(), 'server', 'db.json');

export interface Database {
  teams: any[];
  pairings: any[];
  debates: any[];
  scores: any[];
  users: any[];
  currentRound: number;
}

const defaultData: Database = {
  teams: [],
  pairings: [],
  debates: [],
  scores: [],
  users: [],
  currentRound: 1,
};

async function readDb(): Promise<Database> {
  try {
    const text = await fs.readFile(DB_FILE, 'utf8');
    return { ...defaultData, ...JSON.parse(text) } as Database;
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
    return { ...defaultData };
  }
}

async function writeDb(data: Database) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// ─── Teams CRUD ────────────────────────────────────────────────────────────
app.get('/api/teams', async (_req, res) => {
  const data = await readDb();
  res.json(data.teams);
});

app.get('/api/teams/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const team = data.teams.find(t => t.id === id);
  if (!team) return res.status(404).json({ error: 'Not found' });
  res.json(team);
});

app.post('/api/teams', async (req, res) => {
  const data = await readDb();
  const nextId = Date.now();
  const team = { id: nextId, wins: 0, losses: 0, speakerPoints: 0, ...req.body };
  data.teams.push(team);
  await writeDb(data);
  res.status(201).json(team);
});

app.put('/api/teams/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const idx = data.teams.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.teams[idx] = { ...data.teams[idx], ...req.body };
  await writeDb(data);
  res.json(data.teams[idx]);
});

app.delete('/api/teams/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const idx = data.teams.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = data.teams.splice(idx, 1);
  await writeDb(data);
  res.json(removed);
});

// ─── Pairings CRUD ─────────────────────────────────────────────────────────
app.get('/api/pairings', async (_req, res) => {
  const data = await readDb();
  res.json({ pairings: data.pairings, currentRound: data.currentRound });
});

app.get('/api/pairings/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const pairing = data.pairings.find(p => p.id === id);
  if (!pairing) return res.status(404).json({ error: 'Not found' });
  res.json(pairing);
});

app.post('/api/pairings', async (req, res) => {
  const data = await readDb();
  const pairing = { id: Date.now(), ...req.body };
  data.pairings.push(pairing);
  await writeDb(data);
  res.status(201).json(pairing);
});

app.put('/api/pairings/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const idx = data.pairings.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.pairings[idx] = { ...data.pairings[idx], ...req.body };
  await writeDb(data);
  res.json(data.pairings[idx]);
});

app.delete('/api/pairings/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const idx = data.pairings.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = data.pairings.splice(idx, 1);
  await writeDb(data);
  res.json(removed);
});

// ─── Generate Pairings (placeholder) ───────────────────────────────────────
app.post('/api/pairings/generate', async (_req, res) => {
  // Add your pairing logic here
  res.json({ status: 'ok' });
});

// ─── Debates CRUD ──────────────────────────────────────────────────────────
app.get('/api/debates', async (_req, res) => {
  const data = await readDb();
  res.json(data.debates);
});

app.get('/api/debates/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const debate = data.debates.find(d => d.id === id);
  if (!debate) return res.status(404).json({ error: 'Not found' });
  res.json(debate);
});

app.post('/api/debates', async (req, res) => {
  const data = await readDb();
  const debate = { id: Date.now(), ...req.body };
  data.debates.push(debate);
  await writeDb(data);
  res.status(201).json(debate);
});

app.put('/api/debates/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const idx = data.debates.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.debates[idx] = { ...data.debates[idx], ...req.body };
  await writeDb(data);
  res.json(data.debates[idx]);
});

app.delete('/api/debates/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const idx = data.debates.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = data.debates.splice(idx, 1);
  await writeDb(data);
  res.json(removed);
});

// ─── Scores CRUD ───────────────────────────────────────────────────────────
app.get('/api/scores/:room', async (req, res) => {
  const data = await readDb();
  const room = req.params.room;
  const result = data.scores.filter(s => s.room === room);
  res.json(result);
});

app.post('/api/scores', async (req, res) => {
  const data = await readDb();
  const entry = { id: Date.now(), ...req.body };
  data.scores.push(entry);
  await writeDb(data);
  res.status(201).json(entry);
});

// ─── Users CRUD ────────────────────────────────────────────────────────────
app.get('/api/users', async (_req, res) => {
  const data = await readDb();
  res.json(data.users);
});

app.get('/api/users/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const user = data.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const data = await readDb();
  const user = { id: Date.now(), ...req.body };
  data.users.push(user);
  await writeDb(data);
  res.status(201).json(user);
});

app.put('/api/users/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const idx = data.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.users[idx] = { ...data.users[idx], ...req.body };
  await writeDb(data);
  res.json(data.users[idx]);
});

app.delete('/api/users/:id', async (req, res) => {
  const data = await readDb();
  const id = Number(req.params.id);
  const idx = data.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = data.users.splice(idx, 1);
  await writeDb(data);
  res.json(removed);
});

// ─── Analytics Endpoints ───────────────────────────────────────────────────

// Standings
app.get('/api/analytics/standings', async (_req, res) => {
  const { teams, pairings, scores } = await readDb();
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
  const { scores } = await readDb();
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
  const { pairings, scores } = await readDb();
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
  const { pairings } = await readDb();
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
