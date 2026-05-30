# Where the words come from

This document covers how the v1 word lists were assembled, what each word had to satisfy to ship, what the lists are explicitly *not*, and how to suggest a correction or an addition.

## What's in the repo

Two files under `src/data/`:

- `answers.json`: 311 entries. Every entry has a `word`, a part of speech (`pos`), a one-line English `gloss`, and an optional `note` for words with a meaning or context that a one-line gloss would flatten. These are the words that can appear as the daily answer.
- `guesses.json`: 627 accepted guesses total, including every answer word and 316 additional words that are accepted during play but never selected as the answer. Plain strings; no gloss. The runtime accepts the union of the two lists as legal guesses (627 words total).

Both files are validated at build time by `scripts/validate-wordlists.mjs`: every entry has to be 5 lowercase a–z letters, no duplicates within a list, and every `answers.json` word must also appear in (or be unioned into) the guess set.

## Where the words actually came from

The honest answer, said plainly: **v1 is hand-reviewed by the author from active Tagalog vocabulary and researched candidate lists**, cross-checked against the dictionaries and references she keeps for her linguistics work. The launch lists were not extracted from a tagged corpus, scraped from Wiktionary, or imported from KWF's *Diksiyonaryo ng Wikang Filipino*. Later additions may start from public lexical references or player suggestions, but they still only ship after manual review against the criteria below.

For a v1 daily word game, that is a defensible source. It also has to be stated and not hidden. A reviewed list curated by someone who actually speaks the language beats a long list pulled from a corpus that no one has read end-to-end.

The author's published work on Filipino morphology, [Comparative Analysis of Tagalog Stemmers (PACLIC 38, Tokyo, 2024)](https://aclanthology.org/2024.paclic-1.64/), and the related `explorer.hapinas.net` lexical data project are the *motivation* for caring about a clean Tagalog dataset. They are not the source of the original launch strings.

Future versions will integrate named external sources. Candidates, in roughly the order they would be incorporated:

- Tagalog Wiktionary, restricted to entries marked as Tagalog and filtered to length-5 lemmas in modern Filipino orthography. Public, attributable, easy to diff against.
- KWF's *Diksiyonaryo ng Wikang Filipino* headword list, where the headwords are length-5 and freely citable. Authoritative for modern Filipino spelling.
- The `explorer.hapinas.net` Tagalog lexical database, once its export is stable and its provenance is itself documented at the same level of detail as this file.
- A `data/sources.json` registry so each answer can carry a per-entry source tag once the v2 lists exist.

Until formal source tags land, the source for every shipped word in this repository is: reviewed by one Filipino speaker, sitting down with a text editor and accepting only words she is willing to defend.

## What each word had to meet

Every entry in `answers.json` had to satisfy all of these:

- **Exactly 5 lowercase a–z letters.** Enforced by the validator.
- **Standard modern Filipino orthography.** The 26-letter Latin alphabet adopted by the Komisyon sa Wikang Filipino. No ñ, no diacritics, no apostrophes, no hyphens. This rules out a number of valid Tagalog words (`niño`, `da'wah`, `na-iiwan`) that a future diacritic-aware mode could pick up.
- **Familiar to a competent everyday speaker.** Words a Filipino adult would recognise without a dictionary. No obscure archaisms, no specialist jargon, no slang that only travels in one region.
- **Naturalised loanwords are in scope.** Spanish-origin words that have become part of standard Tagalog (`kotse`, `plato`, `papel`, `karne`, `bayad`) are in. Recent English loans that have not naturalised are not.
- **One canonical spelling.** Where Tagalog tolerates spelling variants (e.g. `kotse` vs the older `coche`), the entry uses the form currently taught in Filipino-medium schools.
- **A real English gloss.** Not a translation in scare quotes. If a word has no clean one-line English equivalent (`kilig`, `tampo`, `bayanihan`), the gloss says so and the `note` field gives the reader a real handhold.

`guesses.json` is broader. It contains plausible 5-letter Tagalog words a player might reach for during play: common nouns, verbs, adjectives, particles, place names, naturalised loans, and a few common colloquial forms that did not make the daily-answer cut. Same orthographic constraints apply, but no `pos` and no gloss are required because these words never surface in the result modal.

## What this list is not

- **Not a dictionary.** It does not aim for lexicographic coverage. Many valid 5-letter Tagalog words are absent on purpose, either because they did not meet the modern-orthography rule or because the author did not reach for them while curating.
- **Not an authority.** A word being absent from `answers.json` is not a claim that the word is wrong. A word being present is not a claim that the gloss is the only correct English rendering.
- **Not a corpus.** No frequency data, no concordance, no part-of-speech ambiguity resolution beyond the single `pos` tag per entry. A real corpus contribution would live in a separate repository under proper data-release terms.
- **Not regional.** The list does not attempt to represent every Filipino language. It is Tagalog-leaning standard Filipino as used in Metro Manila print and broadcast media. Cebuano, Ilokano, Hiligaynon, Kapampangan, and the other Philippine languages each deserve their own version of this game.
- **Not final.** The list will shift as suggestions land and the author finds words she missed.

## How to suggest a word

Open an issue at [github.com/fish-and-bear/hoolah/issues](https://github.com/fish-and-bear/hoolah/issues) with the word, a one-line gloss, a part of speech tag, and a citation. A citation can be a dictionary entry, a Wiktionary URL, a news article, a literary use, a textbook page, or anything reproducible that lets the maintainer confirm the word exists in the form you've spelled it.

The current review path is one person:

1. You open an issue with the word and a citation.
2. The maintainer (Angelica) reads it, checks the spelling against the modern-orthography rule, and either accepts the suggestion, asks a question, or declines with a reason.
3. Accepted entries go in via a small PR that updates the JSON files and re-runs the validator. The next deploy ships them.

There is no automation and no batched intake yet. That is fine for the scale of suggestions a small launch attracts. If volume picks up, the path becomes a `data/suggestions.md` queue and weekly batches; until then, GitHub issues handle it.

## Stability of the rotation

The order in which answers appear as daily puzzles is a deterministic Fisher-Yates shuffle of `answers.json`, seeded by the constant string `hoolah:v1:permutation` and computed against `answers.length`. Two consequences worth knowing:

- Inserting or removing a word in `answers.json` reshuffles every day from that point forward. Day 42 yesterday is not day 42 after the edit.
- Renaming or correcting a word in place (without changing the list length) keeps the rotation order intact, but day N is now a different word for any player who has already seen the old day N.

Both of those are facts about the rotation, not the wordlist content. The contract the game makes with players is: today's word is the same word for everyone on every device. Edits to the answer list keep that contract for tomorrow, but they break it retroactively. Edits get batched and timed accordingly.

## A short history

Initial v1 list: 154 answers, 425 accepted guesses total (271 beyond the answer list). Hand-curated over a single weekend in May 2026 by [Angelica Naguio](https://angelicanaguio.com) ahead of the 30 May 2026 launch. All entries reviewed against the criteria above before commit.

30 May 2026 expansion: 311 answers, 627 accepted guesses total (316 beyond the answer list). Added 157 researched daily-answer candidates and 45 accepted guess-only words, all reviewed against the same 5-letter, modern-orthography, everyday-play criteria.

This document is the source of truth for "where do the words come from." If a contributor, journalist, recruiter, or curious player asks, point them here.
