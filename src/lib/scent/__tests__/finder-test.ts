import { describe, expect, it } from '@jest/globals';
import {
  bestPossibleScore,
  familyWeights,
  isComplete,
  recommend,
  type Answers,
} from '@/lib/scent/finder';
import type { Product } from '@/lib/shopify/products';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'gid://shopify/Product/1',
    handle: 'product',
    title: 'Product',
    description: '',
    tags: [],
    families: [],
    format: 'perfume',
    imageUrl: null,
    imageAlt: null,
    priceFrom: { amount: 10, currencyCode: 'EUR' },
    variants: [],
    available: true,
    ...overrides,
  };
}

const baseAnswers: Answers = {
  mood: 'deep',
  occasion: 'evening',
  season: 'cold',
  intensity: 'balanced',
  notes: [],
};

describe('familyWeights', () => {
  it('sums the weights of the selected options', () => {
    const weights = familyWeights({ mood: 'warm', season: 'cold', notes: [] });
    expect(weights).toEqual({
      woody: 1,
      floral: 0,
      resinous: 5,
      spiced: 4,
      citrus: 0,
      musky: 0,
    });
  });

  it('returns zeros without answers', () => {
    expect(Object.values(familyWeights({ notes: [] })).every((weight) => weight === 0)).toBe(true);
  });
});

describe('recommend', () => {
  it('ranks matching families above non-matching ones', () => {
    const woody = makeProduct({ id: 'a', title: 'Woody', families: ['woody'] });
    const citrus = makeProduct({ id: 'b', title: 'Citrus', families: ['citrus'] });
    const result = recommend([citrus, woody], baseAnswers);
    expect(result.map((entry) => entry.product.id)).toEqual(['a']);
  });

  it('adds points for favourite notes', () => {
    const plain = makeProduct({ id: 'a', title: 'A', families: ['woody'] });
    const rosy = makeProduct({ id: 'b', title: 'B', families: ['woody'], tags: ['damask-rose'] });
    const without = recommend([plain, rosy], baseAnswers);
    expect(without[0].score).toBe(without[1].score);

    const withNote = recommend([plain, rosy], { ...baseAnswers, notes: ['rose'] });
    expect(withNote[0].product.id).toBe('b');
    expect(withNote[0].score).toBe(withNote[1].score + 3);
  });

  it('favours attar for subtle and perfume for strong', () => {
    const attar = makeProduct({ id: 'a', title: 'Attar', families: ['woody'], format: 'attar' });
    const perfume = makeProduct({ id: 'p', title: 'Parfum', families: ['woody'] });

    const subtle = recommend([perfume, attar], { ...baseAnswers, intensity: 'subtle' });
    expect(subtle[0].product.id).toBe('a');

    const strong = recommend([attar, perfume], { ...baseAnswers, intensity: 'strong' });
    expect(strong[0].product.id).toBe('p');
  });

  it('excludes unavailable products', () => {
    const sold = makeProduct({ id: 'a', families: ['woody'], available: false });
    expect(recommend([sold], baseAnswers)).toEqual([]);
  });

  it('excludes products with a score of 0', () => {
    const none = makeProduct({ id: 'a', families: [] });
    expect(recommend([none], baseAnswers)).toEqual([]);
  });

  it('respects the limit', () => {
    const products = ['A', 'B', 'C', 'D', 'E'].map((title) =>
      makeProduct({ id: title, title, families: ['woody'] }),
    );
    expect(recommend(products, baseAnswers, 2)).toHaveLength(2);
    expect(recommend(products, baseAnswers)).toHaveLength(3);
  });

  it('measures the match against the best possible score for the answers', () => {
    // baseAnswers weigh woody 6, resinous 4, spiced 3, so a woody + resinous scent is a perfect fit.
    expect(bestPossibleScore(baseAnswers)).toBe(10);
    const perfect = makeProduct({ id: 'a', title: 'A', families: ['woody', 'resinous'] });
    const partial = makeProduct({ id: 'b', title: 'B', families: ['spiced'] });
    const result = recommend([partial, perfect], baseAnswers);
    expect(result.map((entry) => entry.match)).toEqual([100, 30]);
  });

  it('caps the match at 100 when a product beats the expected best case', () => {
    const rich = makeProduct({ id: 'a', families: ['woody', 'resinous', 'spiced'] });
    expect(recommend([rich], baseAnswers)[0].match).toBe(100);
  });

  it('prefers an alternative over a second scent with the same families', () => {
    const spray = makeProduct({ id: 'a', title: 'A Spray', families: ['woody', 'resinous'] });
    const oil = makeProduct({ id: 'b', title: 'B Oil', families: ['woody', 'resinous'] });
    const other = makeProduct({ id: 'c', title: 'C Other', families: ['woody', 'spiced'] });
    // The oil scores 10 and the alternative 9, but the oil repeats the first pick's families.
    expect(recommend([oil, other, spray], baseAnswers).map((entry) => entry.product.id)).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('breaks ties alphabetically by title', () => {
    const b = makeProduct({ id: 'b', title: 'Bravo', families: ['woody'] });
    const a = makeProduct({ id: 'a', title: 'Alpha', families: ['woody'] });
    expect(recommend([b, a], baseAnswers).map((entry) => entry.product.title)).toEqual([
      'Alpha',
      'Bravo',
    ]);
  });

  it('explains the match with family, note and format reasons', () => {
    const product = makeProduct({
      families: ['woody'],
      tags: ['oud'],
      format: 'attar',
    });
    const [result] = recommend([product], {
      ...baseAnswers,
      intensity: 'subtle',
      notes: ['oud'],
    });
    expect(result.reasons).toHaveLength(3);
    expect(result.reasons[0]).toContain('Holzig');
    expect(result.reasons[1]).toContain('Oud');
    expect(result.reasons[2]).toBe('Als Duftöl dezent und nah an der Haut');
  });
});

describe('isComplete', () => {
  it('is false until all four questions are answered', () => {
    expect(isComplete({ notes: [] })).toBe(false);
    expect(isComplete({ mood: 'warm', occasion: 'daily', season: 'all', notes: [] })).toBe(false);
  });

  it('is true when all questions are answered, even without notes', () => {
    expect(isComplete(baseAnswers)).toBe(true);
  });
});
