
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Play, Pause, TrendingUp, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface TournamentManagementProps {
  activeTournament: {
    name: string;
    format: string;
    rounds: number;
    teams: number;
    status: string;
  };
}

const TournamentManagement = ({ activeTournament }: TournamentManagementProps) => {
  const currentRound = 3;
  const totalRounds = activeTournament.rounds;
  const progress = (currentRound / totalRounds) * 100;

  const fetchStandings = async () => {
    const res = await fetch('http://localhost:3001/api/analytics/standings');
    if (!res.ok) throw new Error('Failed fetching standings');
    return res.json();
  };

  const fetchPerformance = async () => {
    const res = await fetch('http://localhost:3001/api/analytics/performance');
    if (!res.ok) throw new Error('Failed fetching performance');
    return res.json();
  };

  const { data: teamStandings = [] } = useQuery({
    queryKey: ['tm-standings'],
    queryFn: fetchStandings,
    refetchInterval: 5000
  });

  const { data: performanceData = [] } = useQuery({
    queryKey: ['tm-performance'],
    queryFn: fetchPerformance,
    refetchInterval: 5000
  });

  const totalDebates = performanceData.reduce((acc, r) => acc + (r.debates || 0), 0);
  const avgSpeakerScore = (() => {
    if (!totalDebates) return 0;
    const sum = performanceData.reduce((acc, r) => acc + r.avgScore * r.debates, 0);
    return (sum / totalDebates).toFixed(1);
  })();

  const currentLeader = teamStandings[0]?.team || '-';
  const leaderPoints = teamStandings[0]?.points ?? 0;

  const quickStats = [
    { label: 'Total Debates', value: totalDebates, icon: Target },
    { label: 'Avg Speaker Score', value: avgSpeakerScore, icon: TrendingUp },
    { label: 'Active Teams', value: teamStandings.length, icon: Users },
    { label: 'Current Leader', value: `${currentLeader} (${leaderPoints})`, icon: Trophy }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tournament Progress</CardTitle>
            <CardDescription>Track the current state of your tournament</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Round Progress</span>
                <span>{currentRound} of {totalRounds} rounds</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                Pause Round
              </Button>
              <Button className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Next Round
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your tournament</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '2 min ago', action: 'Round 3 scoring completed for Room A', type: 'success' },
                { time: '5 min ago', action: 'Team Oxford A submitted speaker scores', type: 'info' },
                { time: '8 min ago', action: 'Judge Sarah M. requested score clarification', type: 'warning' },
                { time: '12 min ago', action: 'Round 3 pairings generated successfully', type: 'success' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-slate-900">{activity.action}</p>
                    <p className="text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Configuration</CardTitle>
          <CardDescription>Current settings for {activeTournament.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{activeTournament.format}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Debate Style</label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">British Parliamentary</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scoring System</label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Team Points + Speaker Scores</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentManagement;
