import type { JudgedGuess } from './types';
import { MAX_GUESSES } from './types';

const EMOJI = {
  correct: '🟩',
  present: '🟨',
  absent: '⬛',
} as const;

const EMOJI_DARK = {
  correct: '🟩',
  present: '🟨',
  absent: '⬜',
} as const;

export interface ShareOptions {
  puzzleNumber: number | null;
  guesses: JudgedGuess[];
  won: boolean;
  hardMode: boolean;
  // Player's color preference. Only flips the absent-tile emoji so
  // shares from dark-mode players read clearly in dark-mode chat
  // clients too.
  dark?: boolean;
  shareUrl?: string;
}

export function buildShareText({
  puzzleNumber,
  guesses,
  won,
  hardMode,
  dark = false,
  shareUrl,
}: ShareOptions): string {
  const palette = dark ? EMOJI_DARK : EMOJI;
  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const label =
    puzzleNumber != null
      ? `hoolah ${puzzleNumber.toString().padStart(3, '0')}`
      : 'hoolah';
  const head = `${label} — ${score}${hardMode ? '*' : ''}`;
  const grid = guesses
    .map((g) => g.map((t) => palette[t.state]).join(''))
    .join('\n');
  const url = shareUrl ?? 'https://hoolah.hapinas.net';
  return `${head}\n\n${grid}\n\n${url}`;
}

// Returns true on success. Falls back to a hidden textarea + execCommand
// for older mobile browsers that have neither navigator.share nor the
// clipboard API.
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// Wraps the Web Share API. Returns 'shared' | 'copied' | 'failed'.
export async function shareOrCopy(
  text: string,
  title = 'hoolah'
): Promise<'shared' | 'copied' | 'failed'> {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  ) {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (err) {
      // User-cancelled shares throw with .name === 'AbortError'. Treat
      // that as a clean exit, not a fallback trigger.
      if (err instanceof Error && err.name === 'AbortError') return 'failed';
      // fall through to copy
    }
  }
  const ok = await copyToClipboard(text);
  return ok ? 'copied' : 'failed';
}
