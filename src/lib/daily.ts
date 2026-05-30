import { daysBetween, manilaDateString } from './time';

// The first hoolah ever shipped. Day 1 of the rotation. Do not change
// this constant after launch; the puzzle number depends on it.
export const EPOCH_DATE = '2026-05-30';

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

// Seedable 32-bit PRNG. Five lines, well-tested, uniform enough for
// shuffling a few hundred elements. We pair it with FNV-1a so the seed
// is itself stable across browsers and Node versions.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Memoize the shuffled permutation so we only pay the Fisher-Yates
// cost once per process. Keyed by length so a future answer-list
// resize triggers a fresh shuffle, but in practice the seed string
// and length are both part of the launched identity (see below).
let cachedPermutation: { length: number; order: Int32Array } | null = null;

// Build a deterministic shuffled permutation of [0..answerCount).
// The seed string and answerCount together define the rotation that
// every player sees. NEVER change the seed string after launch, and
// avoid changing the answer-list length, since either change
// re-shuffles the rotation for every installed client.
function permutationFor(answerCount: number): Int32Array {
  if (cachedPermutation && cachedPermutation.length === answerCount) {
    return cachedPermutation.order;
  }
  const order = new Int32Array(answerCount);
  for (let i = 0; i < answerCount; i++) order[i] = i;
  const rng = mulberry32(fnv1a('hoolah:v1:permutation'));
  for (let i = answerCount - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  cachedPermutation = { length: answerCount, order };
  return order;
}

// Index into the answer array for a given puzzle number.
//
// Implementation: a seeded Fisher-Yates shuffle of [0..answerCount),
// computed once and memoized by length, indexed by (puzzleNumber - 1)
// mod answerCount. This guarantees every word appears exactly once
  // before any word repeats, i.e. the first repeat is day answerCount+1,
// not "somewhere around day 15" as the previous fnv % length approach
// produced via the birthday paradox.
//
// Properties:
//   - Deterministic across all clients and build environments.
//   - Order is non-obvious (shuffled, not alphabetical) so players
//     can't predict tomorrow's word from a sorted wordlist.
//   - Pure: same (puzzleNumber, answerCount) always returns the same
//     index, with no observable global state from the caller's side.
//
// The seed string `'hoolah:v1:permutation'` is part of the launched
// version's identity. Do not change it.
export function answerIndexFor(
  puzzleNumber: number,
  answerCount: number
): number {
  if (answerCount <= 0) return 0;
  const order = permutationFor(answerCount);
  return order[(puzzleNumber - 1) % answerCount];
}

export function todaysPuzzleKey(): {
  date: string;
  puzzleNumber: number | null;
} {
  const date = manilaDateString();
  return { date, puzzleNumber: puzzleNumberFor(date) };
}
