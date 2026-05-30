'use client';

import { useEffect } from 'react';

interface HelpProps {
  open: boolean;
  onClose: () => void;
}

export default function Help({ open, onClose }: HelpProps) {
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
          animation: 'fadeIn 180ms ease-out',
        }}
      >
        <div className="flex items-start justify-between">
          <h2 id="help-title" className="font-serif text-2xl font-bold">
            how to play
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="text-2xl leading-none px-2 py-1 -mt-1 -mr-2"
            style={{ color: 'var(--hoolah-muted)', background: 'transparent' }}
          >
            ×
          </button>
        </div>

        <p>Guess the Tagalog word in six tries.</p>
        <ol className="list-decimal pl-5 flex flex-col gap-1 text-sm">
          <li>Type any five-letter Filipino word and press enter.</li>
          <li>The tiles flip to show how close you were.</li>
          <li>Use what you learn for the next guess.</li>
        </ol>

        <Example
          label="Tile colours"
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
              <b>B</b> is in the word and in the right spot.
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
              <b>A</b> is in the word but somewhere else.
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
          note={<>None of these letters are in the word.</>}
        />

        <p
          className="text-xs italic pt-2 mt-1 border-t"
          style={{
            color: 'var(--hoolah-muted)',
            borderColor: 'var(--hoolah-rule)',
          }}
        >
          A new word every day at midnight, Manila time. Only the 26-letter
          Latin alphabet (no diacritics). See <a href="/rules">/rules</a> for
          hard mode and accessibility notes.
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
          className="text-[0.7rem] uppercase tracking-wider"
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
