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

// ─── Tournament Stats Endpoint ─────────────────────────────────────────────
app.get('/api/tournament/stats', (req, res) => {
  const currentRound = 3;
  const totalRounds = 4;

  const speakerEntries = Object.values(scores).flat();
  const totalDebates = Object.keys(scores).length;
  const avgSpeakerScore = speakerEntries.length
    ? speakerEntries.reduce((acc: number, s: any) => acc + (s.total || 0), 0) / speakerEntries.length
    : 0;

  const map = new Map<string, { team: string; wins: number; losses: number; speakerPoints: number }>();
  teams.forEach(t => {
    map.set(t.name, { team: t.name, wins: 0, losses: 0, speakerPoints: 0 });
  });
  pairings.forEach(p => {
    if (p.status === 'completed') {
      const prop = map.get(p.proposition);
      const opp = map.get(p.opposition);
      if (!prop || !opp) return;
      if (p.propWins) {
        prop.wins += 1;
        opp.losses += 1;
      } else if (p.propWins === false) {
        prop.losses += 1;
        opp.wins += 1;
      }
    }
  });
  speakerEntries.forEach((s: any) => {
    const entry = map.get(s.team);
    if (entry) entry.speakerPoints += s.total || 0;
  });

  const standings = Array.from(map.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.speakerPoints - a.speakerPoints;
  });

  const leader = standings[0];
  const quickStats = {
    totalDebates,
    avgSpeakerScore: Number(avgSpeakerScore.toFixed(1)),
    activeTeams: teams.length,
    currentLeader: leader ? `${leader.team} (${leader.wins * 3})` : '-'
  };

  res.json({ currentRound, totalRounds, quickStats });
});

app.get('/api/teams', (req, res) => {
  res.json(teams);
});

app.post('/api/teams', (req, res) => {
  const team = { id: teams.length + 1, wins: 0, losses: 0, speakerPoints: 0, ...req.body };
  teams.push(team);
  res.status(201).json(team);
});

app.get('/api/pairings', (req, res) => {
  const currentRound = 1;
  res.json({ pairings, currentRound });
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
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

export default app;
