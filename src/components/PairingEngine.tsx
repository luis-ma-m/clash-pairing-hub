import React, { useState } from 'react';
import { usePairings, type Pairing } from '@/lib/hooks/usePairings';

const PairingEngine: React.FC = () => {
  const [pairingAlgorithm, setPairingAlgorithm] = useState<'swiss' | 'power' | 'random'>('swiss');
  const { pairings, currentRound } = usePairings();

  return (
    <div>
      <h2>Round {currentRound}</h2>
      <select
        value={pairingAlgorithm}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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
