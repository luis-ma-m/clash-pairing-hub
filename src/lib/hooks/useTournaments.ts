
import { useState, useEffect } from 'react';

export interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  rounds: number;
  teams: number;
  settings: Record<string, unknown>;
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: '1',
      name: 'Demo Tournament',
      format: 'British Parliamentary',
      status: 'In Progress',
      rounds: 3,
      teams: 0,
      settings: { rounds: 3 }
    }
  ]);

  return { tournaments };
}
