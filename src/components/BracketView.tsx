import React from 'react';
import { useBracket, BracketRound, BracketMatch } from '@/lib/hooks/useBracket';

const BracketView: React.FC = () => {
  const { bracket } = useBracket();

  if (!bracket) return <div>No bracket generated</div>;

  const rounds: BracketRound[] = bracket.data.rounds || [];

  return (
    <div className="flex gap-4 overflow-x-auto">
      {rounds.map((round: BracketRound) => (
        <div key={round.round} className="min-w-[150px]">
          <h3 className="font-semibold mb-2 text-center">Round {round.round}</h3>
          {round.matches.map((m: BracketMatch) => (
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
