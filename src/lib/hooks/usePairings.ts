// hooks/usePairings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getItem, setItem } from '../storage'

export type Pairing = {
  id: number
  tournament_id: string
  round: number
  room: string
  proposition: string
  opposition: string
  judge: string
  status: string
  propWins: boolean | null
}

export function usePairings(tournamentId?: string) {
  const queryClient = useQueryClient()

  // Load pairings from local storage, optionally filtering by tournament
  const { data } = useQuery<Pairing[]>({
    queryKey: ['pairings', tournamentId],
    queryFn: () => {
      const all = getItem<Pairing[]>('pairings') || []
      return tournamentId
        ? all.filter(p => p.tournament_id === tournamentId)
        : all
    },
  })

  const pairings = data ?? []
  const currentRound = pairings.reduce((max, p) => Math.max(max, p.round), 0)

  interface GeneratePayload {
    round: number
    rooms?: string[]
    judges?: string[]
  }

  // Generate a simple new set of pairings and persist to local storage
  const generatePairings = useMutation({
    mutationFn: async ({ round, rooms = [], judges = [] }: GeneratePayload) => {
      const all = getItem<Pairing[]>('pairings') || []
      const nextId = all.length > 0 ? Math.max(...all.map(p => p.id)) + 1 : 1

      const newPairings: Pairing[] = rooms.map((room, i) => ({
        id: nextId + i,
        tournament_id: tournamentId || '',
        round,
        room,
        proposition: `Team ${i * 2 + 1}`,
        opposition: `Team ${i * 2 + 2}`,
        judge: judges[i] || '',
        status: 'scheduled',
        propWins: null,
      }))

      setItem('pairings', [...all, ...newPairings])
      return newPairings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairings', tournamentId] })
    },
  })

  return {
    pairings,
    currentRound,
    generatePairings: generatePairings.mutateAsync,
  }
}
