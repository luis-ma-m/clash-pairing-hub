import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Pairing } from './usePairings'

function readLocal<T>(key: string): T[] {
  if (typeof localStorage === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function writeLocal<T>(key: string, value: T[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

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
    queryFn: () => {
      const pairings = readLocal<Pairing>('pairings') as unknown as Debate[]
      return tournamentId
        ? pairings.filter((d: Pairing) => d.tournament_id === tournamentId)
        : pairings
    },
    refetchInterval: 5000,
  })
  return { debates: data ?? [] };
}

export function useSpeakerScores(room: string, tournamentId?: string) {
  const { data } = useQuery<SpeakerScore[]>({
    queryKey: ['scores', room, tournamentId],
    queryFn: () => {
      if (!room) return []
      const scores = readLocal<SpeakerScore>('scores')
      let filtered = scores.filter((s) => s.room === room)
      if (tournamentId) filtered = filtered.filter((s) => (s as SpeakerScore & { tournament_id?: string }).tournament_id === tournamentId)
      return filtered
    },
    enabled: !!room,
    refetchInterval: 5000,
  })
  return { speakerScores: data ?? [] };
}

export function useSubmitSpeakerScores(room: string, tournamentId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scores: Omit<SpeakerScore, 'id' | 'room'>[]) => {
      const existing = readLocal<SpeakerScore>('scores');
      const payload = scores.map((s) => ({ ...s, room, tournament_id: tournamentId }));
      writeLocal('scores', [...existing, ...payload]);
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
      const existing = readLocal<{ room: string; tournament_id?: string }>('scores');
      const record = { room, tournament_id: tournamentId, ...payload };
      writeLocal('scores', [...existing, record]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', room, tournamentId] });
    },
  });
}
