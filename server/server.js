import express from 'express';
import cors from 'cors';
import db, { initDB } from './db.js';

await initDB();

const app = express();
app.use(cors());
app.use(express.json());

// helper to persist LowDB
const save = () => db.write();

// ─── Teams CRUD ────────────────────────────────────────────────────────────
app.get('/api/teams', async (_req, res) => {
  await db.read();
  res.json(db.data.teams);
});

app.get('/api/teams/:id', async (req, res) => {
  await db.read();
  const team = db.data.teams.find(t => t.id === Number(req.params.id));
  if (!team) return res.status(404).json({ error: 'Not found' });
  res.json(team);
});

app.post('/api/teams', async (req, res) => {
  const team = { id: Date.now(), wins: 0, losses: 0, speakerPoints: 0, ...req.body };
  db.data.teams.push(team);
  await save();
  res.status(201).json(team);
});

app.put('/api/teams/:id', async (req, res) => {
  const idx = db.data.teams.findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.teams[idx] = { ...db.data.teams[idx], ...req.body };
  await save();
  res.json(db.data.teams[idx]);
});

app.delete('/api/teams/:id', async (req, res) => {
  const idx = db.data.teams.findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.data.teams.splice(idx, 1);
  await save();
  res.json(removed[0]);
});

// ─── Pairings CRUD ─────────────────────────────────────────────────────────
app.get('/api/pairings', async (_req, res) => {
  await db.read();
  res.json({
    pairings: db.data.pairings,
    currentRound: db.data.currentRound
  });
});

app.get('/api/pairings/:id', async (req, res) => {
  await db.read();
  const p = db.data.pairings.find(x => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.post('/api/pairings', async (req, res) => {
  const pairing = { id: Date.now(), ...req.body };
  db.data.pairings.push(pairing);
  await save();
  res.status(201).json(pairing);
});

app.put('/api/pairings/:id', async (req, res) => {
  const idx = db.data.pairings.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.pairings[idx] = { ...db.data.pairings[idx], ...req.body };
  await save();
  res.json(db.data.pairings[idx]);
});

app.delete('/api/pairings/:id', async (req, res) => {
  const idx = db.data.pairings.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.data.pairings.splice(idx, 1);
  await save();
  res.json(removed[0]);
});

// ─── Generate Pairings ─────────────────────────────────────────────────────
app.post('/api/pairings/generate', async (req, res) => {
  await db.read();
  const { algorithm = 'swiss', round } = req.body;

  if (typeof round === 'number') {
    db.data.currentRound = round;
  } else {
    db.data.currentRound += 1;
  }

  const teamList = [...db.data.teams];
  const byWinsAndSpeaker = (a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.speakerPoints - a.speakerPoints;
  };

  if (algorithm === 'random') {
    for (let i = teamList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teamList[i], teamList[j]] = [teamList[j], teamList[i]];
    }
  } else {
    teamList.sort(byWinsAndSpeaker);
  }

  const newPairings = [];
  for (let i = 0; i < teamList.length; i += 2) {
    const A = teamList[i];
    const B = teamList[i + 1];
    if (!B) break;
    newPairings.push({
      id: Date.now() + i,
      round: db.data.currentRound,
      room: `Room ${i/2 + 1}`,
      proposition: A.name,
      opposition: B.name,
      judge: 'TBD',
      status: 'upcoming',
      propWins: null
    });
  }

  db.data.pairings = db.data.pairings.concat(newPairings);
  await save();
  res.json({ status: 'ok', newPairings, currentRound: db.data.currentRound });
});

// ─── Debates CRUD ──────────────────────────────────────────────────────────
app.get('/api/debates', async (_req, res) => {
  await db.read();
  res.json(db.data.debates);
});

app.get('/api/debates/:id', async (req, res) => {
  await db.read();
  const d = db.data.debates.find(x => x.id === Number(req.params.id));
  if (!d) return res.status(404).json({ error: 'Not found' });
  res.json(d);
});

app.post('/api/debates', async (req, res) => {
  const debate = { id: Date.now(), ...req.body };
  db.data.debates.push(debate);
  await save();
  res.status(201).json(debate);
});

app.put('/api/debates/:id', async (req, res) => {
  const idx = db.data.debates.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.debates[idx] = { ...db.data.debates[idx], ...req.body };
  await save();
  res.json(db.data.debates[idx]);
});

app.delete('/api/debates/:id', async (req, res) => {
  const idx = db.data.debates.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.data.debates.splice(idx, 1);
  await save();
  res.json(removed[0]);
});

// ─── Scores CRUD ───────────────────────────────────────────────────────────
app.get('/api/scores', async (_req, res) => {
  await db.read();
  res.json(db.data.scores);
});

app.get('/api/scores/:room', async (req, res) => {
  await db.read();
  res.json(db.data.scores.filter(s => s.room === req.params.room));
});

app.post('/api/scores', async (req, res) => {
  const score = { id: Date.now(), ...req.body };
  db.data.scores.push(score);
  await save();
  res.status(201).json(score);
});

app.put('/api/scores/:id', async (req, res) => {
  const idx = db.data.scores.findIndex(s => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.scores[idx] = { ...db.data.scores[idx], ...req.body };
  await save();
  res.json(db.data.scores[idx]);
});

app.delete('/api/scores/:id', async (req, res) => {
  const idx = db.data.scores.findIndex(s => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.data.scores.splice(idx, 1);
  await save();
  res.json(removed[0]);
});

// ─── Team & Speaker Scores ─────────────────────────────────────────────────
app.post('/api/scores/team', async (req, res) => {
  const entry = { id: Date.now(), type: 'team', ...req.body };
  db.data.scores.push(entry);
  await save();
  res.status(201).json(entry);
});

app.post('/api/scores/speaker', async (req, res) => {
  const entry = { id: Date.now(), type: 'speaker', ...req.body };
  db.data.scores.push(entry);
  await save();
  res.status(201).json(entry);
});

// ─── Users CRUD ────────────────────────────────────────────────────────────
app.get('/api/users', async (_req, res) => {
  await db.read();
  res.json(db.data.users);
});

app.get('/api/users/:id', async (req, res) => {
  await db.read();
  const u = db.data.users.find(x => x.id === Number(req.params.id));
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json(u);
});

app.post('/api/users', async (req, res) => {
  const user = { id: Date.now(), ...req.body };
  db.data.users.push(user);
  await save();
  res.status(201).json(user);
});

app.put('/api/users/:id', async (req, res) => {
  const idx = db.data.users.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.users[idx] = { ...db.data.users[idx], ...req.body };
  await save();
  res.json(db.data.users[idx]);
});

app.delete('/api/users/:id', async (req, res) => {
  const idx = db.data.users.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.data.users.splice(idx, 1);
  await save();
  res.json(removed[0]);
});

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
