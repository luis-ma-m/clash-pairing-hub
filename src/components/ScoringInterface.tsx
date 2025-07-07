
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

interface ScoringInterfaceProps {
  tournamentId: string;
}

export default function ScoringInterface({ tournamentId }: ScoringInterfaceProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scoring Interface</h2>
          <p className="text-gray-600">Enter and manage debate scores</p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          New Score Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score Entry</CardTitle>
          <CardDescription>
            Tournament ID: {tournamentId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No scores entered yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
