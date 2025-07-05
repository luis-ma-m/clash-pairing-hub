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

export interface Speaker {
  id: string;
  team_id: string;
  name: string;
  position: number | null;
}

export function useSpeakers(teamId?: string, tournamentId?: string) {
  const queryClient = useQueryClient();

  const { data } = useQuery<Speaker[]>({
    queryKey: ['speakers', teamId, tournamentId],
    queryFn: () => {
      const data = readLocal<Speaker>('speakers')
      let result = data
      if (teamId) result = result.filter((s) => s.team_id === teamId)
      else if (tournamentId) result = result.filter((s) => s.team_id.startsWith(tournamentId))
      return result
    },
  })

  const addSpeaker = useMutation({
    mutationFn: async (speaker: Omit<Speaker, 'id'>) => {
      const speakers = readLocal<Speaker>('speakers')
      const newSpeaker: Speaker = { id: Date.now().toString(), ...speaker }
      writeLocal('speakers', [...speakers, newSpeaker])
      return newSpeaker
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['speakers'] }),
  });

  const updateSpeaker = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Speaker> }) => {
      const speakers = readLocal<Speaker>('speakers')
      const idx = speakers.findIndex((s) => s.id === id)
      if (idx === -1) throw new Error('Speaker not found')
      speakers[idx] = { ...speakers[idx], ...updates }
      writeLocal('speakers', speakers)
      return speakers[idx]
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['speakers'] }),
  });

  const deleteSpeaker = useMutation({
    mutationFn: async (id: string) => {
      const speakers = readLocal<Speaker>('speakers')
      const idx = speakers.findIndex((s) => s.id === id)
      if (idx === -1) throw new Error('Speaker not found')
      const [removed] = speakers.splice(idx, 1)
      writeLocal('speakers', speakers)
      return removed
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['speakers'] }),
  });

  return {
    speakers: data ?? [],
    addSpeaker: addSpeaker.mutateAsync,
    updateSpeaker: updateSpeaker.mutateAsync,
    deleteSpeaker: deleteSpeaker.mutateAsync,
  };
}
