export type Team = {
  id: number;
  name: string;
  wins: number;
  speakerPoints: number;
};

export type Pairing = {
  round: number;
  room: string;
  proposition: string;
  opposition: string;
  judge: string;
  status: string;
  propWins: boolean | null;
};

export function generateSwissPairings(round: number, teams: Team[]): Pairing[] {
  const sorted = [...teams].sort(
    (a, b) =>
      b.wins - a.wins ||
      b.speakerPoints - a.speakerPoints ||
      a.name.localeCompare(b.name)
  );

  const pairings: Pairing[] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    const prop = sorted[i];
    const opp = sorted[i + 1];
    if (!prop || !opp) break;
    pairings.push({
      round,
      room: `R${round}-${pairings.length + 1}`,
      proposition: prop.name,
      opposition: opp.name,
      judge: 'TBD',
      status: 'scheduled',
      propWins: null,
    });
  }
  return pairings;
}
