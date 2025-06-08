/** @jest-environment node */
import { swissPairings, generateBracket, Pairing, Team } from '../pairingUtils';

describe('Swiss pairing algorithm', () => {
  it('generates pairings and assigns BYE with odd number of teams', () => {
    const teams: Team[] = [
      { name: 'A', wins: 2, speakerPoints: 75 },
      { name: 'B', wins: 2, speakerPoints: 70 },
      { name: 'C', wins: 1, speakerPoints: 60 },
      { name: 'D', wins: 1, speakerPoints: 50 },
      { name: 'E', wins: 0, speakerPoints: 40 },
    ];
    const history: Pairing[] = [{ proposition: 'A', opposition: 'B' }];
    const result = swissPairings(teams, history);
    expect(result.bye).toBe('E');
    // ensure no rematch of A vs B
    const match = result.pairings.some(
      p =>
        [p.proposition, p.opposition].sort().join('-') ===
        ['A', 'B'].sort().join('-')
    );
    expect(match).toBe(false);
    expect(result.pairings).toHaveLength(2);
  });
});

describe('Bracket generation', () => {
  it('pairs top and bottom seeds correctly', () => {
    const teams: Team[] = [
      { name: 'A', wins: 4, speakerPoints: 90 },
      { name: 'B', wins: 3, speakerPoints: 85 },
      { name: 'C', wins: 3, speakerPoints: 80 },
      { name: 'D', wins: 2, speakerPoints: 70 },
      { name: 'E', wins: 2, speakerPoints: 65 },
      { name: 'F', wins: 1, speakerPoints: 60 },
      { name: 'G', wins: 1, speakerPoints: 55 },
      { name: 'H', wins: 0, speakerPoints: 50 },
    ];
    const bracket = generateBracket(teams);
    expect(bracket).toEqual([
      { proposition: 'A', opposition: 'H' },
      { proposition: 'B', opposition: 'G' },
      { proposition: 'C', opposition: 'F' },
      { proposition: 'D', opposition: 'E' },
    ]);
  });
});
