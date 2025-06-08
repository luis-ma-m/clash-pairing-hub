import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  status: string;
}

export function useRounds() {
  const queryClient = useQueryClient();

  const { data } = useQuery<Round[]>({
    queryKey: ['rounds'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rounds').select('*');
      if (error) throw error;
      return (data as Round[]) || [];
    },
  });

  const addRound = useMutation({
    mutationFn: async (round: Omit<Round, 'id'>) => {
      const { data, error } = await supabase
        .from('rounds')
        .insert(round)
        .select()
        .single();
      if (error) throw error;
      return data as Round;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rounds'] }),
  });

  const updateRound = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Round> }) => {
      const { data, error } = await supabase
        .from('rounds')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Round;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rounds'] }),
  });

  const deleteRound = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Round;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rounds'] }),
  });

  return {
    rounds: data ?? [],
    addRound: addRound.mutateAsync,
    updateRound: updateRound.mutateAsync,
    deleteRound: deleteRound.mutateAsync,
  };
}
