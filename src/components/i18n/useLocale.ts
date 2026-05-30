'use client';

import { useCallback, useEffect, useState } from 'react';

import { COPY, htmlLang, normalizeLocale } from '@/lib/i18n';
import { loadSettings, saveSettings, SETTINGS_CHANGED_EVENT } from '@/lib/storage';
import type { Locale } from '@/lib/types';

function applyLocale(locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = htmlLang(locale);
  document.documentElement.setAttribute('data-locale', locale);
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const sync = () => {
      const next = loadSettings().locale;
      setLocaleState(next);
      applyLocale(next);
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(SETTINGS_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(SETTINGS_CHANGED_EVENT, sync);
    };
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    const next = normalizeLocale(nextLocale);
    const settings = loadSettings();
    if (settings.locale === next) {
      setLocaleState(next);
      applyLocale(next);
      return;
    }
    saveSettings({ ...settings, locale: next });
  }, []);

  return {
    locale,
    copy: COPY[locale],
    setLocale,
  };
}
