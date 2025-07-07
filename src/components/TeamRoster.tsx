
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

interface TeamRosterProps {
  tournamentId: string;
}

export default function TeamRoster({ tournamentId }: TeamRosterProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Roster</h2>
          <p className="text-gray-600">Manage teams and speakers</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teams
          </CardTitle>
          <CardDescription>
            Tournament ID: {tournamentId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No teams registered yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
