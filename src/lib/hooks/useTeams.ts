import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem } from '../storage';
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
      const all = getItem<Team[]>('teams') || []
      const newRec: Team = {
        id: Date.now(),
        ...team,
        tournament_id: tournamentId || '',
        wins: 0,
        losses: 0,
        speakerPoints: 0,
      }
      setItem('teams', [...all, newRec])
      return newRec
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Team> }) => {
      const all = getItem<Team[]>('teams') || []
      const idx = all.findIndex(t => t.id === id)
      if (idx === -1) throw new Error('not found')
      all[idx] = { ...all[idx], ...updates }
      setItem('teams', all)
      return all[idx]
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: number) => {
      const all = getItem<Team[]>('teams') || []
      const idx = all.findIndex(t => t.id === id)
      if (idx === -1) throw new Error('not found')
      const [removed] = all.splice(idx, 1)
      setItem('teams', all)
      return removed
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
