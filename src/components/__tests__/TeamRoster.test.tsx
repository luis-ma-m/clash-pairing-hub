// src/components/TeamRoster.test.tsx
/// <reference types="@testing-library/jest-dom" />
import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TeamRoster from '../TeamRoster'
import { supabase } from '@/lib/supabase'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
  __esModule: true,
}))

const mockTeams = [
  { id: 1, name: 'Alpha', organization: 'Org', speakers: ['A1'], wins: 0, losses: 0, speakerPoints: 0 },
]

const fromMock = jest.fn().mockReturnValue({
  select: jest.fn().mockResolvedValue({ data: mockTeams, error: null }),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
})

interface SupabaseLike {
  from: typeof fromMock
}

// Redirect supabase.from to our mock
;(supabase as unknown as SupabaseLike).from = fromMock

// Helper to render the component within QueryClientProvider
const renderComponent = async () => {
  const client = new QueryClient()
  await act(async () => {
    render(
      <QueryClientProvider client={client}>
        <TeamRoster />
      </QueryClientProvider>
    )
  })
}

describe('TeamRoster', () => {
  it('queries the teams table and renders fetched teams', async () => {
    await renderComponent()

    // Ensure we called supabase.from('teams')
    expect(fromMock).toHaveBeenCalledWith('teams')

    // Wait for our mock data to appear in the DOM
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument()
      expect(screen.getByText('Org')).toBeInTheDocument()
    })
  })
})
