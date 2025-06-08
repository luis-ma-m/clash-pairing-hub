import type { Express } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';

export function registerAnalyticsRoutes(app: Express, supabase: SupabaseClient) {

// ─── Analytics Endpoints ───────────────────────────────────────────────────

app.get('/api/analytics/standings', async (_req, res) => {
  const { data: teams, error: tErr } = await supabase.from('teams').select('*');
  const { data: pairings, error: pErr } = await supabase.from('pairings').select('*');
  const { data: scores, error: sErr } = await supabase.from('scores').select('*');
  if (tErr || pErr || sErr) {
    const msg = tErr?.message || pErr?.message || sErr?.message;
    return res.status(500).json({ error: msg });
  }

  const map = new Map<string, { team: string; wins: number; losses: number; speakerPoints: number }>();
  teams.forEach(t => map.set(t.name, { team: t.name, wins: 0, losses: 0, speakerPoints: 0 }));
  pairings.forEach(p => {
    if (p.status === 'completed') {
      const prop = map.get(p.proposition)!;
      const opp = map.get(p.opposition)!;
      if (p.propWins) { prop.wins++; opp.losses++; }
      else             { prop.losses++; opp.wins++; }
    }
  });
  scores.forEach(s => {
    const e = map.get(s.team);
    if (e) e.speakerPoints += s.total || 0;
  });

  const standings = Array.from(map.values())
    .map(t => ({ ...t, points: t.wins * 3 }))
    .sort((a, b) => b.points - a.points || b.speakerPoints - a.speakerPoints)
    .map((t, i) => ({ ...t, rank: i + 1 }));

  res.json(standings);
});

app.get('/api/analytics/speakers', async (_req, res) => {
  const { data: scores, error } = await supabase.from('scores').select('*');
  if (error) return res.status(500).json({ error: error.message });

  const map = new Map<string, { name: string; team: string; total: number; count: number }>();
  scores.forEach(s => {
    if (!map.has(s.speaker)) map.set(s.speaker, { name: s.speaker, team: s.team, total: 0, count: 0 });
    const e = map.get(s.speaker)!;
    e.total += s.total || 0;
    e.count++;
  });

  const speakers = Array.from(map.values())
    .map(s => ({ ...s, average: s.count ? s.total / s.count : 0 }))
    .sort((a, b) => b.average - a.average)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  res.json(speakers);
});

app.get('/api/analytics/performance', async (_req, res) => {
  const { data: pairings, error: pErr } = await supabase.from('pairings').select('*');
  const { data: scores, error: sErr } = await supabase.from('scores').select('*');
  if (pErr || sErr) { return res.status(500).json({ error: (pErr || sErr)!.message }); }

  const rounds = new Map<number, { round: number; total: number; debates: number }>();
  scores.forEach(s => {
    const p = pairings.find(p => p.room === s.room);
    const r = p ? p.round : 1;
    if (!rounds.has(r)) rounds.set(r, { round: r, total: 0, debates: 0 });
    const e = rounds.get(r)!;
    e.total += s.total || 0;
    e.debates++;
  });

  const performance = Array.from(rounds.values())
    .map(r => ({ round: `R${r.round}`, avgScore: r.debates ? r.total / r.debates : 0, debates: r.debates }))
    .sort((a, b) => parseInt(a.round.slice(1)) - parseInt(b.round.slice(1)));

  res.json(performance);
});

app.get('/api/analytics/results', async (_req, res) => {
  const { data: pairings, error } = await supabase.from('pairings').select('*');
  if (error) return res.status(500).json({ error: error.message });

  let propWins = 0, oppWins = 0, ties = 0;
  pairings.forEach(p => {
    if (p.status === 'completed') {
      if (p.propWins === true) propWins++;
      else if (p.propWins === false) oppWins++;
      else                        ties++;
    }
  });

  res.json({ propWins, oppWins, ties });
});

}

export default registerAnalyticsRoutes;
