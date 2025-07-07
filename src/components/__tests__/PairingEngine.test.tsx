
/// <reference types="@testing-library/jest-dom" />
import { render, screen, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { jest } from '@jest/globals';
import { setItem } from '@/lib/storage';
import PairingEngine from '../PairingEngine';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('PairingEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with local storage data', async () => {
    setItem('rounds', [{ id: 'r1', tournament_id: 't1', round_number: 1, status: 'scheduled' }]);
    setItem('pairings', []);

    await act(async () => {
      render(<PairingEngine tournamentId="t1" />, { wrapper: createWrapper() });
    });

    expect(screen.getByText('Swiss')).toBeInTheDocument();
  });
});
