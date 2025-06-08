import { parseTeamsCsv, teamsToCsv, TeamCsv } from '../csv';

describe('CSV utils', () => {
  const teams: TeamCsv[] = [
    { name: 'Alpha', organization: 'Org A', speakers: ['A1', 'A2'] },
    { name: 'Beta', organization: 'Org B', speakers: ['B1', 'B2', 'B3'] }
  ];

  it('converts teams to CSV and back', () => {
    const csv = teamsToCsv(teams);
    const parsed = parseTeamsCsv(csv);
    expect(parsed).toEqual(teams);
  });

  it('parses CSV string', () => {
    const csv = 'Team Name,Organization,Speaker 1,Speaker 2,Speaker 3\n' +
      'Gamma,Org C,C1,C2,';
    expect(parseTeamsCsv(csv)).toEqual([
      { name: 'Gamma', organization: 'Org C', speakers: ['C1', 'C2'] }
    ]);
  });
});
