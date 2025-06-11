import { parseTeamsCsv, teamsToCsv, TeamCsv } from '../csv';

describe('CSV utils', () => {
  const teams: TeamCsv[] = [
    { tournament_id: 't1', name: 'Alpha', organization: 'Org A', speakers: ['A1', 'A2'] },
    { tournament_id: 't1', name: 'Beta', organization: 'Org B', speakers: ['B1', 'B2', 'B3'] },
    { tournament_id: 't1', name: 'Gamma', organization: 'Org C', speakers: ['C1', 'C2', 'C3', 'C4'] },
    {
      tournament_id: 't1',
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
      'Tournament ID,Team Name,Organization,Speaker 1,Speaker 2,Speaker 3,Speaker 4,Speaker 5\n' +
      't1,Omega,Org X,X1,X2,X3,X4,X5\n' +
      't1,Sigma,Org Y,Y1,Y2,Y3,Y4,';
    expect(parseTeamsCsv(csv)).toEqual([
      {
        tournament_id: 't1',
        name: 'Omega',
        organization: 'Org X',
        speakers: ['X1', 'X2', 'X3', 'X4', 'X5'],
      },
      {
        tournament_id: 't1',
        name: 'Sigma',
        organization: 'Org Y',
        speakers: ['Y1', 'Y2', 'Y3', 'Y4'],
      },
    ]);
  });
});
