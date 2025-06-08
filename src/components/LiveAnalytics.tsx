
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';

const LiveAnalytics = () => {
  const teamStandings = [
    { rank: 1, team: 'Cambridge A', wins: 3, losses: 0, speakerPoints: 267.2, points: 9 },
    { rank: 2, team: 'Oxford A', wins: 2, losses: 1, speakerPoints: 245.5, points: 6 },
    { rank: 3, team: 'Edinburgh A', wins: 2, losses: 1, speakerPoints: 239.8, points: 6 },
    { rank: 4, team: 'LSE Debaters', wins: 1, losses: 2, speakerPoints: 198.7, points: 3 },
    { rank: 5, team: 'KCL Speakers', wins: 1, losses: 2, speakerPoints: 195.4, points: 3 }
  ];

  const speakerRankings = [
    { rank: 1, name: 'Alice Johnson', team: 'Oxford A', average: 82.5, total: 247.5 },
    { rank: 2, name: 'David Brown', team: 'Cambridge A', average: 81.8, total: 245.4 },
    { rank: 3, name: 'Emma Wilson', team: 'Cambridge A', average: 80.2, total: 240.6 },
    { rank: 4, name: 'Frank Miller', team: 'LSE Debaters', average: 79.1, total: 237.3 },
    { rank: 5, name: 'Grace Lee', team: 'Edinburgh A', average: 78.9, total: 236.7 }
  ];

  const performanceData = [
    { round: 'R1', avgScore: 235.4, debates: 12 },
    { round: 'R2', avgScore: 238.2, debates: 12 },
    { round: 'R3', avgScore: 241.1, debates: 12 },
    { round: 'R4', avgScore: 239.8, debates: 8 }
  ];

  const resultDistribution = [
    { name: 'Proposition Wins', value: 18, color: '#3b82f6' },
    { name: 'Opposition Wins', value: 14, color: '#ef4444' },
    { name: 'Ties', value: 2, color: '#6b7280' }
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
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">+8 from last round</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Speaker Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">238.7</div>
            <p className="text-xs text-muted-foreground">+2.3 from R3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">All participating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Leader</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Cambridge A</div>
            <p className="text-xs text-muted-foreground">9 points, undefeated</p>
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
