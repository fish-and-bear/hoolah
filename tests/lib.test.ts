import assert from 'node:assert/strict';
import test from 'node:test';

import { archiveItemsForDate } from '../src/lib/archive';
import { resolveClockDate } from '../src/lib/clock';
import { answerIndexFor, puzzleNumberFor } from '../src/lib/daily';
import {
  hardModeViolation,
  isWin,
  judgeGuess,
  keyboardStateFromGuesses,
} from '../src/lib/game';
import { buildShareText } from '../src/lib/share';
import {
  ensureDailyResultRecorded,
  normalizeStats,
  recordDailyResult,
} from '../src/lib/stats';
import {
  daysBetween,
  formatCountdown,
  localDateString,
  localDateStringForInstant,
  msUntilNextLocalMidnight,
} from '../src/lib/time';
import {
  EMPTY_STATS,
  type AnswerEntry,
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
  assert.equal(answerIndexFor(1, 366), answerIndexFor(1, 500));
  assert.equal(answerIndexFor(366, 366), answerIndexFor(366, 500));
});

test('archive shows only past daily-reset puzzles', () => {
  const answers: AnswerEntry[] = Array.from({ length: 40 }, (_, i) => ({
    word: `${String.fromCharCode(97 + (i % 26))}${String.fromCharCode(
      97 + Math.floor(i / 26)
    )}aaa`,
    gloss: `word ${i}`,
    pos: 'n',
  }));

  assert.deepEqual(archiveItemsForDate('2026-05-30', answers), []);

  const firstPast = archiveItemsForDate('2026-05-31', answers);
  assert.equal(firstPast.length, 1);
  assert.equal(firstPast[0].puzzleNumber, 1);
  assert.equal(firstPast[0].date, '2026-05-30');

  const later = archiveItemsForDate('2026-07-15', answers);
  assert.equal(later.length, 30);
  assert.equal(later[0].puzzleNumber, 46);
  assert.equal(later.at(-1)?.puzzleNumber, 17);
});

test('time helpers handle local midnight and zoned calendar dates', () => {
  assert.equal(
    localDateString(new Date(2026, 4, 30, 0, 0, 0)),
    '2026-05-30'
  );
  assert.equal(
    msUntilNextLocalMidnight(new Date(2026, 4, 30, 23, 59, 30)),
    30_000
  );
  assert.equal(
    localDateStringForInstant(
      new Date('2026-05-29T16:00:00.000Z'),
      'Asia/Manila'
    ),
    '2026-05-30'
  );
  assert.equal(
    localDateStringForInstant(
      new Date('2026-05-30T06:30:00.000Z'),
      'America/Los_Angeles'
    ),
    '2026-05-29'
  );
  assert.equal(daysBetween('2026-05-30', '2026-06-01'), 2);
  assert.equal(daysBetween('2026-02-31', '2026-03-01'), null);
  assert.equal(formatCountdown(3_661_000), '1h 1m');
  assert.equal(formatCountdown(61_000), '1m 1s');
});

test('guarded clock advances from trusted host dates, not local clock jumps', () => {
  assert.deepEqual(
    resolveClockDate({
      observedLocalDate: '2026-05-30',
      trustedLocalDate: '2026-05-30',
      currentTimeZone: 'Asia/Manila',
    }),
    {
      date: '2026-05-30',
      timeZone: 'Asia/Manila',
      source: 'host',
    }
  );

  assert.deepEqual(
    resolveClockDate({
      storedDate: '2026-05-30',
      storedTimeZone: 'Asia/Manila',
      storedSource: 'host',
      observedLocalDate: '2026-05-31',
      currentTimeZone: 'Asia/Manila',
    }),
    {
      date: '2026-05-30',
      timeZone: 'Asia/Manila',
      source: 'host',
    }
  );

  assert.deepEqual(
    resolveClockDate({
      storedDate: '2026-05-30',
      storedTimeZone: 'Asia/Manila',
      storedSource: 'host',
      observedLocalDate: '2026-05-31',
      trustedLocalDate: '2026-05-31',
      trustedStoredZoneDate: '2026-05-31',
      currentTimeZone: 'Asia/Manila',
    }),
    {
      date: '2026-05-31',
      timeZone: 'Asia/Manila',
      source: 'host',
    }
  );

  assert.deepEqual(
    resolveClockDate({
      storedDate: '2026-05-30',
      storedTimeZone: 'America/Los_Angeles',
      storedSource: 'host',
      observedLocalDate: '2026-05-31',
      trustedLocalDate: '2026-05-31',
      trustedStoredZoneDate: '2026-05-30',
      currentTimeZone: 'Pacific/Kiritimati',
    }),
    {
      date: '2026-05-30',
      timeZone: 'America/Los_Angeles',
      source: 'host',
    }
  );

  assert.deepEqual(
    resolveClockDate({
      storedDate: '2026-06-02',
      storedTimeZone: 'Asia/Manila',
      storedSource: 'local',
      observedLocalDate: '2026-06-02',
      trustedLocalDate: '2026-05-31',
      trustedStoredZoneDate: '2026-05-31',
      currentTimeZone: 'Asia/Manila',
    }),
    {
      date: '2026-05-31',
      timeZone: 'Asia/Manila',
      source: 'host',
    }
  );
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
  assert.equal(malformed.currentStreak, 1);
  assert.equal(malformed.maxStreak, 1);
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

test('stats repair completed daily snapshots without double-counting', () => {
  const partialWin: Stats = {
    ...EMPTY_STATS,
    played: 1,
    wins: 1,
    lastWonOn: '2026-05-30',
    lastPlayedOn: '2026-05-30',
  };
  const repaired = ensureDailyResultRecorded(
    partialWin,
    snapshot({ guesses: ['bawal', 'sulat', 'galit'] })
  );

  assert.equal(repaired.played, 1);
  assert.equal(repaired.wins, 1);
  assert.equal(repaired.currentStreak, 1);
  assert.equal(repaired.maxStreak, 1);
  assert.deepEqual(repaired.histogram, [0, 0, 1, 0, 0, 0]);
  assert.deepEqual(repaired.recordedDailyKeys, ['daily:2026-05-30']);

  const migratedWin: Stats = {
    ...EMPTY_STATS,
    played: 4,
    wins: 3,
    currentStreak: 2,
    maxStreak: 3,
    histogram: [0, 1, 0, 1, 1, 0],
    lastWonOn: '2026-05-30',
    lastPlayedOn: '2026-05-30',
  };
  const unchanged = ensureDailyResultRecorded(
    migratedWin,
    snapshot({ guesses: ['bawal', 'galit'] })
  );

  assert.equal(unchanged.played, 4);
  assert.equal(unchanged.wins, 3);
  assert.deepEqual(unchanged.histogram, migratedWin.histogram);
  assert.deepEqual(unchanged.recordedDailyKeys, ['daily:2026-05-30']);

  const repairedLoss = ensureDailyResultRecorded(
    {
      ...EMPTY_STATS,
      played: 2,
      wins: 2,
      histogram: [1, 1, 0, 0, 0, 0],
      lastWonOn: '2026-05-29',
      lastPlayedOn: '2026-05-30',
    },
    snapshot({
      guesses: ['bawal', 'sulat', 'aklat', 'bahay', 'tubig', 'dagat'],
      status: 'lost',
    })
  );

  assert.equal(repairedLoss.played, 3);
  assert.equal(repairedLoss.wins, 2);
  assert.equal(repairedLoss.currentStreak, 0);
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
