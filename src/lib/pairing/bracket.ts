export type Team = {
  name: string;
  wins?: number;
  losses?: number;
  speakerPoints?: number;
};

export interface BracketMatch {
  id: string;
  team1: string | null;
  team2: string | null;
  winner?: string | null;
}

export interface BracketRound {
  round: number;
  matches: BracketMatch[];
}

export interface Bracket {
  type: 'single' | 'double';
  rounds: BracketRound[];
  losers?: BracketRound[];
}

function nextPowerOfTwo(n: number) {
  return 1 << Math.ceil(Math.log2(n));
}

export function generateEliminationBracket(
  teams: Team[],
  type: 'single' | 'double',
): Bracket {
  if (!teams.length) return { type, rounds: [], losers: type === 'double' ? [] : undefined };

  const sorted = [...teams].sort((a, b) => {
    const wA = a.wins ?? 0;
    const wB = b.wins ?? 0;
    if (wA !== wB) return wB - wA;
    const spA = a.speakerPoints ?? 0;
    const spB = b.speakerPoints ?? 0;
    return spB - spA;
  });

  const size = nextPowerOfTwo(sorted.length);
  for (let i = sorted.length; i < size; i++) {
    sorted.push({ name: null as unknown as string });
  }

  const rounds: BracketRound[] = [];
  let current = sorted.map(t => t.name);
  let round = 1;
  while (current.length > 1) {
    const matches: BracketMatch[] = [];
    for (let i = 0; i < current.length / 2; i++) {
      const team1 = current[i] ?? null;
      const team2 = current[current.length - 1 - i] ?? null;
      matches.push({ id: `R${round}M${i + 1}`, team1, team2, winner: null });
    }
    rounds.push({ round, matches });
    current = new Array(matches.length).fill(null);
    round++;
  }

  const bracket: Bracket = { type, rounds };
  if (type === 'double') bracket.losers = [];
  return bracket;
}

export function updateBracketWithResults(
  bracket: Bracket,
  pairings: { proposition: string; opposition: string; propWins: boolean | null; round: number }[],
): Bracket {
  const updated: Bracket = JSON.parse(JSON.stringify(bracket));

  for (let r = 0; r < updated.rounds.length; r++) {
    const round = updated.rounds[r];
    round.matches.forEach(m => {
      const p = pairings.find(
        pr =>
          pr.round === round.round &&
          ((pr.proposition === m.team1 && pr.opposition === m.team2) ||
            (pr.opposition === m.team1 && pr.proposition === m.team2)),
      );
      if (p && p.propWins !== null) {
        m.winner = p.propWins ? p.proposition : p.opposition;
      }
    });

    const winners = round.matches.map(m => m.winner).filter(Boolean) as string[];
    const next = updated.rounds[r + 1];
    if (next) {
      for (let i = 0; i < winners.length; i += 2) {
        const idx = Math.floor(i / 2);
        if (next.matches[idx]) {
          next.matches[idx].team1 = winners[i] ?? next.matches[idx].team1;
          next.matches[idx].team2 = winners[i + 1] ?? next.matches[idx].team2;
        }
      }
    }
  }

  return updated;
}
