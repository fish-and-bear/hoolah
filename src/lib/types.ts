export type LetterState =
  | 'empty'
  | 'filled'
  | 'absent'
  | 'present'
  | 'correct';

export interface AnswerEntry {
  word: string;
  gloss: string;
  pos: string;
  note?: string;
  etym?: string;
}

export interface JudgedTile {
  letter: string;
  state: 'absent' | 'present' | 'correct';
}

export type JudgedGuess = JudgedTile[];

export type GameStatus = 'in-progress' | 'won' | 'lost';

export type GameMode = 'daily' | 'free';

export interface GameSnapshot {
  // Unique key. For daily mode: 'daily:YYYY-MM-DD'. For free play:
  // 'free:<random>' so each free game gets its own slot and a refresh
  // doesn't clobber it.
  key: string;
  mode: GameMode;
  // ISO date string (Asia/Manila) when the puzzle was issued.
  dateIssued: string;
  // Puzzle number, daily only: integer offset from EPOCH_DATE.
  puzzleNumber: number | null;
  answer: string;
  guesses: string[];
  status: GameStatus;
  hardMode: boolean;
  startedAt: number;
  finishedAt: number | null;
}

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  // index 0 = won in 1 try, ..., index 5 = won in 6 tries
  histogram: [number, number, number, number, number, number];
  // ISO date (Asia/Manila) of the last won daily puzzle.
  lastWonOn: string | null;
  // ISO date of the last played daily puzzle (win OR loss). Used to
  // decide whether the streak survives or resets.
  lastPlayedOn: string | null;
}

export const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  histogram: [0, 0, 0, 0, 0, 0],
  lastWonOn: null,
  lastPlayedOn: null,
};

export interface Settings {
  hardMode: boolean;
  reducedMotion: boolean;
  // 'system' means follow prefers-color-scheme. 'dark' / 'light' override.
  theme: 'system' | 'dark' | 'light';
  // First-time visitor flag — when false, show the title screen instead
  // of the board.
  hasOpenedBefore: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  hardMode: false,
  reducedMotion: false,
  theme: 'system',
  hasOpenedBefore: false,
};

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
