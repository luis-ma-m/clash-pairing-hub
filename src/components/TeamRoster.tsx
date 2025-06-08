
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, Download, Search, Edit, Trash2 } from 'lucide-react';
import { useTeams } from "@/lib/hooks/useTeams";
import { parseTeamsCsv, teamsToCsv, type TeamCsv } from "@/lib/csv";

type Team = {
  id: number;
  name: string;
  organization: string;
  speakers: string[];
  wins: number;
  losses: number;
  speakerPoints: number;
};

const TeamRoster = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamName, setTeamName] = useState('');
  const [organization, setOrganization] = useState('');
  const [speakers, setSpeakers] = useState<string[]>(['', '']);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addSpeakerField = () => {
    if (speakers.length >= 5) return;
    setSpeakers([...speakers, '']);
  };

  const removeSpeakerField = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const updateSpeaker = (index: number, value: string) => {
    const updated = [...speakers];
    updated[index] = value;
    setSpeakers(updated);
  };

  const { teams, addTeam, updateTeam, deleteTeam } = useTeams();


  const createTeam = async () => {
    const validSpeakers = speakers.filter(Boolean);
    if (validSpeakers.length > 5) {
      throw new Error('Cannot add more than 5 speakers');
    }
    await addTeam({ name: teamName, organization, speakers: validSpeakers });
  };

  const editTeam = async (payload: { id: number; updates: Partial<Team> }) => {
    await updateTeam(payload);
  };

  const removeTeam = async (id: number) => {
    await deleteTeam(id);
  };

  const handleExport = () => {
    const data: TeamCsv[] = teams.map(t => ({
      name: t.name,
      organization: t.organization,
      speakers: t.speakers,
    }));
    const csv = teamsToCsv(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teams.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseTeamsCsv(text);
    for (const team of parsed) {
      await addTeam(team);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTeams = teams.length;
  const totalSpeakers = teams.reduce((acc, t) => acc + t.speakers.length, 0);
  const averageTeamSize = totalTeams ? (totalSpeakers / totalTeams).toFixed(1) : '0';

  let universities = 0;
  let highSchools = 0;
  let clubs = 0;
  teams.forEach((t) => {
    const org = t.organization.toLowerCase();
    if (org.includes('university')) universities += 1;
    else if (org.includes('school')) highSchools += 1;
    else if (org.includes('club')) clubs += 1;
  });

  const confirmed = teams.length;
  const pending = 0;
  const waitlisted = 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-slate-600">Manage teams, speakers, and registrations</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Team</DialogTitle>
                <DialogDescription>
                  Register a new team for the tournament
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                <Input placeholder="Organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
                {speakers.map((spk, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Speaker ${index + 1} Name${index < 2 ? '' : ' (optional)'}`}
                      value={spk}
                      onChange={(e) => updateSpeaker(index, e.target.value)}
                    />
                    {speakers.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => removeSpeakerField(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {speakers.length < 5 && (
                  <Button type="button" variant="outline" onClick={addSpeakerField}>
                    Add Speaker
                  </Button>
                )}
                <Button
                  className="w-full"
                  onClick={async () => {
                    // Validate speaker count
                    const validSpeakers = speakers.filter(Boolean);
                    if (validSpeakers.length < 1) {
                      alert('Team must have at least one speaker');
                      return;
                    }
                    if (validSpeakers.length > 5) {
                      alert('Cannot add more than 5 speakers');
                      return;
                    }
                    try {
                      await createTeam();
                      setTeamName('');
                      setOrganization('');
                      setSpeakers(['', '']);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      setOpen(false);
                    } catch (err) {
                      console.error(err);
                      alert(err instanceof Error ? err.message : 'Failed to create team');
                    }
                  }}
                >
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Registered Teams</CardTitle>
              <CardDescription>{filteredTeams.length} teams registered</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search teams or organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Speakers</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Speaker Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.organization}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {team.speakers.map((speaker, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {speaker}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">{team.wins}W - {team.losses}L</span>
                  </TableCell>
                  <TableCell className="font-mono">{team.speakerPoints}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const name = prompt('Team name', team.name);
                          if (name) await editTeam({ id: team.id, updates: { name } });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (confirm('Delete team?')) await removeTeam(team.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Teams</span>
                <span className="font-semibold">{totalTeams}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Speakers</span>
                <span className="font-semibold">{totalSpeakers}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Team Size</span>
                <span className="font-semibold">{averageTeamSize}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organization Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Universities</span>
                <span className="font-semibold">{universities}</span>
              </div>
              <div className="flex justify-between">
                <span>High Schools</span>
                <span className="font-semibold">{highSchools}</span>
              </div>
              <div className="flex justify-between">
                <span>Clubs</span>
                <span className="font-semibold">{clubs}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Confirmed</span>
                <span className="font-semibold text-green-600">{confirmed}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-semibold text-yellow-600">{pending}</span>
              </div>
              <div className="flex justify-between">
                <span>Waitlisted</span>
                <span className="font-semibold text-slate-600">{waitlisted}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamRoster;
