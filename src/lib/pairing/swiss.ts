import { Pairing, Constraint, applyConstraints, ConstraintContext } from './constraints';
import { loadConstraintSettings } from './config';

export type SwissTeam = {
  name: string;
  wins: number;
  speakerPoints: number;
};

export async function generateSwissPairings(
  round: number,
  teams: SwissTeam[],
  previousPairings: Pairing[] = [],
  constraints: Constraint[] = [],
  rooms: string[] = [],
  judges: string[] = [],
): Promise<Pairing[]> {
  const settings = loadConstraintSettings();
  const active = constraints.filter(c => settings[c.type as keyof typeof settings]);

  const sorted = [...teams].sort(
    (a, b) =>
      b.wins - a.wins ||
      b.speakerPoints - a.speakerPoints ||
      a.name.localeCompare(b.name),
  );

  const pairings: Pairing[] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    const prop = sorted[i];
    const opp = sorted[i + 1];
    if (!prop || !opp) break;
    pairings.push({
      round,
      room: rooms[i / 2] || `R${round}-${pairings.length + 1}`,
      proposition: prop.name,
      opposition: opp.name,
      judge: judges[i / 2] || 'TBD',
      status: 'scheduled',
      propWins: null,
    });
  }
  const context: ConstraintContext = { previousPairings, roomList: rooms };
  return applyConstraints(pairings, active, context);
}
