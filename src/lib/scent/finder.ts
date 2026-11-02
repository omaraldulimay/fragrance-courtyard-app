import type { Product } from '@/lib/shopify/products';

import { FAMILIES, FAMILY_ORDER, type ScentFamily, type ScentFormat } from './families';

export type QuestionId = 'mood' | 'occasion' | 'season' | 'intensity';

export type Option = {
  id: string;
  label: string;
  hint: string;
  weights?: Partial<Record<ScentFamily, number>>;
  prefersFormat?: ScentFormat;
};

export type Question = {
  id: QuestionId;
  title: string;
  options: Option[];
};

export const QUESTIONS: Question[] = [
  {
    id: 'mood',
    title: 'Wie soll sich dein Duft anfühlen?',
    options: [
      {
        id: 'warm',
        label: 'Warm & umhüllend',
        hint: 'Amber, Vanille, Gewürze',
        weights: { resinous: 3, spiced: 2 },
      },
      {
        id: 'fresh',
        label: 'Frisch & leicht',
        hint: 'Neroli, Orangenblüte',
        weights: { citrus: 3, floral: 1 },
      },
      {
        id: 'deep',
        label: 'Tief & geheimnisvoll',
        hint: 'Oud, Zeder, Weihrauch',
        weights: { woody: 3, resinous: 1 },
      },
      {
        id: 'soft',
        label: 'Weich & sinnlich',
        hint: 'Moschus, Rose, Jasmin',
        weights: { musky: 3, floral: 2 },
      },
    ],
  },
  {
    id: 'occasion',
    title: 'Wann trägst du ihn am liebsten?',
    options: [
      {
        id: 'daily',
        label: 'Im Alltag',
        hint: 'Büro, Uni, unterwegs',
        weights: { citrus: 1, musky: 2 },
      },
      {
        id: 'evening',
        label: 'Abends & beim Date',
        hint: 'Wenn er auffallen darf',
        weights: { woody: 2, spiced: 1, resinous: 1 },
      },
      {
        id: 'special',
        label: 'Zu besonderen Anlässen',
        hint: 'Hochzeit, Feiertage, Events',
        weights: { woody: 2, floral: 1 },
      },
      {
        id: 'home',
        label: 'Für mich, zu Hause',
        hint: 'Zum Wohlfühlen',
        weights: { musky: 1, floral: 1, resinous: 1 },
      },
    ],
  },
  {
    id: 'season',
    title: 'Welche Jahreszeit passt zu dir?',
    options: [
      {
        id: 'warm',
        label: 'Frühling & Sommer',
        hint: 'Hell und luftig',
        weights: { citrus: 2, floral: 2 },
      },
      {
        id: 'cold',
        label: 'Herbst & Winter',
        hint: 'Warm und dicht',
        weights: { resinous: 2, spiced: 2, woody: 1 },
      },
      {
        id: 'all',
        label: 'Das ganze Jahr',
        hint: 'Ein Duft für alles',
        weights: { woody: 1, musky: 1 },
      },
    ],
  },
  {
    id: 'intensity',
    title: 'Wie präsent soll er sein?',
    options: [
      {
        id: 'subtle',
        label: 'Dezent',
        hint: 'Nah an der Haut, nur für dich',
        prefersFormat: 'attar',
      },
      { id: 'balanced', label: 'Ausgewogen', hint: 'Spürbar, aber nicht laut' },
      {
        id: 'strong',
        label: 'Kräftig',
        hint: 'Mit Ausstrahlung im Raum',
        prefersFormat: 'perfume',
      },
    ],
  },
];

export type Note = {
  id: string;
  label: string;
  tags: string[];
};

export const NOTES: Note[] = [
  { id: 'oud', label: 'Oud', tags: ['oud'] },
  { id: 'rose', label: 'Rose', tags: ['rose', 'damask-rose'] },
  { id: 'vanilla', label: 'Vanille', tags: ['vanilla'] },
  { id: 'jasmine', label: 'Jasmin', tags: ['jasmine'] },
  { id: 'sandalwood', label: 'Sandelholz', tags: ['sandalwood'] },
  { id: 'saffron', label: 'Safran', tags: ['saffron'] },
  { id: 'amber', label: 'Amber', tags: ['amber'] },
  { id: 'musk', label: 'Moschus', tags: ['musk', 'white-musk', 'white musk'] },
  { id: 'citrus', label: 'Zitrus & Neroli', tags: ['citrus', 'neroli', 'orange-blossom'] },
  { id: 'incense', label: 'Weihrauch & Myrrhe', tags: ['incense', 'frankincense', 'myrrh'] },
];

export const MAX_NOTES = 3;

export type Answers = Partial<Record<QuestionId, string>> & { notes: string[] };

