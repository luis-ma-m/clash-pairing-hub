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

export function useDebates() {
  const { data } = useQuery<Debate[]>({
    queryKey: ['debates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('debates').select('*');
      if (error) throw error;
      return (data as Debate[]) || [];
    },
    refetchInterval: 5000,
  });
  return { debates: data ?? [] };
}

export function useSpeakerScores(room: string) {
  const { data } = useQuery<SpeakerScore[]>({
    queryKey: ['scores', room],
    queryFn: async () => {
      if (!room) return [];
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('room', room);
      if (error) throw error;
      return (data as SpeakerScore[]) || [];
    },
    enabled: !!room,
    refetchInterval: 5000,
  });
  return { speakerScores: data ?? [] };
}

export function useSubmitSpeakerScores(room: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scores: Omit<SpeakerScore, 'id' | 'room'>[]) => {
      const payload = scores.map((s) => ({ ...s, room }));
      const { error } = await supabase.from('scores').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', room] });
    },
  });
}

export function useSubmitTeamScores(room: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      proposition: { points: number; margin: number };
      opposition: { points: number; margin: number };
    }) => {
      const { error } = await supabase
        .from('team_scores')
        .insert({ room, ...payload });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', room] });
    },
  });
}
