import { applyConstraints, NoRepeatMatch, Pairing } from '../constraints';

describe('applyConstraints', () => {
  it('avoids repeated matchups', () => {
    const prev: Pairing[] = [
      { round: 1, room: 'R1', proposition: 'A', opposition: 'B', status: 'done' }
    ];
    const current: Pairing[] = [
      { round: 2, room: 'R1', proposition: 'A', opposition: 'B' },
      { round: 2, room: 'R2', proposition: 'C', opposition: 'D' }
    ];
    const result = applyConstraints(current, [new NoRepeatMatch()], { previousPairings: prev });
    expect(result[0].opposition).not.toBe('B');
  });
});
