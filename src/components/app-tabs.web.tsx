import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/lib/cart/store';

import { AppText } from './ui/text';

const TABS = [
  { name: 'index', href: '/', label: 'Entdecken' },
  { name: 'shop', href: '/shop', label: 'Katalog' },
  { name: 'finder', href: '/finder', label: 'Duftfinder' },
  { name: 'wishlist', href: '/wishlist', label: 'Merkzettel' },
  { name: 'cart', href: '/cart', label: 'Warenkorb' },
] as const;

export default function AppTabs() {
  const itemCount = useCart((state) => state.cart?.totalQuantity ?? 0);

  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <FloatingTabList>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton badge={tab.name === 'cart' && itemCount > 0 ? itemCount : undefined}>
                {tab.label}
              </TabButton>
            </TabTrigger>
          ))}
        </FloatingTabList>
      </TabList>
    </Tabs>
  );
}

function FloatingTabList({ children, ...props }: TabListProps) {
  const theme = useTheme();
  return (
    <View {...props} style={styles.barContainer} pointerEvents="box-none">
      <View style={[styles.bar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

function TabButton({
  children,
  isFocused,
  badge,
  // The trigger's ref targets a View; the Pressable below manages its own.
  ref: _ref,
  ...props
}: TabTriggerSlotProps & { badge?: number }) {
  const theme = useTheme();
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tab,
        isFocused && { backgroundColor: theme.text },
        pressed && styles.pressed,
      ]}>
      <AppText
        variant="caption"
        numberOfLines={1}
        style={[styles.label, { color: isFocused ? theme.background : theme.text }]}>
        {children}
      </AppText>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <AppText variant="label" style={{ color: theme.accentText, letterSpacing: 0 }}>
            {badge}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  barContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two + 2,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.half,
    borderRadius: Radius.pill,
  },
  label: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  // Floats on the corner so the label keeps its full width on narrow phones.
  badge: {
    position: 'absolute',
    top: -8,
    right: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
