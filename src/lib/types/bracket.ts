export interface BracketMatch {
  id: string;
  team1: string | null;
  team2: string | null;
  winner?: string | null;
}

export interface BracketRound {
  round: number;
  matches: BracketMatch[];
}

export interface Bracket {
  type: 'single' | 'double';
  rounds: BracketRound[];
  losers?: BracketRound[];
}
