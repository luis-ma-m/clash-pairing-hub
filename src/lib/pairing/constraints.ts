export type Pairing = {
  tournament_id?: string
  round: number;
  room: string;
  proposition: string;
  opposition: string;
  judge?: string;
  status?: string;
  propWins?: boolean | null;
};

export interface ConstraintContext {
  previousPairings: Pairing[];
  roomList?: string[];
  judgesAvailability?: Record<string, number[]>;
  roomCapacity?: Record<string, number>;
}

export interface Constraint {
  type: string;
  apply(pairings: Pairing[], context: ConstraintContext): Pairing[];
}

function canonical(a: string, b: string) {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

export class NoRepeatMatch implements Constraint {
  type = 'NoRepeatMatch' as const;
  apply(pairings: Pairing[], context: ConstraintContext): Pairing[] {
    const history = new Set(
      context.previousPairings.map(p => canonical(p.proposition, p.opposition))
    );
    const used = new Set<string>();
    for (let i = 0; i < pairings.length; i++) {
      const p = pairings[i];
      let key = canonical(p.proposition, p.opposition);
      if (history.has(key) || used.has(key)) {
        for (let j = i + 1; j < pairings.length; j++) {
          const alt1 = canonical(p.proposition, pairings[j].opposition);
          const alt2 = canonical(pairings[j].proposition, p.opposition);
          if (
            !history.has(alt1) &&
            !used.has(alt1) &&
            !history.has(alt2) &&
            !used.has(alt2)
          ) {
            const tmp = pairings[i].opposition;
            pairings[i].opposition = pairings[j].opposition;
            pairings[j].opposition = tmp;
            key = canonical(pairings[i].proposition, pairings[i].opposition);
            used.add(key);
            used.add(canonical(pairings[j].proposition, pairings[j].opposition));
            break;
          }
        }
      } else {
        used.add(key);
      }
    }
    return pairings;
  }
}

export class JudgeAvailability implements Constraint {
  type = 'JudgeAvailability' as const;
  constructor(public availability: Record<string, number[]>) {}
  apply(pairings: Pairing[], _context: ConstraintContext): Pairing[] {
    for (const p of pairings) {
      if (
        p.judge &&
        this.availability[p.judge] &&
        !this.availability[p.judge].includes(p.round)
      ) {
        // judge unavailable, remove assignment
        p.judge = undefined;
      }
    }
    return pairings;
  }
}

export class RoomCapacity implements Constraint {
  type = 'RoomCapacity' as const;
  constructor(public capacity: Record<string, number>, public rooms: string[]) {}
  apply(pairings: Pairing[], _context: ConstraintContext): Pairing[] {
    const count: Record<string, number> = {};
    for (const p of pairings) {
      const cap = this.capacity[p.room] ?? 1;
      count[p.room] = (count[p.room] || 0) + 1;
      if (count[p.room] > cap) {
        // find free room
        const target = this.rooms.find(r => (count[r] || 0) < (this.capacity[r] ?? 1));
        if (target) {
          p.room = target;
          count[target] = (count[target] || 0) + 1;
        }
      }
    }
    return pairings;
  }
}

export function applyConstraints(
  pairings: Pairing[],
  constraints: Constraint[],
  context: ConstraintContext
): Pairing[] {
  return constraints.reduce((acc, c) => c.apply(acc, context), pairings);
}
