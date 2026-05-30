import type { Metadata } from 'next';

import SiteHeader from '@/components/brand/SiteHeader';
import SiteFooter from '@/components/brand/SiteFooter';
import ArchiveContent, {
  type ArchiveItem,
} from '@/components/pages/ArchiveContent';
import answersData from '@/data/answers.json';
import { EPOCH_DATE, answerIndexFor } from '@/lib/daily';
import type { AnswerEntry } from '@/lib/types';

export const metadata: Metadata = {
  title: 'archive',
  description: 'Past daily hoolah words, last 30 days.',
};

// The archive is generated at build time. The build date is the
// 'today' used to compute the trailing 30 days, which means
// freshly-deployed pages will be at most one day behind the live
// daily for ~24h. That's acceptable for a free-tier static site;
// the game itself uses client time and stays correct.
function buildList() {
  const [ey, em, ed] = EPOCH_DATE.split('-').map(Number);
  const epochUtc = Date.UTC(ey, em - 1, ed);
  const nowUtc = Date.now();
  const todayOffset = Math.floor((nowUtc - epochUtc) / 86_400_000);
  const answers = answersData as AnswerEntry[];
  const items: ArchiveItem[] = [];
  // Show every day from launch up to 'today at build', capped to 30.
  const start = Math.max(0, todayOffset - 29);
  for (let off = todayOffset; off >= start; off--) {
    const puzzleNumber = off + 1;
    const date = new Date(epochUtc + off * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const entry = answers[answerIndexFor(puzzleNumber, answers.length)];
    items.push({ date, puzzleNumber, entry });
  }
  return items;
}

export default function Archive() {
  const items = buildList();
  return (
    <>
      <SiteHeader />
      <ArchiveContent items={items} />
      <SiteFooter />
    </>
  );
}
