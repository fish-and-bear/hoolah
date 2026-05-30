import type { Metadata } from 'next';
import SiteHeader from '@/components/brand/SiteHeader';
import SiteFooter from '@/components/brand/SiteFooter';
import RulesContent from '@/components/pages/RulesContent';

export const metadata: Metadata = {
  title: 'rules',
  description: 'How to play hoolah, including hard mode and shortcuts.',
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
