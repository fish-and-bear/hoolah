'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import answersData from '@/data/answers.json';
import guessesData from '@/data/guesses.json';
import { guardedLocalDateString } from '@/lib/clock';
import { answerIndexFor, dailyPuzzleKeyForDate } from '@/lib/daily';
import {
  hardModeViolation,
  isWin,
  judgeGuess,
  keyboardStateFromGuesses,
} from '@/lib/game';
import {
  COPY,
  formatHardModeViolation,
  formatLongDate,
} from '@/lib/i18n';
import {
  loadGame,
  loadSettings,
  loadStats,
  pruneGames,
  saveGame,
  saveSettings,
  saveStats,
} from '@/lib/storage';
import {
  ensureDailyResultRecorded,
  recordDailyResult,
  snapshotWasRecorded,
} from '@/lib/stats';
import { msUntilNextLocalMidnight } from '@/lib/time';
import {
  DEFAULT_SETTINGS,
  EMPTY_STATS,
  MAX_GUESSES,
  WORD_LENGTH,
  type AnswerEntry,
  type GameMode,
  type GameSnapshot,
  type Settings,
  type Stats,
} from '@/lib/types';

import Board from './Board';
import EndModal from './EndModal';
import Help from './Help';
import Keyboard from './Keyboard';
import SettingsModal from './Settings';
import TitleScreen from './TitleScreen';
import Toast from './Toast';

const answers = answersData as AnswerEntry[];
const guessSet = new Set([
  ...answers.map((a) => a.word),
  ...(guessesData as string[]),
]);
const entryByWord = new Map(answers.map((a) => [a.word, a]));

interface ActivePuzzle {
  key: string;
  mode: GameMode;
  date: string;
  puzzleNumber: number | null;
  answer: string;
  entry: AnswerEntry;
}

function freshSnapshot(p: ActivePuzzle, hardMode: boolean): GameSnapshot {
  return {
    key: p.key,
    mode: p.mode,
    dateIssued: p.date,
    puzzleNumber: p.puzzleNumber,
    answer: p.answer,
    guesses: [],
    status: 'in-progress',
    hardMode,
    startedAt: Date.now(),
    finishedAt: null,
  };
}

function pickDailyPuzzle(date: string): ActivePuzzle {
  const { puzzleNumber } = dailyPuzzleKeyForDate(date);
  const idx = puzzleNumber != null
    ? answerIndexFor(puzzleNumber, answers.length)
    : 0;
  const entry = answers[idx];
  return {
    key: `daily:${date}`,
    mode: 'daily',
    date,
    puzzleNumber,
    answer: entry.word,
    entry,
  };
}

function hydratePuzzle(
  p: ActivePuzzle,
  hardMode: boolean,
  stats: Stats
): {
  snapshot: GameSnapshot;
  stats: Stats;
  shouldOpenEnd: boolean;
  shouldHideTitle: boolean;
  recordedKey: string | null;
} {
  const existing = loadGame(p.key);
  if (existing && existing.answer === p.answer) {
    let nextStats = stats;
    let recordedKey: string | null = null;
    let shouldOpenEnd = false;
    let shouldHideTitle = false;

    if (existing.status !== 'in-progress') {
      if (
        existing.mode === 'daily' &&
        existing.puzzleNumber !== null &&
        !snapshotWasRecorded(nextStats, existing)
      ) {
        nextStats = ensureDailyResultRecorded(nextStats, existing);
        saveStats(nextStats);
      }
      recordedKey = existing.key;
      shouldOpenEnd = true;
      shouldHideTitle = true;
    } else if (existing.guesses.length > 0) {
      shouldHideTitle = true;
    }

    return {
      snapshot: existing,
      stats: nextStats,
      shouldOpenEnd,
      shouldHideTitle,
      recordedKey,
    };
  }

  return {
    snapshot: freshSnapshot(p, hardMode),
    stats,
    shouldOpenEnd: false,
    shouldHideTitle: false,
    recordedKey: null,
  };
}

