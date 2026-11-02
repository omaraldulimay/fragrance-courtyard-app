import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/lib/format';
import { FAMILIES, FORMATS } from '@/lib/scent/families';
import type { Product } from '@/lib/shopify/products';

import { AppText } from './ui/text';
import { WishButton } from './wish-button';

export function ProductCard({ product }: { product: Product }) {
  const theme = useTheme();
  const families = product.families
    .slice(0, 2)
    .map((family) => FAMILIES[family].label)
    .join(' · ');

  return (
    <View style={styles.card}>
      <Link href={{ pathname: '/product/[handle]', params: { handle: product.handle } }} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${product.title}, ab ${formatMoney(product.priceFrom)}`}
          style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
          <View style={[styles.imageWrap, { backgroundColor: theme.surfaceMuted }]}>
            <Image
              source={product.imageUrl ?? undefined}
              accessibilityLabel={product.imageAlt ?? product.title}
              contentFit="cover"
              transition={200}
              style={styles.image}
            />
            {!product.available ? (
              <View style={[styles.soldOut, { backgroundColor: theme.surface }]}>
                <AppText variant="label">Ausverkauft</AppText>
              </View>
            ) : null}
          </View>
          <View style={styles.text}>
            <AppText variant="label">{FORMATS[product.format].label}</AppText>
            <AppText variant="heading" numberOfLines={2}>
              {product.title}
            </AppText>
            {families ? <AppText variant="caption">{families}</AppText> : null}
            <AppText variant="body">ab {formatMoney(product.priceFrom)}</AppText>
          </View>
        </Pressable>
      </Link>
      <View style={styles.wish}>
        <WishButton handle={product.handle} title={product.title} />
      </View>
    </View>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <View key={product.id} style={styles.cell}>
          <ProductCard product={product} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
  },
  pressable: {
    gap: Spacing.two + 2,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrap: {
    aspectRatio: 4 / 5,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  soldOut: {
    position: 'absolute',
    left: Spacing.two,
    bottom: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.sm,
  },
  text: {
    gap: Spacing.one,
  },
  wish: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.two,
    rowGap: Spacing.four,
  },
  cell: {
    width: '50%',
    paddingHorizontal: Spacing.two,
  },
});
