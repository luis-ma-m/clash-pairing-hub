import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

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

export type Pairing = {
  id: number;
  tournament_id: string;
  round: number;
  room: string;
  proposition: string;
  opposition: string;
  judge: string;
  status: string;
  propWins: boolean | null;
};

export function usePairings(tournamentId?: string) {
  const queryClient = useQueryClient();

  const { data } = useQuery<Pairing[]>({
    queryKey: ['pairings', tournamentId],
    queryFn: () => {
      const data = readLocal<Pairing>('pairings')
      return tournamentId ? data.filter((p) => p.tournament_id === tournamentId) : data
    },
  })

  const pairings = data ?? [];
  const currentRound = pairings.reduce((m, p) => Math.max(m, p.round), 0);

  interface GeneratePayload {
    round: number
    rooms?: string[]
    judges?: string[]
  }

  const generatePairings = useMutation({
    mutationFn: async ({ round, rooms = [], judges = [] }: GeneratePayload) => {
      const res = await fetch('/api/pairings/swiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round, rooms, judges, tournament_id: tournamentId }),
      })
      if (!res.ok) throw new Error('Failed to generate pairings');
      const generated = (await res.json()) as Pairing[]
      const existing = readLocal<Pairing>('pairings')
      writeLocal('pairings', [...existing, ...generated])
      return generated
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pairings', tournamentId] }),
  });

  return { pairings, currentRound, generatePairings: generatePairings.mutateAsync };
}
