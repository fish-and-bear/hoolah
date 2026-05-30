import type { Metadata } from 'next';

import SiteHeader from '@/components/brand/SiteHeader';
import SiteFooter from '@/components/brand/SiteFooter';
import answersData from '@/data/answers.json';
import { EPOCH_DATE, answerIndexFor } from '@/lib/daily';
import type { AnswerEntry } from '@/lib/types';

export const metadata: Metadata = {
  title: 'archive',
  description: 'Past daily hoolah words, last 30 days.',
};

// The archive is generated at build time. The build date is the
// 'today' used to compute the trailing 30 days, which means
// freshly-deployed pages will be at most one day behind the live
// daily for ~24h. That's acceptable for a free-tier static site;
// the game itself uses client time and stays correct.
function buildList() {
  const [ey, em, ed] = EPOCH_DATE.split('-').map(Number);
  const epochUtc = Date.UTC(ey, em - 1, ed);
  const nowUtc = Date.now();
  const todayOffset = Math.floor((nowUtc - epochUtc) / 86_400_000);
  const answers = answersData as AnswerEntry[];
  const items: Array<{
    date: string;
    puzzleNumber: number;
    entry: AnswerEntry;
  }> = [];
  // Show every day from launch up to 'today at build', capped to 30.
  const start = Math.max(0, todayOffset - 29);
  for (let off = todayOffset; off >= start; off--) {
    const puzzleNumber = off + 1;
    const date = new Date(epochUtc + off * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const entry = answers[answerIndexFor(puzzleNumber, answers.length)];
    items.push({ date, puzzleNumber, entry });
  }
  return items;
}

export default function Archive() {
  const items = buildList();
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-prose px-5 sm:px-6 py-10">
        <h1 className="font-serif text-4xl font-bold mb-2">archive</h1>
        <p
          className="mb-6 text-sm"
          style={{ color: 'var(--hoolah-muted)' }}
        >
          The last {items.length} hoolah words. The most recent entry is at
          the top.
        </p>
        {items.length === 0 ? (
          <p
            className="italic"
            style={{ color: 'var(--hoolah-muted)' }}
          >
            The archive is empty until day one. Come back after 1 June 2026.
          </p>
        ) : (
          <ol className="flex flex-col">
            {items.map(({ date, puzzleNumber, entry }) => {
              const dt = new Date(date + 'T00:00:00Z');
              const human = dt.toLocaleDateString('en-US', {
                timeZone: 'UTC',
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              return (
                <li
                  key={puzzleNumber}
                  className="grid grid-cols-[auto_1fr_auto] gap-3 items-baseline py-3 border-b"
                  style={{ borderColor: 'var(--hoolah-rule)' }}
                >
                  <span
                    className="font-mono text-xs tabular-nums"
                    style={{ color: 'var(--hoolah-muted)' }}
                  >
                    #{puzzleNumber.toString().padStart(3, '0')}
                  </span>
                  <div>
                    <p className="font-serif text-xl font-semibold uppercase tracking-wide">
                      {entry.word}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--hoolah-muted)' }}
                    >
                      <span className="italic">({entry.pos})</span>{' '}
                      {entry.gloss}
                    </p>
                  </div>
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: 'var(--hoolah-muted)' }}
                  >
                    {human}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        <p
          className="mt-8 text-xs italic"
          style={{ color: 'var(--hoolah-muted)' }}
        >
          The archive only shows past words. Today's puzzle stays hidden until
          you solve it (or run out of tries).
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
