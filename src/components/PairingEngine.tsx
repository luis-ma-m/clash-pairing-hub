
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

interface PairingEngineProps {
  tournamentId: string;
}

export default function PairingEngine({ tournamentId }: PairingEngineProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pairing Engine</h2>
          <p className="text-gray-600">Generate and manage debate pairings</p>
        </div>
        <Button>
          <Shuffle className="h-4 w-4 mr-2" />
          Generate Pairings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Round Pairings</CardTitle>
          <CardDescription>
            Tournament ID: {tournamentId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No pairings generated yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
