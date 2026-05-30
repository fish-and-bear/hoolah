import type { JudgedGuess } from './types';
import { WORD_LENGTH } from './types';

// Wordle-rules judge. Subtle bit: a letter that appears twice in the
// guess but only once in the answer should only colour ONE tile.
// Pass 1 marks exact-position matches and consumes those letters from
// the answer pool; pass 2 looks for present-but-wrong-position
// against the remaining pool.
export function judgeGuess(guess: string, answer: string): JudgedGuess {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  if (g.length !== a.length) {
    throw new Error(
      `judgeGuess: length mismatch (${g.length} vs ${a.length})`
    );
  }
  const result: JudgedGuess = new Array(g.length);
  const remaining: (string | null)[] = a.split('');

  // Pass 1: greens.
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      result[i] = { letter: g[i], state: 'correct' };
      remaining[i] = null;
    }
  }
  // Pass 2: yellows and grays.
  for (let i = 0; i < g.length; i++) {
    if (result[i]) continue;
    const idx = remaining.indexOf(g[i]);
    if (idx >= 0) {
      result[i] = { letter: g[i], state: 'present' };
      remaining[idx] = null;
    } else {
      result[i] = { letter: g[i], state: 'absent' };
    }
  }
  return result;
}

// Collapse a series of judged guesses into the strongest known state
// for each letter — used to colour the on-screen keyboard. Order of
// strength: correct > present > absent.
export function keyboardStateFromGuesses(
  guesses: JudgedGuess[]
): Record<string, 'correct' | 'present' | 'absent'> {
  const out: Record<string, 'correct' | 'present' | 'absent'> = {};
  const rank = { correct: 3, present: 2, absent: 1 } as const;
  for (const g of guesses) {
    for (const tile of g) {
      const prev = out[tile.letter];
      if (!prev || rank[tile.state] > rank[prev]) {
        out[tile.letter] = tile.state;
      }
    }
  }
  return out;
}

// Hard mode constraint: every letter the previous guesses revealed as
// CORRECT must appear in the same slot, and every PRESENT letter must
// appear somewhere in the new guess. Returns a human-readable
// violation message, or null if the guess is legal.
export function hardModeViolation(
  newGuess: string,
  history: JudgedGuess[]
): string | null {
  const g = newGuess.toLowerCase();
  if (history.length === 0) return null;

  // Aggregate constraints. For each slot, the letter that must appear
  // there (if any). And a multiset of letters that must appear
  // somewhere (count = max count observed across any past guess).
  const lockedSlots: (string | null)[] = new Array(WORD_LENGTH).fill(null);
  const needCounts: Record<string, number> = {};

  for (const guess of history) {
    const localCounts: Record<string, number> = {};
    for (let i = 0; i < guess.length; i++) {
      const tile = guess[i];
      if (tile.state === 'correct') {
        lockedSlots[i] = tile.letter;
        localCounts[tile.letter] = (localCounts[tile.letter] ?? 0) + 1;
      } else if (tile.state === 'present') {
        localCounts[tile.letter] = (localCounts[tile.letter] ?? 0) + 1;
      }
    }
    for (const [letter, c] of Object.entries(localCounts)) {
      if (c > (needCounts[letter] ?? 0)) needCounts[letter] = c;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    const must = lockedSlots[i];
    if (must && g[i] !== must) {
      return `${(i + 1).toString()}th letter must be ${must.toUpperCase()}`;
    }
  }

  const guessCounts: Record<string, number> = {};
  for (const ch of g) guessCounts[ch] = (guessCounts[ch] ?? 0) + 1;
  for (const [letter, need] of Object.entries(needCounts)) {
    if ((guessCounts[letter] ?? 0) < need) {
      return `Guess must use ${letter.toUpperCase()}`;
    }
  }
  return null;
}

export function isWin(judged: JudgedGuess): boolean {
  return judged.every((t) => t.state === 'correct');
}
