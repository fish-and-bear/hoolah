'use client';

import { useEffect } from 'react';
import { COPY } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

interface HelpProps {
  open: boolean;
  onClose: () => void;
  locale: Locale;
}

export default function Help({ open, onClose, locale }: HelpProps) {
  const copy = COPY[locale].help;
  const common = COPY[locale].common;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'var(--hoolah-modal-overlay)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl px-5 sm:px-7 pt-6 pb-8 flex flex-col gap-4"
        style={{
          background: 'var(--hoolah-modal-bg)',
          color: 'var(--hoolah-fg)',
          maxHeight: '92dvh',
          overflowY: 'auto',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
          animation: 'fadeIn 180ms ease-out',
        }}
      >
        <div className="flex items-start justify-between">
          <h2 id="help-title" className="font-serif text-2xl font-bold">
            {copy.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={common.close}
            className="-mr-3 -mt-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded text-2xl leading-none"
            style={{ color: 'var(--hoolah-muted)', background: 'transparent' }}
          >
            ×
          </button>
        </div>

        <p>{copy.intro}</p>
        <ol className="list-decimal pl-5 flex flex-col gap-1 text-sm">
          {copy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <Example
          label={copy.tileColours}
          rows={[
            [
              { l: 'b', s: 'correct' },
              { l: 'a', s: 'absent' },
              { l: 'h', s: 'absent' },
              { l: 'a', s: 'absent' },
              { l: 'y', s: 'absent' },
            ],
          ]}
          note={
            <>
              <b>B</b> {copy.correctExample}
            </>
          }
        />
        <Example
          rows={[
            [
              { l: 'd', s: 'absent' },
              { l: 'a', s: 'present' },
              { l: 'h', s: 'absent' },
              { l: 'o', s: 'absent' },
              { l: 'n', s: 'absent' },
            ],
          ]}
          note={
            <>
              <b>A</b> {copy.presentExample}
            </>
          }
        />
        <Example
          rows={[
            [
              { l: 't', s: 'absent' },
              { l: 'u', s: 'absent' },
              { l: 'l', s: 'absent' },
              { l: 'o', s: 'absent' },
              { l: 'g', s: 'absent' },
            ],
          ]}
          note={<>{copy.absentExample}</>}
        />

        <p
          className="text-xs italic pt-2 mt-1 border-t"
          style={{
            color: 'var(--hoolah-muted)',
            borderColor: 'var(--hoolah-rule)',
          }}
        >
          {copy.footerBeforeLink} <a href="/rules">{copy.footerLink}</a>{' '}
          {copy.footerAfterLink}
        </p>
      </div>
    </div>
  );
}

function Example({
  label,
  rows,
  note,
}: {
  label?: string;
  rows: { l: string; s: 'correct' | 'present' | 'absent' }[][];
  note: React.ReactNode;
}) {
  const colours = {
    correct: 'var(--hoolah-correct)',
    present: 'var(--hoolah-present)',
    absent: 'var(--hoolah-absent)',
  } as const;
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <p
          className="text-[0.7rem] uppercase tracking-normal"
          style={{ color: 'var(--hoolah-muted)' }}
        >
          {label}
        </p>
      ) : null}
      <div className="flex gap-1">
        {rows[0].map((c, i) => (
          <div
            key={i}
            className="font-serif font-bold uppercase flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              background: colours[c.s],
              color: '#fff',
              fontSize: 18,
              borderRadius: 2,
            }}
          >
            {c.l}
          </div>
        ))}
      </div>
      <p className="text-sm">{note}</p>
    </div>
  );
}
