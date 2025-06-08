// server/server.ts
import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());

// ─── FS-based JSON “database” helper ───────────────────────────────────────

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
    return { ...defaultData, ...JSON.parse(text) };
  } catch {
    // If missing or corrupted, write a fresh default file
    await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
    return { ...defaultData };
  }
}

async function writeDb(data: Database) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// ─── Validation Schemas ────────────────────────────────────────────────────
const teamSchema = z.object({
  name: z.string(),
  organization: z.string(),
  speakers: z.array(z.string()).max(5),
});
const teamUpdateSchema = teamSchema.partial();

const pairingSchema = z.object({
  round: z.number(),
  room: z.string(),
  proposition: z.string(),
  opposition: z.string(),
  judge: z.string(),
  status: z.string(),
  propWins: z.boolean().nullable().optional(),
});
const pairingUpdateSchema = pairingSchema.partial();

const debateSchema = z.object({
  room: z.string(),
  proposition: z.string(),
  opposition: z.string(),
  judge: z.string(),
  status: z.string(),
});
const debateUpdateSchema = debateSchema.partial();

const speakerScoreSchema = z.object({
  speaker: z.string(),
  team: z.string(),
  position: z.string(),
  content: z.number(),
  style: z.number(),
  strategy: z.number(),
  total: z.number().optional(),
});

const scoreSchema = z.object({
  room: z.string(),
  scores: z.array(speakerScoreSchema).optional(),
  teamScores: z
    .object({
      proposition: z.object({ points: z.number(), margin: z.number() }),
      opposition: z.object({ points: z.number(), margin: z.number() }),
    })
    .optional(),
});

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});
const userUpdateSchema = userSchema.partial();

// ─── Teams CRUD ────────────────────────────────────────────────────────────

app.get('/api/teams', async (_req, res) => {
  const db = await readDb();
  res.json(db.teams);
});

app.get('/api/teams/:id', async (req, res) => {
  const db = await readDb();
  const id = Number(req.params.id);
  const team = db.teams.find(t => t.id === id);
  if (!team) return res.status(404).json({ error: 'Not found' });
  res.json(team);
});

app.post('/api/teams', async (req, res) => {
  const result = teamSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const db = await readDb();
  const team = { id: Date.now(), wins: 0, losses: 0, speakerPoints: 0, ...result.data };
  db.teams.push(team);
  await writeDb(db);
  res.status(201).json(team);
});

app.put('/api/teams/:id', async (req, res) => {
  const result = teamUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const db = await readDb();
  const id = Number(req.params.id);
  const idx = db.teams.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.teams[idx] = { ...db.teams[idx], ...result.data };
  await writeDb(db);
  res.json(db.teams[idx]);
});

app.delete('/api/teams/:id', async (req, res) => {
  const db = await readDb();
  const id = Number(req.params.id);
  const idx = db.teams.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = db.teams.splice(idx, 1);
  await writeDb(db);
  res.json(removed);
});

// ─── Pairings CRUD ─────────────────────────────────────────────────────────

app.get('/api/pairings', async (_req, res) => {
  const db = await readDb();
  res.json({ pairings: db.pairings, currentRound: db.currentRound });
});

