import { router } from 'expo-router';

import { ProductGrid } from '@/components/product-card';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { useProducts } from '@/lib/shopify/hooks';
import { useWishlist } from '@/lib/wishlist/store';

export default function WishlistScreen() {
  const handles = useWishlist((state) => state.handles);
  const { data: products, isPending, error, refetch } = useProducts();

  // Keep the order in which things were saved, newest first.
  const wished = handles.flatMap(
    (handle) => products?.find((product) => product.handle === handle) ?? [],
  );

  return (
    <Screen>
      <AppText variant="display">Merkzettel</AppText>
      {handles.length === 0 ? (
        <EmptyState
          title="Noch nichts gemerkt"
          text="Tippe auf das Herz bei einem Duft, um ihn hier zu sammeln."
          actionLabel="Katalog ansehen"
          onAction={() => router.navigate('/shop')}
        />
      ) : (
        <>
          {isPending ? <LoadingState /> : null}
          {error ? <ErrorState message={error.message} onRetry={refetch} /> : null}
          {products ? <ProductGrid products={wished} /> : null}
        </>
      )}
    </Screen>
  );
}
