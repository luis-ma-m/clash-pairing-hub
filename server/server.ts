import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const dbFile = path.join(__dirname, 'db.json');
interface Database { users: any[] }

function readDb(): Database {
  if (!fs.existsSync(dbFile)) {
    return { users: [] };
  }
  return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
}

function writeDb(data: Database) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

const teams = [
  {
    id: 1,
    name: 'Oxford A',
    organization: 'Oxford University',
    speakers: ['Alice Johnson', 'Bob Smith'],
    wins: 0,
    losses: 0,
    speakerPoints: 0,
  }
];

const pairings = [
  {
    id: 1,
    room: 'A1',
    proposition: 'Oxford A',
    opposition: 'Cambridge B',
    judge: 'Dr. Sarah Wilson',
    status: 'completed',
    propWins: true,
  }
];

const debates = [
  {
    room: 'A1',
    proposition: 'Oxford A',
    opposition: 'Cambridge B',
    judge: 'Dr. Sarah Wilson',
    status: 'scoring',
  }
];

const scores = {
  A1: [
    { speaker: 'Alice Johnson', team: 'Oxford A', position: 'PM', content: 78, style: 82, strategy: 80, total: 240 },
    { speaker: 'Bob Smith', team: 'Oxford A', position: 'DPM', content: 75, style: 79, strategy: 77, total: 231 },
  ]
};

app.get('/api/teams', (req, res) => {
  res.json(teams);
});

app.post('/api/teams', (req, res) => {
  const team = { id: teams.length + 1, wins: 0, losses: 0, speakerPoints: 0, ...req.body };
  teams.push(team);
  res.status(201).json(team);
});

app.get('/api/pairings', (req, res) => {
  res.json(pairings);
});

app.post('/api/pairings/generate', (req, res) => {
  // placeholder generation logic
  res.json({ status: 'ok' });
});

app.get('/api/debates', (req, res) => {
  res.json(debates);
});

app.get('/api/scores/:room', (req, res) => {
  res.json(scores[req.params.room] || []);
});

// User management endpoints backed by db.json
app.get('/api/users', (_req, res) => {
  const data = readDb();
  res.json(data.users);
});

app.post('/api/users', (req, res) => {
  const data = readDb();
  const nextId = data.users.length ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
  const user = { id: nextId, ...req.body };
  data.users.push(user);
  writeDb(data);
  res.status(201).json(user);
});

app.put('/api/users/:id', (req, res) => {
  const data = readDb();
  const id = parseInt(req.params.id, 10);
  const idx = data.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  data.users[idx] = { ...data.users[idx], ...req.body, id };
  writeDb(data);
  res.json(data.users[idx]);
});

app.delete('/api/users/:id', (req, res) => {
  const data = readDb();
  const id = parseInt(req.params.id, 10);
  const idx = data.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  const [deleted] = data.users.splice(idx, 1);
  writeDb(data);
  res.json(deleted);
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

export default app;
