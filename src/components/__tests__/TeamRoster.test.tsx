import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TeamRoster from "../TeamRoster";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: { from: jest.fn() },
  __esModule: true,
}));

const mockTeams = [
  { id: 1, name: "Alpha", organization: "Org", speakers: ["A1"], wins: 0, losses: 0, speakerPoints: 0 },
];

const fromMock = jest.fn().mockReturnValue({
  select: jest.fn().mockResolvedValue({ data: mockTeams, error: null }),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

(supabase as unknown as { from: jest.Mock }).from = fromMock;

test("renders team roster table", async () => {
  const qc = new QueryClient();
  render(
    <QueryClientProvider client={qc}>
      <TeamRoster />
    </QueryClientProvider>
  );
  await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
});