// Soft haptic on guess submit, celebratory on win. iOS Safari does not
// expose navigator.vibrate; this becomes a no-op there. Wrapped in a
// try/catch because some Android skins throw on certain patterns.
function haptic(pattern: number | number[]): void {
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignored
  }
}

export default function Game() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [puzzle, setPuzzle] = useState<ActivePuzzle | null>(null);
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [current, setCurrent] = useState('');
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [bouncingRow, setBouncingRow] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [endOpen, setEndOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [titleVisible, setTitleVisible] = useState(true);

  // Whether the daily puzzle's stats have already been recorded. We
  // record exactly once per (daily) game, identified by puzzle key.
  const recordedKeys = useRef(new Set<string>());
  const timers = useRef<number[]>([]);
  const submitLocked = useRef(false);
  const toastToken = useRef(0);
  const copy = COPY[settings.locale];

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current = timers.current.filter((timer) => timer !== id);
      fn();
    }, ms);
    timers.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Boot: hydrate settings/stats and load today's puzzle.
  useEffect(() => {
    let cancelled = false;
    const s = loadSettings();
    let st = loadStats();
    setSettings(s);
    document.documentElement.lang = COPY[s.locale].meta.htmlLang;
    document.documentElement.setAttribute('data-locale', s.locale);
    document.documentElement.setAttribute(
      'data-reduced-motion',
      s.reducedMotion ? 'true' : 'false'
    );

    void (async () => {
      const today = await guardedLocalDateString();
      if (cancelled) return;

      const todaysPuzzle = pickDailyPuzzle(today);
      const hydrated = hydratePuzzle(todaysPuzzle, s.hardMode, st);
      st = hydrated.stats;

      setPuzzle(todaysPuzzle);
      setSnapshot(hydrated.snapshot);
      if (hydrated.recordedKey) recordedKeys.current.add(hydrated.recordedKey);
      if (hydrated.shouldOpenEnd) setEndOpen(true);
      if (hydrated.shouldHideTitle) setTitleVisible(false);

      // Trim old per-game entries.
      pruneGames([todaysPuzzle.key]);

      setStats(st);
      setMounted(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Apply theme/motion attributes when settings change.
  useEffect(() => {
    if (!mounted) return;
    const dark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute(
      'data-theme',
      dark ? 'dark' : 'light'
    );
    document.documentElement.lang = copy.meta.htmlLang;
    document.documentElement.setAttribute('data-locale', settings.locale);
    document.documentElement.setAttribute(
      'data-reduced-motion',
      settings.reducedMotion ? 'true' : 'false'
    );
    saveSettings(settings);
  }, [settings, mounted, copy.meta.htmlLang]);

  // Persist snapshot every change.
  useEffect(() => {
    if (snapshot && mounted) saveGame(snapshot);
  }, [snapshot, mounted]);

  // Roll to the next local-day puzzle while the app is open. The
  // guarded clock refuses normal OS date jumps; the local timer only
  // decides when to check.
  useEffect(() => {
    if (!mounted || !puzzle) return;
    const currentPuzzle = puzzle;
    let cancelled = false;

    async function refreshDailyPuzzle() {
      const today = await guardedLocalDateString();
      if (cancelled || today === currentPuzzle.date) return;

      const nextPuzzle = pickDailyPuzzle(today);
      const hydrated = hydratePuzzle(
        nextPuzzle,
        settings.hardMode,
        loadStats()
      );

      clearTimers();
      submitLocked.current = false;
      toastToken.current += 1;
      if (hydrated.recordedKey) recordedKeys.current.add(hydrated.recordedKey);

      setPuzzle(nextPuzzle);
      setSnapshot(hydrated.snapshot);
      setStats(hydrated.stats);
      setCurrent('');
      setRevealingRow(null);
      setShakingRow(null);
      setBouncingRow(null);
      setToast(null);
      setEndOpen(hydrated.shouldOpenEnd);
      setTitleVisible(!hydrated.shouldHideTitle);
      pruneGames([nextPuzzle.key]);
    }

    const nextMidnight = window.setTimeout(
      refreshDailyPuzzle,
      msUntilNextLocalMidnight() + 500
    );
    const interval = window.setInterval(refreshDailyPuzzle, 60_000);
    return () => {
      cancelled = true;
      window.clearTimeout(nextMidnight);
      window.clearInterval(interval);
    };
  }, [clearTimers, mounted, puzzle, settings.hardMode]);

  const showToast = useCallback(
    (msg: string, ms = 1600) => {
      const token = toastToken.current + 1;
      toastToken.current = token;
      setToast(msg);
      schedule(() => {
        if (toastToken.current === token) setToast(null);
      }, ms);
    },
    [schedule]
  );

  const judgedGuesses = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.guesses.map((g) => judgeGuess(g, snapshot.answer));
  }, [snapshot]);

  const letterStates = useMemo(
    () => keyboardStateFromGuesses(judgedGuesses),
    [judgedGuesses]
  );

  const onHandleKey = useCallback(
    (key: string) => {
      if (!snapshot || !puzzle) return;
      if (snapshot.status !== 'in-progress') return;
      if (revealingRow !== null) return;
      if (submitLocked.current) return;

      if (key === 'enter') {
        if (current.length < WORD_LENGTH) {
          showToast(copy.game.notEnoughLetters);
          setShakingRow(snapshot.guesses.length);
          schedule(() => setShakingRow(null), 500);
          return;
        }
        if (!guessSet.has(current)) {
          showToast(copy.game.notInWordList);
          setShakingRow(snapshot.guesses.length);
          schedule(() => setShakingRow(null), 500);
          return;
        }
        if (snapshot.hardMode) {
          const violation = hardModeViolation(current, judgedGuesses);
          if (violation) {
            showToast(formatHardModeViolation(violation, settings.locale));
            setShakingRow(snapshot.guesses.length);
            schedule(() => setShakingRow(null), 500);
            return;
          }
        }

        submitLocked.current = true;
        const judged = judgeGuess(current, snapshot.answer);
        const nextGuesses = [...snapshot.guesses, current];
        const rowIdx = snapshot.guesses.length;
        setRevealingRow(rowIdx);
        const flipMs = (WORD_LENGTH - 1) * 280 + 300 + 80; // last tile's flip end + small buffer
        const won = isWin(judged);
        const lost = !won && nextGuesses.length >= MAX_GUESSES;
        const status = won ? 'won' : lost ? 'lost' : 'in-progress';

        const nextSnapshot: GameSnapshot = {
          ...snapshot,
          guesses: nextGuesses,
          status,
          finishedAt: status === 'in-progress' ? null : Date.now(),
        };
        setSnapshot(nextSnapshot);
        setCurrent('');

        // A 12ms tick on submit is short enough to feel like
        // confirmation, not interruption.
        haptic(12);

        schedule(() => {
          setRevealingRow(null);
          submitLocked.current = false;
          if (won) {
            setBouncingRow(rowIdx);
            schedule(() => setBouncingRow(null), 700);
            // Celebratory triple-pulse on the win, only after the row
            // finishes flipping so the haptic lines up with the bounce.
            haptic([18, 60, 18, 60, 30]);
          }
          if (status !== 'in-progress') {
            // Only after the launch epoch: pre-launch games carry
            // puzzleNumber=null (the label is "preview" in that case)
            // and must not pollute the histogram.
            if (
              nextSnapshot.mode === 'daily' &&
              nextSnapshot.puzzleNumber !== null &&
              !recordedKeys.current.has(nextSnapshot.key)
            ) {
              recordedKeys.current.add(nextSnapshot.key);
              setStats((prev) => {
                const updated = recordDailyResult(prev, nextSnapshot);
                saveStats(updated);
                return updated;
              });
            }
            showToast(
              won
                ? nextGuesses.length === 1
                  ? copy.game.winOne
                  : copy.game.solvedIn(nextGuesses.length)
                : copy.game.wordWas(nextSnapshot.answer.toUpperCase()),
              2400
            );
            schedule(() => setEndOpen(true), 1100);
          }
        }, flipMs);
      } else if (key === 'back') {
        if (current.length > 0) setCurrent(current.slice(0, -1));
      } else if (/^[a-z]$/.test(key)) {
        if (current.length < WORD_LENGTH) setCurrent(current + key);
      }
    },
    [
      snapshot,
      puzzle,
      current,
      judgedGuesses,
      revealingRow,
      showToast,
      schedule,
      copy,
      settings.locale,
    ]
  );

  const startGame = useCallback(() => {
    setTitleVisible(false);
    setSettings((s) =>
      s.hasOpenedBefore ? s : { ...s, hasOpenedBefore: true }
    );
    if (!loadSettings().hasOpenedBefore) {
      // First-ever visit: open help once.
      setHelpOpen(true);
    }
  }, []);

  if (!mounted || !snapshot || !puzzle) {
    // Skeleton: same vertical rhythm as the game, no flash on hydration.
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="opacity-30 font-serif italic text-4xl">hoolah</div>
      </main>
    );
  }

  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const inProgress = snapshot.status === 'in-progress';

  if (titleVisible && snapshot.guesses.length === 0) {
    return (
      <>
        <TitleScreen
          dateLine={formatLongDate(puzzle.date, settings.locale)}
          puzzleNumber={puzzle.puzzleNumber}
          onPlay={startGame}
          locale={settings.locale}
        />
        <Help
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          locale={settings.locale}
        />
      </>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ animation: 'boardEnter 220ms ease-out' }}
    >
      <div
        className="flex min-h-11 items-center justify-between gap-3 px-3 sm:px-4"
        style={{ color: 'var(--hoolah-muted)' }}
      >
        <p className="min-w-0 truncate text-[0.7rem] uppercase tracking-normal">
          {puzzle.puzzleNumber != null
            ? `hoolah ${puzzle.puzzleNumber.toString().padStart(3, '0')}`
            : copy.game.preview}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={copy.game.howToPlay}
            onClick={() => setHelpOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-sm"
            style={{ background: 'transparent', color: 'inherit' }}
          >
            ?
          </button>
          <button
            type="button"
            aria-label={copy.game.stats}
            disabled={inProgress}
            onClick={() => setEndOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-sm disabled:opacity-30"
            style={{ background: 'transparent', color: 'inherit' }}
          >
            ☷
          </button>
          <button
            type="button"
            aria-label={copy.game.settings}
            onClick={() => setSettingsOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-sm"
            style={{ background: 'transparent', color: 'inherit' }}
          >
            ⚙
          </button>
        </div>
      </div>

      <main className="hoolah-game-main flex flex-1 flex-col items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-5">
        <Toast message={toast} />
        <Board
          judged={judgedGuesses}
          current={current}
          revealingRow={revealingRow}
          shakingRow={shakingRow}
          bouncingRow={bouncingRow}
          locale={settings.locale}
        />
        <Keyboard
          onKey={onHandleKey}
          letterStates={letterStates}
          disabled={!inProgress || revealingRow !== null}
          locale={settings.locale}
        />
      </main>

      <EndModal
        open={endOpen}
        onClose={() => setEndOpen(false)}
        snapshot={snapshot}
        entry={entryByWord.get(snapshot.answer) ?? puzzle.entry}
        stats={stats}
        dark={dark}
        locale={settings.locale}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={(next) => {
          // Block hard-mode toggle mid-daily-game.
          if (
            next.hardMode !== settings.hardMode &&
            snapshot.mode === 'daily' &&
            snapshot.guesses.length > 0 &&
            snapshot.status === 'in-progress'
          ) {
            showToast(copy.game.finishTodayFirst);
            return;
          }
          setSettings(next);
          if (
            snapshot.status === 'in-progress' &&
            snapshot.guesses.length === 0
          ) {
            // Apply the new hard-mode setting to the fresh snapshot.
            setSnapshot({ ...snapshot, hardMode: next.hardMode });
          }
        }}
        hardModeLocked={
          snapshot.mode === 'daily' &&
          snapshot.guesses.length > 0 &&
          snapshot.status === 'in-progress'
        }
      />

      <Help
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        locale={settings.locale}
      />
    </div>
  );
}
