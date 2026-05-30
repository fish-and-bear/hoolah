import type { Metadata } from 'next';
import SiteHeader from '@/components/brand/SiteHeader';
import SiteFooter from '@/components/brand/SiteFooter';

export const metadata: Metadata = {
  title: 'rules',
  description: 'How to play hoolah, including hard mode and shortcuts.',
};

export default function Rules() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-prose px-5 sm:px-6 py-10">
        <h1 className="font-serif text-4xl font-bold mb-6">rules</h1>

        <p className="mb-4">
          Guess the five-letter Tagalog word in six tries. After each guess,
          each tile recolours to show how close you were.
        </p>

        <ul className="list-disc pl-5 mb-6 flex flex-col gap-1">
          <li>
            <b>Green</b>: right letter, right spot.
          </li>
          <li>
            <b>Yellow</b>: right letter, wrong spot.
          </li>
          <li>
            <b>Grey</b>: not in the word.
          </li>
        </ul>

        <p className="mb-4">
          A word with a repeated letter only colours the tiles that match.
          Guessing two of a letter when the answer only has one will paint one
          tile green or yellow and the other grey.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-3">hard mode</h2>
        <p className="mb-4">
          Toggle it in settings. Once on, every revealed green tile must be
          reused in its slot and every revealed yellow letter must appear
          somewhere in your next guess. Hard mode can only be toggled before
          you start the daily, or between days.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
          one word a day
        </h2>
        <p className="mb-4">
          A new daily word goes live at midnight Manila time (UTC+8). The
          countdown to the next word shows up in the result modal after you
          finish. Free play is available from the settings panel for extra
          rounds; free-play games do not affect the daily streak or stats.
        </p>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
          accessibility
        </h2>
        <ul className="list-disc pl-5 mb-4 flex flex-col gap-1">
          <li>
            All controls are operable from a physical keyboard. Tab moves
            focus; the focus ring uses the oxblood accent on a 2px outline.
          </li>
          <li>
            Tile colour changes and important toasts are announced through a
            polite live region.
          </li>
          <li>
            Reduced motion is honoured automatically when your system asks for
            it, and can be forced on in settings regardless of the system
            preference.
          </li>
          <li>
            Dark mode mirrors the brand palette with a gold accent and a
            higher-contrast ivory text on ink background.
          </li>
        </ul>

        <h2 className="font-serif text-2xl font-bold mt-8 mb-3">shortcuts</h2>
        <ul className="list-disc pl-5 mb-4 flex flex-col gap-1">
          <li>
            <kbd className="border px-1 rounded">A</kbd>{' '}
            <span style={{ color: 'var(--hoolah-muted)' }}>through</span>{' '}
            <kbd className="border px-1 rounded">Z</kbd> — type a letter
          </li>
          <li>
            <kbd className="border px-1 rounded">Enter</kbd> — submit your
            guess
          </li>
          <li>
            <kbd className="border px-1 rounded">Backspace</kbd> — delete the
            last letter
          </li>
          <li>
            <kbd className="border px-1 rounded">Esc</kbd> — close any open
            modal
          </li>
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
