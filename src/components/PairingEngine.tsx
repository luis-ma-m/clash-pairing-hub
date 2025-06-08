import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type Pairing = {
  id: number;
  round: number;
  room: string;
  proposition: string;
  opposition: string;
  judge: string;
  status: string;
  propWins: boolean | null;
};

type PairingsResponse = {
  pairings: Pairing[];
  currentRound: number;
};

const PairingEngine: React.FC = () => {
  const [pairingAlgorithm, setPairingAlgorithm] = useState<'swiss' | 'power' | 'random'>('swiss');
  const queryClient = useQueryClient();

  // ─── Fetch Pairings ──────────────────────────────────────────────────────
  const fetchPairings = async (): Promise<PairingsResponse> => {
    const res = await apiFetch('/api/pairings');
    if (!res.ok) {
      throw new Error('Failed fetching pairings');
    }
    return res.json();
  };

  const { data } = useQuery<PairingsResponse>({
    queryKey: ['pairings'],
    queryFn: fetchPairings
  });

  const pairings = data?.pairings ?? [];
  const currentRound = data?.currentRound ?? 0;

  // …rest of your component (render controls, table, charts, etc.)…

  return (
    <div>
      <h2>Round {currentRound}</h2>
      <select
        value={pairingAlgorithm}
        onChange={e =>
          setPairingAlgorithm(e.target.value as 'swiss' | 'power' | 'random')
        }
      >
        <option value="swiss">Swiss</option>
        <option value="power">Power</option>
        <option value="random">Random</option>
      </select>

      {/* render pairings */}
      <ul>
        {pairings.map(p => (
          <li key={p.id}>
            {p.room}: {p.proposition} vs {p.opposition} ({p.status})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PairingEngine;
