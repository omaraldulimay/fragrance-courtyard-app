import {
  familiesFromTags,
  formatFromProduct,
  type ScentFamily,
  type ScentFormat,
} from '@/lib/scent/families';

import { storefront } from './client';

export type Money = {
  amount: number;
  currencyCode: string;
};

export type Variant = {
  id: string;
  size: string;
  available: boolean;
  price: Money;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  families: ScentFamily[];
  format: ScentFormat;
  imageUrl: string | null;
  imageAlt: string | null;
  priceFrom: Money;
  variants: Variant[];
  available: boolean;
};

type RawMoney = { amount: string; currencyCode: string };

type RawProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: RawMoney };
  variants: {
    nodes: {
      id: string;
      title: string;
      availableForSale: boolean;
      price: RawMoney;
      selectedOptions: { name: string; value: string }[];
    }[];
  };
};

export const PRODUCT_FIELDS = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    tags
    featuredImage { url altText }
    priceRange { minVariantPrice { amount currencyCode } }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        price { amount currencyCode }
        selectedOptions { name value }
      }
    }
  }
`;

const PRODUCTS_QUERY = `
  query Products {
    products(first: 100, sortKey: BEST_SELLING) {
      nodes { ...ProductFields }
    }
  }
  ${PRODUCT_FIELDS}
`;

const PRODUCT_QUERY = `
  query Product($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
  ${PRODUCT_FIELDS}
`;

const SIZE_OPTIONS = ['volume', 'size', 'größe'];

export function toMoney(raw: RawMoney): Money {
  return { amount: Number(raw.amount), currencyCode: raw.currencyCode };
}

export function mapProduct(raw: RawProduct): Product {
  const variants = raw.variants.nodes.map((variant) => {
    const sizeOption = variant.selectedOptions.find((option) =>
      SIZE_OPTIONS.includes(option.name.toLowerCase()),
    );
    return {
      id: variant.id,
      size: sizeOption?.value ?? variant.title,
      available: variant.availableForSale,
      price: toMoney(variant.price),
    };
  });

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    tags: raw.tags,
    families: familiesFromTags(raw.tags),
    format: formatFromProduct(raw.tags, raw.productType),
    imageUrl: raw.featuredImage?.url ?? null,
    imageAlt: raw.featuredImage?.altText ?? null,
    priceFrom: toMoney(raw.priceRange.minVariantPrice),
    variants,
    available: variants.some((variant) => variant.available),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await storefront<{ products: { nodes: RawProduct[] } }>(PRODUCTS_QUERY);
  return data.products.nodes.map(mapProduct);
}

export async function fetchProduct(handle: string): Promise<Product | null> {
  const data = await storefront<{ product: RawProduct | null }>(PRODUCT_QUERY, { handle });
  return data.product ? mapProduct(data.product) : null;
}
