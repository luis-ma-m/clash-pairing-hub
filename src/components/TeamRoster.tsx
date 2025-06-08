
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, Download, Search, Edit, Trash2 } from 'lucide-react';
import { apiFetch } from "@/lib/api";

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
  const [speaker1, setSpeaker1] = useState('');
  const [speaker2, setSpeaker2] = useState('');
  const [speaker3, setSpeaker3] = useState('');

  const queryClient = useQueryClient();

  const fetchTeams = async () => {
    const res = await apiFetch('/api/teams');
    if (!res.ok) throw new Error('Failed fetching teams');
    return res.json();
  };

  const { data: teams = [] } = useQuery<Team[]>({ queryKey: ['teams'], queryFn: fetchTeams });

  const addTeam = async () => {
    const res = await apiFetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: teamName,
        organization,
        speakers: [speaker1, speaker2, speaker3].filter(Boolean)
      })
    });
    if (!res.ok) throw new Error('Failed to add team');
    return res.json();
  };

  const { mutateAsync: createTeam } = useMutation({
    mutationFn: addTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-slate-600">Manage teams, speakers, and registrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
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
                <Input placeholder="Speaker 1 Name" value={speaker1} onChange={(e) => setSpeaker1(e.target.value)} />
                <Input placeholder="Speaker 2 Name" value={speaker2} onChange={(e) => setSpeaker2(e.target.value)} />
                <Input placeholder="Speaker 3 Name (optional)" value={speaker3} onChange={(e) => setSpeaker3(e.target.value)} />
                <Button
                  className="w-full"
                  onClick={async () => {
                    await createTeam();
                    setTeamName('');
                    setOrganization('');
                    setSpeaker1('');
                    setSpeaker2('');
                    setSpeaker3('');
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
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between">
                <span>Total Speakers</span>
                <span className="font-semibold">67</span>
              </div>
              <div className="flex justify-between">
                <span>Average Team Size</span>
                <span className="font-semibold">2.8</span>
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
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between">
                <span>High Schools</span>
                <span className="font-semibold">4</span>
              </div>
              <div className="flex justify-between">
                <span>Clubs</span>
                <span className="font-semibold">2</span>
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
                <span className="font-semibold text-green-600">22</span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-semibold text-yellow-600">2</span>
              </div>
              <div className="flex justify-between">
                <span>Waitlisted</span>
                <span className="font-semibold text-slate-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamRoster;
