import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/lib/cart/store';

export default function AppTabs() {
  const theme = useTheme();
  const itemCount = useCart((state) => state.cart?.totalQuantity ?? 0);

  return (
    <NativeTabs
      tintColor={theme.accent}
      backgroundColor={theme.background}
      labelStyle={{ selected: { color: theme.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Entdecken</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="shop">
        <NativeTabs.Trigger.Label>Katalog</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="square.grid.2x2" md="grid_view" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="finder">
        <NativeTabs.Trigger.Label>Duftfinder</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="wand.and.stars" md="auto_fix_high" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wishlist">
        <NativeTabs.Trigger.Label>Merkzettel</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'heart', selected: 'heart.fill' }} md="favorite" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>Warenkorb</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
        {itemCount > 0 ? (
          <NativeTabs.Trigger.Badge>{String(itemCount)}</NativeTabs.Trigger.Badge>
        ) : null}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
