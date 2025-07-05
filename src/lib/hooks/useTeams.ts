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

export type Team = {
  id: number;
  name: string;
  organization: string;
  tournament_id: string;
  speakers: string[];
  wins: number;
  losses: number;
  speakerPoints: number;
};

export function useTeams(tournamentId?: string) {
  const queryClient = useQueryClient();

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams', tournamentId],
    queryFn: () => {
      const data = readLocal<Team>('teams')
      return tournamentId
        ? data.filter((t) => t.tournament_id === tournamentId)
        : data
    },
  })

  const addTeam = useMutation({
    mutationFn: async (
      team: Omit<Team, 'id' | 'wins' | 'losses' | 'speakerPoints' | 'tournament_id'>,
    ) => {
      const existing = readLocal<Team>('teams')
      const newTeam: Team = {
        id: Date.now(),
        wins: 0,
        losses: 0,
        speakerPoints: 0,
        tournament_id: tournamentId || '',
        ...team,
      }
      writeLocal('teams', [...existing, newTeam])
      return newTeam
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });

  const updateTeam = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Team> }) => {
      const teams = readLocal<Team>('teams')
      const idx = teams.findIndex((t) => t.id === id)
      if (idx === -1) throw new Error('Team not found')
      teams[idx] = { ...teams[idx], ...updates }
      writeLocal('teams', teams)
      return teams[idx]
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: number) => {
      const teams = readLocal<Team>('teams')
      const idx = teams.findIndex((t) => t.id === id)
      if (idx === -1) throw new Error('Team not found')
      const [removed] = teams.splice(idx, 1)
      writeLocal('teams', teams)
      return removed
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });

  return {
    teams: teams ?? [],
    addTeam: addTeam.mutateAsync,
    updateTeam: updateTeam.mutateAsync,
    deleteTeam: deleteTeam.mutateAsync,
  };
}
