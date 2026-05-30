import assert from 'node:assert/strict';
import test from 'node:test';

import { answerIndexFor, puzzleNumberFor } from '../src/lib/daily';
import {
  hardModeViolation,
  isWin,
  judgeGuess,
  keyboardStateFromGuesses,
} from '../src/lib/game';
import { buildShareText } from '../src/lib/share';
import { normalizeStats, recordDailyResult } from '../src/lib/stats';
import {
  daysBetween,
  formatCountdown,
  manilaDateString,
  msUntilNextManilaMidnight,
} from '../src/lib/time';
import {
  EMPTY_STATS,
  type GameSnapshot,
  type Settings,
  type Stats,
} from '../src/lib/types';

const SETTINGS_KEY = 'hoolah:v1:settings';
const GAME_PREFIX = 'hoolah:v1:game:';

type FakeStorage = Storage & {
  dump: () => Record<string, string>;
};

function makeStorage(seed: Record<string, string> = {}): FakeStorage {
  const store: Record<string, string> = { ...seed };
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      for (const key of Object.keys(store)) delete store[key];
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    dump() {
      return { ...store };
    },
  };
}

function withStorage<T>(
  localStorage: FakeStorage,
  run: (storage: typeof import('../src/lib/storage')) => T
): T {
  const globalObject = globalThis as Record<string, unknown>;
  const previousWindow = globalObject.window;
  globalObject.window = { localStorage };

  const moduleId = require.resolve('../src/lib/storage');
  delete require.cache[moduleId];
  const storage = require('../src/lib/storage') as typeof import('../src/lib/storage');
  try {
    return run(storage);
  } finally {
    delete require.cache[moduleId];
    if (previousWindow === undefined) {
      Reflect.deleteProperty(globalObject, 'window');
    } else {
      globalObject.window = previousWindow;
    }
  }
}

function snapshot(overrides: Partial<GameSnapshot> = {}): GameSnapshot {
  return {
    key: 'daily:2026-05-30',
    mode: 'daily',
    dateIssued: '2026-05-30',
    puzzleNumber: 1,
    answer: 'galit',
    guesses: ['galit'],
    status: 'won',
    hardMode: false,
    startedAt: 1,
    finishedAt: 2,
    ...overrides,
  };
}

test('judgeGuess handles duplicate letters without over-crediting', () => {
  assert.deepEqual(judgeGuess('babae', 'bawal'), [
    { letter: 'b', state: 'correct' },
    { letter: 'a', state: 'correct' },
    { letter: 'b', state: 'absent' },
    { letter: 'a', state: 'correct' },
    { letter: 'e', state: 'absent' },
  ]);
  assert.equal(isWin(judgeGuess('aklat', 'aklat')), true);
});

test('keyboard state keeps the strongest discovered state', () => {
  const states = keyboardStateFromGuesses([
    judgeGuess('babae', 'bawal'),
    judgeGuess('bawal', 'bawal'),
  ]);
  assert.equal(states.b, 'correct');
  assert.equal(states.a, 'correct');
  assert.equal(states.e, 'absent');
});

test('hard mode reports locked slots and required yellow letters clearly', () => {
  assert.deepEqual(hardModeViolation('buhok', [judgeGuess('bawal', 'bawal')]), {
    code: 'locked-slot',
    position: 2,
    letter: 'A',
  });
  assert.deepEqual(hardModeViolation('bayan', [judgeGuess('sulat', 'bansa')]), {
    code: 'missing-letter',
    letter: 'S',
  });
  assert.equal(
    hardModeViolation('sabay', [judgeGuess('sulat', 'bansa')]),
    null
  );
});

test('daily puzzle math is deterministic and cycles only after a full permutation', () => {
  assert.equal(puzzleNumberFor('2026-05-29'), null);
  assert.equal(puzzleNumberFor('2026-05-30'), 1);
  assert.equal(puzzleNumberFor('2026-05-31'), 2);

  const firstCycle = Array.from({ length: 20 }, (_, i) =>
    answerIndexFor(i + 1, 20)
  );
  assert.equal(new Set(firstCycle).size, 20);
  assert.equal(answerIndexFor(1, 20), answerIndexFor(21, 20));
});

test('Manila time helpers handle midnight boundaries and invalid dates', () => {
  assert.equal(
    manilaDateString(new Date('2026-05-29T16:00:00.000Z')),
    '2026-05-30'
  );
  assert.equal(
    msUntilNextManilaMidnight(new Date('2026-05-30T15:59:30.000Z')),
    30_000
  );
  assert.equal(daysBetween('2026-05-30', '2026-06-01'), 2);
  assert.equal(daysBetween('2026-02-31', '2026-03-01'), null);
  assert.equal(formatCountdown(3_661_000), '1h 1m');
  assert.equal(formatCountdown(61_000), '1m 1s');
});

