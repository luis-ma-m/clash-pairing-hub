
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Trophy, User, Clock } from 'lucide-react';

const ScoringInterface = () => {
  const [selectedDebate, setSelectedDebate] = useState('A1');
  
  const mockDebates = [
    {
      room: 'A1',
      proposition: 'Oxford A',
      opposition: 'Cambridge B',
      judge: 'Dr. Sarah Wilson',
      status: 'scoring',
      propScore: null,
      oppScore: null
    },
    {
      room: 'A2',
      proposition: 'LSE Debaters',
      opposition: 'Edinburgh A',
      judge: 'Prof. Michael Brown',
      status: 'completed',
      propScore: 2,
      oppScore: 1
    }
  ];

  const mockSpeakerScores = [
    { speaker: 'Alice Johnson', team: 'Oxford A', position: 'PM', content: 78, style: 82, strategy: 80, total: 240 },
    { speaker: 'Bob Smith', team: 'Oxford A', position: 'DPM', content: 75, style: 79, strategy: 77, total: 231 },
    { speaker: 'David Brown', team: 'Cambridge B', position: 'LO', content: 81, style: 78, strategy: 83, total: 242 },
    { speaker: 'Emma Wilson', team: 'Cambridge B', position: 'DLO', content: 77, style: 81, strategy: 79, total: 237 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scoring Interface</h2>
          <p className="text-slate-600">Input and manage debate scores</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedDebate} onValueChange={setSelectedDebate}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select debate room" />
            </SelectTrigger>
            <SelectContent>
              {mockDebates.map((debate) => (
                <SelectItem key={debate.room} value={debate.room}>
                  Room {debate.room} - {debate.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Scores</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Debates</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Speaker Score</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">237.5</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Speakers</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score Entry - Room {selectedDebate}</CardTitle>
          <CardDescription>
            Enter team results and individual speaker scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="team-scores" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="team-scores">Team Scores</TabsTrigger>
              <TabsTrigger value="speaker-scores">Speaker Scores</TabsTrigger>
            </TabsList>
            
            <TabsContent value="team-scores" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50">Proposition</Badge>
                      Oxford A
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Team Points</label>
                        <Input type="number" min="0" max="3" placeholder="0-3" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Margin</label>
                        <Input type="number" placeholder="Point margin" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-50">Opposition</Badge>
                      Cambridge B
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Team Points</label>
                        <Input type="number" min="0" max="3" placeholder="0-3" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Margin</label>
                        <Input type="number" placeholder="Point margin" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button>Submit Team Scores</Button>
              </div>
            </TabsContent>

            <TabsContent value="speaker-scores" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Content (50-100)</TableHead>
                    <TableHead>Style (50-100)</TableHead>
                    <TableHead>Strategy (50-100)</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSpeakerScores.map((speaker, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{speaker.speaker}</TableCell>
                      <TableCell>{speaker.team}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{speaker.position}</Badge>
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="50" max="100" defaultValue={speaker.content} className="w-20" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="50" max="100" defaultValue={speaker.style} className="w-20" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="50" max="100" defaultValue={speaker.strategy} className="w-20" />
                      </TableCell>
                      <TableCell className="font-mono font-bold">{speaker.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-6 flex justify-end">
                <Button>Submit Speaker Scores</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoringInterface;
