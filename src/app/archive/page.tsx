import type { Metadata } from 'next';

import SiteHeader from '@/components/brand/SiteHeader';
import SiteFooter from '@/components/brand/SiteFooter';
import ArchiveContent from '@/components/pages/ArchiveContent';
import { OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Past Daily Tagalog Words',
  description:
    'Browse the last 30 daily hoolah answers from the Filipino Wordle-style Tagalog word game.',
  alternates: { canonical: '/archive' },
  openGraph: {
    title: 'Past hoolah words',
    description:
      'The recent answer archive for hoolah, a daily Tagalog word game.',
    url: '/archive',
    images: [OG_IMAGE],
  },
};

export default function Archive() {
  return (
    <>
      <SiteHeader />
      <ArchiveContent />
      <SiteFooter />
    </>
  );
}
