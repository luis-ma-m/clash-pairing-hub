// src/components/TeamRoster.test.tsx
/// <reference types="@testing-library/jest-dom" />
import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TeamRoster from '../TeamRoster'

const mockTeams = [
  { id: 1, name: 'Alpha', organization: 'Org', speakers: ['A1'], wins: 0, losses: 0, speakerPoints: 0 },
]

// Mock fetch to return our mockTeams
const fetchMock = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => mockTeams,
  headers: { get: () => 'application/json' },
  text: async () => JSON.stringify(mockTeams),
});

// Helper to render the component within QueryClientProvider
const renderComponent = async () => {
  const client = new QueryClient()
  // @ts-ignore
  global.fetch = fetchMock
  await act(async () => {
    render(
      <QueryClientProvider client={client}>
        <TeamRoster tournamentId="t1" />
      </QueryClientProvider>
    )
  })
}

describe('TeamRoster', () => {
  it('queries the teams table and renders fetched teams', async () => {
    await renderComponent()

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/teams?tournament_id=t1')

    // Wait for our mock data to appear in the DOM
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument()
      expect(screen.getByText('Org')).toBeInTheDocument()
    })
  })
})
