// The whole site is static, so the daily date string has to be derived
// in the browser. The game uses the player's local calendar, guarded
// by a same-origin host Date check before advancing days.

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

export function localDateString(date: Date = new Date()): string {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join('-');
}

export function zonedDateString(date: Date, timeZone: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const m = parts.find((p) => p.type === 'month')?.value ?? '01';
    const d = parts.find((p) => p.type === 'day')?.value ?? '01';
    return `${y}-${m}-${d}`;
  } catch {
    return null;
  }
}

export function currentTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

export function localDateStringForInstant(
  date: Date,
  timeZone = currentTimeZone()
): string {
  if (timeZone) {
    const zoned = zonedDateString(date, timeZone);
    if (zoned) return zoned;
  }
  return localDateString(date);
}

export function msUntilNextLocalMidnight(now: Date = new Date()): number {
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return Math.max(0, next.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// Days between two ISO date strings (YYYY-MM-DD). Positive when b is
// after a. Returns null if either string is invalid.
function isoDateToUtcMs(value: string): number | null {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  if (Number.isNaN(utc)) return null;
  if (new Date(utc).toISOString().slice(0, 10) !== value) return null;
  return utc;
}

export function daysBetween(a: string, b: string): number | null {
  const aUtc = isoDateToUtcMs(a);
  const bUtc = isoDateToUtcMs(b);
  if (aUtc === null || bUtc === null) return null;
  return Math.round((bUtc - aUtc) / 86_400_000);
}
