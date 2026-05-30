'use client';

import { useEffect, useState } from 'react';
import type { AnswerEntry, GameSnapshot, Stats } from '@/lib/types';
import { buildShareText, shareOrCopy } from '@/lib/share';
import { judgeGuess } from '@/lib/game';
import Countdown from './Countdown';
import StatsPanel from './StatsPanel';

interface EndModalProps {
  open: boolean;
  onClose: () => void;
  snapshot: GameSnapshot;
  entry: AnswerEntry;
  stats: Stats;
  dark: boolean;
  onPlayFreeGame?: () => void;
  newFreeGameLabel?: string;
}

export default function EndModal({
  open,
  onClose,
  snapshot,
  entry,
  stats,
  dark,
  onPlayFreeGame,
  newFreeGameLabel,
}: EndModalProps) {
  const [shareState, setShareState] = useState<'' | 'shared' | 'copied' | 'failed'>('');

  useEffect(() => {
    if (!open) setShareState('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const judgedRows = snapshot.guesses.map((g) => judgeGuess(g, snapshot.answer));
  const won = snapshot.status === 'won';

  async function handleShare() {
    const text = buildShareText({
      puzzleNumber: snapshot.puzzleNumber,
      guesses: judgedRows,
      won,
      hardMode: snapshot.hardMode,
      dark,
    });
    const result = await shareOrCopy(text);
    setShareState(result);
  }

  const headline = won
    ? snapshot.guesses.length === 1
      ? 'one try.'
      : `nailed it in ${snapshot.guesses.length}.`
    : 'maybe tomorrow.';

  const subhead = won
    ? snapshot.guesses.length <= 3
      ? 'A clean solve.'
      : 'A solve is a solve.'
    : 'The streak resets at midnight Manila time.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'var(--hoolah-modal-overlay)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl px-5 sm:px-7 pt-6 pb-8 flex flex-col gap-5"
        style={{
          background: 'var(--hoolah-modal-bg)',
          color: 'var(--hoolah-fg)',
          maxHeight: '92dvh',
          overflowY: 'auto',
          animation: 'fadeIn 180ms ease-out',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="end-modal-title"
              className="font-serif text-2xl sm:text-3xl font-bold leading-tight"
            >
              {headline}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--hoolah-muted)' }}
            >
              {subhead}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="text-2xl leading-none px-2 py-1 -mt-1 -mr-2"
            style={{ color: 'var(--hoolah-muted)', background: 'transparent' }}
          >
            ×
          </button>
        </div>

        <div
          className="rounded-lg p-4"
          style={{ background: 'var(--hoolah-accent-soft)' }}
        >
          <p className="font-serif text-4xl font-bold leading-none uppercase tracking-wide">
            {snapshot.answer}
          </p>
          <p className="text-sm mt-2">
            <span style={{ color: 'var(--hoolah-muted)' }}>
              ({entry.pos}){' '}
            </span>
            {entry.gloss}
          </p>
          {entry.note ? (
            <p
              className="text-xs mt-2 italic"
              style={{ color: 'var(--hoolah-muted)' }}
            >
              {entry.note}
            </p>
          ) : null}
        </div>

        <StatsPanel
          stats={stats}
          highlight={won ? snapshot.guesses.length : null}
        />

        {!won && stats.currentStreak === 0 && stats.maxStreak >= 3 ? (
          <p
            className="text-sm italic"
            style={{ color: 'var(--hoolah-muted)' }}
          >
            Your {stats.maxStreak}-day streak is on the record. The next one
            starts tomorrow.
          </p>
        ) : null}

        {snapshot.mode === 'daily' ? (
          <div
            className="flex items-center justify-between gap-3 pt-3 border-t"
            style={{ borderColor: 'var(--hoolah-rule)' }}
          >
            <div>
              <p
                className="text-[0.65rem] uppercase tracking-wider"
                style={{ color: 'var(--hoolah-muted)' }}
              >
                Next hoolah
              </p>
              <p className="font-serif text-xl font-semibold">
                <Countdown />
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2 rounded font-medium text-sm"
                style={{
                  background: 'var(--hoolah-accent)',
                  color: dark ? 'var(--hoolah-ink)' : '#fff',
                  border: 0,
                }}
              >
                Share result
              </button>
              {shareState === 'copied' ? (
                <span
                  className="text-xs"
                  style={{ color: 'var(--hoolah-muted)' }}
                >
                  Copied to clipboard.
                </span>
              ) : shareState === 'failed' ? (
                <span className="text-xs" style={{ color: '#a13a3a' }}>
                  Copy failed. Try again.
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-between gap-3 pt-3 border-t"
            style={{ borderColor: 'var(--hoolah-rule)' }}
          >
            <p className="text-xs" style={{ color: 'var(--hoolah-muted)' }}>
              Free play. No streak. No share.
            </p>
            {onPlayFreeGame ? (
              <button
                type="button"
                onClick={onPlayFreeGame}
                className="px-4 py-2 rounded font-medium text-sm"
                style={{
                  background: 'var(--hoolah-accent)',
                  color: dark ? 'var(--hoolah-ink)' : '#fff',
                  border: 0,
                }}
              >
                {newFreeGameLabel ?? 'Another word'}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
