import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Bracket } from '../types/bracket';

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
