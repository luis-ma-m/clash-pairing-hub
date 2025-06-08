import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
  return { teams: [], pairings: [], currentRound: 1 };
}

function saveDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const db = loadDb();
let { teams, pairings, currentRound } = db;

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
  saveDb({ teams, pairings, currentRound });
  res.status(201).json(team);
});

app.get('/api/pairings', (req, res) => {
  res.json({ pairings, currentRound });
});

app.post('/api/pairings/generate', (req, res) => {
  const { algorithm = 'swiss', round } = req.body;
  if (round) {
    currentRound = round;
  } else {
    currentRound += 1;
  }

  const teamList = [...teams];

  const sortFn = (a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.speakerPoints - a.speakerPoints;
  };

  if (algorithm === 'random') {
    for (let i = teamList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teamList[i], teamList[j]] = [teamList[j], teamList[i]];
    }
  } else if (algorithm === 'power') {
    teamList.sort(sortFn);
  } else {
    // default swiss pairing
    teamList.sort(sortFn);
  }

  const newPairings = [];
  for (let i = 0; i < teamList.length; i += 2) {
    const teamA = teamList[i];
    const teamB = teamList[i + 1];
    if (!teamB) break;
    newPairings.push({
      id: pairings.length + newPairings.length + 1,
      round: currentRound,
      room: `A${i / 2 + 1}`,
      proposition: teamA.name,
      opposition: teamB.name,
      judge: 'TBD',
      status: 'upcoming',
      propWins: null,
    });
  }

  pairings = pairings.concat(newPairings);
  saveDb({ teams, pairings, currentRound });
  res.json({ status: 'ok', pairings: newPairings, currentRound });
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
