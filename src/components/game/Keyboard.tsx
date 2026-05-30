'use client';

import { useEffect, useMemo } from 'react';

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'back'],
];

const STATE_BG: Record<string, string> = {
  correct: 'var(--hoolah-correct)',
  present: 'var(--hoolah-present)',
  absent: 'var(--hoolah-absent)',
};

interface KeyboardProps {
  onKey: (key: string) => void;
  letterStates: Record<string, 'correct' | 'present' | 'absent'>;
  disabled?: boolean;
}

export default function Keyboard({
  onKey,
  letterStates,
  disabled,
}: KeyboardProps) {
  // Physical keyboard handler.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (disabled) return;
      // Ignore when typing in an actual input/textarea (modal forms, etc.)
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      // Don't swallow shortcut keys.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        onKey('enter');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onKey('back');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onKey(e.key.toLowerCase());
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKey, disabled]);

  const styledRows = useMemo(() => ROWS, []);

  return (
    <div
      className="w-full max-w-[520px] mx-auto px-1 sm:px-0 flex flex-col gap-[6px] sm:gap-2"
      role="group"
      aria-label="on-screen keyboard"
    >
      {styledRows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-[4px] sm:gap-[6px] justify-center">
          {row.map((key) => {
            const isAction = key === 'enter' || key === 'back';
            const state = letterStates[key];
            const bg = state ? STATE_BG[state] : 'var(--hoolah-key-bg)';
            const color = state
              ? 'var(--hoolah-tile-text-on-color)'
              : 'var(--hoolah-key-fg)';
            const label =
              key === 'enter'
                ? 'submit guess'
                : key === 'back'
                  ? 'delete letter'
                  : `letter ${key.toUpperCase()}`;
            const display =
              key === 'enter' ? 'enter' : key === 'back' ? '⌫' : key.toUpperCase();
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKey(key)}
                aria-label={label}
                aria-disabled={disabled ? 'true' : 'false'}
                className="select-none touch-manipulation rounded-[4px] font-semibold text-sm sm:text-base"
                style={{
                  flex: isAction ? '1.4 1 0' : '1 1 0',
                  minWidth: 0,
                  height: 'clamp(48px, 9vw, 58px)',
                  background: bg,
                  color,
                  border: 0,
                  transition: 'background-color 80ms linear',
                  textTransform: key === 'enter' ? 'lowercase' : 'none',
                  letterSpacing: key === 'enter' ? '0.05em' : 'normal',
                  cursor: disabled ? 'default' : 'pointer',
                }}
              >
                {display}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
