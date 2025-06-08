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

const users = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@oxford.ac.uk',
    role: 'TabDirector',
    permissions: ['manage_tournament', 'view_all', 'edit_scores'],
    lastActive: '2 min ago',
    status: 'active'
  },
  {
    id: 2,
    name: 'Prof. Michael Brown',
    email: 'michael.brown@cambridge.ac.uk',
    role: 'Judge',
    permissions: ['view_assigned', 'enter_scores'],
    lastActive: '5 min ago',
    status: 'active'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    email: 'alice.johnson@oxford.ac.uk',
    role: 'TeamCaptain',
    permissions: ['view_team', 'submit_registration'],
    lastActive: '1 hour ago',
    status: 'active'
  },
  {
    id: 4,
    name: 'System Admin',
    email: 'admin@debatedesk.com',
    role: 'SuperAdmin',
    permissions: ['full_access'],
    lastActive: '1 day ago',
    status: 'active'
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

app.get('/api/scores/:room', (req, res) => {
  res.json(scores[req.params.room] || []);
});

// ----- User Endpoints -----
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const user = { id: users.length + 1, ...req.body };
  users.push(user);
  res.status(201).json(user);
});

app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
});

app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  const removed = users.splice(index, 1)[0];
  res.json(removed);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
