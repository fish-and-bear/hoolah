'use client';

import { useLocale } from '@/components/i18n/useLocale';

export default function RulesContent() {
  const { copy } = useLocale();
  const page = copy.pages.rules;

  return (
    <main className="prose-style mx-auto w-full max-w-[42rem] flex-1 px-5 py-8 sm:px-6 sm:py-10 md:py-12">
      <h1 className="mb-6 font-serif text-3xl font-bold leading-tight sm:text-4xl">
        {page.title}
      </h1>

      <p className="mb-4">{page.intro}</p>

      <ul className="list-disc pl-5 mb-6 flex flex-col gap-1">
        <li>
          <b>{page.green}</b>: {page.greenDesc}
        </li>
        <li>
          <b>{page.yellow}</b>: {page.yellowDesc}
        </li>
        <li>
          <b>{page.grey}</b>: {page.greyDesc}
        </li>
      </ul>

      <p className="mb-4">{page.repeats}</p>

      <h2 className="font-serif text-2xl font-bold mt-8 mb-3 leading-tight">
        {page.hardHeading}
      </h2>
      <p className="mb-4">{page.hard}</p>

      <h2 className="font-serif text-2xl font-bold mt-8 mb-3 leading-tight">
        {page.oneHeading}
      </h2>
      <p className="mb-4">{page.one}</p>

      <h2 className="font-serif text-2xl font-bold mt-8 mb-3 leading-tight">
        {page.accessibilityHeading}
      </h2>
      <ul className="list-disc pl-5 mb-4 flex flex-col gap-1">
        {page.accessibility.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2 className="font-serif text-2xl font-bold mt-8 mb-3 leading-tight">
        {page.shortcutsHeading}
      </h2>
      <ul className="list-disc pl-5 mb-4 flex flex-col gap-1">
        <li>
          <kbd className="border px-1 rounded">A</kbd>{' '}
          <span style={{ color: 'var(--hoolah-muted)' }}>{page.through}</span>{' '}
          <kbd className="border px-1 rounded">Z</kbd>: {page.typeLetter}
        </li>
        <li>
          <kbd className="border px-1 rounded">Enter</kbd>: {page.submitGuess}
        </li>
        <li>
          <kbd className="border px-1 rounded">Backspace</kbd>:{' '}
          {page.deleteLetter}
        </li>
        <li>
          <kbd className="border px-1 rounded">Esc</kbd>: {page.closeModal}
        </li>
      </ul>
    </main>
  );
}
