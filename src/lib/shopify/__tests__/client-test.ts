import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { StorefrontError, storefront, throwOnUserErrors } from '@/lib/shopify/client';

describe('storefront', () => {
  type FetchCall = [string, { method: string; headers: Record<string, string>; body: string }];
  const fetchMock = jest.fn<(...args: FetchCall) => Promise<unknown>>();

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it('throws a German StorefrontError on network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    const promise = storefront('query { shop { name } }');
    await expect(promise).rejects.toBeInstanceOf(StorefrontError);
    await expect(promise).rejects.toThrow('Keine Verbindung zum Shop');
  });

  it('throws on a non-OK HTTP status and includes the status', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    const promise = storefront('query { shop { name } }');
    await expect(promise).rejects.toBeInstanceOf(StorefrontError);
    await expect(promise).rejects.toThrow('503');
  });

  it('throws with the joined messages when the body has errors', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ errors: [{ message: 'first' }, { message: 'second' }] }),
    });
    await expect(storefront('query { x }')).rejects.toThrow('first, second');
  });

  it('returns data on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { shop: { name: 'Attars' } } }),
    });
    await expect(storefront('query { shop { name } }')).resolves.toEqual({
      shop: { name: 'Attars' },
    });
  });
});

describe('throwOnUserErrors', () => {
  it('throws when given messages', () => {
    expect(() => throwOnUserErrors([{ message: 'a' }, { message: 'b' }])).toThrow('a, b');
    expect(() => throwOnUserErrors([{ message: 'a' }])).toThrow(StorefrontError);
  });

  it('does not throw when empty', () => {
    expect(() => throwOnUserErrors([])).not.toThrow();
  });
});
