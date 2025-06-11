
/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase client to avoid ESM-only package loading
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
  __esModule: true,
}));

import PairingEngine from '../PairingEngine';
import { supabase } from '@/lib/supabase';

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
    const mockSupabase = supabase as jest.Mocked<typeof supabase>;
    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    await act(async () => {
      render(<PairingEngine tournamentId="t1" />, { wrapper: createWrapper() });
    });

    expect(screen.getByText('Swiss')).toBeInTheDocument();
  });
});
