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

const answers = JSON.parse(await fs.readFile(answersPath, 'utf8'));
const guesses = JSON.parse(await fs.readFile(guessesPath, 'utf8'));

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
