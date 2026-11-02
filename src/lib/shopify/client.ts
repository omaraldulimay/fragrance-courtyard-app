// Shopify's public mock store is the default, so the app runs without an account. A real store
// only needs its Storefront API URL and public access token in .env (see .env.example).
const DEFAULT_ENDPOINT = 'https://arabic-attars.mock.shop/api';

const endpoint = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_URL || DEFAULT_ENDPOINT;
const accessToken = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

export class StorefrontError extends Error {
  name = 'StorefrontError';
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers['X-Shopify-Storefront-Access-Token'] = accessToken;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new StorefrontError('Keine Verbindung zum Shop. Bitte prüfe deine Internetverbindung.');
  }

  if (!response.ok) {
    throw new StorefrontError(`Der Shop antwortet gerade nicht (HTTP ${response.status}).`);
  }

  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new StorefrontError(body.errors.map((error) => error.message).join(', '));
  }
  if (!body.data) {
    throw new StorefrontError('Der Shop hat keine Daten geliefert.');
  }
  return body.data;
}

export function throwOnUserErrors(userErrors: { message: string }[]): void {
  if (userErrors.length > 0) {
    throw new StorefrontError(userErrors.map((error) => error.message).join(', '));
  }
}
