/** @jest-environment node */
import { generateSwissPairings } from '../pairing/swiss';

const teams = [
  { id: 1, name: 'Alpha', wins: 2, speakerPoints: 80 },
  { id: 2, name: 'Bravo', wins: 2, speakerPoints: 90 },
  { id: 3, name: 'Charlie', wins: 1, speakerPoints: 70 },
  { id: 4, name: 'Delta', wins: 0, speakerPoints: 60 }
];

describe('generateSwissPairings', () => {
  it('orders teams by wins then speaker points', async () => {
    const pairings = await generateSwissPairings(2, teams);
    expect(pairings[0].proposition).toBe('Bravo');
    expect(pairings[0].opposition).toBe('Alpha');
  });

  it('pairs adjacent teams', async () => {
    const pairings = await generateSwissPairings(2, teams);
    expect(pairings).toHaveLength(2);
    expect(pairings[1].proposition).toBe('Charlie');
    expect(pairings[1].opposition).toBe('Delta');
  });
});
