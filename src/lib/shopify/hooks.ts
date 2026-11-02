import { useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchProduct, fetchProducts, type Product } from './products';

const PRODUCTS_KEY = ['products'] as const;

export function useProducts() {
  return useQuery({ queryKey: PRODUCTS_KEY, queryFn: fetchProducts });
}

export function useProduct(handle: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['product', handle],
    queryFn: () => fetchProduct(handle),
    // Opening a product from a list is instant because the list already holds its data.
    initialData: () =>
      queryClient
        .getQueryData<Product[]>(PRODUCTS_KEY)
        ?.find((product) => product.handle === handle),
  });
}
