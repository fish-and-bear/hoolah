'use client';

import { MAX_GUESSES, WORD_LENGTH } from '@/lib/types';
import { COPY } from '@/lib/i18n';
import type { JudgedGuess, Locale } from '@/lib/types';
import Tile from './Tile';

interface BoardProps {
  judged: JudgedGuess[];
  current: string;
  // Index of the row that just got submitted (animates flip).
  revealingRow: number | null;
  // Index of the row that is being shaken (invalid guess).
  shakingRow: number | null;
  // Index of the row that should bounce (win).
  bouncingRow: number | null;
  locale: Locale;
}

// Read out a judged row in a screen-reader-friendly way. Wordle's own
// approach: "letter, position N, correct" style is too chatty; this
// flattens to "B correct, A absent, H absent..." which most readers
// chunk well.
function describeJudged(
  row: JudgedGuess,
  states: Record<JudgedGuess[number]['state'], string>
): string {
  return row
    .map((t) => `${t.letter.toUpperCase()} ${states[t.state]}`)
    .join(', ');
}

export default function Board({
  judged,
  current,
  revealingRow,
  shakingRow,
  bouncingRow,
  locale,
}: BoardProps) {
  const copy = COPY[locale].board;
  const rows: ('done' | 'active' | 'empty')[] = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < judged.length) rows.push('done');
    else if (i === judged.length) rows.push('active');
    else rows.push('empty');
  }

  // Latest judged row, announced once the flip animation finishes.
  // `revealingRow !== null` means the flip is still playing; we wait
  // until it's null before publishing the line so the announcement
  // lines up with the visual result.
  const latestRow = judged.length > 0 ? judged[judged.length - 1] : null;
  const announcement =
    latestRow && revealingRow === null
      ? copy.rowAnnouncement(
          judged.length,
          describeJudged(latestRow, copy.states)
        )
      : '';

  return (
    <>
      <div
        className="hoolah-board w-full mx-auto grid gap-[6px] sm:gap-2"
        style={{
          gridTemplateRows: `repeat(${MAX_GUESSES}, 1fr)`,
        }}
        role="grid"
        aria-label={copy.label}
      >
        {rows.map((kind, rowIdx) => {
          const judgedRow = kind === 'done' ? judged[rowIdx] : null;
          const cells: { letter: string; state?: JudgedGuess[number]['state'] }[] = [];
          for (let i = 0; i < WORD_LENGTH; i++) {
            if (judgedRow) {
              cells.push({ letter: judgedRow[i].letter, state: judgedRow[i].state });
            } else if (kind === 'active') {
              cells.push({ letter: current[i] ?? '' });
            } else {
              cells.push({ letter: '' });
            }
          }
          const animation =
            rowIdx === shakingRow
              ? 'rowShake 500ms ease-in-out'
              : rowIdx === bouncingRow
                ? 'winBounce 600ms ease-in-out'
                : undefined;

          const rowLabel =
            kind === 'done'
              ? copy.doneRow(
                  rowIdx + 1,
                  (judgedRow ?? []).map((t) => t.letter).join('').toUpperCase()
                )
              : kind === 'active'
                ? copy.activeRow(rowIdx + 1, current.length, WORD_LENGTH)
                : copy.emptyRow(rowIdx + 1);

          return (
            <div
              key={rowIdx}
              className="grid grid-cols-5 gap-[6px] sm:gap-2"
              style={{ animation }}
              role="row"
              aria-label={rowLabel}
            >
              {cells.map((c, colIdx) => (
                <div role="gridcell" key={colIdx}>
                  <Tile
                    letter={c.letter || undefined}
                    state={c.state}
                    index={colIdx}
                    revealing={rowIdx === revealingRow}
                    active={kind === 'active'}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite" role="status">
        {announcement}
      </span>
    </>
  );
}
