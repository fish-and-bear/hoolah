'use client';

import { useEffect, useRef, useState } from 'react';
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
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      setShareState('');
      return;
    }
    // Focus the close button on open so screen reader / keyboard users
    // land somewhere predictable, and Esc-to-close keeps the same
    // surface to dismiss from.
    closeBtnRef.current?.focus();
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

  const onStreak = won && stats.currentStreak >= 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{
        background: 'var(--hoolah-modal-overlay)',
        animation: 'fadeIn 160ms ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl px-5 sm:px-7 pt-6 pb-7 flex flex-col gap-5"
        style={{
          background: 'var(--hoolah-modal-bg)',
          color: 'var(--hoolah-fg)',
          // dvh keeps the modal inside the visible viewport even when
          // iOS Safari's URL bar is showing. On the smallest phones
          // (iPhone SE 1, 320x568) the content overflows; the inner
          // scrollbar absorbs it.
          maxHeight: '92dvh',
          overflowY: 'auto',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.75rem)',
          animation: 'modalRise 220ms cubic-bezier(0.16, 1, 0.3, 1)',
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
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="close"
            className="text-2xl leading-none px-2 py-1 -mt-1 -mr-2 rounded"
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
          highlight={
            won &&
            snapshot.mode === 'daily' &&
            snapshot.puzzleNumber !== null
              ? snapshot.guesses.length
              : null
          }
        />

        {/* Streak status line. Reads warmer when the streak is alive
            and muted when it just reset; gives the streak number a
            place to live beyond the small stat-grid count. */}
        {snapshot.mode === 'daily' && snapshot.puzzleNumber !== null ? (
          <p
            className="text-sm"
            style={{
              color: onStreak ? 'var(--hoolah-accent)' : 'var(--hoolah-muted)',
              fontStyle: onStreak ? 'normal' : 'italic',
              marginTop: '-0.5rem',
            }}
          >
            {onStreak
              ? `Streak alive at ${stats.currentStreak} days.`
              : !won && stats.maxStreak >= 3
                ? `Your ${stats.maxStreak}-day streak is on the record. The next one starts tomorrow.`
                : null}
          </p>
        ) : null}

        {snapshot.mode === 'daily' ? (
          <div
            className="flex flex-col gap-3 pt-3 border-t"
            style={{ borderColor: 'var(--hoolah-rule)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  className="text-[0.65rem] uppercase tracking-wider"
                  style={{ color: 'var(--hoolah-muted)' }}
                >
                  Next hoolah
                </p>
                <p className="font-serif text-xl font-semibold tabular-nums">
                  <Countdown />
                </p>
              </div>
              <button
                type="button"
                onClick={handleShare}
                className="px-5 py-2.5 rounded-md font-medium text-sm hoolah-cta"
                style={{
                  background: 'var(--hoolah-accent)',
                  color: dark ? 'var(--hoolah-ink)' : '#fff',
                  border: 0,
                  minHeight: 44,
                }}
              >
                Share result
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs min-h-[1.25rem]">
              <span
                aria-live="polite"
                style={{
                  color:
                    shareState === 'failed'
                      ? '#a13a3a'
                      : 'var(--hoolah-muted)',
                }}
              >
                {shareState === 'copied'
                  ? 'Copied to clipboard.'
                  : shareState === 'shared'
                    ? 'Shared.'
                    : shareState === 'failed'
                      ? 'Copy failed. Try again.'
                      : ''}
              </span>
              {onPlayFreeGame ? (
                <button
                  type="button"
                  onClick={onPlayFreeGame}
                  className="underline-offset-4 hover:underline"
                  style={{
                    color: 'var(--hoolah-muted)',
                    background: 'transparent',
                    border: 0,
                    padding: 0,
                    minHeight: 32,
                  }}
                >
                  play a free game
                </button>
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
                className="px-4 py-2 rounded font-medium text-sm hoolah-cta"
                style={{
                  background: 'var(--hoolah-accent)',
                  color: dark ? 'var(--hoolah-ink)' : '#fff',
                  border: 0,
                  minHeight: 44,
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
