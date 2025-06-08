import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface Speaker {
  id: string;
  team_id: string;
  name: string;
  position: number | null;
}

export function useSpeakers(teamId?: string) {
  const queryClient = useQueryClient();

  const { data } = useQuery<Speaker[]>({
    queryKey: ['speakers', teamId],
    queryFn: async () => {
      let query = supabase.from('speakers').select('*');
      if (teamId) query = query.eq('team_id', teamId);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Speaker[]) || [];
    },
  });

  const addSpeaker = useMutation({
    mutationFn: async (speaker: Omit<Speaker, 'id'>) => {
      const { data, error } = await supabase
        .from('speakers')
        .insert(speaker)
        .select()
        .single();
      if (error) throw error;
      return data as Speaker;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['speakers'] }),
  });

  const updateSpeaker = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Speaker> }) => {
      const { data, error } = await supabase
        .from('speakers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Speaker;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['speakers'] }),
  });

  const deleteSpeaker = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('speakers')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Speaker;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['speakers'] }),
  });

  return {
    speakers: data ?? [],
    addSpeaker: addSpeaker.mutateAsync,
    updateSpeaker: updateSpeaker.mutateAsync,
    deleteSpeaker: deleteSpeaker.mutateAsync,
  };
}
