import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export type Pairing = {
  id: number;
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
      let query = supabase.from('pairings').select('*');
      if (tournamentId) query = query.eq('tournament_id', tournamentId);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Pairing[]) || [];
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
      const res = await fetch('/api/pairings/swiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round, rooms, judges }),
      })
      if (!res.ok) throw new Error('Failed to generate pairings');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pairings', tournamentId] }),
  });

  return { pairings, currentRound, generatePairings: generatePairings.mutateAsync };
}
