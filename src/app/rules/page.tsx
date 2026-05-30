import type { Metadata } from 'next';
import SiteHeader from '@/components/brand/SiteHeader';
import SiteFooter from '@/components/brand/SiteFooter';
import RulesContent from '@/components/pages/RulesContent';
import { OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How to Play the Filipino Wordle-Style Game',
  description:
    'How to play hoolah, the daily Tagalog word game: five letters, six tries, tile colors, hard mode, and shortcuts.',
  alternates: { canonical: '/rules' },
  openGraph: {
    title: 'How to play hoolah',
    description:
      'Rules for hoolah, the daily Filipino Wordle-style Tagalog word game.',
    url: '/rules',
    images: [OG_IMAGE],
  },
};

export default function Rules() {
  return (
    <>
      <SiteHeader />
      <RulesContent />
      <SiteFooter />
    </>
  );
}
