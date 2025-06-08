/** @jest-environment node */
import { applyConstraints, JudgeAvailability, Pairing } from '../../src/lib/pairing/constraints';

describe('JudgeAvailability constraint', () => {
  it('removes judges who are unavailable for a round', () => {
    const pairings: Pairing[] = [
      { round: 1, room: 'R1', proposition: 'A', opposition: 'B', judge: 'J1' },
      { round: 1, room: 'R2', proposition: 'C', opposition: 'D', judge: 'J2' }
    ];

    const result = applyConstraints(
      pairings,
      [new JudgeAvailability({ J1: [2], J2: [1] })],
      { previousPairings: [] }
    );

    expect(result[0].judge).toBeUndefined();
    expect(result[1].judge).toBe('J2');
  });
});
