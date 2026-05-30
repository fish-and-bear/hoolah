'use client';

import Link from 'next/link';
import LanguageToggle from '@/components/i18n/LanguageToggle';
import { useLocale } from '@/components/i18n/useLocale';
import Wordmark from './Wordmark';

interface SiteHeaderProps {
  rightSlot?: React.ReactNode;
}

export default function SiteHeader({ rightSlot }: SiteHeaderProps) {
  const { copy } = useLocale();

  return (
    <header
      className="flex min-h-[52px] items-center justify-between px-4 sm:px-6 border-b"
      style={{ borderColor: 'var(--hoolah-rule)' }}
    >
      <Link
        href="/"
        aria-label={copy.common.homeAria}
        className="inline-flex min-h-11 items-center no-underline"
        style={{ background: 'transparent' }}
      >
        <Wordmark size="sm" />
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">
        {rightSlot ?? <LanguageToggle />}
      </div>
    </header>
  );
}
