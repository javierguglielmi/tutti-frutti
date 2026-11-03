export type ThemeId = 'light' | 'paper' | 'dark' | 'arcade';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  score: number;
}

export type GamePhase = 'lobby' | 'roulette' | 'playing' | 'voting' | 'podium';

export interface GameSettings {
  roundDuration: number;
  totalRounds: number;
  categories: string[];
}

export interface PlayerAnswerRecord {
  answers: Record<string, string>;
  scores: Record<string, number>;
}

export interface RoomState {
  roomId: string;
  pin?: string;
  hostId: string;
  phase: GamePhase;
  currentRound: number;
  currentLetter: string;
  usedLetters: string[];
  settings: GameSettings;
  players: Player[];
  bannedPlayerIds: string[];
  results: Record<string, Record<string, PlayerAnswerRecord>>;
  stoppedBy: string | null;
}