export type Recommendation = {
  product: Product;
  score: number;
  match: number;
  reasons: string[];
};

const NOTE_POINTS = 3;
const FORMAT_POINTS = 2;
// Most products carry two scent families, and two matched notes is a realistic best case.
const SCORED_FAMILIES = 2;
const SCORED_NOTES = 2;
// Lowers a candidate per already chosen result with the same families, so the list offers
// real alternatives instead of the same scent as spray and as oil.
const DIVERSITY_PENALTY = 2;

function selectedOptions(answers: Answers): Option[] {
  return QUESTIONS.flatMap((question) => {
    const option = question.options.find((candidate) => candidate.id === answers[question.id]);
    return option ? [option] : [];
  });
}

export function familyWeights(answers: Answers): Record<ScentFamily, number> {
  const weights = Object.fromEntries(FAMILY_ORDER.map((family) => [family, 0])) as Record<
    ScentFamily,
    number
  >;
  for (const option of selectedOptions(answers)) {
    for (const [family, weight] of Object.entries(option.weights ?? {})) {
      weights[family as ScentFamily] += weight;
    }
  }
  return weights;
}

function preferredFormatOf(answers: Answers): ScentFormat | undefined {
  return selectedOptions(answers).find((option) => option.prefersFormat)?.prefersFormat;
}

// The highest score any product could reach for these answers, used as 100 %.
export function bestPossibleScore(answers: Answers): number {
  const familyPart = Object.values(familyWeights(answers))
    .sort((a, b) => b - a)
    .slice(0, SCORED_FAMILIES)
    .reduce((sum, weight) => sum + weight, 0);
  const notePart = Math.min(answers.notes.length, SCORED_NOTES) * NOTE_POINTS;
  const formatPart = preferredFormatOf(answers) ? FORMAT_POINTS : 0;
  return familyPart + notePart + formatPart;
}

function sameFamilies(a: Product, b: Product): boolean {
  return a.families.length === b.families.length && a.families.every((f) => b.families.includes(f));
}

function scoreProduct(product: Product, answers: Answers, weights: Record<ScentFamily, number>) {
  const tags = product.tags.map((tag) => tag.toLowerCase());
  const familyScore = product.families.reduce((sum, family) => sum + weights[family], 0);
  const matchedNotes = NOTES.filter(
    (note) => answers.notes.includes(note.id) && note.tags.some((tag) => tags.includes(tag)),
  );
  const preferredFormat = preferredFormatOf(answers);
  const formatMatches = preferredFormat !== undefined && preferredFormat === product.format;

  const score =
    familyScore + matchedNotes.length * NOTE_POINTS + (formatMatches ? FORMAT_POINTS : 0);

  const reasons: string[] = [];
  const likedFamilies = product.families
    .filter((family) => weights[family] > 0)
    .sort((a, b) => weights[b] - weights[a])
    .slice(0, 2)
    .map((family) => FAMILIES[family].label);
  if (likedFamilies.length > 0) {
    reasons.push(`${likedFamilies.join(' & ')}, so wie du es magst`);
  }
  if (matchedNotes.length > 0) {
    reasons.push(
      `Enthält deine Lieblingsnote ${matchedNotes.map((note) => note.label).join(' und ')}`,
    );
  }
  if (formatMatches) {
    reasons.push(
      product.format === 'attar'
        ? 'Als Duftöl dezent und nah an der Haut'
        : 'Als Parfum mit spürbarer Ausstrahlung',
    );
  }
  return { score, reasons };
}

export function recommend(products: Product[], answers: Answers, limit = 3): Recommendation[] {
  const weights = familyWeights(answers);
  const remaining = products
    .filter((product) => product.available)
    .map((product) => ({ product, ...scoreProduct(product, answers, weights) }))
    .filter((entry) => entry.score > 0);

  // Greedy pick: always take the best candidate after the diversity penalty for what is
  // already chosen. Ties go to the alphabetically first title so results are stable.
  const picked: typeof remaining = [];
  while (picked.length < limit && remaining.length > 0) {
    const adjusted = (entry: (typeof remaining)[number]) =>
      entry.score -
      DIVERSITY_PENALTY *
        picked.filter((chosen) => sameFamilies(chosen.product, entry.product)).length;
    remaining.sort(
      (a, b) => adjusted(b) - adjusted(a) || a.product.title.localeCompare(b.product.title),
    );
    picked.push(remaining.shift()!);
  }

  const best = bestPossibleScore(answers);
  return picked.map((entry) => ({
    ...entry,
    match: Math.min(100, Math.round((100 * entry.score) / best)),
  }));
}

export function isComplete(answers: Answers): boolean {
  return QUESTIONS.every((question) => answers[question.id] !== undefined);
}
