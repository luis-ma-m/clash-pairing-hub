
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const LiveAnalytics = () => {
  const fetchStandings = async () => {
    const res = await apiFetch('/api/analytics/standings');
    if (!res.ok) throw new Error('Failed fetching standings');
    return res.json();
  };

  const fetchSpeakers = async () => {
    const res = await apiFetch('/api/analytics/speakers');
    if (!res.ok) throw new Error('Failed fetching speakers');
    return res.json();
  };

  const fetchPerformance = async () => {
    const res = await apiFetch('/api/analytics/performance');
    if (!res.ok) throw new Error('Failed fetching performance');
    return res.json();
  };

  const fetchResults = async () => {
    const res = await apiFetch('/api/analytics/results');
    if (!res.ok) throw new Error('Failed fetching results');
    return res.json();
  };

  const { data: teamStandings = [] } = useQuery({
    queryKey: ['team-standings'],
    queryFn: fetchStandings,
    refetchInterval: 5000
  });

  const { data: speakerRankings = [] } = useQuery({
    queryKey: ['speaker-rankings'],
    queryFn: fetchSpeakers,
    refetchInterval: 5000
  });

  const { data: performanceData = [] } = useQuery({
    queryKey: ['performance-data'],
    queryFn: fetchPerformance,
    refetchInterval: 5000
  });

  const { data: resultDistributionRaw = { propWins: 0, oppWins: 0, ties: 0 } } = useQuery({
    queryKey: ['result-distribution'],
    queryFn: fetchResults,
    refetchInterval: 5000
  });

  const resultDistribution = [
    { name: 'Proposition Wins', value: resultDistributionRaw.propWins, color: '#3b82f6' },
    { name: 'Opposition Wins', value: resultDistributionRaw.oppWins, color: '#ef4444' },
    { name: 'Ties', value: resultDistributionRaw.ties, color: '#6b7280' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Live Analytics</h2>
          <p className="text-slate-600">Real-time tournament statistics and insights</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          Live Updates
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debates</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.reduce((acc, r) => acc + (r.debates || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Speaker Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const totalDebates = performanceData.reduce((acc, r) => acc + (r.debates || 0), 0);
                if (!totalDebates) return 0;
                const sum = performanceData.reduce((acc, r) => acc + r.avgScore * r.debates, 0);
                return (sum / totalDebates).toFixed(1);
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStandings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Leader</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamStandings[0]?.team || '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {teamStandings[0] ? `${teamStandings[0].points} points` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Standings</CardTitle>
            <CardDescription>Current tournament rankings</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>W-L</TableHead>
                  <TableHead>Pts</TableHead>
                  <TableHead>Spkr Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamStandings.map((team) => (
                  <TableRow key={team.rank}>
                    <TableCell className="font-bold">{team.rank}</TableCell>
                    <TableCell className="font-medium">{team.team}</TableCell>
                    <TableCell className="font-mono">{team.wins}-{team.losses}</TableCell>
                    <TableCell className="font-bold">{team.points}</TableCell>
                    <TableCell className="font-mono">{team.speakerPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Speaker Rankings</CardTitle>
            <CardDescription>Top individual speakers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Speaker</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Avg</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {speakerRankings.map((speaker) => (
                  <TableRow key={speaker.rank}>
                    <TableCell className="font-bold">{speaker.rank}</TableCell>
                    <TableCell className="font-medium">{speaker.name}</TableCell>
                    <TableCell>{speaker.team}</TableCell>
                    <TableCell className="font-mono">{speaker.average}</TableCell>
                    <TableCell className="font-mono">{speaker.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Average speaker scores by round</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="round" />
                <YAxis domain={[230, 245]} />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result Distribution</CardTitle>
            <CardDescription>Proposition vs Opposition wins</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resultDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resultDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Round Performance</CardTitle>
          <CardDescription>Number of debates and average scores per round</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="round" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="debates" fill="#3b82f6" name="Debates" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveAnalytics;
