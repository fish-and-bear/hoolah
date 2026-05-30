# Contributing

Thanks for helping make hoolah better. This project is intentionally small:
static app, local browser storage, no accounts, no analytics, no backend.

## Local Setup

Use Node from `.node-version` and pnpm from `package.json`.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Before opening a pull request, run:

```bash
pnpm run ci
```

## Word Suggestions

Word changes need extra care because the answer list controls the daily
rotation for every player.

- Use the word-suggestion issue template first.
- Daily-answer candidates need `word`, `pos`, and a short English `gloss`.
- Accepted-guess-only words go in `src/data/guesses.json`.
- Every word must be exactly five lowercase `a-z` letters.
- Include a reproducible citation: dictionary entry, Wiktionary URL, news or
  literary use, textbook, or other source a maintainer can check.

Read `docs/CORPUS.md` before adding words. Run
`pnpm run validate` after editing either JSON file.

## Pull Requests

Keep PRs focused. A wordlist batch, a UI fix, and a dependency update should
usually be separate PRs.

The CI workflow runs wordlist validation, unit tests, typecheck, lint, and a
static production build. PRs should be green before merge.
