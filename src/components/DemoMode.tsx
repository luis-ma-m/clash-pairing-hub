
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, BarChart3, Settings, Play } from "lucide-react";

export default function DemoMode() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DebateMinistrator</h1>
          <p className="text-gray-600">Tournament Management System</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Demo Mode
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">+2 from last tournament</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Round</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">of 4 rounds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Debates</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">tournament progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Getting Started
          </CardTitle>
          <CardDescription>
            This is a demo version of DebateMinistrator. To unlock full functionality:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">1. Connect Supabase</h3>
              <p className="text-sm text-gray-600">Click the green Supabase button to set up your backend</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">2. Configure Database</h3>
              <p className="text-sm text-gray-600">Set up tables for teams, tournaments, and scoring</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">3. Start Managing</h3>
              <p className="text-sm text-gray-600">Create tournaments and manage debates in real-time</p>
            </div>
          </div>
          <Button className="w-full">
            Get Started with Supabase Integration
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Swiss-system tournament pairing</li>
              <li>• Real-time scoring and results</li>
              <li>• Automatic bracket generation</li>
              <li>• Team and speaker management</li>
              <li>• Role-based access control</li>
              <li>• CSV import/export</li>
              <li>• Live analytics dashboard</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tournament Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• British Parliamentary (BP)</li>
              <li>• World Schools Debate (WSDC)</li>
              <li>• Karl Popper format</li>
              <li>• Custom formats</li>
              <li>• Elimination brackets</li>
              <li>• Swiss system rounds</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
