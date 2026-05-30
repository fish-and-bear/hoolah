import Game from '@/components/game/Game';
import SiteFooter from '@/components/brand/SiteFooter';

export default function Home() {
  return (
    <>
      <Game />
      <noscript>
        <main className="mx-auto flex flex-1 flex-col justify-center px-5 py-10 text-center">
          <h1 className="font-serif text-5xl font-bold italic">hoolah</h1>
          <p className="mx-auto mt-4 max-w-md">
            Play a daily Filipino Wordle-style Tagalog word game. Five
            letters, six tries, one new word at midnight.
          </p>
          <p className="mx-auto mt-3 max-w-md">
            hoolah needs JavaScript to run the board, keyboard, stats, and
            daily puzzle.
          </p>
        </main>
      </noscript>
      <SiteFooter />
    </>
  );
}
