import Link from 'next/link';
import Wordmark from './Wordmark';

interface SiteHeaderProps {
  rightSlot?: React.ReactNode;
}

export default function SiteHeader({ rightSlot }: SiteHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 sm:px-6 py-3 border-b"
      style={{ borderColor: 'var(--hoolah-rule)' }}
    >
      <Link
        href="/"
        aria-label="hoolah, home"
        className="no-underline"
        style={{ background: 'transparent' }}
      >
        <Wordmark size="sm" />
      </Link>
      <div className="flex items-center gap-1 sm:gap-2">{rightSlot}</div>
    </header>
  );
}
