# hoolah

A daily five-letter Tagalog word game. Five letters, six tries, one new word every midnight in Manila time.

Live site: [hoolah.hapinas.net](https://hoolah.hapinas.net)

## What this is

Wordle, in Tagalog. The mechanic is the one you already know. The contribution is the vocabulary: a hand-reviewed list of everyday Filipino words, every answer verified, with English glosses shown after each round so the game doubles as quiet language practice.

Built as a real product, not a demo. It is a Progressive Web App, runs entirely in the browser, ships zero analytics and zero third-party scripts, and works offline once installed.

## What is inside

- Next.js 15 App Router with `output: 'export'`, so the whole site builds to a static folder
- Tailwind CSS for layout and components
- An EB Garamond italic wordmark on an oxblood, ivory, ink and gold palette
- Deterministic, client-side daily-word selection (seeded permutation, no server needed)
- localStorage-backed game state, stats, settings, and streak
- Hard mode, dark mode, reduced-motion mode, keyboard control, screen-reader announcements
- A service worker that pre-caches the app shell so an installed PWA opens offline
- Open Graph card, sitemap, robots, and a `Game` Schema.org JSON-LD blob

## Local development

Requires Node 20+ and pnpm. The deployed build uses the Node version pinned in `.node-version`.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev          # http://localhost:3000
```

To build and inspect the static output:

```bash
pnpm build
pnpm preview
```

To regenerate PWA icons (after a brand change):

```bash
node scripts/generate-icons.mjs
```

To validate the word lists:

```bash
node scripts/validate-wordlists.mjs
```

To run the full local gate used by CI:

```bash
pnpm run ci
```

## How the daily word works

`EPOCH_DATE` in `src/lib/daily.ts` is set to 30 May 2026. The puzzle number for any given day is the count of days since the epoch (1-indexed). The answer rotation is a deterministic Fisher-Yates shuffle of the answer indices, seeded by `fnv1a("hoolah:v1:permutation")`, then indexed by puzzle number. That guarantees every word appears once before the list repeats, while keeping the order non-obvious and identical on every device without a server.

Manila time (`Asia/Manila`, UTC+8, no DST) is computed in the browser via `Intl.DateTimeFormat`, which means time-zone correctness does not depend on the host machine clock.

## Word lists

The answer list (`src/data/answers.json`) is hand-reviewed Tagalog: 366 entries, each with a part of speech and a one-line English gloss. The acceptable-guess list (`src/data/guesses.json`) contains 2,757 accepted 5-letter Tagalog guesses total, including every answer word and 2,391 additional documented forms a player might reach for during play. Latin alphabet, lowercase a-z only; no ñ, no diacritics, for v1 simplicity.

The full provenance, criteria, and contribution path are documented in [docs/CORPUS.md](./docs/CORPUS.md). Read that before opening an issue to suggest a word.

## Deployment

See [DEPLOY.md](./DEPLOY.md).

## Contributing and Security

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and word-suggestion rules. Please report vulnerabilities privately; see [SECURITY.md](./SECURITY.md).

## A note on the name

There is a dormant Singapore-based buy-now-pay-later brand also called Hoolah, acquired by ShopBack in 2021. Negligible risk of confusion with a Filipino word game in a different category and region; the maintainer has been informed and decided to proceed.

## License

MIT. See [LICENSE](./LICENSE).
