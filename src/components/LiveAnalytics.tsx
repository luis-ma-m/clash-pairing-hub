
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface LiveAnalyticsProps {
  tournamentId: string;
}

export default function LiveAnalytics({ tournamentId }: LiveAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Live Analytics</h2>
        <p className="text-gray-600">Real-time tournament statistics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tournament Analytics
          </CardTitle>
          <CardDescription>
            Tournament ID: {tournamentId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Analytics data will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
