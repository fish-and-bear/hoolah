// hoolah's 'today' is Asia/Manila (UTC+8, no DST). The whole site is
// static, so the date string has to be derived in the browser. We
// format using Intl with a hard-coded timeZone so the value matches
// whether the player is in Manila, Hong Kong, or Toronto.

const TZ = 'Asia/Manila';

export function manilaDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const d = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${y}-${m}-${d}`;
}

// Milliseconds until the next Manila midnight (when the next hoolah
// becomes available). Used for the countdown shown in the end modal.
export function msUntilNextManilaMidnight(now: Date = new Date()): number {
  const todayStr = manilaDateString(now);
  // Construct a UTC instant equal to 'tomorrow 00:00 in Manila', which
  // is exactly today 16:00 UTC (since Manila is UTC+8 year-round).
  const [y, m, d] = todayStr.split('-').map(Number);
  // 00:00 Manila on (date+1) = 16:00 UTC on (date).
  const nextMidnightUtc = Date.UTC(y, m - 1, d, 16, 0, 0, 0);
  return Math.max(0, nextMidnightUtc - now.getTime());
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
export function daysBetween(a: string, b: string): number | null {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(a) || !re.test(b)) return null;
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const aUtc = Date.UTC(ay, am - 1, ad);
  const bUtc = Date.UTC(by, bm - 1, bd);
  return Math.round((bUtc - aUtc) / 86_400_000);
}
