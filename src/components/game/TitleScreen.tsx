'use client';

import { useEffect, useRef } from 'react';

import Wordmark from '@/components/brand/Wordmark';

interface TitleScreenProps {
  dateLine: string;
  puzzleNumber: number | null;
  onPlay: () => void;
}

// Cold-start surface for first-time visitors and returning players.
// The brief argues that "the open-the-app moment matters" — the
// title screen is the daily-ritual cue, not a splash to skip past.
export default function TitleScreen({
  dateLine,
  puzzleNumber,
  onPlay,
}: TitleScreenProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Explicit ref-based focus is more reliable than autoFocus for a
  // dynamically-mounted screen, and respects RTL/iOS focus quirks.
  useEffect(() => {
    btnRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center"
      style={{ animation: 'titleEnter 320ms ease-out' }}
    >
      <p
        className="text-xs uppercase tracking-[0.2em] mb-4 tabular-nums"
        style={{ color: 'var(--hoolah-muted)' }}
      >
        {puzzleNumber != null
          ? `hoolah ${puzzleNumber.toString().padStart(3, '0')}`
          : 'preview'}{' '}
        · {dateLine}
      </p>
      <Wordmark size="lg" />
      <p
        className="mt-4 max-w-sm text-base"
        style={{ color: 'var(--hoolah-muted)' }}
      >
        guess the Filipino word. five letters, six tries, one new one every
        day.
      </p>
      <button
        ref={btnRef}
        type="button"
        onClick={onPlay}
        className="mt-8 px-8 py-3 rounded-full text-base font-medium hoolah-cta"
        style={{
          background: 'var(--hoolah-accent)',
          color: '#fff',
          border: 0,
          letterSpacing: '0.04em',
          minHeight: 48,
          minWidth: 120,
        }}
      >
        play
      </button>
    </main>
  );
}
