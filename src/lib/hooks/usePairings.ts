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

  const { data } = useQuery<Pairing[]>({
    queryKey: ['pairings'],
    queryFn: async () => getPairings() as Pairing[],
  });

  const pairings = data ?? [];
  const currentRound = pairings.reduce((m, p) => Math.max(m, p.round), 0);

  interface GeneratePayload {
    round: number
    rooms?: string[]
    judges?: string[]
  }

  const generatePairings = useMutation({
    mutationFn: async ({ round, rooms = [], judges = [] }: GeneratePayload) => {
      const standings = getTeamStandings();
      const teams: SwissTeam[] = standings.map(s => ({ name: s.team, wins: s.wins, speakerPoints: s.speakerPoints }));
      const previous = getPairings();
      const newPairings = await generateSwissPairings(round, teams, previous, [], rooms, judges);
      setPairings([...previous, ...newPairings]);
      return newPairings;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pairings'] }),
  });

  return { pairings, currentRound, generatePairings: generatePairings.mutateAsync };
}
