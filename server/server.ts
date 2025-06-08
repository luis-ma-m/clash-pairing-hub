import express from 'express';
import cors from 'cors';
import db, { initDB } from './db.ts';

const app = express();
app.use(cors());
app.use(express.json());

// initialize database without blocking startup
initDB().catch((err) => {
  console.error('Failed to initialize DB', err);
});

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

app.get('/api/scores/:room', async (req, res) => {
  await db.read();
  const roomScores = (db.data?.scores ?? []).filter((s: any) => s.room === req.params.room);
  res.json(roomScores);
});

app.post('/api/scores', async (req, res) => {
  await db.read();
  db.data!.scores.push(req.body);
  await db.write();
  res.status(201).json(req.body);
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

export default app;
