'use client';

import { COPY } from '@/lib/i18n';
import { MAX_GUESSES, type Locale, type Stats } from '@/lib/types';

interface StatsPanelProps {
  stats: Stats;
  // Highlighted bar (the row the player just won on). 1..6 or null.
  highlight?: number | null;
  locale: Locale;
}

export default function StatsPanel({
  stats,
  highlight,
  locale,
}: StatsPanelProps) {
  const copy = COPY[locale].stats;
  const maxCount = Math.max(0, ...stats.histogram);
  const denom = Math.max(1, maxCount);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Stat n={stats.played} label={copy.played} />
        <Stat
          n={
            stats.played > 0
              ? Math.round((stats.wins / stats.played) * 100)
              : 0
          }
          label={copy.winPct}
        />
        <Stat n={stats.currentStreak} label={copy.streak} />
        <Stat n={stats.maxStreak} label={copy.max} />
      </div>
      <h3 className="text-xs uppercase font-bold text-center mb-2">
        {copy.distribution}
      </h3>
      <ul className="flex flex-col gap-[4px]">
        {Array.from({ length: MAX_GUESSES }, (_, i) => {
          const tries = i + 1;
          const count = stats.histogram[i] ?? 0;
          const widthPct = count > 0 ? (count / denom) * 100 : 7;
          const isMostRecent = highlight === tries;
          return (
            <li
              key={tries}
              className="grid grid-cols-[16px_minmax(0,1fr)] items-center gap-[4px] text-sm tabular-nums"
              aria-label={copy.rowAria(tries, count)}
            >
              <span
                className="text-right font-medium"
                style={{ color: 'var(--hoolah-fg)' }}
                aria-hidden="true"
              >
                {tries}
              </span>
              <div className="relative h-[20px] w-full overflow-hidden">
                <div
                  className="flex h-full min-w-[24px] items-center justify-end px-[7px] text-xs font-bold"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: isMostRecent
                      ? '#6aaa64'
                      : '#787c7e',
                    color: '#fff',
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
      <div className="text-3xl font-semibold leading-none tabular-nums">
        {n}
      </div>
      <div
        className="text-[0.68rem] leading-[0.95rem] mt-1"
        style={{ color: 'var(--hoolah-muted)' }}
      >
        {label}
      </div>
    </div>
  );
}
