'use client';

import { useEffect, useState } from 'react';
import type { JudgedTile } from '@/lib/types';

interface TileProps {
  letter?: string;
  // Final colour after the row is judged.
  state?: JudgedTile['state'];
  // 0..4 column index, used to stagger the flip.
  index: number;
  // True only for the row that just got submitted, so the flip plays
  // for that row and the persisted earlier rows stay static.
  revealing: boolean;
  // True for the row currently being typed; renders the letter with a
  // subtle pop and bordered emphasis.
  active: boolean;
}

const STATE_BG: Record<JudgedTile['state'], string> = {
  correct: 'var(--hoolah-correct)',
  present: 'var(--hoolah-present)',
  absent: 'var(--hoolah-absent)',
};

export default function Tile({
  letter,
  state,
  index,
  revealing,
  active,
}: TileProps) {
  const [phase, setPhase] = useState<'idle' | 'pre' | 'post'>(
    state ? 'post' : 'idle'
  );

  useEffect(() => {
    if (!state) {
      setPhase('idle');
      return;
    }
    if (!revealing) {
      setPhase('post');
      return;
    }
    const delay = index * 280;
    const t1 = window.setTimeout(() => setPhase('pre'), delay);
    const t2 = window.setTimeout(() => setPhase('post'), delay + 300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [state, revealing, index]);

  const isColored = phase === 'post' && state;
  const isFlipping = phase === 'pre';

  return (
    <div
      className="aspect-square w-full select-none flex items-center justify-center font-serif font-bold uppercase"
      style={{
        // The tile rotates around its X-axis; perspective on the parent
        // would be cleaner, but applying it locally is sufficient for
        // five tiles on a row and avoids touching the board.
        perspective: '400px',
      }}
      aria-hidden="true"
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 280ms ease-in-out',
          transform: isFlipping ? 'rotateX(-90deg)' : 'rotateX(0deg)',
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: isColored
              ? STATE_BG[state!]
              : 'transparent',
            color: isColored
              ? 'var(--hoolah-tile-text-on-color)'
              : 'var(--hoolah-fg)',
            border: isColored
              ? `2px solid ${STATE_BG[state!]}`
              : letter
                ? '2px solid var(--hoolah-tile-border-filled)'
                : '2px solid var(--hoolah-tile-border)',
            fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
            transition:
              'background-color 60ms linear, border-color 60ms linear, color 60ms linear',
            animation: active && letter ? 'tilePop 120ms ease-out' : undefined,
          }}
        >
          {letter ?? ''}
        </div>
      </div>
    </div>
  );
}
