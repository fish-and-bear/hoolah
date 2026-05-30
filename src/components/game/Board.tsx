'use client';

import { MAX_GUESSES, WORD_LENGTH } from '@/lib/types';
import type { JudgedGuess } from '@/lib/types';
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
}

export default function Board({
  judged,
  current,
  revealingRow,
  shakingRow,
  bouncingRow,
}: BoardProps) {
  const rows: ('done' | 'active' | 'empty')[] = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < judged.length) rows.push('done');
    else if (i === judged.length) rows.push('active');
    else rows.push('empty');
  }

  return (
    <div
      className="w-full mx-auto grid gap-[6px] sm:gap-2"
      style={{
        maxWidth: 'min(360px, 90vw)',
        gridTemplateRows: `repeat(${MAX_GUESSES}, 1fr)`,
      }}
      role="grid"
      aria-label="hoolah game board"
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

        return (
          <div
            key={rowIdx}
            className="grid grid-cols-5 gap-[6px] sm:gap-2"
            style={{ animation }}
            role="row"
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
  );
}
