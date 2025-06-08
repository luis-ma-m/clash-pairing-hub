import { parseTeamsCsv, teamsToCsv, TeamCsv } from '../csv';

describe('CSV utils', () => {
  const teams: TeamCsv[] = [
    { name: 'Alpha', organization: 'Org A', speakers: ['A1', 'A2'] },
    { name: 'Beta', organization: 'Org B', speakers: ['B1', 'B2', 'B3'] },
    { name: 'Gamma', organization: 'Org C', speakers: ['C1', 'C2', 'C3', 'C4'] },
    {
      name: 'Delta',
      organization: 'Org D',
      speakers: ['D1', 'D2', 'D3', 'D4', 'D5'],
    },
  ];

  it('converts teams to CSV and back', () => {
    const csv = teamsToCsv(teams);
    const parsed = parseTeamsCsv(csv);
    expect(parsed).toEqual(teams);
  });

  it('parses CSV string with varying speaker counts', () => {
    const csv =
      'Team Name,Organization,Speaker 1,Speaker 2,Speaker 3,Speaker 4,Speaker 5\n' +
      'Omega,Org X,X1,X2,X3,X4,X5\n' +
      'Sigma,Org Y,Y1,Y2,Y3,Y4,';
    expect(parseTeamsCsv(csv)).toEqual([
      {
        name: 'Omega',
        organization: 'Org X',
        speakers: ['X1', 'X2', 'X3', 'X4', 'X5'],
      },
      {
        name: 'Sigma',
        organization: 'Org Y',
        speakers: ['Y1', 'Y2', 'Y3', 'Y4'],
      },
    ]);
  });
});
