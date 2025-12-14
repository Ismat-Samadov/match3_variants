export type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Position {
  row: number;
  col: number;
}

export interface Gem {
  type: GemType;
  id: string;
  isMatched?: boolean;
  isAnimating?: boolean;
}

export interface Board {
  gems: (Gem | null)[][];
  size: number;
}

export interface GameState {
  board: Board;
  score: number;
  moves: number;
  timeLeft: number;
  combo: number;
  selectedGem: Position | null;
  isProcessing: boolean;
  isGameOver: boolean;
  highScore: number;
}

export interface Match {
  positions: Position[];
  type: GemType;
  isSpecial?: boolean;
}

export interface ScoreEvent {
  points: number;
  combo: number;
  matchLength: number;
  position: Position;
}

export interface LeaderboardEntry {
  score: number;
  date: string;
  moves: number;
  time: number;
}
