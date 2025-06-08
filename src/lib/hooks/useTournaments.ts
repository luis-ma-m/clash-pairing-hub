import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'

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
    queryFn: async () => {
      const { data, error } = await supabase.from('tournaments').select('*')
      if (error) throw error
      return (data as Tournament[]) || []
    },
  })

  const addTournament = useMutation({
    mutationFn: async (t: Omit<Tournament, 'id'>) => {
      const { data, error } = await supabase
        .from('tournaments')
        .insert(t)
        .select()
        .single()
      if (error) throw error
      return data as Tournament
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  })

  const updateTournament = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tournament> }) => {
      const { data, error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Tournament
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  })

  const deleteTournament = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Tournament
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
