import type { Metadata } from 'next';
import SiteHeader from '@/components/brand/SiteHeader';
import SiteFooter from '@/components/brand/SiteFooter';

export const metadata: Metadata = {
  title: 'about',
  description: 'About hoolah, the daily Filipino word game.',
};

export default function About() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-prose px-5 sm:px-6 py-10 prose-style">
        <h1 className="font-serif text-4xl font-bold mb-6">about hoolah</h1>

        <p className="mb-4">
          hoolah is a phonetic spelling of <em>hula</em>, the Tagalog word for{' '}
          <em>to guess</em>. International players who already know hula as the
          Hawaiian dance get a second meaning for free. Filipino speakers
          should hear the homophone the first time they read the name. Either
          way, you are here to guess.
        </p>

        <p className="mb-4">
          The rules are the rules. Five letters, six tries, one new word every
          midnight in Manila time. Wordle did the work of teaching the world
          this shape; the contribution here is the vocabulary.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
          why a Tagalog word game
        </h2>
        <p className="mb-4">
          There are over eighty million Tagalog speakers, and the New York
          Times Wordle has been ported into dozens of languages. A daily
          Filipino edition is one of the obvious gaps. The point is small but
          worth saying: the words you grow up reading and writing should be
          allowed to be entertainment, not only homework.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
          the word list
        </h2>
        <p className="mb-4">
          The answer list is curated by hand. Every word in it is a real
          everyday Tagalog word, verified from common-knowledge usage and
          standard dictionaries. The list ships small on purpose. A short list
          of words you can actually defend beats a long list with one or two
          inventions buried inside it.
        </p>
        <p className="mb-4">
          The acceptable-guess list is broader. It contains plausible
          five-letter Tagalog words you might reach for during play, even if
          they are not in the daily-answer rotation. Loanwords from Spanish
          and English that have become standard Tagalog (kotse, plato, papel,
          karne) are accepted; words that have never naturalised are not.
        </p>
        <p className="mb-4">
          The alphabet is the 26-letter modern Filipino set. No ñ, no
          diacritics on tiles. That is a deliberate v1 simplification — the
          full orthography includes both, and a later release may add a
          separate diacritic-aware mode. Until then, take it as a constraint
          like Wordle's English-only one: it makes the daily a tighter puzzle,
          not a comprehensive dictionary exercise.
        </p>
        <p className="mb-4">
          The list will grow. Suggestions for additions, removals, or
          corrections go to{' '}
          <a
            href="https://github.com/fish-and-bear/hoolah/issues"
            target="_blank"
            rel="noreferrer"
          >
            the GitHub issue tracker
          </a>
          . If you flag a word, please cite a source.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
          how the daily word gets picked
        </h2>
        <p className="mb-4">
          The puzzle number is the count of days since 1 June 2026, the day
          this site launched. The word for a given puzzle number is selected
          by a stable hash of that number into the answer array, so day 42 is
          the same word for every player on every device. Computation happens
          in the browser; the site does not need a server to know what today
          is.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
          what is not here
        </h2>
        <p className="mb-4">
          No accounts. No leaderboards. No analytics, no telemetry, no
          tracking pixels, no third-party scripts at all. Your streak and your
          stats live in your browser's localStorage and stay there. There is
          no email collection, no notification permission prompt, no ad
          server. If you want a daily reminder, install the site as a PWA on
          your phone (Share, then Add to Home Screen) and treat it like any
          other app.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-3">who made it</h2>
        <p className="mb-4">
          hoolah is built and maintained by{' '}
          <a
            href="https://angelicanaguio.com"
            target="_blank"
            rel="noreferrer"
          >
            Angelica Naguio
          </a>
          , whose published work on Filipino morphology (PACLIC 38, Tokyo) was
          the original reason for caring about a clean five-letter Tagalog
          dataset. The codebase is MIT-licensed and lives at{' '}
          <a
            href="https://github.com/fish-and-bear/hoolah"
            target="_blank"
            rel="noreferrer"
          >
            github.com/fish-and-bear/hoolah
          </a>
          .
        </p>

        <p
          className="mt-10 text-sm italic"
          style={{ color: 'var(--hoolah-muted)' }}
        >
          A note on the name: there is a dormant Singapore-based
          buy-now-pay-later brand also called Hoolah, acquired by ShopBack in
          2021. No confusion expected with a Filipino word game; raised and
          decided.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
