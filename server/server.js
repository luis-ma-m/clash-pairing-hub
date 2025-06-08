import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

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

app.post('/api/scores', (req, res) => {
  const { room, scores: roomScores } = req.body;
  if (!room || !Array.isArray(roomScores)) {
    return res.status(400).json({ error: 'Invalid score data' });
  }
  scores[room] = roomScores;
  res.status(201).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
