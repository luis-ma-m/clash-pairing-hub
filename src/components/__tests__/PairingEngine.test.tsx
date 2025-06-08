import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PairingEngine from '../PairingEngine';

const mockPairings = [
  { id: 1, room: 'A1', proposition: 'Team A', opposition: 'Team B', judge: 'Judge', status: 'completed', propWins: true }
];

const mockResponse = {
  pairings: mockPairings,
  currentRound: 1
};

global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve(mockResponse)
})) as jest.Mock;

const renderComponent = () => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <PairingEngine />
    </QueryClientProvider>
  );
};

describe('PairingEngine', () => {
  it('renders pairings from API', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Team A/)).toBeInTheDocument();
      expect(screen.getByText(/Team B/)).toBeInTheDocument();
    });
  });
});
