export type TeamCsv = {
  name: string;
  organization: string;
  speakers: string[];
};

export function teamsToCsv(teams: TeamCsv[]): string {
  const header = 'Team Name,Organization,Speaker 1,Speaker 2,Speaker 3';
  const rows = teams.map(team => {
    const [s1 = '', s2 = '', s3 = ''] = team.speakers;
    const values = [team.name, team.organization, s1, s2, s3];
    return values.map(v => `"${(v ?? '').replace(/"/g, '""')}"`).join(',');
  });
  return [header, ...rows].join('\n');
}

export function parseTeamsCsv(csv: string): TeamCsv[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  lines.shift();
  return lines.map(line => {
    const [name = '', organization = '', sp1 = '', sp2 = '', sp3 = ''] = line.split(',');
    const clean = (v: string) => v.trim().replace(/^"|"$/g, '');
    const speakers = [sp1, sp2, sp3].map(clean).filter(Boolean);
    return { name: clean(name), organization: clean(organization), speakers };
  });
}
