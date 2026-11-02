export type ScentFamily = 'woody' | 'floral' | 'resinous' | 'spiced' | 'citrus' | 'musky';

export type FamilyInfo = {
  label: string;
  notes: string;
  color: string;
};

export const FAMILIES: Record<ScentFamily, FamilyInfo> = {
  woody: { label: 'Holzig', notes: 'Oud, Zeder, Sandelholz, Vetiver', color: '#7A5A3A' },
  floral: { label: 'Blumig', notes: 'Rose, Jasmin, Tuberose, Lotus', color: '#B5657A' },
  resinous: { label: 'Amber & Harz', notes: 'Amber, Myrrhe, Weihrauch, Vanille', color: '#B07A2E' },
  spiced: { label: 'Würzig', notes: 'Safran, Kardamom, Dattel', color: '#A2472F' },
  citrus: { label: 'Frisch', notes: 'Neroli, Orangenblüte, Zitrus', color: '#B8901A' },
  musky: { label: 'Moschus', notes: 'Weißer Moschus, weich und sauber', color: '#857A9C' },
};

export const FAMILY_ORDER: ScentFamily[] = [
  'woody',
  'floral',
  'resinous',
  'spiced',
  'citrus',
  'musky',
];

// Shopify tags differ between stores, so several tags can point to one family.
const TAG_TO_FAMILY: Record<string, ScentFamily> = {
  woody: 'woody',
  oud: 'woody',
  sandalwood: 'woody',
  vetiver: 'woody',
  floral: 'floral',
  rose: 'floral',
  jasmine: 'floral',
  resinous: 'resinous',
  amber: 'resinous',
  vanilla: 'resinous',
  myrrh: 'resinous',
  spiced: 'spiced',
  saffron: 'spiced',
  cardamom: 'spiced',
  citrus: 'citrus',
  neroli: 'citrus',
  'orange-blossom': 'citrus',
  musk: 'musky',
  musky: 'musky',
  'white-musk': 'musky',
  'white musk': 'musky',
};

export function familiesFromTags(tags: string[]): ScentFamily[] {
  const found = new Set<ScentFamily>();
  for (const tag of tags) {
    const family = TAG_TO_FAMILY[tag.toLowerCase()];
    if (family) {
      found.add(family);
    }
  }
  return FAMILY_ORDER.filter((family) => found.has(family));
}

export type ScentFormat = 'perfume' | 'attar';

export const FORMATS: Record<ScentFormat, { label: string; description: string }> = {
  perfume: {
    label: 'Parfum',
    description: 'Eau de Parfum und Extrait zum Sprühen, mit deutlicher Ausstrahlung.',
  },
  attar: {
    label: 'Attar-Öl',
    description: 'Konzentriertes Duftöl zum Auftupfen, dezent und lange haltbar.',
  },
};

export function formatFromProduct(tags: string[], productType: string): ScentFormat {
  const lowerTags = tags.map((tag) => tag.toLowerCase());
  const isAttar =
    lowerTags.includes('attar') ||
    lowerTags.includes('perfume-oil') ||
    productType.toLowerCase().includes('attar');
  return isAttar ? 'attar' : 'perfume';
}
