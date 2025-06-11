import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { apiFetch, expectJson } from '../api';

export interface Speaker {
  id: string;
  team_id: string;
  name: string;
  position: number | null;
}

export function useSpeakers(teamId?: string, tournamentId?: string) {
  const queryClient = useQueryClient();

  const { data } = useQuery<Speaker[]>({
    queryKey: ['speakers', teamId, tournamentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (teamId) params.set('team_id', teamId);
      if (!teamId && tournamentId) params.set('tournament_id', tournamentId);
      const qs = params.toString();
      const res = await apiFetch(`/api/speakers${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed fetching speakers');
      return expectJson<Speaker[]>(res);
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
