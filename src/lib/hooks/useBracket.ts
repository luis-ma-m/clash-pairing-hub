import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface BracketMatch {
  id: string;
  team1: string | null;
  team2: string | null;
  winner?: string | null;
}

export interface BracketRound {
  round: number;
  matches: BracketMatch[];
}

export interface Bracket {
  type: 'single' | 'double';
  rounds: BracketRound[];
  losers?: BracketRound[];
}

export interface BracketRecord {
  id: string;
  type: 'single' | 'double';
  data: Bracket;
}

export function useBracket() {
  const { data } = useQuery<BracketRecord | null>({
    queryKey: ['bracket'],
    queryFn: async () => {
      const { data, error } = await supabase.from('brackets').select('*').single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as BracketRecord | null;
    },
    refetchInterval: 5000,
  });

  return { bracket: data };
}
