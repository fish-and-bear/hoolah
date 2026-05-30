import type { HardModeViolation } from './game';
import type { Locale } from './types';

type Widen<T> = T extends string
  ? string
  : T extends (...args: infer Args) => infer Return
    ? (...args: Args) => Return
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

function ordinalEn(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

const en = {
  meta: {
    localeName: 'English',
    shortName: 'EN',
    htmlLang: 'en',
    intlLocale: 'en-US',
  },
  common: {
    close: 'close',
    language: 'Language',
    english: 'English',
    filipino: 'Filipino',
    homeAria: 'hoolah, home',
  },
  footer: {
    about: 'about',
    rules: 'rules',
    archive: 'archive',
    madeBy: 'made by',
  },
  languageToggle: {
    label: 'Interface language',
    setEnglish: 'Use English',
    setFilipino: 'Use Filipino',
  },
  title: {
    preview: 'preview',
    tagline:
      'guess the Filipino word. five letters, six tries, one new one every day.',
    play: 'play',
  },
  game: {
    preview: 'preview',
    howToPlay: 'how to play',
    stats: 'stats',
    settings: 'settings',
    notEnoughLetters: 'Not enough letters',
    notInWordList: 'Not in word list',
    winOne: 'In one. The dream guess.',
    solvedIn: (tries: number) => `Solved in ${tries}.`,
    wordWas: (word: string) => `The word was ${word}.`,
    finishTodayFirst: "Finish today's puzzle to change hard mode.",
    hardModeLockedSlot: (position: number, letter: string) =>
      `${ordinalEn(position)} letter must be ${letter}`,
    hardModeMissingLetter: (letter: string) => `Guess must use ${letter}`,
  },
  board: {
    label: 'hoolah game board',
    rowAnnouncement: (row: number, result: string) => `Row ${row}: ${result}`,
    doneRow: (row: number, word: string) => `guess ${row}: ${word}`,
    activeRow: (row: number, current: number, total: number) =>
      `guess ${row}: in progress, ${current} of ${total} letters`,
    emptyRow: (row: number) => `guess ${row}: empty`,
    states: {
      correct: 'correct',
      present: 'present',
      absent: 'absent',
    },
  },
  keyboard: {
    label: 'on-screen keyboard',
    submit: 'submit guess',
    delete: 'delete letter',
    letter: (letter: string) => `letter ${letter}`,
    enter: 'enter',
  },
  help: {
    title: 'how to play',
    intro: 'Guess the Tagalog word in six tries.',
    steps: [
      'Type any five-letter Filipino word and press enter.',
      'The tiles flip to show how close you were.',
      'Use what you learn for the next guess.',
    ],
    tileColours: 'Tile colors',
    correctExample: 'is in the word and in the right spot.',
    presentExample: 'is in the word but somewhere else.',
    absentExample: 'None of these letters are in the word.',
    footerBeforeLink:
      'A new word every day at midnight, Manila time. Only the 26-letter Latin alphabet (no diacritics). See',
    footerLink: '/rules',
    footerAfterLink: 'for hard mode and accessibility notes.',
  },
  settings: {
    title: 'settings',
    hardMode: 'Hard mode',
    hardModeSub: 'Revealed letters must be used in every later guess.',
    hardModeLocked: "Finish today's puzzle to change this.",
    darkMode: 'Dark mode',
    darkModeSub: 'Inverted oxblood; gold accent.',
    reducedMotion: 'Reduced motion',
    reducedMotionSub: 'Skip tile flips, shake, bounce.',
    language: 'Language',
    languageSub: 'Choose the language for the whole interface.',
  },
  end: {
    winOneHeadline: 'one try.',
    winHeadline: (tries: number) => `nailed it in ${tries}.`,
    lossHeadline: 'maybe tomorrow.',
    fastSubhead: 'A clean solve.',
    winSubhead: 'A solve is a solve.',
    lossSubhead: 'The streak resets at midnight Manila time.',
    streakAlive: (days: number) => `Streak alive at ${days} days.`,
    streakRecord: (days: number) =>
      `Your ${days}-day streak is on the record. The next one starts tomorrow.`,
    next: 'Next hoolah',
    copyResult: 'Copy result',
    copied: 'Copied to clipboard.',
    shared: 'Shared.',
    copyFailed: 'Copy failed. Try again.',
  },
  stats: {
    played: 'played',
    winPct: 'win %',
    streak: 'streak',
    max: 'max',
    distribution: 'GUESS DISTRIBUTION',
    rowAria: (tries: number, count: number) =>
      `Won in ${tries} ${tries === 1 ? 'try' : 'tries'}: ${count} ${
        count === 1 ? 'game' : 'games'
      }`,
  },
  pages: {
    about: {
      title: 'about hoolah',
      introBeforeHula: 'I called it hoolah because it sounds like',
      introAfterHula: ', the Tagalog word for',
      introGuess: 'to guess',
      introRest:
        '. If hula reminds you of the Hawaiian dance, then nice, you get the second meaning too. Either way, you are here to guess.',
      knownGame:
        'The game is the one everyone already knows: five letters, six tries, a fresh word at midnight.',
      whyHeading: 'why a Tagalog word game',
      why:
        'There are more than eighty million Tagalog speakers. Wordle has been remade in so many languages that a Filipino one felt overdue. And my advocacy is to make Filipino languages fun.',
      selectiveBeforeLink:
        'The list is small on purpose. I would rather be selective than let a fake or flimsy word slip in. If a word is missing,',
      suggestionLink: 'open a suggestion',
      selectiveAfterLink:
        'with the word, what it means, its part of speech, and a source I can check.',
    },
    rules: {
      title: 'rules',
      intro:
        'Guess the five-letter Tagalog word in six tries. After each guess, each tile recolors to show how close you were.',
      green: 'Green',
      greenDesc: 'right letter, right spot.',
      yellow: 'Yellow',
      yellowDesc: 'right letter, wrong spot.',
      grey: 'Grey',
      greyDesc: 'not in the word.',
      repeats:
        'A word with a repeated letter only colors the tiles that match. Guessing two of a letter when the answer only has one will paint one tile green or yellow and the other grey.',
      hardHeading: 'hard mode',
      hard:
        'Toggle it in settings. Once on, every revealed green tile must be reused in its slot and every revealed yellow letter must appear somewhere in your next guess. Hard mode can only be toggled before you start the daily, or between days.',
      oneHeading: 'one word a day',
      one:
        'A new daily word goes live at midnight Manila time (UTC+8). The countdown to the next word shows up in the result modal after you finish. There is only one playable puzzle each day.',
      accessibilityHeading: 'accessibility',
      accessibility: [
        'All controls are operable from a physical keyboard. Tab moves focus; the focus ring uses the oxblood accent on a 2px outline.',
        'Tile color changes and important toasts are announced through a polite live region.',
        'Reduced motion is honored automatically when your system asks for it, and can be forced on in settings regardless of the system preference.',
        'Dark mode mirrors the brand palette with a gold accent and a higher-contrast ivory text on ink background.',
      ],
      shortcutsHeading: 'shortcuts',
      through: 'through',
      typeLetter: 'type a letter',
      submitGuess: 'submit your guess',
      deleteLetter: 'delete the last letter',
      closeModal: 'close any open modal',
    },
    archive: {
      title: 'archive',
      summary: (count: number) =>
        `The last ${count} hoolah words. The most recent entry is at the top.`,
      emptyBeforeDate: 'The archive is empty until day one. Come back after',
      hidden:
        "The archive only shows past words. Today's puzzle stays hidden until you solve it (or run out of tries).",
    },
    notFound: {
      message: 'Page not in the word list.',
      back: 'back to the game',
    },
  },
} as const;

type AppCopyShape = Widen<typeof en>;

export const COPY = {
  en: en as AppCopyShape,
  fil: {
    meta: {
      localeName: 'Filipino',
      shortName: 'FIL',
      htmlLang: 'fil',
      intlLocale: 'fil-PH',
    },
    common: {
      close: 'isara',
      language: 'Wika',
      english: 'English',
      filipino: 'Filipino',
      homeAria: 'hoolah, bumalik sa paglalaro',
    },
    footer: {
      about: 'tungkol',
      rules: 'paano laruin',
      archive: 'arkibo',
      madeBy: 'gawa ni',
    },
    languageToggle: {
      label: 'Wika ng interface',
      setEnglish: 'Gamitin ang English',
      setFilipino: 'Gamitin ang Filipino',
    },
    title: {
      preview: 'silip',
      tagline:
        'hulaan ang salitang Filipino. limang letra, anim na subok, bagong salita araw-araw.',
      play: 'maglaro',
    },
    game: {
      preview: 'silip',
      howToPlay: 'paano laruin',
      stats: 'estadistika',
      settings: 'mga setting',
      notEnoughLetters: 'Kulang ang letra',
      notInWordList: 'Wala sa listahan',
      winOne: 'Isang hula lang. Ang galing.',
      solvedIn: (tries: number) => `Nakuha sa ${tries}.`,
      wordWas: (word: string) => `Ang salita ay ${word}.`,
      finishTodayFirst:
        'Tapusin muna ang puzzle ngayon bago palitan ang mahirap na mode.',
      hardModeLockedSlot: (position: number, letter: string) =>
        `Dapat ${letter} ang ika-${position} letra`,
      hardModeMissingLetter: (letter: string) => `Dapat gamitin ang ${letter}`,
    },
    board: {
      label: 'board ng hoolah',
      rowAnnouncement: (row: number, result: string) =>
        `Hilera ${row}: ${result}`,
      doneRow: (row: number, word: string) => `hula ${row}: ${word}`,
      activeRow: (row: number, current: number, total: number) =>
        `hula ${row}: kasalukuyan, ${current} sa ${total} letra`,
      emptyRow: (row: number) => `hula ${row}: walang laman`,
      states: {
        correct: 'tama',
        present: 'nasa salita pero ibang puwesto',
        absent: 'wala',
      },
    },
    keyboard: {
      label: 'keyboard sa screen',
      submit: 'magpasa ang hula',
      delete: 'burahin ang letra',
      letter: (letter: string) => `letrang ${letter}`,
      enter: 'enter',
    },
    help: {
      title: 'paano laruin',
      intro: 'Hulaan ang salitang Tagalog sa loob ng anim na subok.',
      steps: [
        'Mag-type ng kahit anong limang-letrang salitang Filipino at pindutin ang enter.',
        'Iikot ang mga tile para ipakita kung gaano ka kalapit.',
        'Gamitin ang natutuhan mo sa susunod na hula.',
      ],
      tileColours: 'Kulay ng tile',
      correctExample: 'ay nasa salita at nasa tamang puwesto.',
      presentExample: 'ay nasa salita pero nasa ibang puwesto.',
      absentExample: 'Wala sa salita ang mga letrang ito.',
      footerBeforeLink:
        'May bagong salita araw-araw tuwing hatinggabi, oras ng Maynila. Alpabetong Latin na may 26 letra lang muna (walang tuldik). Basahin ang',
      footerLink: '/rules',
      footerAfterLink: 'para sa mahirap na mode at tala sa pagiging accessible.',
    },
    settings: {
      title: 'mga setting',
      hardMode: 'Mahirap na mode',
      hardModeSub: 'Kailangang gamitin ang mga letrang lumabas sa bawat kasunod na hula.',
      hardModeLocked: 'Tapusin muna ang puzzle ngayon bago ito palitan.',
      darkMode: 'Madilim na mode',
      darkModeSub: 'Madilim na tema na may gintong accent.',
      reducedMotion: 'Kaunting galaw',
      reducedMotionSub: 'Tanggalin ang tile flip, shake, at bounce.',
      language: 'Wika',
      languageSub: 'Piliin ang wika ng buong interface.',
    },
    end: {
      winOneHeadline: 'isang subok.',
      winHeadline: (tries: number) => `nakuha sa ${tries}.`,
      lossHeadline: 'bukas ulit.',
      fastSubhead: 'Ang bilis mong nakuha.',
      winSubhead: 'Nakuha pa rin.',
      lossSubhead:
        'Magre-reset ang sunod-sunod na panalo sa hatinggabi, oras ng Maynila.',
      streakAlive: (days: number) =>
        `Tuloy ang sunod-sunod na panalo sa ${days} araw.`,
      streakRecord: (days: number) =>
        `${days} araw ka nang panalo. Bukas ulit!`,
      next: 'Susunod na hoolah',
      copyResult: 'Kopyahin ang resulta',
      copied: 'Nakopya sa clipboard.',
      shared: 'Naibahagi na.',
      copyFailed: 'Hindi nakopya. Subukan ulit.',
    },
    stats: {
      played: 'laro',
      winPct: 'panalo %',
      streak: 'sunod',
      max: 'pinaka',
      distribution: 'DISTRIBUSYON NG HULA',
      rowAria: (tries: number, count: number) =>
        `Nanalo sa ${tries} na subok: ${count} na laro`,
    },
    pages: {
      about: {
        title: 'tungkol sa hoolah',
        introBeforeHula: 'Tinawag ko itong hoolah dahil tunog',
        introAfterHula: ', ang salitang Tagalog para sa',
        introGuess: 'manghula',
        introRest:
          '. Kung naiisip mo ang sayaw na Hawaiian pag narinig mo ang "hula," okay lang! May pangalawang kahulugan ka na rin. Pero nandito ka para manghula.',
        knownGame:
          'Kilala na ng lahat ang laro: may limang letra, anim na subok, at bagong salita tuwing hatinggabi.',
        whyHeading: 'bakit larong salitang Tagalog',
        why:
          'Mahigit walumpung milyon ang nagsasalita ng Tagalog. Nagawan na ng Wordle sa napakaraming wika, kaya matagal nang bagay magkaroon ng bersiyong Filipino. At adbokasiya kong gawing masaya ang mga wika sa Pilipinas.',
        selectiveBeforeLink:
          'Maliit ang listahan, sinadya iyon. Mas gusto kong maging mapili kaysa makalusot ang gawa-gawa o alanganing salita. Kung may kulang na salita,',
        suggestionLink: 'magsumite ng mungkahi',
        selectiveAfterLink:
          'kasama ang salita, ibig sabihin nito, bahagi ng pananalita, at sangguniang puwede kong tingnan.',
      },
      rules: {
        title: 'paano laruin',
        intro:
          'Hulaan ang limang-letrang salitang Tagalog sa loob ng anim na subok. Pagkatapos ng bawat hula, magbabago ang kulay ng mga tile para ipakita kung gaano ka kalapit.',
        green: 'Berde',
        greenDesc: 'tamang letra, tamang puwesto.',
        yellow: 'Dilaw',
        yellowDesc: 'tamang letra, maling puwesto.',
        grey: 'Kulay-abo',
        greyDesc: 'wala sa salita.',
        repeats:
          'Kung may inuulit na letra ang hula, ang mga tile lang na tumutugma ang makukulayan. Kapag dalawang beses mong hinulaan ang isang letra pero isa lang iyon sa sagot, isang tile lang ang magiging berde o dilaw at magiging kulay-abo ang isa.',
        hardHeading: 'mahirap na mode',
        hard:
          'I-on ito sa mga setting. Kapag naka-on, kailangang gamitin ulit ang bawat berdeng tile sa tamang puwesto at kailangang lumitaw sa susunod mong hula ang bawat dilaw na letra. Puwede lang palitan ang mahirap na mode bago mo simulan ang arawang puzzle, o sa pagitan ng mga araw.',
        oneHeading: 'isang salita bawat araw',
        one:
          'May bagong arawang salita tuwing hatinggabi, oras ng Maynila (UTC+8). Lalabas ang natitirang oras sa modal ng resulta pagkatapos mong matapos. Isang puzzle lang ang puwedeng laruin bawat araw.',
        accessibilityHeading: 'pagiging accessible',
        accessibility: [
          'Lahat ng kontrol ay gumagana gamit ang pisikal na keyboard. Ang Tab ang naglilipat ng focus; ang focus ring ay 2px outline gamit ang oxblood accent.',
          'Inaanunsiyo sa polite live region ang pagbabago ng kulay ng tile at mahahalagang mensahe.',
          'Sinusunod ang reduced motion kapag iyon ang hiling ng sistema, at puwede rin itong piliting i-on sa mga setting kahit iba ang kagustuhan ng sistema.',
          'Ang madilim na mode ay sumusunod sa palette ng brand, may gintong accent, at may mas malinaw na ivory text sa ink background.',
        ],
        shortcutsHeading: 'mga shortcut',
        through: 'hanggang',
        typeLetter: 'mag-type ng letra',
        submitGuess: 'magpasa ang hula',
        deleteLetter: 'burahin ang huling letra',
        closeModal: 'isara ang bukas na modal',
      },
      archive: {
        title: 'arkibo',
        summary: (count: number) =>
          `Ang huling ${count} salita sa hoolah. Nasa itaas ang pinakabago.`,
        emptyBeforeDate: 'Walang laman ang arkibo hanggang unang araw. Bumalik pagkatapos ng',
        hidden:
          'Mga nakaraang salita lang ang nasa arkibo. Mananatiling nakatago ang puzzle ngayon hanggang makuha mo ito o maubos ang subok.',
      },
      notFound: {
        message: 'Wala sa word list ang page na ito.',
        back: 'bumalik sa paglalaro',
      },
    },
  } satisfies AppCopyShape,
} satisfies Record<Locale, AppCopyShape>;

export type AppCopy = (typeof COPY)[Locale];

export const LOCALES: Locale[] = ['en', 'fil'];

export function normalizeLocale(value: unknown): Locale {
  return value === 'fil' ? 'fil' : 'en';
}

export function htmlLang(locale: Locale): string {
  return COPY[locale].meta.htmlLang;
}

export function intlLocale(locale: Locale): string {
  return COPY[locale].meta.intlLocale;
}

export function formatLongDate(date: string, locale: Locale): string {
  const [y, m, d] = date.split('-').map(Number);
  const localDate = new Date(Date.UTC(y, m - 1, d));
  return localDate.toLocaleDateString(intlLocale(locale), {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(date: string, locale: Locale): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(
    intlLocale(locale),
    {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

export function formatDisplayDate(date: string, locale: Locale): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(
    intlLocale(locale),
    {
      timeZone: 'UTC',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

export function formatHardModeViolation(
  violation: HardModeViolation,
  locale: Locale
): string {
  const copy = COPY[locale].game;
  if (violation.code === 'locked-slot') {
    return copy.hardModeLockedSlot(violation.position, violation.letter);
  }
  return copy.hardModeMissingLetter(violation.letter);
}
