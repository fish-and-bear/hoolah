'use client';

import { useLocale } from '@/components/i18n/useLocale';

const SUGGESTION_URL =
  'https://github.com/fish-and-bear/hoolah/issues/new?template=word_suggestion.yml';

export default function AboutContent() {
  const { copy } = useLocale();
  const page = copy.pages.about;

  return (
    <main className="prose-style mx-auto w-full max-w-[42rem] flex-1 px-5 py-8 sm:px-6 sm:py-10 md:py-12">
      <h1 className="mb-6 font-serif text-3xl font-bold leading-tight sm:text-4xl">
        {page.title}
      </h1>

      <p className="mb-4">
        {page.introBeforeHula} <em>hula</em>
        {page.introAfterHula} <em>{page.introGuess}</em>
        {page.introRest}
      </p>

      <p className="mb-4">{page.knownGame}</p>

      <h2 className="mb-3 mt-9 font-serif text-2xl font-bold leading-tight sm:mt-10">
        {page.whyHeading}
      </h2>
      <p className="mb-4">{page.why}</p>

      <p className="mb-4">
        {page.selectiveBeforeLink}{' '}
        <a href={SUGGESTION_URL} target="_blank" rel="noreferrer">
          {page.suggestionLink}
        </a>{' '}
        {page.selectiveAfterLink}
      </p>
    </main>
  );
}
