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
    round: 1,
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
    round: 1,
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

// ----- Analytics Endpoints -----

app.get('/api/analytics/standings', (req, res) => {
  const map = new Map();

  // initialize team entries
  teams.forEach((t) => {
    map.set(t.name, { team: t.name, wins: 0, losses: 0, speakerPoints: 0 });
  });

  // compute wins/losses from pairings
  pairings.forEach((p) => {
    if (p.status === 'completed') {
      const prop = map.get(p.proposition);
      const opp = map.get(p.opposition);
      if (p.propWins) {
        if (prop) prop.wins += 1;
        if (opp) opp.losses += 1;
      } else {
        if (prop) prop.losses += 1;
        if (opp) opp.wins += 1;
      }
    }
  });

  // add speaker points from scores
  Object.entries(scores).forEach(([room, speakerScores]) => {
    speakerScores.forEach((s) => {
      const team = map.get(s.team);
      if (team) team.speakerPoints += s.total;
    });
  });

  const standings = Array.from(map.values()).map((t) => ({
    ...t,
    points: t.wins * 3,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.speakerPoints - a.speakerPoints;
  });

  standings.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  res.json(standings);
});

app.get('/api/analytics/speakers', (req, res) => {
  const map = new Map();

  Object.values(scores).forEach((roomScores) => {
    roomScores.forEach((s) => {
      if (!map.has(s.speaker)) {
        map.set(s.speaker, { name: s.speaker, team: s.team, total: 0, count: 0 });
      }
      const entry = map.get(s.speaker);
      entry.total += s.total;
      entry.count += 1;
    });
  });

  const speakers = Array.from(map.values()).map((s) => ({
    ...s,
    average: s.count ? s.total / s.count : 0,
  }));

  speakers.sort((a, b) => b.average - a.average);
  speakers.forEach((s, idx) => (s.rank = idx + 1));

  res.json(speakers);
});

app.get('/api/analytics/performance', (req, res) => {
  const rounds = new Map();

  Object.entries(scores).forEach(([room, speakerScores]) => {
    const pairing = pairings.find((p) => p.room === room);
    const round = pairing ? pairing.round : 1;
    if (!rounds.has(round)) rounds.set(round, { round, total: 0, debates: 0 });
    const entry = rounds.get(round);
    const debateAvg =
      speakerScores.reduce((acc, s) => acc + s.total, 0) / speakerScores.length;
    entry.total += debateAvg;
    entry.debates += 1;
  });

  const performance = Array.from(rounds.values()).map((r) => ({
    round: `R${r.round}`,
    avgScore: r.debates ? r.total / r.debates : 0,
    debates: r.debates,
  }));

  performance.sort((a, b) => parseInt(a.round.slice(1)) - parseInt(b.round.slice(1)));

  res.json(performance);
});

app.get('/api/analytics/results', (req, res) => {
  let propWins = 0;
  let oppWins = 0;
  let ties = 0;
  pairings.forEach((p) => {
    if (p.status === 'completed') {
      if (p.propWins === true) propWins += 1;
      else if (p.propWins === false) oppWins += 1;
      else ties += 1;
    }
  });
  res.json({ propWins, oppWins, ties });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
