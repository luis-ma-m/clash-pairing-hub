
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Trophy, User, Clock } from 'lucide-react';
import { apiFetch } from "@/lib/api";

type Debate = {
  room: string;
  proposition: string;
  opposition: string;
  judge: string;
  status: string;
};

type SpeakerScore = {
  speaker: string;
  team: string;
  position: string;
  content: number;
  style: number;
  strategy: number;
  total: number;
};

const ScoringInterface = () => {
  const [selectedDebate, setSelectedDebate] = useState('');
  const [scoresData, setScoresData] = useState<SpeakerScore[]>([]);
  const queryClient = useQueryClient();

  const fetchDebates = async () => {
    const res = await apiFetch('/api/debates');
    if (!res.ok) throw new Error('Failed fetching debates');
    return res.json();
  };

  const { data: debates = [] } = useQuery<Debate[]>({ queryKey: ['debates'], queryFn: fetchDebates });

  const fetchSpeakerScores = async () => {
    if (!selectedDebate) return [];
    const res = await apiFetch(`/api/scores/${selectedDebate}`);
    if (!res.ok) throw new Error('Failed fetching scores');
    return res.json();
  };

  const { data: speakerScores = [] } = useQuery<SpeakerScore[]>({
    queryKey: ['scores', selectedDebate],
    queryFn: fetchSpeakerScores,
    enabled: !!selectedDebate
  });

  useEffect(() => {
    setScoresData(speakerScores);
  }, [speakerScores]);

  const { mutate: submitScores } = useMutation({
    mutationFn: async (scores: SpeakerScore[]) => {
      const res = await fetch('http://localhost:3001/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: selectedDebate, scores })
      });
      if (!res.ok) throw new Error('Failed submitting scores');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', selectedDebate] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });

  const handleSubmit = () => {
    const valid = scoresData.every(
      (s) => s.content >= 0 && s.content <= 100 && s.style >= 0 && s.style <= 100 && s.strategy >= 0 && s.strategy <= 100
    );
    if (!valid) {
      alert('Scores must be between 0 and 100');
      return;
    }
    submitScores(scoresData);
  };

  useEffect(() => {
    if (!selectedDebate && debates.length > 0) {
      setSelectedDebate(debates[0].room);
    }
  }, [debates, selectedDebate]);


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
              {debates.map((debate) => (
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
                    <TableHead>Content (0-100)</TableHead>
                    <TableHead>Style (0-100)</TableHead>
                    <TableHead>Strategy (0-100)</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoresData.map((speaker, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{speaker.speaker}</TableCell>
                      <TableCell>{speaker.team}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{speaker.position}</Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={speaker.content}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, Number(e.target.value)));
                            const newScores = [...scoresData];
                            newScores[index] = {
                              ...speaker,
                              content: val,
                              total: val + newScores[index].style + newScores[index].strategy,
                            };
                            setScoresData(newScores);
                          }}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={speaker.style}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, Number(e.target.value)));
                            const newScores = [...scoresData];
                            newScores[index] = {
                              ...speaker,
                              style: val,
                              total: val + newScores[index].content + newScores[index].strategy,
                            };
                            setScoresData(newScores);
                          }}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={speaker.strategy}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, Number(e.target.value)));
                            const newScores = [...scoresData];
                            newScores[index] = {
                              ...speaker,
                              strategy: val,
                              total: val + newScores[index].content + newScores[index].style,
                            };
                            setScoresData(newScores);
                          }}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell className="font-mono font-bold">{speaker.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSubmit}>Submit Speaker Scores</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoringInterface;
