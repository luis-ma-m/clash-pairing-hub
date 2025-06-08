import { useQuery } from '@tanstack/react-query';
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

  return { pairings, currentRound };
}
