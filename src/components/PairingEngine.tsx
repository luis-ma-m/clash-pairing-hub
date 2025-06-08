
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shuffle, Play, Clock, MapPin, CheckCircle } from 'lucide-react';

type Pairing = {
  id: number;
  round: number;
  room: string;
  proposition: string;
  opposition: string;
  judge: string;
  status: string;
  propWins: boolean | null;
};

type PairingsResponse = {
  currentRound: number;
  pairings: Pairing[];
};

const PairingEngine = () => {
  const [pairingAlgorithm, setPairingAlgorithm] = useState('swiss');

  const queryClient = useQueryClient();
  
  const fetchPairings = async (): Promise<PairingsResponse> => {
    const res = await fetch('http://localhost:3001/api/pairings');
    if (!res.ok) throw new Error('Failed fetching pairings');
    return res.json();
  };

  const { data } = useQuery<PairingsResponse>({ queryKey: ['pairings'], queryFn: fetchPairings });
  const pairings = data?.pairings ?? [];
  const currentRound = data?.currentRound ?? 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'upcoming':
        return <Badge className="bg-gray-100 text-gray-800">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const generatePairings = async () => {
    await fetch('http://localhost:3001/api/pairings/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm: pairingAlgorithm, round: currentRound })
    });
  };

  const { mutateAsync: generate } = useMutation({
    mutationFn: generatePairings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairings'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pairing Engine</h2>
          <p className="text-slate-600">Generate and manage debate pairings</p>
        </div>
        <div className="flex gap-3">
          <Select value={pairingAlgorithm} onValueChange={setPairingAlgorithm}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="swiss">Swiss System</SelectItem>
              <SelectItem value="power">Power Pairing</SelectItem>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="round-robin">Round Robin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => generate()} className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Generate Pairings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Round</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentRound}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Debates</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pairings.filter((p) => p.round === currentRound && p.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pairings.filter((p) => p.round === currentRound && p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms Used</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pairings.filter(p => p.round === currentRound).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Round {currentRound} Pairings</CardTitle>
          <CardDescription>
            Generated using {pairingAlgorithm} algorithm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Proposition</TableHead>
                <TableHead>Opposition</TableHead>
                <TableHead>Judge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairings.filter(p => p.round === currentRound).map((pairing) => (
                <TableRow key={pairing.id}>
                  <TableCell className="font-medium">{pairing.room}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50">Prop</Badge>
                      {pairing.proposition}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-50">Opp</Badge>
                      {pairing.opposition}
                    </div>
                  </TableCell>
                  <TableCell>{pairing.judge}</TableCell>
                  <TableCell>{getStatusBadge(pairing.status)}</TableCell>
                  <TableCell>
                    {pairing.status === 'completed' ? (
                      <Badge variant={pairing.propWins ? 'default' : 'secondary'}>
                        {pairing.propWins ? 'Prop Win' : 'Opp Win'}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pairing Algorithm Details</CardTitle>
          <CardDescription>
            Configuration and constraints for the selected algorithm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Hard Constraints</h4>
              <ul className="text-sm space-y-1 text-slate-600">
                <li>• No team can debate itself</li>
                <li>• No team can debate the same opponent twice</li>
                <li>• Room capacity must not be exceeded</li>
                <li>• Judge conflicts are avoided</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Soft Constraints</h4>
              <ul className="text-sm space-y-1 text-slate-600">
                <li>• Balance proposition/opposition sides</li>
                <li>• Minimize strength differences</li>
                <li>• Avoid judge preferences where possible</li>
                <li>• Consider geographical distribution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PairingEngine;
