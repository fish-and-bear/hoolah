import type { Metadata } from 'next';
import SiteHeader from '@/components/brand/SiteHeader';
import SiteFooter from '@/components/brand/SiteFooter';
import AboutContent from '@/components/pages/AboutContent';

export const metadata: Metadata = {
  title: 'about',
  description: 'About hoolah, the daily Filipino word game.',
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
