import {
  currentTimeZone,
  daysBetween,
  localDateString,
  localDateStringForInstant,
} from './time';

const DAILY_CLOCK_KEY = 'hoolah:v1:daily-clock';

type ClockSource = 'host' | 'local';

let trustedAnchor: { hostMs: number; perfMs: number } | null = null;

interface StoredDailyClock {
  date: string;
  timeZone: string | null;
  source: ClockSource;
  updatedAt: number;
}

export interface ResolveClockDateInput {
  storedDate?: string | null;
  storedTimeZone?: string | null;
  storedSource?: ClockSource | null;
  currentTimeZone?: string | null;
  observedLocalDate: string;
  trustedLocalDate?: string | null;
  trustedStoredZoneDate?: string | null;
}

export interface ResolvedClockDate {
  date: string;
  timeZone: string | null;
  source: ClockSource;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    daysBetween(value, value) === 0
  );
}

function compareDates(a: string, b: string): number {
  const diff = daysBetween(a, b);
  return diff ?? 0;
}

function isAfter(a: string, b: string): boolean {
  return compareDates(b, a) > 0;
}

function maxDate(a: string, b: string): string {
  return isAfter(b, a) ? b : a;
}

function readStoredClock(): StoredDailyClock | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(DAILY_CLOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDailyClock>;
    if (!isIsoDate(parsed.date)) return null;
    return {
      date: parsed.date,
      timeZone:
        typeof parsed.timeZone === 'string' ? parsed.timeZone : null,
      source: parsed.source === 'local' ? 'local' : 'host',
      updatedAt:
        typeof parsed.updatedAt === 'number' &&
        Number.isFinite(parsed.updatedAt)
          ? parsed.updatedAt
          : Date.now(),
    };
  } catch {
    return null;
  }
}

function writeStoredClock(value: StoredDailyClock): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(DAILY_CLOCK_KEY, JSON.stringify(value));
  } catch {
    // Private browsing or quota failures should not stop play.
  }
}

function performanceNow(): number | null {
  if (!isBrowser()) return null;
  if (typeof window.performance?.now !== 'function') return null;
  return window.performance.now();
}

function rememberTrustedNow(date: Date): void {
  const perfMs = performanceNow();
  if (perfMs === null) return;
  trustedAnchor = { hostMs: date.getTime(), perfMs };
}

function sessionTrustedNow(): Date | null {
  const perfMs = performanceNow();
  if (!trustedAnchor || perfMs === null) return null;
  return new Date(trustedAnchor.hostMs + (perfMs - trustedAnchor.perfMs));
}

async function fetchHostNow(): Promise<Date | null> {
  if (!isBrowser()) return null;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(new URL('/', window.location.href), {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    const rawDate = res.headers.get('date');
    const ms = rawDate ? Date.parse(rawDate) : Number.NaN;
    return Number.isFinite(ms) ? new Date(ms) : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function trustedNow(): Promise<Date | null> {
  const hostNow = await fetchHostNow();
  if (hostNow) {
    rememberTrustedNow(hostNow);
    return hostNow;
  }
  return sessionTrustedNow();
}

export function resolveClockDate({
  storedDate,
  storedTimeZone,
  storedSource,
  currentTimeZone,
  observedLocalDate,
  trustedLocalDate,
  trustedStoredZoneDate,
}: ResolveClockDateInput): ResolvedClockDate {
  const observed = isIsoDate(observedLocalDate)
    ? observedLocalDate
    : localDateString();
  const stored = isIsoDate(storedDate) ? storedDate : null;
  const trusted = isIsoDate(trustedLocalDate) ? trustedLocalDate : null;
  const trustedInStoredZone = isIsoDate(trustedStoredZoneDate)
    ? trustedStoredZoneDate
    : null;

  if (!stored) {
    return {
      date: trusted ?? observed,
      timeZone: currentTimeZone ?? null,
      source: trusted ? 'host' : 'local',
    };
  }

  if (!trusted) {
    return {
      date: stored,
      timeZone: storedTimeZone ?? currentTimeZone ?? null,
      source: storedSource === 'local' ? 'local' : 'host',
    };
  }

  if (storedSource === 'local' && isAfter(stored, trusted)) {
    return {
      date: trusted,
      timeZone: currentTimeZone ?? null,
      source: 'host',
    };
  }

  const zoneChanged =
    !!storedTimeZone &&
    !!currentTimeZone &&
    storedTimeZone !== currentTimeZone;

  if (
    zoneChanged &&
    isAfter(trusted, stored) &&
    (!trustedInStoredZone || !isAfter(trustedInStoredZone, stored))
  ) {
    return {
      date: stored,
      timeZone: storedTimeZone,
      source: 'host',
    };
  }

  return {
    date: maxDate(stored, trusted),
    timeZone: currentTimeZone ?? storedTimeZone ?? null,
    source: 'host',
  };
}

export async function guardedLocalDateString(
  now: Date = new Date()
): Promise<string> {
  const timeZone = currentTimeZone();
  const observedLocalDate = localDateStringForInstant(now, timeZone);
  const stored = readStoredClock();
  const trustedDate = await trustedNow();
  const trustedLocalDate = trustedDate
    ? localDateStringForInstant(trustedDate, timeZone)
    : null;
  const trustedStoredZoneDate =
    trustedDate && stored?.timeZone
      ? localDateStringForInstant(trustedDate, stored.timeZone)
      : null;

  const resolved = resolveClockDate({
    storedDate: stored?.date ?? null,
    storedTimeZone: stored?.timeZone ?? null,
    storedSource: stored?.source ?? null,
    currentTimeZone: timeZone,
    observedLocalDate,
    trustedLocalDate,
    trustedStoredZoneDate,
  });

  writeStoredClock({
    ...resolved,
    updatedAt: Date.now(),
  });
  return resolved.date;
}
