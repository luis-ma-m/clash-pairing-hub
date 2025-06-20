// src/lib/hooks/useBracket.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'

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
    queryFn: async () => {
      let query = supabase.from('brackets').select('*')
      if (tournamentId) query = query.eq('tournament_id', tournamentId)
      const { data, error } = await query.single()

      if (error) {
        // Supabase returns PGRST116 when no record exists
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data as BracketRecord
    },
    // Poll every 5 seconds to keep the UI updated
    refetchInterval: 5000,
  })

  return { bracket: data }
}
