--- a/src/components/__tests__/TeamRoster.test.tsx
+++ b/src/components/__tests__/TeamRoster.test.tsx
@@
-import { render, screen, waitFor, act } from "@testing-library/react";
+import { render, screen, waitFor, act } from "@testing-library/react";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
-jest.mock("@/lib/supabase");
-import TeamRoster from "../TeamRoster";
-import { supabase } from "@/lib/supabase";
+// Avoid importing the real Supabase client (ESM-only). Provide a lightweight mock:
+jest.mock("@/lib/supabase", () => ({
+  supabase: { from: jest.fn() },
+  __esModule: true,
+}));
+import TeamRoster from "../TeamRoster";
+import { supabase } from "@/lib/supabase";
 
 const mockTeams = [
   { id: 1, name: "Alpha", organization: "Org", speakers: ["A1"], wins: 0, losses: 0, speakerPoints: 0 },
 ];
@@
-const fromMock = jest.fn().mockReturnValue({
+const fromMock = jest.fn().mockReturnValue({
   select: jest.fn().mockResolvedValue({ data: mockTeams, error: null }),
   insert: jest.fn(),
   update: jest.fn(),
   delete: jest.fn(),
 });
@@
-(supabase as any).from = fromMock;
+(supabase as any).from = fromMock;
