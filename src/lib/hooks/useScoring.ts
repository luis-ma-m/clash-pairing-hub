import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem } from '../storage';

export type Debate = {
  room: string;
  proposition: string;
  opposition: string;
  judge: string;
  status: string;
};

export type SpeakerScore = {
  id?: number;
  room: string;
  speaker: string;
  team: string;
  position: string;
  content: number;
  style: number;
  strategy: number;
  total: number;
};

export function useDebates(tournamentId?: string) {
  const { data } = useQuery<Debate[]>({
    queryKey: ['debates', tournamentId],
    queryFn: async () => {
      const all = getItem<(Debate & { tournament_id?: string })[]>('debates') || []
      return tournamentId ? all.filter(d => d.tournament_id === tournamentId) : all
    },
    refetchInterval: 5000,
  });
  return { debates: data ?? [] };
}

export function useSpeakerScores(room: string, tournamentId?: string) {
  const { data } = useQuery<SpeakerScore[]>({
    queryKey: ['scores', room, tournamentId],
    queryFn: async () => {
      if (!room) return [];
      const all = getItem<(SpeakerScore & { tournament_id?: string })[]>('scores') || []
      return all.filter(s => s.room === room && (!tournamentId || s.tournament_id === tournamentId))
    },
    enabled: !!room,
    refetchInterval: 5000,
  });
  return { speakerScores: data ?? [] };
}

export function useSubmitSpeakerScores(room: string, tournamentId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scores: Omit<SpeakerScore, 'id' | 'room'>[]) => {
      const payload = scores.map((s) => ({ ...s, room, tournament_id: tournamentId }));
      const all = getItem<SpeakerScore[]>('scores') || []
      const withIds = payload.map((p, i) => ({ ...p, id: Date.now() + i }))
      setItem('scores', [...all, ...withIds])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', room, tournamentId] });
    },
  });
}

export function useSubmitTeamScores(room: string, tournamentId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      proposition: { points: number; margin: number };
      opposition: { points: number; margin: number };
    }) => {
      const all = getItem<Record<string, unknown>[]>('team_scores') || []
      all.push({ room, tournament_id: tournamentId, ...payload })
      setItem('team_scores', all)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', room, tournamentId] });
    },
  });
}
