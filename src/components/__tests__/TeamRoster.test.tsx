/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamRoster from '../TeamRoster';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase');

const mockTeams = [
  { id: 1, name: 'Alpha', organization: 'Org', speakers: ['A1'], wins: 0, losses: 0, speakerPoints: 0 },
];

const fromMock = jest.fn().mockReturnValue({
  select: jest.fn().mockResolvedValue({ data: mockTeams, error: null }),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

(supabase as any).from = fromMock;

const renderComponent = async () =>
  await act(async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <TeamRoster />
      </QueryClientProvider>
    );
  });

describe('TeamRoster', () => {
  it('renders teams from Supabase', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
  });
});
