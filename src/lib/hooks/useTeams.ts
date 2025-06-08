import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export type Team = {
  id: number;
  name: string;
  organization: string;
  speakers: string[];
  wins: number;
  losses: number;
  speakerPoints: number;
};

export function useTeams() {
  const queryClient = useQueryClient();

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase.from('teams').select('*');
      if (error) throw error;
      return (data as Team[]) || [];
    },
  });

  const addTeam = useMutation({
    mutationFn: async (team: Omit<Team, 'id' | 'wins' | 'losses' | 'speakerPoints'>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();
      if (error) throw error;
      return data as Team;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Team> }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Team;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Team;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });

  return {
    teams: teams ?? [],
    addTeam: addTeam.mutateAsync,
    updateTeam: updateTeam.mutateAsync,
    deleteTeam: deleteTeam.mutateAsync,
  };
}
