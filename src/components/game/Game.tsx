'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import answersData from '@/data/answers.json';
import guessesData from '@/data/guesses.json';
import { answerIndexFor, todaysPuzzleKey } from '@/lib/daily';
import {
  hardModeViolation,
  isWin,
  judgeGuess,
  keyboardStateFromGuesses,
} from '@/lib/game';
import {
  loadGame,
  loadSettings,
  loadStats,
  pruneGames,
  saveGame,
  saveSettings,
  saveStats,
} from '@/lib/storage';
import { daysBetween, manilaDateString } from '@/lib/time';
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

function pickDailyPuzzle(): ActivePuzzle {
  const { date, puzzleNumber } = todaysPuzzleKey();
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

function pickFreePuzzle(): ActivePuzzle {
  const idx = Math.floor(Math.random() * answers.length);
  const entry = answers[idx];
  const tag = Math.random().toString(36).slice(2, 8);
  return {
    key: `free:${tag}`,
    mode: 'free',
    date: manilaDateString(),
    puzzleNumber: null,
    answer: entry.word,
    entry,
  };
}

function applyResultToStats(
  prev: Stats,
  won: boolean,
  guessesUsed: number,
  date: string
): Stats {
  const next: Stats = {
    ...prev,
    histogram: [...prev.histogram] as Stats['histogram'],
  };
  next.played = prev.played + 1;
  if (won) {
    next.wins = prev.wins + 1;
    next.histogram[guessesUsed - 1] = next.histogram[guessesUsed - 1] + 1;
    const dayGap = prev.lastWonOn ? daysBetween(prev.lastWonOn, date) : null;
    next.currentStreak = dayGap === 1 ? prev.currentStreak + 1 : 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
    next.lastWonOn = date;
  } else {
    next.currentStreak = 0;
  }
  next.lastPlayedOn = date;
  return next;
}

function formatDateLong(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const localDate = new Date(Date.UTC(y, m - 1, d));
  return localDate.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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

  // Boot: hydrate settings/stats and load today's puzzle.
  useEffect(() => {
    const s = loadSettings();
    const st = loadStats();
    setSettings(s);
    setStats(st);
    document.documentElement.setAttribute(
      'data-reduced-motion',
      s.reducedMotion ? 'true' : 'false'
    );

    const todaysPuzzle = pickDailyPuzzle();
    setPuzzle(todaysPuzzle);

    const existing = loadGame(todaysPuzzle.key);
    if (existing && existing.answer === todaysPuzzle.answer) {
      setSnapshot(existing);
      // Returning players whose previous snapshot already wrapped up:
      // pop the modal automatically.
      if (existing.status !== 'in-progress') {
        recordedKeys.current.add(existing.key);
        setEndOpen(true);
        setTitleVisible(false);
      } else if (s.hasOpenedBefore && existing.guesses.length > 0) {
        // Mid-game return: skip the title screen and resume.
        setTitleVisible(false);
      }
    } else {
      setSnapshot(freshSnapshot(todaysPuzzle, s.hardMode));
    }

    // Trim old per-game entries.
    pruneGames([todaysPuzzle.key]);

    setMounted(true);
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
    document.documentElement.setAttribute(
      'data-reduced-motion',
      settings.reducedMotion ? 'true' : 'false'
    );
    saveSettings(settings);
  }, [settings, mounted]);

  // Persist snapshot every change.
  useEffect(() => {
    if (snapshot && mounted) saveGame(snapshot);
  }, [snapshot, mounted]);

  const showToast = useCallback((msg: string, ms = 1600) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), ms);
  }, []);

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

      if (key === 'enter') {
        if (current.length < WORD_LENGTH) {
          showToast('Not enough letters');
          setShakingRow(snapshot.guesses.length);
          window.setTimeout(() => setShakingRow(null), 500);
          return;
        }
        if (!guessSet.has(current)) {
          showToast('Not in word list');
          setShakingRow(snapshot.guesses.length);
          window.setTimeout(() => setShakingRow(null), 500);
          return;
        }
        if (snapshot.hardMode) {
          const violation = hardModeViolation(current, judgedGuesses);
          if (violation) {
            showToast(violation);
            setShakingRow(snapshot.guesses.length);
            window.setTimeout(() => setShakingRow(null), 500);
            return;
          }
        }

        const judged = judgeGuess(current, snapshot.answer);
        const nextGuesses = [...snapshot.guesses, current];
        const rowIdx = snapshot.guesses.length;
        setRevealingRow(rowIdx);
        const flipMs = rowIdx * 280 + 300 + 80; // last tile's flip end + small buffer
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

        window.setTimeout(() => {
          setRevealingRow(null);
          if (won) {
            setBouncingRow(rowIdx);
            window.setTimeout(() => setBouncingRow(null), 700);
            // Celebratory triple-pulse on the win, only after the row
            // finishes flipping so the haptic lines up with the bounce.
            haptic([18, 60, 18, 60, 30]);
          }
          if (status !== 'in-progress') {
            // Daily-only AND only after the launch epoch: free-play games
            // are already excluded by mode, but pre-launch games carry
            // mode='daily' with puzzleNumber=null (the label is "preview"
            // in that case) and must not pollute the histogram either.
            if (
              nextSnapshot.mode === 'daily' &&
              nextSnapshot.puzzleNumber !== null &&
              !recordedKeys.current.has(nextSnapshot.key)
            ) {
              recordedKeys.current.add(nextSnapshot.key);
              const updated = applyResultToStats(
                stats,
                won,
                nextGuesses.length,
                nextSnapshot.dateIssued
              );
              setStats(updated);
              saveStats(updated);
            }
            showToast(
              won
                ? nextGuesses.length === 1
                  ? 'In one. The dream guess.'
                  : `Solved in ${nextGuesses.length}.`
                : `The word was ${nextSnapshot.answer.toUpperCase()}.`,
              2400
            );
            window.setTimeout(() => setEndOpen(true), 1100);
          }
        }, flipMs);
      } else if (key === 'back') {
        if (current.length > 0) setCurrent(current.slice(0, -1));
      } else if (/^[a-z]$/.test(key)) {
        if (current.length < WORD_LENGTH) setCurrent(current + key);
      }
    },
    [snapshot, puzzle, current, judgedGuesses, revealingRow, stats, showToast]
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

  const startFreeGame = useCallback(() => {
    const p = pickFreePuzzle();
    setPuzzle(p);
    setSnapshot(freshSnapshot(p, settings.hardMode));
    setCurrent('');
    setEndOpen(false);
    setSettingsOpen(false);
  }, [settings.hardMode]);

  const resumeDaily = useCallback(() => {
    const daily = pickDailyPuzzle();
    setPuzzle(daily);
    const existing = loadGame(daily.key);
    if (existing && existing.answer === daily.answer) {
      setSnapshot(existing);
      setEndOpen(existing.status !== 'in-progress');
    } else {
      setSnapshot(freshSnapshot(daily, settings.hardMode));
      setEndOpen(false);
    }
    setSettingsOpen(false);
    setCurrent('');
  }, [settings.hardMode]);

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
          dateLine={formatDateLong(puzzle.date)}
          puzzleNumber={puzzle.puzzleNumber}
          onPlay={startGame}
        />
        <Help open={helpOpen} onClose={() => setHelpOpen(false)} />
      </>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col"
      style={{ animation: 'boardEnter 220ms ease-out' }}
    >
      <div
        className="flex items-center justify-between px-3 sm:px-4 pt-2 pb-1"
        style={{ color: 'var(--hoolah-muted)' }}
      >
        <p className="text-[0.7rem] uppercase tracking-[0.18em]">
          {puzzle.mode === 'free'
            ? 'free play'
            : puzzle.puzzleNumber != null
              ? `hoolah ${puzzle.puzzleNumber.toString().padStart(3, '0')}`
              : 'preview'}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="how to play"
            onClick={() => setHelpOpen(true)}
            className="text-sm px-2 py-1 rounded"
            style={{ background: 'transparent', color: 'inherit' }}
          >
            ?
          </button>
          <button
            type="button"
            aria-label="stats"
            disabled={inProgress}
            onClick={() => setEndOpen(true)}
            className="text-sm px-2 py-1 rounded disabled:opacity-30"
            style={{ background: 'transparent', color: 'inherit' }}
          >
            ☷
          </button>
          <button
            type="button"
            aria-label="settings"
            onClick={() => setSettingsOpen(true)}
            className="text-sm px-2 py-1 rounded"
            style={{ background: 'transparent', color: 'inherit' }}
          >
            ⚙
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-between gap-4 px-3 sm:px-4 py-3 sm:py-5">
        <Toast message={toast} />
        <Board
          judged={judgedGuesses}
          current={current}
          revealingRow={revealingRow}
          shakingRow={shakingRow}
          bouncingRow={bouncingRow}
        />
        <Keyboard
          onKey={onHandleKey}
          letterStates={letterStates}
          disabled={!inProgress || revealingRow !== null}
        />
      </main>

      <EndModal
        open={endOpen}
        onClose={() => setEndOpen(false)}
        snapshot={snapshot}
        entry={entryByWord.get(snapshot.answer) ?? puzzle.entry}
        stats={stats}
        dark={dark}
        onPlayFreeGame={
          snapshot.mode === 'free' ? startFreeGame : startFreeGame
        }
        newFreeGameLabel={snapshot.mode === 'free' ? 'Another word' : undefined}
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
            showToast('Finish today first to change hard mode.');
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
        onFreePlay={startFreeGame}
        freePlayActive={snapshot.mode === 'free'}
        onResumeDaily={resumeDaily}
      />

      <Help open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
