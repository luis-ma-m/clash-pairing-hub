// src/lib/hooks/useBracket.ts
import { useQuery } from '@tanstack/react-query'
import { getItem } from '../storage'

export interface BracketMatch {
  id: string
  team1: string | null
  team2: string | null
  winner?: string | null
}

export interface BracketRound {
  round: number
  matches: BracketMatch[]
}

export interface Bracket {
  type: 'single' | 'double'
  rounds: BracketRound[]
  losers?: BracketRound[]
}

export interface BracketRecord {
  id: string
  tournament_id: string
  type: 'single' | 'double'
  data: Bracket
}

export function useBracket(tournamentId?: string) {
  const { data } = useQuery<BracketRecord | null>({
    queryKey: ['bracket', tournamentId],
    queryFn: async () => {
      const all = getItem<BracketRecord[]>('brackets') || []
      const record = tournamentId
        ? all.find(b => b.tournament_id === tournamentId)
        : all[0]
      return record || null
    },
    refetchInterval: 5000,
  })

  return { bracket: data }
}
