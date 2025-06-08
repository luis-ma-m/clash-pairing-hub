
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamRoster from '../TeamRoster';

const mockTeams = [
  { id: 1, name: 'Alpha', organization: 'Org', speakers: [], wins: 0, losses: 0, speakerPoints: 0 }
];

globalThis.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve(mockTeams)
})) as jest.Mock;

const renderComponent = () => {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <TeamRoster />
    </QueryClientProvider>
  );
};

describe('TeamRoster', () => {
  it('displays teams from API', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
  });
});
