// hooks/usePairings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPairings, setPairings } from '../localData';
import { generateSwissPairings, SwissTeam } from '../pairing';
import { getTeamStandings } from '../localAnalytics';

export type Pairing = {
  id: number;
  tournament_id: string;
  round: number;
  room: string;
  proposition: string;
  opposition: string;
  judge: string;
  status: string;
  propWins: boolean | null;
};

export function usePairings(tournamentId?: string) {
  const queryClient = useQueryClient();

  // Load pairings from localData, optionally filtering by tournamentId
  const { data } = useQuery<Pairing[]>({
    queryKey: ['pairings', tournamentId],
    queryFn: async () => {
      const all = getPairings();
      return tournamentId
        ? all.filter(p => p.tournament_id === tournamentId)
        : all;
    },
  });

  const pairings = data ?? [];
  const currentRound = pairings.reduce((max, p) => Math.max(max, p.round), 0);

  interface GeneratePayload {
    round: number;
    rooms?: string[];
    judges?: string[];
  }

  // Generate new Swiss‐style pairings using local analytics & pairing logic
  const generatePairings = useMutation({
    mutationFn: async ({ round, rooms = [], judges = [] }: GeneratePayload) => {
      // get current standings
      const standings = getTeamStandings();
      const teams: SwissTeam[] = standings.map(s => ({
        name: s.team,
        wins: s.wins,
        speakerPoints: s.speakerPoints,
      }));

      // existing pairings
      const previous = getPairings();

      // generate new
      const newPairings = await generateSwissPairings(
        round,
        teams,
        previous,
        [],      // byes
        rooms,
        judges
      );

      // persist
      setPairings([...previous, ...newPairings]);
      return newPairings;
    },
    onSuccess: () => {
      // refresh the query (with the same tournamentId key)
      queryClient.invalidateQueries({ queryKey: ['pairings', tournamentId] });
    },
  });

  return {
    pairings,
    currentRound,
    generatePairings: generatePairings.mutateAsync,
  };
}
