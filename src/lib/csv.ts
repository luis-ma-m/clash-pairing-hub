export type TeamCsv = {
  tournament_id: string;
  name: string;
  organization: string;
  speakers: string[];
};

export function teamsToCsv(teams: TeamCsv[]): string {
  const header =
    'Tournament ID,Team Name,Organization,Speaker 1,Speaker 2,Speaker 3,Speaker 4,Speaker 5';
  const rows = teams.map(team => {
    const [s1 = '', s2 = '', s3 = '', s4 = '', s5 = ''] = team.speakers;
    const values = [
      team.tournament_id,
      team.name,
      team.organization,
      s1,
      s2,
      s3,
      s4,
      s5,
    ];
    return values.map(v => `"${(v ?? '').replace(/"/g, '""')}"`).join(',');
  });
  return [header, ...rows].join('\n');
}

export function parseTeamsCsv(csv: string): TeamCsv[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  lines.shift();
  return lines.map(line => {
    const [
      tournament_id = '',
      name = '',
      organization = '',
      sp1 = '',
      sp2 = '',
      sp3 = '',
      sp4 = '',
      sp5 = '',
    ] = line.split(',');
    const clean = (v: string) => v.trim().replace(/^"|"$/g, '');
    const speakers = [sp1, sp2, sp3, sp4, sp5].map(clean).filter(Boolean);
    return {
      tournament_id: clean(tournament_id),
      name: clean(name),
      organization: clean(organization),
      speakers,
    };
  });
}
