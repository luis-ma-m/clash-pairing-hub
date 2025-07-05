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

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  status: string;
}

export function useRounds(tournamentId?: string) {
  const queryClient = useQueryClient();

  const { data } = useQuery<Round[]>({
    queryKey: ['rounds', tournamentId],
    queryFn: () => {
      const data = readLocal<Round>('rounds')
      return tournamentId ? data.filter((r) => r.tournament_id === tournamentId) : data
    },
  })

  const addRound = useMutation({
    mutationFn: async (round: Omit<Round, 'id'>) => {
      const rounds = readLocal<Round>('rounds')
      const newRound: Round = { id: Date.now().toString(), ...round }
      writeLocal('rounds', [...rounds, newRound])
      return newRound
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rounds', tournamentId] }),
  });

  const updateRound = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Round> }) => {
      const rounds = readLocal<Round>('rounds')
      const idx = rounds.findIndex((r) => r.id === id)
      if (idx === -1) throw new Error('Round not found')
      rounds[idx] = { ...rounds[idx], ...updates }
      writeLocal('rounds', rounds)
      return rounds[idx]
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rounds', tournamentId] }),
  });

  const deleteRound = useMutation({
    mutationFn: async (id: string) => {
      const rounds = readLocal<Round>('rounds')
      const idx = rounds.findIndex((r) => r.id === id)
      if (idx === -1) throw new Error('Round not found')
      const [removed] = rounds.splice(idx, 1)
      writeLocal('rounds', rounds)
      return removed
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rounds', tournamentId] }),
  });

  return {
    rounds: data ?? [],
    addRound: addRound.mutateAsync,
    updateRound: updateRound.mutateAsync,
    deleteRound: deleteRound.mutateAsync,
  };
}
