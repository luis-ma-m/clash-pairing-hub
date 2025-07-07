
/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


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

  it('renders without crashing', async () => {
    await act(async () => {
      render(<PairingEngine tournamentId="t1" />, { wrapper: createWrapper() });
    });

    expect(screen.getByText('Swiss')).toBeInTheDocument();
  });
});
