import { daysBetween, manilaDateString } from './time';

// The first hoolah ever shipped. Day 1 of the rotation. Picked as
// 2026-06-01 to give an obvious 'this is when the game started' line
// the player can cite. Do not change this constant after launch; the
// puzzle number depends on it.
export const EPOCH_DATE = '2026-06-01';

// Pure FNV-1a 32-bit hash of a string, used as a stable seed for the
// answer rotation. The whole point is to be deterministic across
// browsers and node versions.
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

// Puzzle number for a given Manila-local date string. 1-indexed.
// Returns null if the date is before the epoch (player has shifted
// their clock).
export function puzzleNumberFor(dateStr: string): number | null {
  const offset = daysBetween(EPOCH_DATE, dateStr);
  if (offset === null || offset < 0) return null;
  return offset + 1;
}

// Index into the answer array for a given puzzle number. The hash
// keeps the order non-obvious so a player can't peek at 'the next
// answer is at index N+1.' Each puzzle number maps to a single index
// for the life of the game.
export function answerIndexFor(
  puzzleNumber: number,
  answerCount: number
): number {
  if (answerCount <= 0) return 0;
  // Salt the hash so two installs of the same game logic produce the
  // same answer for the same day, but the order isn't trivially the
  // first N words sorted alphabetically.
  const seed = `hoolah:v1:${puzzleNumber}`;
  return fnv1a(seed) % answerCount;
}

export function todaysPuzzleKey(): {
  date: string;
  puzzleNumber: number | null;
} {
  const date = manilaDateString();
  return { date, puzzleNumber: puzzleNumberFor(date) };
}
