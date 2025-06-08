import { Pairing, Constraint, applyConstraints, ConstraintContext } from './constraints';
import { loadConstraintSettings } from './config';

export async function generateSwissPairings(
  teams: string[],
  round: number,
  previousPairings: Pairing[],
  constraints: Constraint[] = [],
  rooms: string[] = []
): Promise<Pairing[]> {
  const settings = await loadConstraintSettings();
  const active = constraints.filter(c => settings[c.type as keyof typeof settings]);

  const sorted = [...teams].sort();
  const pairings: Pairing[] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    pairings.push({
      round,
      room: rooms[i / 2] || `Room ${i / 2 + 1}`,
      proposition: sorted[i],
      opposition: sorted[i + 1],
      status: 'scheduled',
    });
  }
  const context: ConstraintContext = { previousPairings, roomList: rooms };
  return applyConstraints(pairings, active, context);
}
