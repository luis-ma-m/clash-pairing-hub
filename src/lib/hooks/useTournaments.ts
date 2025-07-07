
import { useState, useEffect } from 'react';

export interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  settings: Record<string, unknown>;
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: '1',
      name: 'Demo Tournament',
      format: 'British Parliamentary',
      status: 'In Progress',
      settings: { rounds: 3 }
    }
  ]);

  return { tournaments };
}
