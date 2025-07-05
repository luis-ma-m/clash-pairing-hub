// src/lib/hooks/useTeams.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getItem, setItem } from '../storage'

export type Team = {
  id: number
  name: string
  organization: string
  tournament_id: string
  speakers: string[]
  wins: number
  losses: number
  speakerPoints: number
}

export function useTeams(tournamentId?: string) {
  const queryClient = useQueryClient()

  // Fetch teams from local storage, optionally filtering by tournament
  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams', tournamentId],
    queryFn: async () => {
      const all = getItem<Team[]>('teams') || []
      return tournamentId
        ? all.filter(t => t.tournament_id === tournamentId)
        : all
    },
    refetchInterval: 5000,
  })

  // Create a new team
  const addTeam = useMutation({
    mutationFn: async (
      team: Omit<Team, 'id' | 'wins' | 'losses' | 'speakerPoints' | 'tournament_id'>,
    ) => {
      const existing = getItem<Team[]>('teams') || []
      const newTeam: Team = {
        id: Date.now(),
        ...team,
        tournament_id: tournamentId || '',
        wins: 0,
        losses: 0,
        speakerPoints: 0,
      }
      setItem('teams', [...existing, newTeam])
      return newTeam
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] })
    },
  })

  // Update an existing team
  const updateTeam = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number
      updates: Partial<Team>
    }) => {
      const all = getItem<Team[]>('teams') || []
      const idx = all.findIndex(t => t.id === id)
      if (idx === -1) throw new Error('Team not found')
      all[idx] = { ...all[idx], ...updates }
      setItem('teams', all)
      return all[idx]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] })
    },
  })

  // Delete a team
  const deleteTeam = useMutation({
    mutationFn: async (id: number) => {
      const all = getItem<Team[]>('teams') || []
      const idx = all.findIndex(t => t.id === id)
      if (idx === -1) throw new Error('Team not found')
      const [removed] = all.splice(idx, 1)
      setItem('teams', all)
      return removed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] })
    },
  })

  return {
    teams: teams ?? [],
    addTeam: addTeam.mutateAsync,
    updateTeam: updateTeam.mutateAsync,
    deleteTeam: deleteTeam.mutateAsync,
  }
}
