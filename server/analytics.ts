// ─── Analytics Endpoints ───────────────────────────────────────────────────

// GET /api/analytics/standings
app.get('/api/analytics/standings', async (req, res) => {
  await db.read();
  const { teams, pairings, scores } = db.data;

  // build team stats map
  const map = new Map<string, { team: string; wins: number; losses: number; speakerPoints: number }>();
  teams.forEach(t => {
    map.set(t.name, { team: t.name, wins: 0, losses: 0, speakerPoints: 0 });
  });

  // tally wins / losses
  pairings.forEach(p => {
    if (p.status === 'completed') {
      const prop = map.get(p.proposition)!;
      const opp  = map.get(p.opposition)!;
      if (p.propWins) {
        prop.wins += 1;
        opp.losses += 1;
      } else {
        prop.losses += 1;
        opp.wins += 1;
      }
    }
  });

  // add speaker points
  scores.forEach(s => {
    const entry = map.get(s.team);
    if (entry) entry.speakerPoints += s.total ?? 0;
  });

  // convert to array, compute ranking points and sort
  const standings = Array.from(map.values()).map(t => ({
    ...t,
    points: t.wins * 3
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.speakerPoints - a.speakerPoints;
  });

  standings.forEach((s, i) => s['rank'] = i + 1);
  res.json(standings);
});

// GET /api/analytics/speakers
app.get('/api/analytics/speakers', async (req, res) => {
  await db.read();
  const { scores } = db.data;

  const map = new Map<string, { name: string; team: string; total: number; count: number }>();
  scores.forEach(s => {
    if (!map.has(s.speaker)) {
      map.set(s.speaker, { name: s.speaker, team: s.team, total: 0, count: 0 });
    }
    const e = map.get(s.speaker)!;
    e.total += s.total ?? 0;
    e.count += 1;
  });

  const speakers = Array.from(map.values())
    .map(s => ({ ...s, average: s.count ? s.total / s.count : 0 }))
    .sort((a, b) => b.average - a.average);

  speakers.forEach((s, i) => s['rank'] = i + 1);
  res.json(speakers);
});

// GET /api/analytics/performance
app.get('/api/analytics/performance', async (req, res) => {
  await db.read();
  const { pairings, scores } = db.data;

  const rounds = new Map<number, { round: number; total: number; debates: number }>();
  scores.forEach(s => {
    const p = pairings.find(p => p.room === s.room);
    const rnd = p ? p.round : 1;
    if (!rounds.has(rnd)) rounds.set(rnd, { round: rnd, total: 0, debates: 0 });
    const e = rounds.get(rnd)!;
    e.total += s.total ?? 0;
    e.debates += 1;
  });

  const performance = Array.from(rounds.values())
    .map(r => ({ round: `R${r.round}`, avgScore: r.debates ? r.total / r.debates : 0, debates: r.debates }))
    .sort((a, b) => parseInt(a.round.slice(1)) - parseInt(b.round.slice(1)));

  res.json(performance);
});

// GET /api/analytics/results
app.get('/api/analytics/results', async (req, res) => {
  await db.read();
  const { pairings } = db.data;

  let propWins = 0, oppWins = 0, ties = 0;
  pairings.forEach(p => {
    if (p.status === 'completed') {
      if (p.propWins === true)      propWins++;
      else if (p.propWins === false) oppWins++;
      else                           ties++;
    }
  });

  res.json({ propWins, oppWins, ties });
});

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

export default app;
