'use client';

import Wordmark from '@/components/brand/Wordmark';

interface TitleScreenProps {
  dateLine: string;
  puzzleNumber: number | null;
  onPlay: () => void;
}

// Cold-start surface for first-time visitors and returning players.
// The brief argues that 'the open-the-app moment matters' — the
// title screen is the daily-ritual cue, not a splash to skip past.
export default function TitleScreen({
  dateLine,
  puzzleNumber,
  onPlay,
}: TitleScreenProps) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      <p
        className="text-xs uppercase tracking-[0.2em] mb-4"
        style={{ color: 'var(--hoolah-muted)' }}
      >
        {puzzleNumber != null
          ? `hoolah ${puzzleNumber.toString().padStart(3, '0')}`
          : 'hoolah'}{' '}
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
        type="button"
        onClick={onPlay}
        autoFocus
        className="mt-8 px-7 py-3 rounded-full text-base font-medium"
        style={{
          background: 'var(--hoolah-accent)',
          color: '#fff',
          border: 0,
          letterSpacing: '0.04em',
        }}
      >
        play
      </button>
    </main>
  );
}
