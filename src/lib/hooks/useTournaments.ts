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

export interface Tournament {
  id: string
  name: string
  format: string | null
  status: string | null
  settings: Record<string, unknown> | null
}

export function useTournaments() {
  const queryClient = useQueryClient()

  const { data } = useQuery<Tournament[]>({
    queryKey: ['tournaments'],
    queryFn: () => readLocal<Tournament>('tournaments'),
  })

  const addTournament = useMutation({
    mutationFn: async (t: Omit<Tournament, 'id'>) => {
      const tournaments = readLocal<Tournament>('tournaments')
      const newTour: Tournament = { id: Date.now().toString(), ...t }
      writeLocal('tournaments', [...tournaments, newTour])
      return newTour
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  })

  const updateTournament = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tournament> }) => {
      const tournaments = readLocal<Tournament>('tournaments')
      const idx = tournaments.findIndex((t) => t.id === id)
      if (idx === -1) throw new Error('Tournament not found')
      tournaments[idx] = { ...tournaments[idx], ...updates }
      writeLocal('tournaments', tournaments)
      return tournaments[idx]
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  })

  const deleteTournament = useMutation({
    mutationFn: async (id: string) => {
      const tournaments = readLocal<Tournament>('tournaments')
      const idx = tournaments.findIndex((t) => t.id === id)
      if (idx === -1) throw new Error('Tournament not found')
      const [removed] = tournaments.splice(idx, 1)
      writeLocal('tournaments', tournaments)
      return removed
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  })

  return {
    tournaments: data ?? [],
    addTournament: addTournament.mutateAsync,
    updateTournament: updateTournament.mutateAsync,
    deleteTournament: deleteTournament.mutateAsync,
  }
}
