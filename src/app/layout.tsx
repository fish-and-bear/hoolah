import type { Metadata, Viewport } from 'next';
import { EB_Garamond, Inter_Tight } from 'next/font/google';

import RegisterSW from '@/components/pwa/RegisterSW';
import '@/styles/globals.css';

// Self-hosted Google Fonts via next/font: weights pared down to what
// the design actually uses (serif 700 italic for the wordmark + 600/700
// for headings; sans 400/500/600 for body/UI). Fewer weights = fewer
// preload bytes. `display: swap` keeps text visible during the load;
// `preload: true` on the wordmark italic makes the first paint use it.
const serif = EB_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  preload: true,
  // Local Georgia/Times fallback while the webfont swaps in. next/font
  // emits the size-adjust metrics automatically when adjustFontFallback
  // stays at its default; explicit override is left off so the
  // generated metrics aren't fighting a hand-picked fallback.
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

const sans = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
});

const SITE_URL = 'https://hoolah.hapinas.net';
const TAGLINE = 'guess the Filipino word';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'hoolah',
    template: '%s | hoolah',
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
  // Allow user zoom up to 5x. There are no <input> elements on the
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
  var s = raw ? JSON.parse(raw) : {};
  var pref = s.theme || 'system';
  var dark = pref === 'dark' || (pref === 'system' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  var locale = s.locale === 'fil' ? 'fil' : 'en';
  document.documentElement.setAttribute('data-locale', locale);
  document.documentElement.lang = locale;
  if (s.reducedMotion) {
    document.documentElement.setAttribute('data-reduced-motion', 'true');
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
