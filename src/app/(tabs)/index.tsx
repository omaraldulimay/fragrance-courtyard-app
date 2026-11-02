import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ProductGrid } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { FamilyChip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FAMILY_ORDER, FORMATS, type ScentFormat } from '@/lib/scent/families';
import { useProducts } from '@/lib/shopify/hooks';

export default function DiscoverScreen() {
  const theme = useTheme();
  const { data: products, isPending, error, refetch } = useProducts();

  return (
    <Screen>
      <View style={styles.brand}>
        <AppText variant="label">The Fragrance Courtyard</AppText>
        <AppText variant="display">Düfte mit Geschichte.</AppText>
      </View>

      <View style={[styles.hero, { backgroundColor: theme.hero }]}>
        <AppText variant="label" style={{ color: theme.heroText, opacity: 0.7 }}>
          Duftfinder · 1 Minute
        </AppText>
        <AppText variant="title" style={{ color: theme.heroText }}>
          Finde den Duft, der zu dir passt.
        </AppText>
        <AppText variant="body" style={{ color: theme.heroText, opacity: 0.8 }}>
          Fünf kurze Fragen zu Stimmung, Anlass und Lieblingsnoten. Wir empfehlen dir die drei
          passendsten Düfte und sagen dir, warum.
        </AppText>
        <Button
          label="Duftfinder starten"
          variant="inverse"
          onPress={() => router.navigate('/finder')}
        />
      </View>

      <View style={styles.section}>
        <AppText variant="heading">Nach Duftfamilie stöbern</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {FAMILY_ORDER.map((family) => (
            <FamilyChip
              key={family}
              family={family}
              onPress={() => router.navigate({ pathname: '/shop', params: { family } })}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.formats}>
        {(Object.keys(FORMATS) as ScentFormat[]).map((format) => (
          <Pressable
            key={format}
            accessibilityRole="link"
            onPress={() => router.navigate({ pathname: '/shop', params: { format } })}
            style={({ pressed }) => [
              styles.formatCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && styles.pressed,
            ]}>
            <AppText variant="title">{FORMATS[format].label}</AppText>
            <AppText variant="caption">{FORMATS[format].description}</AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="heading">Beliebt</AppText>
          <Pressable accessibilityRole="link" onPress={() => router.navigate('/shop')} hitSlop={8}>
            <AppText variant="caption" color="accent">
              Alle ansehen
            </AppText>
          </Pressable>
        </View>
        {isPending ? <LoadingState /> : null}
        {error ? <ErrorState message={error.message} onRetry={refetch} /> : null}
        {products ? <ProductGrid products={products.slice(0, 6)} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    gap: Spacing.two,
  },
  hero: {
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  chips: {
    gap: Spacing.two,
  },
  formats: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  formatCard: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