app.get('/api/pairings/:id', async (req, res) => {
  const db = await readDb();
  const id = Number(req.params.id);
  const p = db.pairings.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.post('/api/pairings', async (req, res) => {
  const result = pairingSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const db = await readDb();
  const pairing = { id: Date.now(), ...result.data };
  db.pairings.push(pairing);
  await writeDb(db);
  res.status(201).json(pairing);
});

app.put('/api/pairings/:id', async (req, res) => {
  const result = pairingUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const db = await readDb();
  const id = Number(req.params.id);
  const idx = db.pairings.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.pairings[idx] = { ...db.pairings[idx], ...result.data };
  await writeDb(db);
  res.json(db.pairings[idx]);
});

app.delete('/api/pairings/:id', async (req, res) => {
  const db = await readDb();
  const id = Number(req.params.id);
  const idx = db.pairings.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = db.pairings.splice(idx, 1);
  await writeDb(db);
  res.json(removed);
});

// ─── Debates CRUD ──────────────────────────────────────────────────────────

app.get('/api/debates', async (_req, res) => {
  const db = await readDb();
  res.json(db.debates);
});

app.get('/api/debates/:id', async (req, res) => {
  const db = await readDb();
  const id = Number(req.params.id);
  const d = db.debates.find(x => x.id === id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  res.json(d);
});

app.post('/api/debates', async (req, res) => {
  const result = debateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const db = await readDb();
  const debate = { id: Date.now(), ...result.data };
  db.debates.push(debate);
  await writeDb(db);
  res.status(201).json(debate);
});

app.put('/api/debates/:id', async (req, res) => {
  const result = debateUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const db = await readDb();
  const id = Number(req.params.id);
  const idx = db.debates.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.debates[idx] = { ...db.debates[idx], ...result.data };
  await writeDb(db);
  res.json(db.debates[idx]);
});

app.delete('/api/debates/:id', async (req, res) => {
  const db = await readDb();
  const id = Number(req.params.id);
  const idx = db.debates.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = db.debates.splice(idx, 1);
  await writeDb(db);
  res.json(removed);
});

// ─── Scores CRUD ───────────────────────────────────────────────────────────

app.get('/api/scores/:room', async (req, res) => {
  const db = await readDb();
  res.json(db.scores.filter(s => s.room === req.params.room));
});

app.post('/api/scores', async (req, res) => {
  const result = scoreSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const db = await readDb();
  const entry = { id: Date.now(), ...result.data };
  db.scores.push(entry);
  await writeDb(db);
  res.status(201).json(entry);
});

// ─── Users CRUD ────────────────────────────────────────────────────────────

app.get('/api/users', async (_req, res) => {
  const db = await readDb();
  res.json(db.users);
});

app.get('/api/users/:id', async (req, res) => {
  const db = await readDb();
  const id = Number(req.params.id);
  const u = db.users.find(x => x.id === id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json(u);
});

app.post('/api/users', async (req, res) => {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const db = await readDb();
  const user = { id: Date.now(), ...result.data };
  db.users.push(user);
  await writeDb(db);
  res.status(201).json(user);
});

app.put('/api/users/:id', async (req, res) => {
  const result = userUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.message });
  }
  const db = await readDb();
  const id = Number(req.params.id);
  const idx = db.users.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.users[idx] = { ...db.users[idx], ...result.data };
  await writeDb(db);
  res.json(db.users[idx]);
});

app.delete('/api/users/:id', async (req, res) => {
  const db = await readDb();
  const id = Number(req.params.id);
  const idx = db.users.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = db.users.splice(idx, 1);
  await writeDb(db);
  res.json(removed);
});

// ─── Analytics Endpoints ───────────────────────────────────────────────────

// 1) Standings
app.get('/api/analytics/standings', async (_req, res) => {
  const db = await readDb();
  const map = new Map<string, { team: string; wins: number; losses: number; speakerPoints: number }>();
  db.teams.forEach(t => map.set(t.name, { team: t.name, wins: 0, losses: 0, speakerPoints: 0 }));

  db.pairings.forEach(p => {
    if (p.status === 'completed') {
      const prop = map.get(p.proposition)!;
      const opp  = map.get(p.opposition)!;
      if (p.propWins) { prop.wins++; opp.losses++; }
      else           { prop.losses++; opp.wins++; }
    }
  });

  db.scores.forEach(s => {
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
  const db = await readDb();
  const map = new Map<string, { name: string; team: string; total: number; count: number }>();

  db.scores.forEach(s => {
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
  const db = await readDb();
  const rounds = new Map<number, { round: number; total: number; debates: number }>();

  db.scores.forEach(s => {
    const p = db.pairings.find(p => p.room === s.room);
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
  const db = await readDb();
  let propWins = 0, oppWins = 0, ties = 0;
  db.pairings.forEach(p => {
    if (p.status === 'completed') {
      if (p.propWins === true)  propWins++;
      else if (p.propWins === false) oppWins++;
      else                         ties++;
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
