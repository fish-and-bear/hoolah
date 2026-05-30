import type { Metadata, Viewport } from 'next';
import { EB_Garamond, Inter_Tight } from 'next/font/google';

import RegisterSW from '@/components/pwa/RegisterSW';
import '@/styles/globals.css';

const serif = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
});

const sans = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_URL = 'https://hoolah.hapinas.net';
const TAGLINE = 'guess the Filipino word';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'hoolah',
    template: '%s — hoolah',
  },
  description: `${TAGLINE}. A daily five-letter Tagalog word game.`,
  applicationName: 'hoolah',
  keywords: [
    'Tagalog',
    'Filipino',
    'Wordle',
    'word game',
    'puzzle',
    'salita',
    'hoolah',
    'daily',
  ],
  authors: [{ name: 'Angelica Naguio', url: 'https://angelicanaguio.com' }],
  creator: 'Angelica Naguio',
  manifest: '/manifest.webmanifest',
  alternates: { canonical: SITE_URL },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'hoolah',
    description: `${TAGLINE}. A daily five-letter Tagalog word game.`,
    url: SITE_URL,
    siteName: 'hoolah',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'hoolah',
    description: `${TAGLINE}. A daily five-letter Tagalog word game.`,
  },
  appleWebApp: {
    title: 'hoolah',
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Allow user zoom up to 5x — there are no <input> elements on the
  // page so the iOS Safari zoom-on-focus footgun does not apply, and
  // locking out zoom is an a11y regression for low-vision players.
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4EDE3' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0E0E' },
  ],
  colorScheme: 'light dark',
};

// Inline theme-init script runs before paint so dark-mode players don't
// see a flash of ivory. Reads the persisted setting and applies the
// data-theme attribute on <html>.
const THEME_INIT_SCRIPT = `(() => { try {
  var raw = localStorage.getItem('hoolah:v1:settings');
  var pref = raw ? (JSON.parse(raw).theme || 'system') : 'system';
  var dark = pref === 'dark' || (pref === 'system' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  if (raw) {
    var s = JSON.parse(raw);
    if (s.reducedMotion) document.documentElement.setAttribute('data-reduced-motion', 'true');
  }
} catch (e) {} })();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Game',
              name: 'hoolah',
              description: `${TAGLINE}. A daily five-letter Tagalog word game.`,
              url: SITE_URL,
              applicationCategory: 'Game',
              operatingSystem: 'Any',
              author: {
                '@type': 'Person',
                name: 'Angelica Naguio',
                url: 'https://angelicanaguio.com',
              },
              inLanguage: ['tl', 'en'],
              isAccessibleForFree: true,
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
