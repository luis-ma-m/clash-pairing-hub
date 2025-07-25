
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardNav from '@/components/DashboardNav';
import TournamentManagement from '@/components/TournamentManagement';
import TeamRoster from '@/components/TeamRoster';
import PairingEngine from '@/components/PairingEngine';
import ScoringInterface from '@/components/ScoringInterface';
import LiveAnalytics from '@/components/LiveAnalytics';
import UserRoleManager from '@/components/UserRoleManager';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTournaments, Tournament } from '@/lib/hooks/useTournaments';
import { Trophy, Users, Shuffle, Target, BarChart3, Settings } from 'lucide-react';

const Index = () => {
  
  const { tournaments } = useTournaments();
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    if (!selectedId && tournaments.length > 0) {
      setSelectedId(tournaments[0].id);
    }
  }, [tournaments, selectedId]);

  const activeTournament = tournaments.find(t => t.id === selectedId) || {
    id: '',
    name: 'No Tournament Selected',
    format: '',
    rounds: 0,
    teams: 0,
    status: '',
    settings: {},
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav activeTournament={activeTournament} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">DebateMinistrator</h1>
              <p className="text-slate-600 mt-1">Tournament Management System</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant={activeTournament.status === 'In Progress' ? 'default' : 'secondary'}>
                {activeTournament.status}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="pairings" className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              Pairings
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Scoring
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <TournamentManagement activeTournament={activeTournament} />
          </TabsContent>

          <TabsContent value="teams">
            <TeamRoster tournamentId={activeTournament.id} />
          </TabsContent>

          <TabsContent value="pairings">
            <PairingEngine tournamentId={activeTournament.id} />
          </TabsContent>

          <TabsContent value="scoring">
            <ScoringInterface tournamentId={activeTournament.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <LiveAnalytics tournamentId={activeTournament.id} />
          </TabsContent>

          <TabsContent value="admin">
            <UserRoleManager currentUser={null} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
