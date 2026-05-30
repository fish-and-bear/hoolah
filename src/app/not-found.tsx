import Link from 'next/link';
import SiteFooter from '@/components/brand/SiteFooter';
import Wordmark from '@/components/brand/Wordmark';

export default function NotFound() {
  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-4">
        <Wordmark size="md" />
        <p
          className="text-base"
          style={{ color: 'var(--hoolah-muted)' }}
        >
          Page not in the word list.
        </p>
        <Link href="/" className="text-sm">
          back to the game
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
