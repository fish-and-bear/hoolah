#!/usr/bin/env node
// Validate the answer and guess word lists. Fails CI if any entry
// breaks the contract: 5 lowercase a-z letters, no duplicates, every
// answer also present in the guess list.

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const answersPath = path.join(root, 'src/data/answers.json');
const guessesPath = path.join(root, 'src/data/guesses.json');
const rotationPath = path.join(root, 'src/data/rotation.json');

const answers = JSON.parse(await fs.readFile(answersPath, 'utf8'));
const guesses = JSON.parse(await fs.readFile(guessesPath, 'utf8'));
const rotation = JSON.parse(await fs.readFile(rotationPath, 'utf8'));

const errors = [];
const wordRe = /^[a-z]{5}$/;

const answerSet = new Set();
for (const entry of answers) {
  if (typeof entry !== 'object' || !entry.word) {
    errors.push(`Answer missing 'word' field: ${JSON.stringify(entry)}`);
    continue;
  }
  const w = entry.word;
  if (!wordRe.test(w)) {
    errors.push(`Answer "${w}" is not 5 lowercase a-z letters.`);
  }
  if (answerSet.has(w)) {
    errors.push(`Duplicate answer: "${w}"`);
  }
  answerSet.add(w);
  if (typeof entry.gloss !== 'string' || entry.gloss.length === 0) {
    errors.push(`Answer "${w}" missing gloss.`);
  }
  if (typeof entry.pos !== 'string' || entry.pos.length === 0) {
    errors.push(`Answer "${w}" missing pos.`);
  }
}

const guessSet = new Set();
for (const g of guesses) {
  if (typeof g !== 'string') {
    errors.push(`Guess entry is not a string: ${JSON.stringify(g)}`);
    continue;
  }
  if (!wordRe.test(g)) {
    errors.push(`Guess "${g}" is not 5 lowercase a-z letters.`);
  }
  if (guessSet.has(g)) {
    errors.push(`Duplicate guess: "${g}"`);
  }
  guessSet.add(g);
}

for (const a of answerSet) {
  if (!guessSet.has(a)) {
    errors.push(`Answer "${a}" missing from guess list.`);
  }
}

if (!Array.isArray(rotation) || rotation.length === 0) {
  errors.push('rotation.json must contain at least one rotation epoch.');
} else {
  let previousStart = 0;
  for (const [i, epoch] of rotation.entries()) {
    if (!epoch || typeof epoch !== 'object' || Array.isArray(epoch)) {
      errors.push(`Rotation epoch ${i + 1} is not an object.`);
      continue;
    }
    const { startPuzzle, answerCount, seed } = epoch;
    if (!Number.isInteger(startPuzzle) || startPuzzle < 1) {
      errors.push(`Rotation epoch ${i + 1} has invalid startPuzzle.`);
    }
    if (i === 0 && startPuzzle !== 1) {
      errors.push('The first rotation epoch must start at puzzle 1.');
    }
    if (Number.isInteger(startPuzzle) && startPuzzle <= previousStart) {
      errors.push('Rotation epochs must be sorted by startPuzzle.');
    }
    if (!Number.isInteger(answerCount) || answerCount < 1) {
      errors.push(`Rotation epoch ${i + 1} has invalid answerCount.`);
    } else if (answerCount > answerSet.size) {
      errors.push(
        `Rotation epoch ${i + 1} uses ${answerCount} answers, but only ${answerSet.size} exist.`
      );
    }
    if (typeof seed !== 'string' || seed.length === 0) {
      errors.push(`Rotation epoch ${i + 1} has invalid seed.`);
    }
    if (Number.isInteger(startPuzzle)) previousStart = startPuzzle;
  }

  const latest = rotation.at(-1);
  if (
    latest &&
    typeof latest === 'object' &&
    !Array.isArray(latest) &&
    latest.answerCount !== answerSet.size
  ) {
    errors.push(
      `Latest rotation epoch uses ${latest.answerCount} answers, but answers.json has ${answerSet.size}. Add a new rotation epoch when changing the daily answer count.`
    );
  }
}

if (errors.length > 0) {
  console.error(`\nWord list validation failed (${errors.length} error(s)):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `OK. ${answerSet.size} answers, ${guessSet.size} accepted guesses (${
    guessSet.size - answerSet.size
  } extra).`
);
