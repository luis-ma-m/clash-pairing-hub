import { Pairing, Constraint, applyConstraints, ConstraintContext } from './constraints';
import { loadConstraintSettings } from './config';

export async function generateBracket(
  teams: string[],
  previousPairings: Pairing[],
  constraints: Constraint[] = [],
  rooms: string[] = []
): Promise<Pairing[]> {
  const settings = await loadConstraintSettings();
  const active = constraints.filter(c => settings[c.type as keyof typeof settings]);

  const pairings: Pairing[] = [];
  const n = teams.length;
  for (let i = 0; i < n / 2; i++) {
    pairings.push({
      round: 1,
      room: rooms[i] || `Room ${i + 1}`,
      proposition: teams[i],
      opposition: teams[n - 1 - i],
      status: 'scheduled',
    });
  }
  const context: ConstraintContext = { previousPairings, roomList: rooms };
  return applyConstraints(pairings, active, context);
}
