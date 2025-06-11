import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { apiFetch, expectJson } from '../api';

export type Team = {
  id: number;
  name: string;
  organization: string;
  tournament_id: string;
  speakers: string[];
  wins: number;
  losses: number;
  speakerPoints: number;
};

export function useTeams(tournamentId?: string) {
  const queryClient = useQueryClient();

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams', tournamentId],
    queryFn: async () => {
      const qs = tournamentId ? `?tournament_id=${encodeURIComponent(tournamentId)}` : '';
      const res = await apiFetch(`/api/teams${qs}`);
      if (!res.ok) throw new Error('Failed fetching teams');
      return expectJson<Team[]>(res);
    },
  });

  const addTeam = useMutation({
    mutationFn: async (
      team: Omit<Team, 'id' | 'wins' | 'losses' | 'speakerPoints' | 'tournament_id'>,
    ) => {
      const { data, error } = await supabase
        .from('teams')
        .insert({ ...team, tournament_id: tournamentId })
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
