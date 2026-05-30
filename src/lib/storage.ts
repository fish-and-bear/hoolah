import type { GameSnapshot, Settings, Stats } from './types';
import { DEFAULT_SETTINGS, EMPTY_STATS } from './types';

// Storage keys are versioned. If the snapshot shape changes in a
// breaking way later, bump the suffix and migrate.
const KEY_SETTINGS = 'hoolah:v1:settings';
const KEY_STATS = 'hoolah:v1:stats';
const KEY_GAME_PREFIX = 'hoolah:v1:game:';

const isBrowser = typeof window !== 'undefined';

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private-mode failures are swallowed — the game still
    // works, you just lose persistence.
  }
}

export function loadSettings(): Settings {
  return readJSON<Settings>(KEY_SETTINGS, DEFAULT_SETTINGS);
}
export function saveSettings(s: Settings): void {
  writeJSON(KEY_SETTINGS, s);
}

export function loadStats(): Stats {
  return readJSON<Stats>(KEY_STATS, EMPTY_STATS);
}
export function saveStats(s: Stats): void {
  writeJSON(KEY_STATS, s);
}

export function loadGame(key: string): GameSnapshot | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(KEY_GAME_PREFIX + key);
    return raw ? (JSON.parse(raw) as GameSnapshot) : null;
  } catch {
    return null;
  }
}

export function saveGame(snapshot: GameSnapshot): void {
  writeJSON(KEY_GAME_PREFIX + snapshot.key, snapshot);
}

// Trim the per-game storage to the most recent N entries so the
// archive page can show recent puzzles without unbounded growth.
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
