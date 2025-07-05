import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Users, Trophy, Play, Pause, TrendingUp, Target, Trash2 } from 'lucide-react';
import { useTournaments, Tournament } from '@/lib/hooks/useTournaments';
import {
  getTeamStandings,
  getRoundPerformance,
  getCurrentRound,
} from '@/lib/localAnalytics';
import { getPairings, setPairings } from '@/lib/localData';
import { generateSwissPairings, SwissTeam } from '@/lib/pairing';

interface TournamentManagementProps {
  activeTournament: {
    name: string;
    format: string;
    rounds: number;
    teams: number;
    status: string;
    settings?: Record<string, unknown>;
  };
}

const TournamentManagement = ({ activeTournament }: TournamentManagementProps) => {
  // ─── Compute live tournament stats from localStorage ──────────────────────
  const fetchStats = async () => {
    const pairings = getPairings();
    const currentRound = getCurrentRound();
    const performance = getRoundPerformance();
    const totalDebates = pairings.length;
    const avgSpeakerScore = (() => {
      const total = performance.reduce((acc, r) => acc + r.avgScore * r.debates, 0);
      const count = performance.reduce((acc, r) => acc + r.debates, 0);
      return count ? Number((total / count).toFixed(1)) : 0;
    })();
    const standings = getTeamStandings();
    const currentLeader = standings[0]?.team || '-';
    return {
      currentRound,
      totalRounds: activeTournament.rounds,
      totalDebates,
      avgSpeakerScore,
      currentLeader,
    };
  };

  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['tournament-stats'],
    queryFn: fetchStats,
    refetchInterval: 5000
  });

  const startNextRound = useMutation({
    mutationFn: async () => {
      const previous = getPairings();
      const nextRound = getCurrentRound() + 1;
      const standings = getTeamStandings();
      const teams: SwissTeam[] = standings.map(s => ({ name: s.team, wins: s.wins, speakerPoints: s.speakerPoints }));
      const newPairings = await generateSwissPairings(nextRound, teams, previous);
      setPairings([...previous, ...newPairings]);
      return newPairings;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournament-stats'] })
  });

  const progressRound = useMutation({
    mutationFn: async () => {
      const current = getCurrentRound();
      const updated = getPairings().map(p =>
        p.round === current ? { ...p, status: 'completed' } : p,
      );
      setPairings(updated);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournament-stats'] })
  });

  // ─── Derive values for progress bar and quick‐stats cards ────────────────
  const currentRound = stats?.currentRound ?? 0;
  const totalRounds = stats?.totalRounds ?? activeTournament.rounds;
  const progress = totalRounds ? (currentRound / totalRounds) * 100 : 0;

  const quickStats = [
    { label: 'Total Debates',     value: stats?.totalDebates    ?? 0,  icon: Target },
    { label: 'Avg Speaker Score', value: stats?.avgSpeakerScore ?? 0,  icon: TrendingUp },
    { label: 'Current Leader',    value: stats?.currentLeader   ?? '-', icon: Trophy },
  ];

  const { tournaments, addTournament, updateTournament, deleteTournament } = useTournaments();
  const [editValues, setEditValues] = useState<Record<string, { status?: string; rounds?: string; elimination?: string }>>({});

  const handleEditChange = (id: string, field: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveEdits = async (id: string) => {
    const values = editValues[id];
    if (!values) return;
    const updates: Partial<Tournament> = {};
    if (values.status !== undefined) updates.status = values.status;
    const settings: Record<string, unknown> = {};
    if (values.rounds) settings.rounds = Number(values.rounds);
    if (values.elimination) settings.elimination = values.elimination;
    if (Object.keys(settings).length > 0) updates.settings = settings;
    await updateTournament({ id, updates });
    setEditValues(prev => ({ ...prev, [id]: {} }));
  };
  const [name, setName] = useState('');
  const [format, setFormat] = useState('BP');

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
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => progressRound.mutateAsync()}
              >
                <Pause className="h-4 w-4" /> Pause Round
              </Button>
              <Button
                className="flex items-center gap-2"
                onClick={() => startNextRound.mutateAsync()}
              >
                <Play className="h-4 w-4" /> Start Next Round
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status &amp; Settings</CardTitle>
            <CardDescription>Current tournament configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="secondary">{activeTournament.status}</Badge>
            {activeTournament.settings && (
              <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(activeTournament.settings, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Recent activity and config cards omitted for brevity */}
      </div>

      {/* Basic tournament list & creation */}
      <Card>
        <CardHeader>
          <CardTitle>All Tournaments</CardTitle>
          <CardDescription>Manage tournaments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              {tournaments.map((t) => {
                const edit = editValues[t.id] || {};
                const currentSettings = t.settings as { rounds?: number; elimination?: string } | null;
                return (
                  <div key={t.id} className="space-y-1 border rounded p-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>{t.name}</span>
                        {t.status && <Badge variant="secondary">{t.status}</Badge>}
                        {t.settings && (
                          <code className="text-xs text-muted-foreground ml-2">
                            {JSON.stringify(t.settings)}
                          </code>
                        )}
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteTournament(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        placeholder="status"
                        className="w-24"
                        value={edit.status ?? t.status ?? ''}
                        onChange={(e) => handleEditChange(t.id, 'status', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="rounds"
                        className="w-20"
                        value={edit.rounds ?? currentSettings?.rounds ?? ''}
                        onChange={(e) => handleEditChange(t.id, 'rounds', e.target.value)}
                      />
                      <Input
                        placeholder="elimination"
                        className="w-28"
                        value={edit.elimination ?? currentSettings?.elimination ?? ''}
                        onChange={(e) => handleEditChange(t.id, 'elimination', e.target.value)}
                      />
                      <Button size="sm" onClick={() => saveEdits(t.id)}>Save</Button>
                    </div>
                  </div>
                );
              })}
            {tournaments.length === 0 && <p className="text-sm text-muted-foreground">No tournaments</p>}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Input placeholder="Tournament name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Format" className="w-24" value={format} onChange={(e) => setFormat(e.target.value)} />
            <Button onClick={async () => { if (name) { await addTournament({ name, format, status: 'draft', settings: null, owner_id: undefined }); setName(''); } }}>Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentManagement;
