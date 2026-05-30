import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer
      className="mt-auto px-4 sm:px-6 py-4 text-xs flex flex-wrap items-center justify-between gap-3 border-t"
      style={{
        borderColor: 'var(--hoolah-rule)',
        color: 'var(--hoolah-muted)',
      }}
    >
      <nav className="flex items-center gap-4">
        <Link href="/about" style={{ background: 'transparent' }}>
          about
        </Link>
        <Link href="/rules" style={{ background: 'transparent' }}>
          rules
        </Link>
        <Link href="/archive" style={{ background: 'transparent' }}>
          archive
        </Link>
      </nav>
      <p className="text-right">
        made by{' '}
        <a
          href="https://angelicanaguio.com"
          target="_blank"
          rel="noreferrer"
          style={{ background: 'transparent' }}
        >
          angelica naguio
        </a>{' '}
        ·{' '}
        <a
          href="https://github.com/fish-and-bear/hoolah"
          target="_blank"
          rel="noreferrer"
          style={{ background: 'transparent' }}
        >
          fish-and-bear/hoolah
        </a>
      </p>
    </footer>
  );
}