test('stats normalize malformed storage and record daily results once', () => {
  const malformed = normalizeStats({
    played: 1,
    wins: 9,
    currentStreak: 3,
    maxStreak: 2,
    histogram: [5, -1, 2, Number.NaN, 1.7, 'x'],
    lastWonOn: '2026-02-31',
    lastPlayedOn: '2026-05-30',
    recordedDailyKeys: ['daily:2026-05-30', 'bad', 'daily:2026-05-30'],
  } as unknown as Parameters<typeof normalizeStats>[0]);

  assert.equal(malformed.played, 1);
  assert.equal(malformed.wins, 1);
  assert.equal(malformed.currentStreak, 3);
  assert.equal(malformed.maxStreak, 3);
  assert.deepEqual(malformed.histogram, [0, 0, 0, 0, 0, 0]);
  assert.equal(malformed.lastWonOn, null);
  assert.deepEqual(malformed.recordedDailyKeys, ['daily:2026-05-30']);

  const base: Stats = {
    ...EMPTY_STATS,
    played: 1,
    wins: 1,
    currentStreak: 1,
    maxStreak: 1,
    histogram: [1, 0, 0, 0, 0, 0],
    lastWonOn: '2026-05-30',
    lastPlayedOn: '2026-05-30',
    recordedDailyKeys: ['daily:2026-05-30'],
  };
  const next = recordDailyResult(
    base,
    snapshot({
      key: 'daily:2026-05-31',
      dateIssued: '2026-05-31',
      puzzleNumber: 2,
      guesses: ['bawal', 'sulat', 'galit'],
    })
  );

  assert.equal(next.played, 2);
  assert.equal(next.wins, 2);
  assert.equal(next.currentStreak, 2);
  assert.equal(next.maxStreak, 2);
  assert.deepEqual(next.histogram, [1, 0, 1, 0, 0, 0]);
  assert.deepEqual(recordDailyResult(next, snapshot({
    key: 'daily:2026-05-31',
    dateIssued: '2026-05-31',
    puzzleNumber: 2,
  })), next);

  const loss = recordDailyResult(next, snapshot({
    key: 'daily:2026-06-01',
    dateIssued: '2026-06-01',
    puzzleNumber: 3,
    guesses: ['bawal', 'sulat', 'aklat', 'bahay', 'tubig', 'dagat'],
    status: 'lost',
  }));
  assert.equal(loss.played, 3);
  assert.equal(loss.wins, 2);
  assert.equal(loss.currentStreak, 0);
});

test('share text uses a compact Wordle-style clipboard block', () => {
  const text = buildShareText({
    puzzleNumber: 7,
    guesses: [judgeGuess('bawal', 'galit')],
    won: false,
    hardMode: true,
    dark: true,
  });
  assert.equal(text, 'hoolah 007 X/6*\n\n⬜🟩⬜⬜🟨');
});

test('storage normalizes settings and rejects corrupt snapshots', () => {
  const localStorage = makeStorage({
    [SETTINGS_KEY]: JSON.stringify({
      hardMode: 'yes',
      reducedMotion: true,
      locale: 'xx',
      theme: 'neon',
      hasOpenedBefore: 'true',
    }),
    [`${GAME_PREFIX}daily:2026-05-30`]: JSON.stringify(snapshot()),
    [`${GAME_PREFIX}daily:bad`]: JSON.stringify({
      ...snapshot(),
      key: 'daily:bad',
      answer: '<img>',
    }),
  });

  withStorage(localStorage, (storage) => {
    assert.deepEqual(storage.loadSettings(), {
      hardMode: false,
      reducedMotion: true,
      locale: 'en',
      theme: 'system',
      hasOpenedBefore: false,
    } satisfies Settings);

    assert.equal(storage.loadGame('daily:2026-05-30')?.answer, 'galit');
    assert.equal(storage.loadGame('daily:bad'), null);

    storage.saveSettings({
      hardMode: true,
      reducedMotion: false,
      locale: 'fil',
      theme: 'dark',
      hasOpenedBefore: true,
    });
    assert.equal(
      JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}').theme,
      'dark'
    );
  });
});

test('storage pruning keeps the requested game keys only', () => {
  const localStorage = makeStorage({
    [`${GAME_PREFIX}daily:2026-05-30`]: '{}',
    [`${GAME_PREFIX}daily:2026-05-29`]: '{}',
    'hoolah:v1:stats': '{}',
  });

  withStorage(localStorage, (storage) => {
    storage.pruneGames(['daily:2026-05-30']);
    assert.deepEqual(Object.keys(localStorage.dump()).sort(), [
      'hoolah:v1:game:daily:2026-05-30',
      'hoolah:v1:stats',
    ]);
  });
});
