
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Play, Settings } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  format: string;
  rounds: number;
  teams: number;
  status: string;
  settings: Record<string, unknown>;
}

interface TournamentManagementProps {
  activeTournament: Tournament;
}

export default function TournamentManagement({ activeTournament }: TournamentManagementProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTournament.teams}</div>
            <p className="text-xs text-muted-foreground">registered teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Round</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTournament.rounds}</div>
            <p className="text-xs text-muted-foreground">current round</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={activeTournament.status === 'In Progress' ? 'default' : 'secondary'}>
              {activeTournament.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">tournament status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Format</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{activeTournament.format}</div>
            <p className="text-xs text-muted-foreground">debate format</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Overview</CardTitle>
          <CardDescription>
            Manage your tournament settings and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button>Start Next Round</Button>
            <Button variant="outline">View Brackets</Button>
            <Button variant="outline">Export Results</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
