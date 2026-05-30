'use client';

import { useEffect } from 'react';
import { LanguageSegments } from '@/components/i18n/LanguageToggle';
import { COPY } from '@/lib/i18n';
import type { Settings } from '@/lib/types';

interface SettingsProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (next: Settings) => void;
  // Disabled when the player has started guessing today's puzzle.
  hardModeLocked?: boolean;
}

export default function SettingsModal({
  open,
  onClose,
  settings,
  onChange,
  hardModeLocked,
}: SettingsProps) {
  const copy = COPY[settings.locale];

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
          maxHeight: '92dvh',
          overflowY: 'auto',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
          animation: 'fadeIn 180ms ease-out',
        }}
      >
        <div className="flex items-start justify-between">
          <h2 id="settings-title" className="font-serif text-2xl font-bold">
            {copy.settings.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.common.close}
            className="-mr-3 -mt-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded text-2xl leading-none"
            style={{ color: 'var(--hoolah-muted)', background: 'transparent' }}
          >
            ×
          </button>
        </div>

        <Row
          title={copy.settings.language}
          sub={copy.settings.languageSub}
        >
          <LanguageSegments
            locale={settings.locale}
            label={copy.languageToggle.label}
            onChange={(v) => set('locale', v)}
          />
        </Row>

        <Row
          title={copy.settings.hardMode}
          sub={copy.settings.hardModeSub}
          disabled={hardModeLocked}
          disabledNote={copy.settings.hardModeLocked}
        >
          <Toggle
            checked={settings.hardMode}
            onChange={(v) => set('hardMode', v)}
            label={copy.settings.hardMode}
            disabled={hardModeLocked}
          />
        </Row>

        <Row title={copy.settings.darkMode} sub={copy.settings.darkModeSub}>
          <Toggle
            checked={settings.theme === 'dark'}
            onChange={(v) => set('theme', v ? 'dark' : 'light')}
            label={copy.settings.darkMode}
          />
        </Row>

        <Row
          title={copy.settings.reducedMotion}
          sub={copy.settings.reducedMotionSub}
        >
          <Toggle
            checked={settings.reducedMotion}
            onChange={(v) => set('reducedMotion', v)}
            label={copy.settings.reducedMotion}
          />
        </Row>

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
      className="relative inline-flex min-h-11 min-w-14 items-center justify-center rounded-full"
      style={{
        background: 'transparent',
        border: 0,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 44,
          height: 24,
          borderRadius: 999,
          background: checked
            ? 'var(--hoolah-accent)'
            : 'var(--hoolah-key-bg)',
          transition: 'background-color 120ms linear',
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: checked ? 'calc(50% + 1px)' : 'calc(50% - 19px)',
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
