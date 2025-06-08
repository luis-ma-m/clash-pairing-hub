import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
  __esModule: true,
}))

import TeamRoster from '../TeamRoster'

const client = new QueryClient()

describe('TeamRoster', () => {
  it('renders management header', () => {
    render(
      <QueryClientProvider client={client}>
        <TeamRoster />
      </QueryClientProvider>
    )
    expect(screen.getByText(/Team Management/i)).toBeInTheDocument()
  })
})
