'use client';

import Link from 'next/link';

import Wordmark from '@/components/brand/Wordmark';
import { useLocale } from '@/components/i18n/useLocale';

export default function NotFoundContent() {
  const { copy } = useLocale();

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-4">
      <Wordmark size="md" />
      <p className="text-base" style={{ color: 'var(--hoolah-muted)' }}>
        {copy.pages.notFound.message}
      </p>
      <Link href="/" className="inline-flex min-h-11 items-center text-sm">
        {copy.pages.notFound.back}
      </Link>
    </main>
  );
}
