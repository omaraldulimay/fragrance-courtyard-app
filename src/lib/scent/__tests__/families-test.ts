import { describe, expect, it } from '@jest/globals';
import { familiesFromTags, formatFromProduct } from '@/lib/scent/families';

describe('familiesFromTags', () => {
  it('maps aliases to their family', () => {
    expect(familiesFromTags(['oud'])).toEqual(['woody']);
    expect(familiesFromTags(['saffron'])).toEqual(['spiced']);
    expect(familiesFromTags(['white-musk'])).toEqual(['musky']);
  });

  it('is case-insensitive', () => {
    expect(familiesFromTags(['OUD', 'Rose'])).toEqual(['woody', 'floral']);
  });

  it('de-duplicates families reached through several tags', () => {
    expect(familiesFromTags(['oud', 'woody', 'sandalwood'])).toEqual(['woody']);
  });

  it('returns families in FAMILY_ORDER order regardless of tag order', () => {
    expect(familiesFromTags(['musk', 'saffron', 'rose', 'oud'])).toEqual([
      'woody',
      'floral',
      'spiced',
      'musky',
    ]);
  });

  it('ignores unknown tags', () => {
    expect(familiesFromTags(['bestseller', 'oud', 'new'])).toEqual(['woody']);
    expect(familiesFromTags([])).toEqual([]);
  });
});

describe('formatFromProduct', () => {
  it('returns attar for the attar tag', () => {
    expect(formatFromProduct(['attar'], 'Perfume')).toBe('attar');
  });

  it('returns attar for the perfume-oil tag', () => {
    expect(formatFromProduct(['Perfume-Oil'], '')).toBe('attar');
  });

  it('returns attar when the product type contains Attar', () => {
    expect(formatFromProduct([], 'Attar Oil')).toBe('attar');
  });

  it('returns perfume otherwise', () => {
    expect(formatFromProduct(['oud'], 'Eau de Parfum')).toBe('perfume');
  });
});
