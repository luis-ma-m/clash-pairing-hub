/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PairingEngine from '../PairingEngine';
import { supabase } from '@/lib/supabase';

// Provide a custom factory so Jest doesn't try to load the real module, which
// depends on ESM-only packages. The mocked object exposes a `from` method that
// tests can override.
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
  __esModule: true,
}));

const mockPairings = [
  {
    id: 1,
    round: 1,
    room: 'A1',
    proposition: 'Team A',
    opposition: 'Team B',
    judge: 'Judge',
    status: 'completed',
    propWins: true,
  },
];

const fromMock = jest.fn().mockReturnValue({
  select: jest.fn().mockResolvedValue({ data: mockPairings, error: null }),
});

(supabase as any).from = fromMock;

const renderComponent = async () =>
  await act(async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PairingEngine />
      </QueryClientProvider>
    );
  });

describe('PairingEngine', () => {
  it('renders pairings from API', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Team A', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Team B', { exact: false })).toBeInTheDocument();
    });
  });
});
