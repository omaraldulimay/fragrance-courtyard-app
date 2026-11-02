import { storefront, throwOnUserErrors } from '@/lib/shopify/client';
import { toMoney, type Money } from '@/lib/shopify/products';

export type CartLine = {
  id: string;
  quantity: number;
  variantId: string;
  size: string;
  handle: string;
  title: string;
  imageUrl: string | null;
  total: Money;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  total: Money;
  lines: CartLine[];
};

type RawMoney = { amount: string; currencyCode: string };

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: RawMoney; totalAmount: RawMoney };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { totalAmount: RawMoney };
      merchandise: {
        id: string;
        title: string;
        product: { handle: string; title: string; featuredImage: { url: string } | null };
      };
    }[];
  };
};

type CartPayload = { cart: RawCart | null; userErrors: { message: string }[] };

const CART_FIELDS = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            product { handle title featuredImage { url } }
          }
        }
      }
    }
  }
`;

function mapCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: toMoney(raw.cost.subtotalAmount),
    total: toMoney(raw.cost.totalAmount),
    lines: raw.lines.nodes.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      variantId: line.merchandise.id,
      // Variant titles look like "50 mL / Amber"; the size is the part customers care about.
      size: line.merchandise.title.split(' / ')[0],
      handle: line.merchandise.product.handle,
      title: line.merchandise.product.title,
      imageUrl: line.merchandise.product.featuredImage?.url ?? null,
      total: toMoney(line.cost.totalAmount),
    })),
  };
}

function unwrap(payload: CartPayload): Cart {
  throwOnUserErrors(payload.userErrors);
  if (!payload.cart) {
    throw new Error('Der Warenkorb konnte nicht geladen werden.');
  }
  return mapCart(payload.cart);
}

export async function createCart(variantId: string, quantity: number): Promise<Cart> {
  const data = await storefront<{ cartCreate: CartPayload }>(
    `mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) { cart { ...CartFields } userErrors { message } }
    }
    ${CART_FIELDS}`,
    { lines: [{ merchandiseId: variantId, quantity }] },
  );
  return unwrap(data.cartCreate);
}

export async function addLine(cartId: string, variantId: string, quantity: number): Promise<Cart> {
  const data = await storefront<{ cartLinesAdd: CartPayload }>(
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } }
    }
    ${CART_FIELDS}`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
  );
  return unwrap(data.cartLinesAdd);
}

export async function updateLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  const data = await storefront<{ cartLinesUpdate: CartPayload }>(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } }
    }
    ${CART_FIELDS}`,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  return unwrap(data.cartLinesUpdate);
}

export async function removeLine(cartId: string, lineId: string): Promise<Cart> {
  const data = await storefront<{ cartLinesRemove: CartPayload }>(
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { message } }
    }
    ${CART_FIELDS}`,
    { cartId, lineIds: [lineId] },
  );
  return unwrap(data.cartLinesRemove);
}

export async function fetchCart(cartId: string): Promise<Cart | null> {
  const data = await storefront<{ cart: RawCart | null }>(
    `query Cart($cartId: ID!) { cart(id: $cartId) { ...CartFields } }
    ${CART_FIELDS}`,
    { cartId },
  );
  return data.cart ? mapCart(data.cart) : null;
}
