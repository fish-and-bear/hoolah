# hoolah

A daily five-letter Tagalog word game. Five letters, six tries, one new word every midnight in Manila time.

Live site: [hoolah.hapinas.net](https://hoolah.hapinas.net)

## What this is

Wordle, in Tagalog. The mechanic is the one you already know. The contribution is the vocabulary: a hand-curated list of everyday Filipino words, every entry verified, with English glosses shown after each round so the game doubles as quiet language practice.

Built as a real product, not a demo. It is a Progressive Web App, runs entirely in the browser, ships zero analytics and zero third-party scripts, and works offline once installed.

## What is inside

- Next.js 15 App Router with `output: 'export'`, so the whole site builds to a static folder
- Tailwind CSS for layout and components
- An EB Garamond italic wordmark on an oxblood, ivory, ink and gold palette
- Deterministic, client-side daily-word selection (FNV-1a hash of the puzzle number, no server needed)
- localStorage-backed game state, stats, settings, and streak
- Hard mode, dark mode, reduced-motion mode, keyboard control, screen-reader announcements
- A service worker that pre-caches the app shell so an installed PWA opens offline
- Open Graph card, sitemap, robots, and a `Game` Schema.org JSON-LD blob

## Local development

Requires Node 20+ and pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

To build and inspect the static output:

```bash
pnpm build
pnpm exec serve out
```

To regenerate PWA icons (after a brand change):

```bash
node scripts/generate-icons.mjs
```

To validate the word lists:

```bash
node scripts/validate-wordlists.mjs
```

## How the daily word works

`EPOCH_DATE` in `src/lib/daily.ts` is set to 1 June 2026. The puzzle number for any given day is the count of days since the epoch (1-indexed). The answer for puzzle number `N` is `answers[fnv1a("hoolah:v1:" + N) mod answers.length]`. The hash keeps the sequence non-obvious; the determinism keeps every player on every device in sync without a server.

Manila time (`Asia/Manila`, UTC+8, no DST) is computed in the browser via `Intl.DateTimeFormat`, which means time-zone correctness does not depend on the host machine clock.

## Word lists

The answer list (`src/data/answers.json`) is hand-verified Tagalog. Every entry includes the part of speech and an English gloss. The acceptable-guess list (`src/data/guesses.json`) is broader and contains plausible five-letter Tagalog words a player might reach for. Latin alphabet, lowercase a-z only (no ñ, no diacritics) for v1 simplicity.

Corrections and additions go through GitHub issues. Please cite a source if you propose adding or removing a word.

## Deployment

See [DEPLOY.md](./DEPLOY.md).

## A note on the name

There is a dormant Singapore-based buy-now-pay-later brand also called Hoolah, acquired by ShopBack in 2021. Negligible risk of confusion with a Filipino word game in a different category and region; the maintainer has been informed and decided to proceed.

## License

MIT. See [LICENSE](./LICENSE).
