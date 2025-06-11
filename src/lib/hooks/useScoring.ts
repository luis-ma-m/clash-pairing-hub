import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

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
      let query = supabase.from('debates').select('*');
      if (tournamentId) query = query.eq('tournament_id', tournamentId);
      const { data, error } = await query;
      if (error) throw error;
      return (data as Debate[]) || [];
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
      let query = supabase.from('scores').select('*').eq('room', room);
      if (tournamentId) query = query.eq('tournament_id', tournamentId);
      const { data, error } = await query;
      if (error) throw error;
      return (data as SpeakerScore[]) || [];
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
      const { error } = await supabase.from('scores').insert(payload);
      if (error) throw error;
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
      const { error } = await supabase
        .from('team_scores')
        .insert({ room, tournament_id: tournamentId, ...payload });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', room, tournamentId] });
    },
  });
}
