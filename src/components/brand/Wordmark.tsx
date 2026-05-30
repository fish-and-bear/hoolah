import Link from 'next/link';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
}

const SIZES = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl sm:text-7xl',
};

export default function Wordmark({ size = 'md', asLink = false }: WordmarkProps) {
  const content = (
    <span
      className={`wordmark ${SIZES[size]}`}
      style={{ color: 'var(--hoolah-accent)' }}
    >
      hoolah
    </span>
  );
  if (asLink) {
    return (
      <Link
        href="/"
        aria-label="hoolah, home"
        className="no-underline hover:bg-transparent focus-visible:bg-transparent"
        style={{ background: 'transparent' }}
      >
        {content}
      </Link>
    );
  }
  return content;
}
