'use client';

import { MAX_GUESSES, type Stats } from '@/lib/types';

interface StatsPanelProps {
  stats: Stats;
  // Highlighted bar (the row the player just won on). 1..6 or null.
  highlight?: number | null;
}

export default function StatsPanel({ stats, highlight }: StatsPanelProps) {
  const maxCount = Math.max(0, ...stats.histogram);
  const denom = Math.max(1, maxCount);

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
      <ul className="flex flex-col gap-[6px]">
        {Array.from({ length: MAX_GUESSES }, (_, i) => {
          const tries = i + 1;
          const count = stats.histogram[i] ?? 0;
          // Always reserve a small floor so the row reads as a row, not as
          // a label-with-a-hole. 6% of the track is enough to show the
          // bar exists without misrepresenting the value (the count is
          // also rendered inline).
          const widthPct =
            count > 0 ? Math.max(6, (count / denom) * 100) : 6;
          const isMostRecent = highlight === tries;
          const isMax = maxCount > 0 && count === maxCount;
          return (
            <li
              key={tries}
              className="flex items-center gap-2 text-sm tabular-nums"
              aria-label={`Won in ${tries} ${tries === 1 ? 'try' : 'tries'}: ${count} ${count === 1 ? 'game' : 'games'}`}
            >
              <span
                className="w-4 text-right font-medium"
                style={{ color: 'var(--hoolah-muted)' }}
                aria-hidden="true"
              >
                {tries}
              </span>
              <div className="flex-1 h-6 relative">
                <div
                  className="absolute inset-y-0 left-0 flex items-center justify-end pr-2 text-xs font-semibold rounded-sm"
                  style={{
                    width: `${widthPct}%`,
                    background: isMostRecent
                      ? 'var(--hoolah-accent)'
                      : count > 0
                        ? 'var(--hoolah-correct)'
                        : 'var(--hoolah-key-bg)',
                    color:
                      count > 0
                        ? 'var(--hoolah-tile-text-on-color)'
                        : 'var(--hoolah-muted)',
                    fontWeight: isMax ? 800 : 600,
                    transition:
                      'width 320ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms linear',
                    animation: isMostRecent
                      ? 'barPulse 1100ms ease-out 1'
                      : undefined,
                    minWidth: '1.4rem',
                  }}
                >
                  {count}
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
      <div className="text-2xl font-serif font-semibold leading-none tabular-nums">
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
