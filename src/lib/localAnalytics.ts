import { getTeams, getPairings, getScores } from './localData';

export interface TeamStanding {
  team: string;
  wins: number;
  losses: number;
  speakerPoints: number;
  points: number;
  rank: number;
}

export function getTeamStandings(): TeamStanding[] {
  const teams = getTeams() as { name: string }[];
  const pairings = getPairings() as { proposition: string; opposition: string; propWins: boolean | null; status: string }[];
  const scores = getScores() as { team: string; total: number }[];

  const map = new Map<string, { wins: number; losses: number; speakerPoints: number }>();
  teams.forEach(t => map.set(t.name, { wins: 0, losses: 0, speakerPoints: 0 }));

  pairings.forEach(p => {
    if (p.status === 'completed') {
      const prop = map.get(p.proposition);
      const opp = map.get(p.opposition);
      if (!prop || !opp) return;
      if (p.propWins === true) { prop.wins++; opp.losses++; }
      else if (p.propWins === false) { prop.losses++; opp.wins++; }
    }
  });

  scores.forEach(s => {
    const entry = map.get(s.team);
    if (entry) entry.speakerPoints += s.total || 0;
  });

  const arr = Array.from(map.entries()).map(([team, data]) => ({
    team,
    wins: data.wins,
    losses: data.losses,
    speakerPoints: data.speakerPoints,
    points: data.wins * 3,
  }));
  arr.sort((a, b) => b.points - a.points || b.speakerPoints - a.speakerPoints);
  return arr.map((t, i) => ({ ...t, rank: i + 1 }));
}

export interface SpeakerRanking {
  name: string;
  team: string;
  total: number;
  average: number;
  rank: number;
}

export function getSpeakerRankings(): SpeakerRanking[] {
  const scores = getScores() as { speaker: string; team: string; total: number }[];
  const map = new Map<string, { team: string; total: number; count: number }>();

  scores.forEach(s => {
    if (!map.has(s.speaker)) map.set(s.speaker, { team: s.team, total: 0, count: 0 });
    const e = map.get(s.speaker)!;
    e.total += s.total || 0;
    e.count++;
  });

  const arr = Array.from(map.entries()).map(([name, data]) => ({
    name,
    team: data.team,
    total: data.total,
    average: data.count ? data.total / data.count : 0,
  }));
  arr.sort((a, b) => b.average - a.average);
  return arr.map((s, i) => ({ ...s, rank: i + 1 }));
}

export interface RoundPerformance {
  round: string;
  avgScore: number;
  debates: number;
}

export function getRoundPerformance(): RoundPerformance[] {
  const pairings = getPairings() as { room: string; round: number }[];
  const scores = getScores() as { room: string; total: number }[];
  const rounds = new Map<number, { total: number; debates: number }>();

  scores.forEach(s => {
    const p = pairings.find(p => p.room === s.room);
    const r = p ? p.round : 1;
    const entry = rounds.get(r) || { total: 0, debates: 0 };
    entry.total += s.total || 0;
    entry.debates++;
    rounds.set(r, entry);
  });

  return Array.from(rounds.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, data]) => ({
      round: `R${round}`,
      avgScore: data.debates ? data.total / data.debates : 0,
      debates: data.debates,
    }));
}

export function getResultDistribution(): { propWins: number; oppWins: number; ties: number } {
  const pairings = getPairings() as { propWins: boolean | null; status: string }[];
  let propWins = 0, oppWins = 0, ties = 0;

  pairings.forEach(p => {
    if (p.status === 'completed') {
      if (p.propWins === true) propWins++;
      else if (p.propWins === false) oppWins++;
      else ties++;
    }
  });

  return { propWins, oppWins, ties };
}

export function getCurrentRound(): number {
  const pairings = getPairings() as { round: number }[];
  return pairings.reduce((m, p) => Math.max(m, p.round), 0);
}
