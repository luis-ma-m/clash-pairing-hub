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

function updateTeamStats() {
  const stats = {};
  Object.values(scores).forEach((roomScores) => {
    roomScores.forEach((s) => {
      if (!stats[s.team]) stats[s.team] = { wins: 0, losses: 0, speakerPoints: 0 };
      stats[s.team].speakerPoints += s.total;
    });
  });

  pairings.forEach((p) => {
    if (p.status !== 'completed') return;
    if (!stats[p.proposition]) stats[p.proposition] = { wins: 0, losses: 0, speakerPoints: 0 };
    if (!stats[p.opposition]) stats[p.opposition] = { wins: 0, losses: 0, speakerPoints: 0 };
    if (p.propWins) {
      stats[p.proposition].wins += 1;
      stats[p.opposition].losses += 1;
    } else {
      stats[p.proposition].losses += 1;
      stats[p.opposition].wins += 1;
    }
  });

  teams.forEach((team) => {
    const s = stats[team.name] || { wins: 0, losses: 0, speakerPoints: 0 };
    team.wins = s.wins;
    team.losses = s.losses;
    team.speakerPoints = s.speakerPoints;
  });
}

app.get('/api/teams', (req, res) => {
  updateTeamStats();
  res.json(teams);
});

app.post('/api/teams', (req, res) => {
  const team = { id: teams.length + 1, wins: 0, losses: 0, speakerPoints: 0, ...req.body };
  teams.push(team);
  res.status(201).json(team);
});

app.put('/api/teams/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = teams.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).send('Team not found');
  teams[idx] = { ...teams[idx], ...req.body };
  res.json(teams[idx]);
});

app.delete('/api/teams/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = teams.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).send('Team not found');
  const removed = teams.splice(idx, 1)[0];
  res.json(removed);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
