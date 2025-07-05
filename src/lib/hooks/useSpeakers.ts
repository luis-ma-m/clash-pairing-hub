// src/lib/hooks/useSpeakers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getItem, setItem } from '../storage'

export interface Speaker {
  id: string
  team_id: string
  name: string
  position: number | null
}

export function useSpeakers(teamId?: string, tournamentId?: string) {
  const queryClient = useQueryClient()

  const { data } = useQuery<Speaker[]>({
    queryKey: ['speakers', teamId, tournamentId],
    queryFn: () => {
      const all = getItem<Speaker[]>('speakers') || []
      let result = all
      if (teamId) {
        result = result.filter(s => s.team_id === teamId)
      } else if (tournamentId) {
        result = result.filter(s => s.team_id.startsWith(tournamentId))
      }
      return result
    },
    refetchInterval: 5000,
  })

  const addSpeaker = useMutation({
    mutationFn: async (speaker: Omit<Speaker, 'id'>) => {
      const all = getItem<Speaker[]>('speakers') || []
      const newSpeaker: Speaker = { id: Date.now().toString(), ...speaker }
      setItem('speakers', [...all, newSpeaker])
      return newSpeaker
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', teamId, tournamentId] })
    },
  })

  const updateSpeaker = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Speaker>
    }) => {
      const all = getItem<Speaker[]>('speakers') || []
      const idx = all.findIndex(s => s.id === id)
      if (idx === -1) throw new Error('Speaker not found')
      all[idx] = { ...all[idx], ...updates }
      setItem('speakers', all)
      return all[idx]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', teamId, tournamentId] })
    },
  })

  const deleteSpeaker = useMutation({
    mutationFn: async (id: string) => {
      const all = getItem<Speaker[]>('speakers') || []
      const idx = all.findIndex(s => s.id === id)
      if (idx === -1) throw new Error('Speaker not found')
      const [removed] = all.splice(idx, 1)
      setItem('speakers', all)
      return removed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers', teamId, tournamentId] })
    },
  })

  return {
    speakers: data ?? [],
    addSpeaker: addSpeaker.mutateAsync,
    updateSpeaker: updateSpeaker.mutateAsync,
    deleteSpeaker: deleteSpeaker.mutateAsync,
  }
}
