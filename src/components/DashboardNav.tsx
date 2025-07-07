
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  format: string;
  rounds: number;
  teams: number;
  status: string;
  settings: Record<string, unknown>;
}

interface DashboardNavProps {
  activeTournament: Tournament;
}

export default function DashboardNav({ activeTournament }: DashboardNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTournament.name}
          </h2>
          <Badge variant="outline">
            {activeTournament.format}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Round {activeTournament.rounds}
          </div>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
