import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem } from '../storage';

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
    queryKey: ['pairings', tournamentId],
    queryFn: async () => {
      const all = getItem<Pairing[]>('pairings') || []
      return tournamentId ? all.filter(p => p.tournament_id === tournamentId) : all
    },
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
      const all = getItem<Pairing[]>('pairings') || []
      const nextId = all.length + 1
      const newPairings: Pairing[] = rooms.map((room, i) => ({
        id: nextId + i,
        tournament_id: tournamentId || '',
        round,
        room,
        proposition: `Team ${i}`,
        opposition: `Team ${i+1}`,
        judge: judges[i] || '',
        status: 'scheduled',
        propWins: null
      }))
      setItem('pairings', [...all, ...newPairings])
      return newPairings
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pairings', tournamentId] }),
  });

  return { pairings, currentRound, generatePairings: generatePairings.mutateAsync };
}
