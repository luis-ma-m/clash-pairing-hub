
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Setup Required</CardTitle>
          <CardDescription>
            Supabase integration is required to use DebateMinistrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            To use this application, you need to:
          </p>
          <ol className="text-sm space-y-2 text-gray-700">
            <li>1. Click the green Supabase button in Lovable</li>
            <li>2. Connect to your Supabase project</li>
            <li>3. Configure authentication</li>
            <li>4. Set up the database schema</li>
          </ol>
          <Button 
            className="w-full" 
            onClick={() => window.location.reload()}
          >
            Refresh After Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
