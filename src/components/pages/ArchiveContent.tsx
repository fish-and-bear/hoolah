'use client';

import { useLocale } from '@/components/i18n/useLocale';
import { formatDisplayDate, formatShortDate } from '@/lib/i18n';
import { EPOCH_DATE } from '@/lib/daily';
import type { AnswerEntry } from '@/lib/types';

export interface ArchiveItem {
  date: string;
  puzzleNumber: number;
  entry: AnswerEntry;
}

interface ArchiveContentProps {
  items: ArchiveItem[];
}

export default function ArchiveContent({ items }: ArchiveContentProps) {
  const { locale, copy } = useLocale();
  const page = copy.pages.archive;

  return (
    <main className="prose-style mx-auto w-full max-w-[42rem] flex-1 px-5 py-8 sm:px-6 sm:py-10 md:py-12">
      <h1 className="font-serif text-3xl font-bold leading-tight mb-2 sm:text-4xl">
        {page.title}
      </h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--hoolah-muted)' }}>
        {page.summary(items.length)}
      </p>
      {items.length === 0 ? (
        <p className="italic" style={{ color: 'var(--hoolah-muted)' }}>
          {page.emptyBeforeDate} {formatDisplayDate(EPOCH_DATE, locale)}.
        </p>
      ) : (
        <ol className="flex flex-col">
          {items.map(({ date, puzzleNumber, entry }) => (
            <li
              key={puzzleNumber}
              className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-baseline py-3 border-b sm:grid-cols-[auto_1fr_auto]"
              style={{ borderColor: 'var(--hoolah-rule)' }}
            >
              <span
                className="font-mono text-xs tabular-nums"
                style={{ color: 'var(--hoolah-muted)' }}
              >
                #{puzzleNumber.toString().padStart(3, '0')}
              </span>
              <div>
                <p className="font-serif text-xl font-semibold uppercase tracking-normal">
                  {entry.word}
                </p>
                <p className="text-sm" style={{ color: 'var(--hoolah-muted)' }}>
                  <span className="italic">({entry.pos})</span> {entry.gloss}
                </p>
              </div>
              <span
                className="col-start-2 text-xs tabular-nums sm:col-start-auto"
                style={{ color: 'var(--hoolah-muted)' }}
              >
                {formatShortDate(date, locale)}
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-8 text-xs italic" style={{ color: 'var(--hoolah-muted)' }}>
        {page.hidden}
      </p>
    </main>
  );
}
