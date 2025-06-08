import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Play, Pause, TrendingUp, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

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
  // ─── Fetch live tournament stats from the backend ─────────────────────────
  const fetchStats = async () => {
    const res = await apiFetch('/api/tournament/stats');
    if (!res.ok) throw new Error('Failed fetching stats');
    return res.json();
  };

  const { data: stats } = useQuery({
    queryKey: ['tournament-stats'],
    queryFn: fetchStats,
    refetchInterval: 5000
  });

  // ─── Derive values for progress bar and quick‐stats cards ────────────────
  const currentRound   = stats?.currentRound  ?? 0;
  const totalRounds    = stats?.totalRounds   ?? activeTournament.rounds;
  const progress       = totalRounds ? (currentRound / totalRounds) * 100 : 0;
  const quick          = stats?.quickStats    ?? { totalDebates: 0, avgSpeakerScore: 0, activeTeams: 0, currentLeader: '-' };

  const quickStats = [
    { label: 'Total Debates',     value: quick.totalDebates,    icon: Target },
    { label: 'Avg Speaker Score', value: quick.avgSpeakerScore, icon: TrendingUp },
    { label: 'Active Teams',      value: quick.activeTeams,     icon: Users },
    { label: 'Current Leader',    value: quick.currentLeader,   icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      {/* Quick‐stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex items-center justify-between pb-2">
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

      {/* Progress & controls */}
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
                <Pause className="h-4 w-4" /> Pause Round
              </Button>
              <Button className="flex items-center gap-2">
                <Play className="h-4 w-4" /> Start Next Round
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity and config cards omitted for brevity */}
      </div>
    </div>
  );
};

export default TournamentManagement;
