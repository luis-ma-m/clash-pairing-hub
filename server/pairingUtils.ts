export interface Team {
  name: string;
  wins: number;
  speakerPoints: number;
}

export interface Pairing {
  proposition: string;
  opposition: string;
}

export interface SwissResult {
  pairings: Pairing[];
  bye: string | null;
}

export function swissPairings(
  teams: Team[],
  history: Pairing[] = []
): SwissResult {
  const sorted = [...teams].sort(
    (a, b) => b.wins - a.wins || b.speakerPoints - a.speakerPoints
  );

  let bye: string | null = null;
  if (sorted.length % 2 === 1) {
    bye = sorted.pop()!.name;
  }

  const played = new Set(
    history.map(h => [h.proposition, h.opposition].sort().join('|'))
  );

  const pairings: Pairing[] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    let a = sorted[i];
    let b = sorted[i + 1];
    if (played.has([a.name, b.name].sort().join('|')) && i + 2 < sorted.length) {
      const c = sorted[i + 2];
      sorted[i + 1] = c;
      sorted[i + 2] = b;
      b = c;
    }
    pairings.push({ proposition: a.name, opposition: b.name });
  }

  return { pairings, bye };
}

export function generateBracket(teams: Team[]): Pairing[] {
  const sorted = [...teams].sort(
    (a, b) => b.wins - a.wins || b.speakerPoints - a.speakerPoints
  );
  const pairings: Pairing[] = [];
  for (let i = 0; i < Math.floor(sorted.length / 2); i++) {
    pairings.push({
      proposition: sorted[i].name,
      opposition: sorted[sorted.length - 1 - i].name,
    });
  }
  return pairings;
}
