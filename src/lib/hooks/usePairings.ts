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

export function usePairings() {
  const queryClient = useQueryClient();

  const { data } = useQuery<Pairing[]>({
    queryKey: ['pairings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pairings').select('*');
      if (error) throw error;
      return (data as Pairing[]) || [];
    },
  });

  const pairings = data ?? [];
  const currentRound = pairings.reduce((m, p) => Math.max(m, p.round), 0);

  const generatePairings = useMutation({
    mutationFn: async (round: number) => {
      const res = await fetch('/api/pairings/swiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round }),
      });
      if (!res.ok) throw new Error('Failed to generate pairings');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pairings'] }),
  });

  return { pairings, currentRound, generatePairings: generatePairings.mutateAsync };
}
