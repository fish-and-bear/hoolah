import type { GameSnapshot, Settings, Stats } from './types';
import { normalizeStats } from './stats';
import {
  DEFAULT_SETTINGS,
  EMPTY_STATS,
  MAX_GUESSES,
  WORD_LENGTH,
} from './types';

// Storage keys are versioned. If the snapshot shape changes in a
// breaking way later, bump the suffix and migrate.
const KEY_SETTINGS = 'hoolah:v1:settings';
const KEY_STATS = 'hoolah:v1:stats';
const KEY_GAME_PREFIX = 'hoolah:v1:game:';
export const SETTINGS_CHANGED_EVENT = 'hoolah:v1:settings-changed';

const isBrowser = typeof window !== 'undefined';
const WORD_RE = new RegExp(`^[a-z]{${WORD_LENGTH}}$`);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const THEMES = new Set<Settings['theme']>(['system', 'dark', 'light']);
const LOCALES = new Set<Settings['locale']>(['en', 'fil']);
const STATUSES = new Set<GameSnapshot['status']>([
  'in-progress',
  'won',
  'lost',
]);

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return fallback;
    }
    return { ...fallback, ...(parsed as T) };
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private-mode failures are swallowed. The game still
    // works, you just lose persistence.
  }
}

function notifySettingsChanged(settings: Settings): void {
  if (!isBrowser || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(
      new CustomEvent(SETTINGS_CHANGED_EVENT, { detail: settings })
    );
  } catch {
    // ignored
  }
}

function isFiniteTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10) === value;
}

export function normalizeSettings(
  value: Partial<Settings> | null | undefined
): Settings {
  const raw = value ?? {};
  return {
    hardMode:
      typeof raw.hardMode === 'boolean'
        ? raw.hardMode
        : DEFAULT_SETTINGS.hardMode,
    reducedMotion:
      typeof raw.reducedMotion === 'boolean'
        ? raw.reducedMotion
        : DEFAULT_SETTINGS.reducedMotion,
    locale:
      raw.locale && LOCALES.has(raw.locale)
        ? raw.locale
        : DEFAULT_SETTINGS.locale,
    theme:
      raw.theme && THEMES.has(raw.theme)
        ? raw.theme
        : DEFAULT_SETTINGS.theme,
    hasOpenedBefore:
      typeof raw.hasOpenedBefore === 'boolean'
        ? raw.hasOpenedBefore
        : DEFAULT_SETTINGS.hasOpenedBefore,
  };
}

export function normalizeGameSnapshot(
  value: Partial<GameSnapshot> | null | undefined,
  expectedKey?: string
): GameSnapshot | null {
  if (!value || typeof value !== 'object') return null;

  const key = typeof value.key === 'string' ? value.key : '';
  if (!key || (expectedKey && key !== expectedKey)) return null;

  const mode = value.mode;
  if (mode !== 'daily') return null;

  const dateIssued = value.dateIssued;
  if (!isIsoDate(dateIssued)) return null;

  const answer = value.answer;
  if (typeof answer !== 'string' || !WORD_RE.test(answer)) return null;

  const guesses = Array.isArray(value.guesses) ? value.guesses : null;
  if (
    !guesses ||
    guesses.length > MAX_GUESSES ||
    !guesses.every((guess): guess is string =>
      typeof guess === 'string' && WORD_RE.test(guess)
    )
  ) {
    return null;
  }

  const status = value.status;
  if (!status || !STATUSES.has(status)) return null;
  if (status === 'won' && guesses[guesses.length - 1] !== answer) return null;
  if (status === 'lost' && guesses.length < MAX_GUESSES) return null;
  if (status === 'in-progress' && guesses.length >= MAX_GUESSES) return null;

  const puzzleNumber = value.puzzleNumber ?? null;
  if (
    puzzleNumber !== null &&
    (!Number.isInteger(puzzleNumber) || puzzleNumber < 1)
  ) {
    return null;
  }

  return {
    key,
    mode,
    dateIssued,
    puzzleNumber: puzzleNumber ?? null,
    answer,
    guesses,
    status,
    hardMode: typeof value.hardMode === 'boolean' ? value.hardMode : false,
    startedAt: isFiniteTimestamp(value.startedAt) ? value.startedAt : Date.now(),
    finishedAt:
      status === 'in-progress'
        ? null
        : isFiniteTimestamp(value.finishedAt)
          ? value.finishedAt
          : Date.now(),
  };
}

export function loadSettings(): Settings {
  return normalizeSettings(readJSON<Settings>(KEY_SETTINGS, DEFAULT_SETTINGS));
}
export function saveSettings(s: Settings): void {
  const normalized = normalizeSettings(s);
  writeJSON(KEY_SETTINGS, normalized);
  notifySettingsChanged(normalized);
}

export function loadStats(): Stats {
  return normalizeStats(readJSON<Stats>(KEY_STATS, EMPTY_STATS));
}
export function saveStats(s: Stats): void {
  writeJSON(KEY_STATS, normalizeStats(s));
}

export function loadGame(key: string): GameSnapshot | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(KEY_GAME_PREFIX + key);
    return raw
      ? normalizeGameSnapshot(JSON.parse(raw) as Partial<GameSnapshot>, key)
      : null;
  } catch {
    return null;
  }
}

export function saveGame(snapshot: GameSnapshot): void {
  const normalized = normalizeGameSnapshot(snapshot);
  if (normalized) writeJSON(KEY_GAME_PREFIX + normalized.key, normalized);
}

// Trim per-game snapshots so stale daily states cannot grow without bound.
export function pruneGames(keepKeys: string[]): void {
  if (!isBrowser) return;
  try {
    const keep = new Set(keepKeys.map((k) => KEY_GAME_PREFIX + k));
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(KEY_GAME_PREFIX) && !keep.has(k)) {
        window.localStorage.removeItem(k);
      }
    }
  } catch {
    // ignored
  }
}
