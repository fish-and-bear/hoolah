import { daysBetween } from './time';
import { EMPTY_STATS, type GameSnapshot, type Stats } from './types';

const MAX_RECORDED_DAILY_KEYS = 500;

function normalizeHistogram(value: unknown): Stats['histogram'] {
  const out: Stats['histogram'] = [0, 0, 0, 0, 0, 0];
  if (!Array.isArray(value)) return out;
  for (let i = 0; i < out.length; i++) {
    const n = value[i];
    out[i] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }
  return out;
}

function normalizeCount(value: unknown): number {
  return Number.isFinite(value) && Number(value) > 0
    ? Math.floor(Number(value))
    : 0;
}

function normalizeDate(value: unknown): string | null {
  return typeof value === 'string' && daysBetween(value, value) === 0
    ? value
    : null;
}

export function normalizeStats(value: Partial<Stats> | null | undefined): Stats {
  const raw = value ?? {};
  const histogram = normalizeHistogram(raw.histogram);
  const histogramTotal = histogram.reduce((sum, n) => sum + n, 0);
  const played = normalizeCount(raw.played);
  const wins = Math.min(normalizeCount(raw.wins), played);
  const normalizedHistogram = histogramTotal <= wins
    ? histogram
    : EMPTY_STATS.histogram;
  const currentStreak = normalizeCount(raw.currentStreak);
  const maxStreak = Math.max(normalizeCount(raw.maxStreak), currentStreak);
  return {
    ...EMPTY_STATS,
    ...raw,
    played,
    wins,
    currentStreak,
    maxStreak,
    histogram: normalizedHistogram,
    lastWonOn: normalizeDate(raw.lastWonOn),
    lastPlayedOn: normalizeDate(raw.lastPlayedOn),
    recordedDailyKeys: Array.isArray(raw.recordedDailyKeys)
      ? Array.from(
          new Set(
            raw.recordedDailyKeys.filter(
              (key): key is string =>
                typeof key === 'string' && key.startsWith('daily:')
            )
          )
        ).slice(-MAX_RECORDED_DAILY_KEYS)
      : [],
  };
}

export function snapshotWasRecorded(
  stats: Stats,
  snapshot: GameSnapshot
): boolean {
  return stats.recordedDailyKeys.includes(snapshot.key);
}

export function markSnapshotRecorded(
  stats: Stats,
  snapshot: GameSnapshot
): Stats {
  if (snapshotWasRecorded(stats, snapshot)) return stats;
  return {
    ...stats,
    recordedDailyKeys: [...stats.recordedDailyKeys, snapshot.key],
  };
}

export function recordDailyResult(stats: Stats, snapshot: GameSnapshot): Stats {
  const base = normalizeStats(stats);
  if (
    snapshot.mode !== 'daily' ||
    snapshot.puzzleNumber === null ||
    snapshot.status === 'in-progress' ||
    snapshotWasRecorded(base, snapshot)
  ) {
    return base;
  }

  const won = snapshot.status === 'won';
  const guessesUsed = snapshot.guesses.length;
  const next: Stats = {
    ...base,
    histogram: [...base.histogram] as Stats['histogram'],
    recordedDailyKeys: [...base.recordedDailyKeys, snapshot.key].slice(
      -MAX_RECORDED_DAILY_KEYS
    ),
  };

  next.played = base.played + 1;
  if (won) {
    next.wins = base.wins + 1;
    if (guessesUsed >= 1 && guessesUsed <= next.histogram.length) {
      next.histogram[guessesUsed - 1] = next.histogram[guessesUsed - 1] + 1;
    }
    const dayGap = base.lastWonOn
      ? daysBetween(base.lastWonOn, snapshot.dateIssued)
      : null;
    next.currentStreak = dayGap === 1 ? base.currentStreak + 1 : 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
    next.lastWonOn = snapshot.dateIssued;
  } else {
    next.currentStreak = 0;
  }
  next.lastPlayedOn = snapshot.dateIssued;
  return next;
}
