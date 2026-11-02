import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { addLine, createCart, fetchCart } from '@/lib/cart/api';

function makeRawCart() {
  return {
    id: 'gid://shopify/Cart/1',
    checkoutUrl: 'https://example.com/checkout',
    totalQuantity: 2,
    cost: {
      subtotalAmount: { amount: '100.00', currencyCode: 'EUR' },
      totalAmount: { amount: '119.00', currencyCode: 'EUR' },
    },
    lines: {
      nodes: [
        {
          id: 'line1',
          quantity: 2,
          cost: { totalAmount: { amount: '100.00', currencyCode: 'EUR' } },
          merchandise: {
            id: 'variant1',
            title: '50 mL / Amber',
            product: {
              handle: 'royal-oud',
              title: 'Royal Oud',
              featuredImage: { url: 'https://example.com/a.png' },
            },
          },
        },
      ],
    },
  };
}

function respondWith(data: unknown) {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ data }) });
}

type FetchCall = [string, { method: string; headers: Record<string, string>; body: string }];
const fetchMock = jest.fn<(...args: FetchCall) => Promise<unknown>>();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

describe('createCart', () => {
  it('maps lines and converts totals to numbers', async () => {
    respondWith({ cartCreate: { cart: makeRawCart(), userErrors: [] } });

    const cart = await createCart('variant1', 2);

    expect(cart.total).toEqual({ amount: 119, currencyCode: 'EUR' });
    expect(cart.subtotal).toEqual({ amount: 100, currencyCode: 'EUR' });
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0]).toMatchObject({
      id: 'line1',
      variantId: 'variant1',
      size: '50 mL',
      handle: 'royal-oud',
      title: 'Royal Oud',
      imageUrl: 'https://example.com/a.png',
      total: { amount: 100, currencyCode: 'EUR' },
    });
  });
});

describe('addLine', () => {
  it('sends cartId and lines as variables', async () => {
    respondWith({ cartLinesAdd: { cart: makeRawCart(), userErrors: [] } });

    await addLine('cart1', 'variant1', 3);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.variables).toEqual({
      cartId: 'cart1',
      lines: [{ merchandiseId: 'variant1', quantity: 3 }],
    });
  });

  it('rejects when the payload has user errors', async () => {
    respondWith({ cartLinesAdd: { cart: null, userErrors: [{ message: 'x' }] } });
    await expect(addLine('cart1', 'variant1', 1)).rejects.toThrow('x');
  });
});

describe('fetchCart', () => {
  it('returns null when the cart is null', async () => {
    respondWith({ cart: null });
    await expect(fetchCart('gone')).resolves.toBeNull();
  });

  it('returns a mapped cart when it exists', async () => {
    respondWith({ cart: makeRawCart() });
    const cart = await fetchCart('cart1');
    expect(cart?.id).toBe('gid://shopify/Cart/1');
  });
});
