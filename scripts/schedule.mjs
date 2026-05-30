import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const answersPath = path.resolve(here, '..', 'src/data/answers.json');
const rotationPath = path.resolve(here, '..', 'src/data/rotation.json');
const answers = JSON.parse(readFileSync(answersPath, 'utf8'));
const rotation = JSON.parse(readFileSync(rotationPath, 'utf8'));

// NOTE: this script must always match the production indexing logic in
// src/lib/daily.ts. If you change one, change the other. Both use the
// rotation epochs in src/data/rotation.json and a seeded Fisher-Yates
// shuffle inside each epoch.

function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const permutationCache = new Map();

function buildPermutation(answerCount, seed) {
  const cacheKey = `${seed}:${answerCount}`;
  const cached = permutationCache.get(cacheKey);
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
  permutationCache.set(cacheKey, order);
  return order;
}

function epochForPuzzleNumber(puzzleNumber) {
  let selected = rotation[0];
  for (const epoch of rotation) {
    if (epoch.startPuzzle <= puzzleNumber) selected = epoch;
  }
  return selected;
}

function answerIndexFor(puzzleNumber, answerCount) {
  if (answerCount <= 0) return 0;
  const epoch = epochForPuzzleNumber(puzzleNumber);
  const epochAnswerCount = Math.min(answerCount, epoch.answerCount);
  if (epochAnswerCount <= 0) return 0;
  const order = buildPermutation(epochAnswerCount, epoch.seed);
  return order[(puzzleNumber - epoch.startPuzzle) % epochAnswerCount];
}

const EPOCH_DATE = '2026-05-30';
const EPOCH = Date.UTC(2026, 4, 30);
const DAYS = Number(process.argv[2] ?? 60);

console.log(`# Next ${DAYS} hoolah puzzles (epoch ${EPOCH_DATE})`);
console.log('');
console.log('puzzle | date       | word     | gloss');
console.log('-------+------------+----------+--------------------------------------');
for (let i = 1; i <= DAYS; i++) {
  const dateStr = new Date(EPOCH + (i - 1) * 86400000)
    .toISOString()
    .slice(0, 10);
  const idx = answerIndexFor(i, answers.length);
  const entry = answers[idx];
  const gloss = (entry.gloss || '').slice(0, 38);
  console.log(`  ${String(i).padStart(3, '0')}  | ${dateStr} | ${entry.word.padEnd(8)} | ${gloss}`);
}

// Determinism / uniqueness summary, printed at the end so it is easy
// to eyeball each rotation epoch.
const N = answers.length;
console.log('');
for (let i = 0; i < rotation.length; i++) {
  const epoch = rotation[i];
  const nextEpoch = rotation[i + 1];
  const epochCount = Math.min(N, epoch.answerCount);
  const start = epoch.startPuzzle;
  const end = Math.min(
    DAYS,
    nextEpoch ? nextEpoch.startPuzzle - 1 : start + epochCount - 1
  );
  if (end < start) continue;
  const seen = new Set();
  for (let puzzleNumber = start; puzzleNumber <= end; puzzleNumber++) {
    seen.add(answerIndexFor(puzzleNumber, N));
  }
  const expected = end - start + 1;
  console.log(
    `# Unique words in epoch starting day ${start}, days ${start}..${end}: ${seen.size} (expected ${expected})`
  );
}
