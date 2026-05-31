# hoolah

A daily five-letter Tagalog word game. Five letters, six tries, one new word every midnight.

Live site: [hoolah.hapinas.net](https://hoolah.hapinas.net)

## What this is

Wordle, in Tagalog.

It is a Progressive Web App, which runs entirely in the browser, has zero analytics and zero third-party scripts, and works offline once installed.

## What is inside

- Next.js 15 App Router with `output: 'export'`, so the whole site builds to a static folder
- Tailwind CSS for layout and components
- Deterministic, client-side daily-word selection (seeded permutation, no server needed)
- localStorage-backed game state, stats, settings, and streak
- Local-midnight daily reset, hard mode, dark mode, reduced-motion mode, keyboard control, screen-reader announcements
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

`EPOCH_DATE` in `src/lib/daily.ts` is set to 30 May 2026. The puzzle number for any given day is the count of days since the epoch (1-indexed). The answer rotation is controlled by `src/data/rotation.json`; each epoch names a seed, a start puzzle, and the answer count it locks. Within an epoch, the game uses a deterministic Fisher-Yates shuffle of those answer indices. That guarantees every word appears once before the epoch repeats, while keeping the order non-obvious and identical on every device without a server.

When the daily answer list grows, add a new rotation epoch instead of editing an old one. That keeps already-played puzzle numbers stable.

The daily word changes at the player's local midnight. Before the app advances the stored daily date, it asks the same static host for a `Date` header and uses that trusted instant with the player's current time zone. That blocks normal OS clock fast-forwarding from revealing tomorrow's puzzle. It is still a static app, so someone with devtools, source access, or cleared site data can bypass client-side protections.

## Word lists

The answer list (`src/data/answers.json`) is hand-reviewed Tagalog: 366 entries, each with a part of speech and a one-line English gloss. The acceptable-guess list (`src/data/guesses.json`) contains 2,757 accepted 5-letter Tagalog guesses total, including every answer word and 2,391 additional documented forms a player might reach for during play. Latin alphabet, lowercase a-z only; no ñ, no diacritics, for v1 simplicity.

The full provenance, criteria, and contribution path are documented in [docs/CORPUS.md](./docs/CORPUS.md).

## Deployment

See [DEPLOY.md](./DEPLOY.md).

## Contributing and Security

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and word-suggestion rules. Please report vulnerabilities privately; see [SECURITY.md](./SECURITY.md).

## License

MIT. See [LICENSE](./LICENSE).
