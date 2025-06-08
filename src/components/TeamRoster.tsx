
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, Download, Search, Edit, Trash2 } from 'lucide-react';

const TeamRoster = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const mockTeams = [
    {
      id: 1,
      name: 'Oxford A',
      organization: 'Oxford University',
      speakers: ['Alice Johnson', 'Bob Smith', 'Carol White'],
      wins: 2,
      losses: 1,
      speakerPoints: 245.5
    },
    {
      id: 2,
      name: 'Cambridge A',
      organization: 'Cambridge University',
      speakers: ['David Brown', 'Emma Wilson'],
      wins: 3,
      losses: 0,
      speakerPoints: 267.2
    },
    {
      id: 3,
      name: 'LSE Debaters',
      organization: 'London School of Economics',
      speakers: ['Frank Miller', 'Grace Lee', 'Henry Clark', 'Ivy Davis'],
      wins: 1,
      losses: 2,
      speakerPoints: 198.7
    }
  ];

  const filteredTeams = mockTeams.filter(team => 
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
                <Input placeholder="Team Name" />
                <Input placeholder="Organization" />
                <Input placeholder="Speaker 1 Name" />
                <Input placeholder="Speaker 2 Name" />
                <Input placeholder="Speaker 3 Name (optional)" />
                <Button className="w-full">Create Team</Button>
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
