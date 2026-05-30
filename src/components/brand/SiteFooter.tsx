'use client';

import Link from 'next/link';
import { useLocale } from '@/components/i18n/useLocale';

export default function SiteFooter() {
  const { copy } = useLocale();

  return (
    <footer
      className="mt-auto flex flex-col gap-2 border-t px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4"
      style={{
        borderColor: 'var(--hoolah-rule)',
        color: 'var(--hoolah-muted)',
      }}
    >
      <nav className="-mx-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Link
          href="/about"
          className="inline-flex min-h-11 items-center px-2"
          style={{ background: 'transparent' }}
        >
          {copy.footer.about}
        </Link>
        <Link
          href="/rules"
          className="inline-flex min-h-11 items-center px-2"
          style={{ background: 'transparent' }}
        >
          {copy.footer.rules}
        </Link>
        <Link
          href="/archive"
          className="inline-flex min-h-11 items-center px-2"
          style={{ background: 'transparent' }}
        >
          {copy.footer.archive}
        </Link>
      </nav>
      <p className="max-w-full text-left leading-6 sm:text-right">
        {copy.footer.madeBy}{' '}
        <a
          href="https://angelicanaguio.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center align-middle"
          style={{ background: 'transparent' }}
        >
          angelica naguio
        </a>{' '}
        ·{' '}
        <a
          href="https://github.com/fish-and-bear/hoolah"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center align-middle"
          style={{ background: 'transparent' }}
        >
          fish-and-bear/hoolah
        </a>
      </p>
    </footer>
  );
}
