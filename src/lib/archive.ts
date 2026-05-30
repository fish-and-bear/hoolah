import { answerIndexFor, EPOCH_DATE, puzzleNumberFor } from './daily';
import type { AnswerEntry } from './types';

export interface ArchiveItem {
  date: string;
  puzzleNumber: number;
  entry: AnswerEntry;
}

const MAX_ARCHIVE_ITEMS = 30;

function dateForPuzzleNumber(puzzleNumber: number): string {
  const [year, month, day] = EPOCH_DATE.split('-').map(Number);
  return new Date(
    Date.UTC(year, month - 1, day + puzzleNumber - 1)
  ).toISOString().slice(0, 10);
}

export function archiveItemsForDate(
  todayDate: string,
  answers: AnswerEntry[]
): ArchiveItem[] {
  const todayPuzzleNumber = puzzleNumberFor(todayDate);
  if (
    todayPuzzleNumber === null ||
    todayPuzzleNumber <= 1 ||
    answers.length === 0
  ) {
    return [];
  }

  const lastPastPuzzleNumber = todayPuzzleNumber - 1;
  const firstPuzzleNumber = Math.max(
    1,
    lastPastPuzzleNumber - MAX_ARCHIVE_ITEMS + 1
  );
  const items: ArchiveItem[] = [];

  for (
    let puzzleNumber = lastPastPuzzleNumber;
    puzzleNumber >= firstPuzzleNumber;
    puzzleNumber--
  ) {
    items.push({
      date: dateForPuzzleNumber(puzzleNumber),
      puzzleNumber,
      entry: answers[answerIndexFor(puzzleNumber, answers.length)],
    });
  }

  return items;
}
