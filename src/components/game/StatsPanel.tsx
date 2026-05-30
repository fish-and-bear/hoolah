'use client';

import { MAX_GUESSES, type Stats } from '@/lib/types';

interface StatsPanelProps {
  stats: Stats;
  // Highlighted bar (the row the player just won on). 1..6 or null.
  highlight?: number | null;
}

export default function StatsPanel({ stats, highlight }: StatsPanelProps) {
  const maxBar = Math.max(1, ...stats.histogram);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat n={stats.played} label="played" />
        <Stat
          n={
            stats.played > 0
              ? Math.round((stats.wins / stats.played) * 100)
              : 0
          }
          label="win %"
        />
        <Stat n={stats.currentStreak} label="streak" />
        <Stat n={stats.maxStreak} label="max" />
      </div>
      <h3
        className="text-xs uppercase tracking-wider mb-2"
        style={{ color: 'var(--hoolah-muted)' }}
      >
        Guess distribution
      </h3>
      <ul className="flex flex-col gap-1">
        {Array.from({ length: MAX_GUESSES }, (_, i) => {
          const tries = i + 1;
          const count = stats.histogram[i];
          const widthPct = (count / maxBar) * 100;
          const isHighlight = highlight === tries;
          return (
            <li
              key={tries}
              className="flex items-center gap-2 text-sm"
              aria-label={`Won in ${tries} ${tries === 1 ? 'try' : 'tries'}: ${count} ${count === 1 ? 'game' : 'games'}`}
            >
              <span
                className="w-3 text-right font-medium"
                style={{ color: 'var(--hoolah-muted)' }}
              >
                {tries}
              </span>
              <div className="flex-1 h-5 flex items-center">
                <div
                  className="h-full flex items-center justify-end px-2 text-xs font-semibold"
                  style={{
                    width: count > 0 ? `${Math.max(widthPct, 8)}%` : '8px',
                    background: isHighlight
                      ? 'var(--hoolah-accent)'
                      : count > 0
                        ? 'var(--hoolah-correct)'
                        : 'var(--hoolah-key-bg)',
                    color: count > 0 ? '#fff' : 'transparent',
                    transition: 'width 300ms ease-out, background 200ms linear',
                  }}
                >
                  {count > 0 ? count : ''}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-serif font-semibold leading-none">
        {n}
      </div>
      <div
        className="text-[0.65rem] uppercase tracking-wider mt-1"
        style={{ color: 'var(--hoolah-muted)' }}
      >
        {label}
      </div>
    </div>
  );
}
