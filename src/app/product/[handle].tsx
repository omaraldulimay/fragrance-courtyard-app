import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BackButton } from '@/components/back-button';
import { WishButton } from '@/components/wish-button';
import { Button } from '@/components/ui/button';
import { Chip, FamilyChip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/lib/cart/store';
import { formatMoney } from '@/lib/format';
import { FAMILIES, FORMATS } from '@/lib/scent/families';
import { useProduct } from '@/lib/shopify/hooks';

export default function ProductScreen() {
  const theme = useTheme();
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const { data: product, isPending, error, refetch } = useProduct(handle);
  const add = useCart((state) => state.add);
  const pending = useCart((state) => state.pending);
  const cartError = useCart((state) => state.error);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  if (isPending || error || !product) {
    return (
      <View style={styles.root}>
        <Screen>
          {isPending ? <LoadingState /> : null}
          {error ? <ErrorState message={error.message} onRetry={refetch} /> : null}
          {!isPending && !error ? <ErrorState message="Diesen Duft gibt es nicht mehr." /> : null}
        </Screen>
        <BackButton />
      </View>
    );
  }

  const variant =
    product.variants.find((candidate) => candidate.id === selectedId) ??
    product.variants.find((candidate) => candidate.available) ??
    product.variants[0];

  return (
    <View style={styles.root}>
      <Screen
        edgeToEdge
        footer={
          <View style={styles.footer}>
            <View>
              <AppText variant="caption">{variant?.size}</AppText>
              <AppText variant="title">{variant ? formatMoney(variant.price) : '–'}</AppText>
            </View>
            <Button
              label={
                !variant?.available ? 'Ausverkauft' : added ? 'Zum Warenkorb' : 'In den Warenkorb'
              }
              disabled={!variant?.available}
              loading={pending && !added}
              style={styles.addButton}
              onPress={async () => {
                if (added) {
                  router.navigate('/cart');
                } else if (variant && (await add(variant.id))) {
                  setAdded(true);
                }
              }}
            />
          </View>
        }>
        <View style={[styles.imageWrap, { backgroundColor: theme.surfaceMuted }]}>
          <Image
            source={product.imageUrl ?? undefined}
            accessibilityLabel={product.imageAlt ?? product.title}
            contentFit="cover"
            transition={200}
            style={styles.image}
          />
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleText}>
              <AppText variant="label">{FORMATS[product.format].label}</AppText>
              <AppText variant="display">{product.title}</AppText>
            </View>
            <WishButton handle={product.handle} title={product.title} size={44} />
          </View>

          {product.families.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.wrap}>
                {product.families.map((family) => (
                  <FamilyChip key={family} family={family} />
                ))}
              </View>
              <AppText variant="caption">
                {product.families
                  .map((family) => `${FAMILIES[family].label}: ${FAMILIES[family].notes}`)
                  .join('\n')}
              </AppText>
            </View>
          ) : null}

          <AppText variant="body">{product.description}</AppText>

          <View style={styles.section}>
            <AppText variant="heading">Größe</AppText>
            <View style={styles.wrap} accessibilityRole="radiogroup">
              {product.variants.map((candidate) => (
                <Chip
                  key={candidate.id}
                  label={`${candidate.size} · ${formatMoney(candidate.price)}${candidate.available ? '' : ' · ausverkauft'}`}
                  selected={candidate.id === variant?.id}
                  onPress={() => {
                    setSelectedId(candidate.id);
                    setAdded(false);
                  }}
                />
              ))}
            </View>
          </View>

          {cartError ? (
            <AppText variant="caption" color="danger" accessibilityRole="alert">
              {cartError}
            </AppText>
          ) : null}

          <Pressable
            accessibilityRole="link"
            onPress={() => router.navigate('/finder')}
            style={[
              styles.finderHint,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <AppText variant="heading">Unsicher, ob er zu dir passt?</AppText>
            <AppText variant="caption">
              Der Duftfinder vergleicht ihn in einer Minute mit deinem Geschmack →
            </AppText>
          </Pressable>
        </View>
      </Screen>
      <BackButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: Spacing.three + Spacing.one,
    gap: Spacing.four,
  },
  titleRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  titleText: {
    flex: 1,
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two + 2,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  finderHint: {
    padding: Spacing.three,
    gap: Spacing.one,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  addButton: {
    flex: 1,
    maxWidth: 260,
  },
});
