'use client';

import { COPY, LOCALES } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import { useLocale } from './useLocale';

export default function LanguageToggle() {
  const { locale, copy, setLocale } = useLocale();

  return (
    <LanguageSegments
      locale={locale}
      label={copy.languageToggle.label}
      onChange={setLocale}
    />
  );
}

export function LanguageSegments({
  locale,
  label,
  onChange,
}: {
  locale: Locale;
  label: string;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex min-h-11 items-center rounded-full p-1"
      style={{
        background: 'var(--hoolah-key-bg)',
        color: 'var(--hoolah-fg)',
      }}
    >
      {LOCALES.map((item) => (
        <Segment
          key={item}
          locale={item}
          current={locale}
          onClick={() => onChange(item)}
        />
      ))}
    </div>
  );
}

function Segment({
  locale,
  current,
  onClick,
}: {
  locale: Locale;
  current: Locale;
  onClick: () => void;
}) {
  const selected = locale === current;
  const label =
    locale === 'en'
      ? COPY[current].languageToggle.setEnglish
      : COPY[current].languageToggle.setFilipino;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className="inline-flex min-h-9 min-w-11 items-center justify-center rounded-full px-3 text-xs font-semibold"
      style={{
        background: selected ? 'var(--hoolah-accent)' : 'transparent',
        color: selected ? 'var(--hoolah-bg)' : 'inherit',
        border: 0,
        letterSpacing: 0,
      }}
    >
      {COPY[locale].meta.shortName}
    </button>
  );
}
