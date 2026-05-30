'use client';

import { useEffect } from 'react';
import type { Settings } from '@/lib/types';

interface SettingsProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (next: Settings) => void;
  // Disabled when the player has started guessing today's puzzle.
  hardModeLocked?: boolean;
  onFreePlay?: () => void;
  freePlayActive: boolean;
  onResumeDaily?: () => void;
}

export default function SettingsModal({
  open,
  onClose,
  settings,
  onChange,
  hardModeLocked,
  onFreePlay,
  freePlayActive,
  onResumeDaily,
}: SettingsProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'var(--hoolah-modal-overlay)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl px-5 sm:px-7 pt-6 pb-8 flex flex-col gap-4"
        style={{
          background: 'var(--hoolah-modal-bg)',
          color: 'var(--hoolah-fg)',
          animation: 'fadeIn 180ms ease-out',
        }}
      >
        <div className="flex items-start justify-between">
          <h2 id="settings-title" className="font-serif text-2xl font-bold">
            settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="text-2xl leading-none px-2 py-1 -mt-1 -mr-2"
            style={{ color: 'var(--hoolah-muted)', background: 'transparent' }}
          >
            ×
          </button>
        </div>

        <Row
          title="Hard mode"
          sub="Revealed letters must be used in every later guess."
          disabled={hardModeLocked}
          disabledNote="Finish today's puzzle to change this."
        >
          <Toggle
            checked={settings.hardMode}
            onChange={(v) => set('hardMode', v)}
            label="hard mode"
            disabled={hardModeLocked}
          />
        </Row>

        <Row title="Dark mode" sub="Inverted oxblood; gold accent.">
          <Toggle
            checked={settings.theme === 'dark'}
            onChange={(v) => set('theme', v ? 'dark' : 'light')}
            label="dark mode"
          />
        </Row>

        <Row title="Reduced motion" sub="Skip tile flips, shake, bounce.">
          <Toggle
            checked={settings.reducedMotion}
            onChange={(v) => set('reducedMotion', v)}
            label="reduced motion"
          />
        </Row>

        <div
          className="pt-3 mt-1 border-t flex items-center justify-between gap-3"
          style={{ borderColor: 'var(--hoolah-rule)' }}
        >
          <div>
            <p className="font-medium">
              {freePlayActive ? 'Daily puzzle' : 'Free play'}
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--hoolah-muted)' }}
            >
              {freePlayActive
                ? 'Return to today\u2019s puzzle.'
                : 'Random word, no stats, no streak.'}
            </p>
          </div>
          <button
            type="button"
            onClick={freePlayActive ? onResumeDaily : onFreePlay}
            className="px-3 py-2 rounded text-sm font-medium"
            style={{
              background: 'var(--hoolah-key-bg)',
              color: 'var(--hoolah-fg)',
              border: 0,
            }}
          >
            {freePlayActive ? 'Back to daily' : 'Play random'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  title,
  sub,
  children,
  disabled,
  disabledNote,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
  disabled?: boolean;
  disabledNote?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className={`font-medium ${disabled ? 'opacity-60' : ''}`}>
          {title}
        </p>
        <p
          className="text-xs"
          style={{ color: 'var(--hoolah-muted)' }}
        >
          {disabled && disabledNote ? disabledNote : sub}
        </p>
      </div>
      <div className="shrink-0 pt-1">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="rounded-full"
      style={{
        width: 44,
        height: 24,
        background: checked
          ? 'var(--hoolah-accent)'
          : 'var(--hoolah-key-bg)',
        position: 'relative',
        border: 0,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 120ms linear',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'var(--hoolah-modal-bg)',
          transition: 'left 120ms ease-out',
        }}
      />
    </button>
  );
}
