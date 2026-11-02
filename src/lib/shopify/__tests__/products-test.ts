import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fetchProducts, mapProduct } from '@/lib/shopify/products';

type RawProduct = Parameters<typeof mapProduct>[0];

function makeRaw(overrides: Partial<RawProduct> = {}): RawProduct {
  return {
    id: 'gid://shopify/Product/1',
    handle: 'royal-oud',
    title: 'Royal Oud',
    description: 'Deep and woody.',
    productType: 'Eau de Parfum',
    tags: ['oud', 'rose'],
    featuredImage: { url: 'https://example.com/a.png', altText: 'Flacon' },
    priceRange: { minVariantPrice: { amount: '49.5', currencyCode: 'EUR' } },
    variants: {
      nodes: [
        {
          id: 'v1',
          title: '50 mL',
          availableForSale: false,
          price: { amount: '49.50', currencyCode: 'EUR' },
          selectedOptions: [{ name: 'Volume', value: '50 mL' }],
        },
        {
          id: 'v2',
          title: '100 mL',
          availableForSale: true,
          price: { amount: '89', currencyCode: 'EUR' },
          selectedOptions: [{ name: 'SIZE', value: '100 mL (large)' }],
        },
      ],
    },
    ...overrides,
  };
}

describe('mapProduct', () => {
  it('picks the size from a Volume or Size option, case-insensitively', () => {
    const product = mapProduct(makeRaw());
    expect(product.variants.map((variant) => variant.size)).toEqual(['50 mL', '100 mL (large)']);
  });

  it('falls back to the variant title and converts amounts to numbers', () => {
    const raw = makeRaw();
    raw.variants.nodes[0].selectedOptions = [{ name: 'Color', value: 'Amber' }];
    const product = mapProduct(raw);
    expect(product.variants[0].size).toBe('50 mL');
    expect(product.variants[0].price).toEqual({ amount: 49.5, currencyCode: 'EUR' });
    expect(product.priceFrom).toEqual({ amount: 49.5, currencyCode: 'EUR' });
  });

  it('is available when any variant is available', () => {
    expect(mapProduct(makeRaw()).available).toBe(true);
    const raw = makeRaw();
    raw.variants.nodes.forEach((variant) => (variant.availableForSale = false));
    expect(mapProduct(raw).available).toBe(false);
  });

  it('derives families and format from tags', () => {
    const product = mapProduct(makeRaw({ tags: ['oud', 'rose', 'attar'] }));
    expect(product.families).toEqual(['woody', 'floral']);
    expect(product.format).toBe('attar');
    expect(mapProduct(makeRaw()).format).toBe('perfume');
  });

  it('handles a missing featured image', () => {
    const product = mapProduct(makeRaw({ featuredImage: null }));
    expect(product.imageUrl).toBeNull();
    expect(product.imageAlt).toBeNull();
  });
});

describe('fetchProducts', () => {
  type FetchCall = [string, { method: string; headers: Record<string, string>; body: string }];
  const fetchMock = jest.fn<(...args: FetchCall) => Promise<unknown>>();

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it('returns mapped products and POSTs JSON to the mock.shop endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { products: { nodes: [makeRaw()] } } }),
    });

    const products = await fetchProducts();

    expect(products).toHaveLength(1);
    expect(products[0].title).toBe('Royal Oud');
    expect(products[0].families).toEqual(['woody', 'floral']);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('mock.shop');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toHaveProperty('query');
  });
});
