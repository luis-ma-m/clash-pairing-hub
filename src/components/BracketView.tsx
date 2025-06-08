import React from 'react';
import { useBracket } from '@/lib/hooks/useBracket';

const BracketView: React.FC = () => {
  const { bracket } = useBracket();

  if (!bracket) return <div>No bracket generated</div>;

  type Match = { id: string; team1: string | null; team2: string | null };
  type Round = { round: number; matches: Match[] };
  const data = bracket.data as { rounds?: Round[] };
  const rounds = data.rounds || [];

  return (
    <div className="flex gap-4 overflow-x-auto">
      {rounds.map((round: Round) => (
        <div key={round.round} className="min-w-[150px]">
          <h3 className="font-semibold mb-2 text-center">Round {round.round}</h3>
          {round.matches.map((m: Match) => (
            <div key={m.id} className="border rounded p-2 mb-2 text-sm text-center">
              <div>{m.team1 || 'TBD'}</div>
              <div className="text-xs text-gray-500">vs</div>
              <div>{m.team2 || 'TBD'}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BracketView;
