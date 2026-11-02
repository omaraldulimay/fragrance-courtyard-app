import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ProductGrid } from '@/components/product-card';
import { Chip, FamilyChip } from '@/components/ui/chip';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  FAMILIES,
  FAMILY_ORDER,
  FORMATS,
  type ScentFamily,
  type ScentFormat,
} from '@/lib/scent/families';
import { useProducts } from '@/lib/shopify/hooks';

type Sort = 'popular' | 'price-asc' | 'price-desc';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'popular', label: 'Beliebt' },
  { id: 'price-asc', label: 'Preis aufsteigend' },
  { id: 'price-desc', label: 'Preis absteigend' },
];

function isFamily(value: unknown): value is ScentFamily {
  return typeof value === 'string' && value in FAMILIES;
}

function isFormat(value: unknown): value is ScentFormat {
  return typeof value === 'string' && value in FORMATS;
}

export default function ShopScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ family?: string; format?: string }>();
  const { data: products, isPending, error, refetch } = useProducts();

  const [search, setSearch] = useState('');
  const [family, setFamily] = useState<ScentFamily | null>(
    isFamily(params.family) ? params.family : null,
  );
  const [format, setFormat] = useState<ScentFormat | null>(
    isFormat(params.format) ? params.format : null,
  );
  const [sort, setSort] = useState<Sort>('popular');

  // Links from the start page open this tab with a preselected filter. The tab stays mounted,
  // so new link parameters are applied while rendering, as React recommends for derived state.
  const [appliedParams, setAppliedParams] = useState(params);
  if (params.family !== appliedParams.family || params.format !== appliedParams.format) {
    setAppliedParams(params);
    if (isFamily(params.family)) setFamily(params.family);
    if (isFormat(params.format)) setFormat(params.format);
  }

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = (products ?? []).filter(
      (product) =>
        (!family || product.families.includes(family)) &&
        (!format || product.format === format) &&
        (!term ||
          product.title.toLowerCase().includes(term) ||
          product.tags.some((tag) => tag.toLowerCase().includes(term))),
    );
    if (sort === 'popular') return filtered;
    const direction = sort === 'price-asc' ? 1 : -1;
    return [...filtered].sort((a, b) => direction * (a.priceFrom.amount - b.priceFrom.amount));
  }, [products, search, family, format, sort]);

  const hasFilters = family !== null || format !== null || search !== '';

  return (
    <Screen>
      <AppText variant="display">Katalog</AppText>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Duft oder Note suchen, z. B. Rose"
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel="Katalog durchsuchen"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={[
          styles.search,
          { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      />

      <View style={styles.filters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}>
          {(Object.keys(FORMATS) as ScentFormat[]).map((option) => (
            <Chip
              key={option}
              label={FORMATS[option].label}
              selected={format === option}
              onPress={() => setFormat(format === option ? null : option)}
            />
          ))}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          {FAMILY_ORDER.map((option) => (
            <FamilyChip
              key={option}
              family={option}
              selected={family === option}
              onPress={() => setFamily(family === option ? null : option)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}>
          {SORTS.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              selected={sort === option.id}
              onPress={() => setSort(option.id)}
            />
          ))}
        </ScrollView>
      </View>

      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState message={error.message} onRetry={refetch} /> : null}
      {products ? (
        <>
          <AppText variant="caption" accessibilityLiveRegion="polite">
            {results.length} {results.length === 1 ? 'Duft' : 'Düfte'}
          </AppText>
          {results.length > 0 ? (
            <ProductGrid products={results} />
          ) : (
            <EmptyState
              title="Nichts gefunden"
              text="Für diese Kombination gibt es keinen Duft. Versuch es mit weniger Filtern."
              actionLabel={hasFilters ? 'Filter zurücksetzen' : undefined}
              onAction={() => {
                setSearch('');
                setFamily(null);
                setFormat(null);
              }}
            />
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    fontSize: 15,
  },
  filters: {
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.two,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 20,
    marginHorizontal: Spacing.one,
  },
});
