import rotationData from '../data/rotation.json';
import { daysBetween, localDateString } from './time';

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

// Puzzle number for a given daily-reset date string. 1-indexed.
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

interface RotationEpoch {
  startPuzzle: number;
  answerCount: number;
  seed: string;
}

const ROTATION_EPOCHS = (rotationData as RotationEpoch[]).slice().sort(
  (a, b) => a.startPuzzle - b.startPuzzle
);

// Memoize shuffled permutations so we only pay the Fisher-Yates cost
// once per process. Keyed by seed and count because future rotation
// epochs can intentionally introduce new answer-list sizes without
// rewriting older puzzle numbers.
const cachedPermutations = new Map<string, Int32Array>();

// Build a deterministic shuffled permutation of [0..answerCount).
// The epoch seed and answer count together define that epoch's order.
function permutationFor(answerCount: number, seed: string): Int32Array {
  const cacheKey = `${seed}:${answerCount}`;
  const cached = cachedPermutations.get(cacheKey);
  if (cached) return cached;

  const order = new Int32Array(answerCount);
  for (let i = 0; i < answerCount; i++) order[i] = i;
  const rng = mulberry32(fnv1a(seed));
  for (let i = answerCount - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  cachedPermutations.set(cacheKey, order);
  return order;
}

function epochForPuzzleNumber(puzzleNumber: number): RotationEpoch {
  let selected = ROTATION_EPOCHS[0];
  for (const epoch of ROTATION_EPOCHS) {
    if (epoch.startPuzzle <= puzzleNumber) selected = epoch;
  }
  return selected;
}

// Index into the answer array for a given puzzle number.
//
// Implementation: each rotation epoch names an answer-count and seed.
// Within that epoch, a seeded Fisher-Yates shuffle of [0..answerCount)
// is indexed by puzzle offset. This guarantees every word in that
// epoch appears exactly once before the epoch repeats, while letting
// future word-list expansions start a new epoch without changing older
// puzzle numbers.
//
// Properties:
//   - Deterministic across all clients and build environments.
//   - Order is non-obvious (shuffled, not alphabetical) so players
//     can't predict tomorrow's word from a sorted wordlist.
//   - Pure: same (puzzleNumber, answerCount) always returns the same
//     index, with no observable global state from the caller's side.
//
// Rotation epochs are source-controlled in src/data/rotation.json. Do
// not edit an existing epoch after launch; add a later epoch instead.
export function answerIndexFor(
  puzzleNumber: number,
  answerCount: number
): number {
  if (answerCount <= 0) return 0;
  const epoch = epochForPuzzleNumber(puzzleNumber);
  const epochAnswerCount = Math.min(answerCount, epoch.answerCount);
  if (epochAnswerCount <= 0) return 0;
  const order = permutationFor(epochAnswerCount, epoch.seed);
  return order[(puzzleNumber - epoch.startPuzzle) % epochAnswerCount];
}

export function dailyPuzzleKeyForDate(date: string): {
  date: string;
  puzzleNumber: number | null;
} {
  return { date, puzzleNumber: puzzleNumberFor(date) };
}

export function todaysPuzzleKey(date = localDateString()): {
  date: string;
  puzzleNumber: number | null;
} {
  return dailyPuzzleKeyForDate(date);
}
