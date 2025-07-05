// src/lib/hooks/useBracket.ts
import { useQuery } from '@tanstack/react-query'

function readLocal<T>(key: string): T[] {
  if (typeof localStorage === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

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

/**
 * Represents the record fetched from Supabase.
 * The `data` field always contains a fully-typed Bracket object.
 */
export interface BracketRecord {
  id: string
  tournament_id: string
  type: 'single' | 'double'
  data: Bracket
}

/**
 * Hook to fetch the current bracket from Supabase.
 * Returns `{ bracket: BracketRecord | null }`.
 */
export function useBracket(tournamentId?: string) {
  const { data } = useQuery<BracketRecord | null>({
    queryKey: ['bracket', tournamentId],
    queryFn: () => {
      const records = readLocal<BracketRecord>('brackets')
      if (tournamentId) {
        return records.find((b) => b.tournament_id === tournamentId) || null
      }
      return records[0] || null
    },
    refetchInterval: 5000,
  })

  return { bracket: data }
}
