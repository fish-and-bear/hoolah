'use client';

import { useEffect, useRef, useState } from 'react';
import { COPY } from '@/lib/i18n';
import type {
  AnswerEntry,
  GameSnapshot,
  Locale,
  Stats,
} from '@/lib/types';
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
  locale: Locale;
}

export default function EndModal({
  open,
  onClose,
  snapshot,
  entry,
  stats,
  dark,
  locale,
}: EndModalProps) {
  const [shareState, setShareState] = useState<'' | 'shared' | 'copied' | 'failed'>('');
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const copy = COPY[locale];

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
      ? copy.end.winOneHeadline
      : copy.end.winHeadline(snapshot.guesses.length)
    : copy.end.lossHeadline;

  const subhead = won
    ? snapshot.guesses.length <= 3
      ? copy.end.fastSubhead
      : copy.end.winSubhead
    : copy.end.lossSubhead;

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
            aria-label={copy.common.close}
            className="-mr-3 -mt-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded text-2xl leading-none"
            style={{ color: 'var(--hoolah-muted)', background: 'transparent' }}
          >
            ×
          </button>
        </div>

        <div
          className="rounded-lg p-4"
          style={{ background: 'var(--hoolah-accent-soft)' }}
        >
          <p className="font-serif text-4xl font-bold leading-none uppercase tracking-normal">
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
          locale={locale}
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
              ? copy.end.streakAlive(stats.currentStreak)
              : !won && stats.maxStreak >= 3
                ? copy.end.streakRecord(stats.maxStreak)
                : null}
          </p>
        ) : null}

        <div
          className="flex flex-col gap-3 pt-3 border-t"
          style={{ borderColor: 'var(--hoolah-rule)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="text-[0.65rem] uppercase tracking-normal"
                style={{ color: 'var(--hoolah-muted)' }}
              >
                {copy.end.next}
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
              {copy.end.copyResult}
            </button>
          </div>
          <div className="flex min-h-[1.25rem] items-center text-xs">
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
                ? copy.end.copied
                : shareState === 'shared'
                  ? copy.end.shared
                  : shareState === 'failed'
                    ? copy.end.copyFailed
                    : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
