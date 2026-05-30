import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const answersPath = path.resolve(here, '..', 'src/data/answers.json');
const answers = JSON.parse(readFileSync(answersPath, 'utf8'));

// NOTE: this script must always match the production indexing logic in
// src/lib/daily.ts. If you change one, change the other. Both use a
// seeded Fisher-Yates shuffle with the seed string
// 'hoolah:v1:permutation'. See daily.ts for why that string is fixed.

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

function buildPermutation(answerCount) {
  const order = new Int32Array(answerCount);
  for (let i = 0; i < answerCount; i++) order[i] = i;
  const rng = mulberry32(fnv1a('hoolah:v1:permutation'));
  for (let i = answerCount - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = order[i];
    order[i] = order[j];
    order[j] = tmp;
  }
  return order;
}

function answerIndexFor(puzzleNumber, answerCount) {
  if (answerCount <= 0) return 0;
  const order = buildPermutation(answerCount);
  return order[(puzzleNumber - 1) % answerCount];
}

const EPOCH_DATE = '2026-05-30';
const EPOCH = new Date(`${EPOCH_DATE}T00:00:00+08:00`);
const DAYS = Number(process.argv[2] ?? 60);

console.log(`# Next ${DAYS} hoolah puzzles (epoch ${EPOCH_DATE}, Asia/Manila)`);
console.log('');
console.log('puzzle | date       | word     | gloss');
console.log('-------+------------+----------+--------------------------------------');
for (let i = 1; i <= DAYS; i++) {
  const d = new Date(EPOCH.getTime() + (i - 1) * 86400000);
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const idx = answerIndexFor(i, answers.length);
  const entry = answers[idx];
  const gloss = (entry.gloss || '').slice(0, 38);
  console.log(`  ${String(i).padStart(3, '0')}  | ${dateStr} | ${entry.word.padEnd(8)} | ${gloss}`);
}

// Determinism / uniqueness summary, printed at the end so it's easy
// to eyeball when running `node scripts/schedule.mjs 365`.
const N = answers.length;
const firstCycle = new Set();
for (let i = 1; i <= Math.min(DAYS, N); i++) {
  firstCycle.add(answerIndexFor(i, N));
}
console.log('');
console.log(`# Unique words in days 1..${Math.min(DAYS, N)}: ${firstCycle.size} (expected ${Math.min(DAYS, N)})`);
if (DAYS >= 2 * N) {
  const secondCycle = new Set();
  for (let i = N + 1; i <= 2 * N; i++) {
    secondCycle.add(answerIndexFor(i, N));
  }
  console.log(`# Unique words in days ${N + 1}..${2 * N}: ${secondCycle.size} (expected ${N})`);
  console.log(`# Day 1 word === day ${N + 1} word? ${answerIndexFor(1, N) === answerIndexFor(N + 1, N)}`);
}
