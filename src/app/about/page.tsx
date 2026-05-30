import type { Metadata } from 'next';
import SiteHeader from '@/components/brand/SiteHeader';
import SiteFooter from '@/components/brand/SiteFooter';
import AboutContent from '@/components/pages/AboutContent';
import { OG_IMAGE, SEO_DESCRIPTION } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About the Filipino Wordle-Style Game',
  description:
    'About hoolah, a daily Tagalog word game made for Filipino language play and vocabulary learning.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About hoolah',
    description: SEO_DESCRIPTION,
    url: '/about',
    images: [OG_IMAGE],
  },
};

export default function About() {
  return (
    <>
      <SiteHeader />
      <AboutContent />
      <SiteFooter />
    </>
  );
}
