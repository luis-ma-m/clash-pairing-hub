import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem } from '../storage';
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
      const all = getItem<Speaker[]>('speakers') || []
      const newRec: Speaker = { id: Date.now().toString(), ...speaker }
      setItem('speakers', [...all, newRec])
      return newRec
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['speakers'] }),
  });

  const updateSpeaker = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Speaker> }) => {
      const all = getItem<Speaker[]>('speakers') || []
      const idx = all.findIndex(s => s.id === id)
      if (idx === -1) throw new Error('not found')
      all[idx] = { ...all[idx], ...updates }
      setItem('speakers', all)
      return all[idx]
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['speakers'] }),
  });

  const deleteSpeaker = useMutation({
    mutationFn: async (id: string) => {
      const all = getItem<Speaker[]>('speakers') || []
      const idx = all.findIndex(s => s.id === id)
      if (idx === -1) throw new Error('not found')
      const [removed] = all.splice(idx, 1)
      setItem('speakers', all)
      return removed
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
