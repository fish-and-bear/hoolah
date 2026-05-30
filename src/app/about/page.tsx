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
          v1 ships 154 daily-answer words and 425 extra accepted guesses, all
          hand-curated. No corpus extraction, no scraped dictionary. The
          source is one Filipino speaker (the author) writing words she
          actually uses, checked against the orthography rule and the
          dictionaries she keeps for her linguistics work. A short list you
          can defend end-to-end beats a long list with inventions buried
          inside it.
        </p>
        <p className="mb-4">
          The full provenance — where each word came from, what criteria it
          had to meet, what the list is explicitly not, and how to suggest a
          missing word — lives in{' '}
          <a
            href="https://github.com/fish-and-bear/hoolah/blob/main/docs/CORPUS.md"
            target="_blank"
            rel="noreferrer"
          >
            docs/CORPUS.md
          </a>
          . Read it before opening an issue.
        </p>
        <p className="mb-4">
          The acceptable-guess list is broader than the daily-answer set.
          Naturalised loanwords from Spanish (kotse, plato, papel, karne) are
          accepted; recent English loans that have not naturalised are not.
          The alphabet is the 26-letter modern Filipino set; no ñ, no
          diacritics on tiles. A later release may add a diacritic-aware
          mode.
        </p>
        <p className="mb-4">
          Suggestions for additions, removals, or corrections go to{' '}
          <a
            href="https://github.com/fish-and-bear/hoolah/issues"
            target="_blank"
            rel="noreferrer"
          >
            the GitHub issue tracker
          </a>
          . Please cite a source.
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
          . Her published work on Filipino morphology —{' '}
          <a
            href="https://aclanthology.org/2024.paclic-1.64/"
            target="_blank"
            rel="noreferrer"
          >
            Comparative Analysis of Tagalog Stemmers (PACLIC 38, Tokyo)
          </a>
          {' '}— is the reason she cared about a clean five-letter Tagalog
          dataset enough to type one out by hand. The codebase is MIT-licensed
          and lives at{' '}
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
