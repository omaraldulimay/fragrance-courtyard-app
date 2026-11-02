import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyState } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CartLine } from '@/lib/cart/api';
import { useCart } from '@/lib/cart/store';
import { formatMoney } from '@/lib/format';

export default function CartScreen() {
  const theme = useTheme();
  const cart = useCart((state) => state.cart);
  const error = useCart((state) => state.error);
  const lines = cart?.lines ?? [];

  if (lines.length === 0) {
    return (
      <Screen>
        <AppText variant="display">Warenkorb</AppText>
        <EmptyState
          title="Dein Warenkorb ist leer"
          text="Nicht sicher, was du suchst? Der Duftfinder hilft dir in einer Minute."
          actionLabel="Duftfinder starten"
          onAction={() => router.navigate('/finder')}
        />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        cart ? (
          <View style={styles.summary}>
            <View style={styles.totalRow}>
              <AppText variant="body">Zwischensumme</AppText>
              <AppText variant="heading">{formatMoney(cart.subtotal)}</AppText>
            </View>
            <AppText variant="caption">Versand und Steuern werden im Checkout berechnet.</AppText>
            <Button
              label="Zur Kasse"
              accessibilityHint="Öffnet den sicheren Shopify-Checkout"
              onPress={() => WebBrowser.openBrowserAsync(cart.checkoutUrl)}
            />
          </View>
        ) : null
      }>
      <AppText variant="display">Warenkorb</AppText>
      {error ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
      <View style={[styles.list, { borderColor: theme.border }]}>
        {lines.map((line) => (
          <LineItem key={line.id} line={line} />
        ))}
      </View>
    </Screen>
  );
}

function LineItem({ line }: { line: CartLine }) {
  const theme = useTheme();
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const pending = useCart((state) => state.pending);

  return (
    <View style={[styles.line, { borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={line.title}
        onPress={() =>
          router.push({ pathname: '/product/[handle]', params: { handle: line.handle } })
        }>
        <Image
          source={line.imageUrl ?? undefined}
          contentFit="cover"
          style={[styles.image, { backgroundColor: theme.surfaceMuted }]}
        />
      </Pressable>
      <View style={styles.lineText}>
        <AppText variant="heading" numberOfLines={2}>
          {line.title}
        </AppText>
        <AppText variant="caption">{line.size}</AppText>
        <View style={styles.lineBottom}>
          <View style={[styles.stepper, { borderColor: theme.border }]}>
            <StepperButton
              label="−"
              accessibilityLabel={`Menge von ${line.title} verringern`}
              disabled={pending}
              onPress={() => setQuantity(line.id, line.quantity - 1)}
            />
            <AppText variant="heading" accessibilityLabel={`Menge ${line.quantity}`}>
              {line.quantity}
            </AppText>
            <StepperButton
              label="+"
              accessibilityLabel={`Menge von ${line.title} erhöhen`}
              disabled={pending}
              onPress={() => setQuantity(line.id, line.quantity + 1)}
            />
          </View>
          <AppText variant="heading">{formatMoney(line.total)}</AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={pending}
          onPress={() => remove(line.id)}
          hitSlop={8}
          style={styles.remove}>
          <AppText variant="caption">Entfernen</AppText>
        </Pressable>
      </View>
    </View>
  );
}

function StepperButton({
  label,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.stepperButton, (pressed || disabled) && styles.dimmed]}>
      <AppText variant="heading">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  line: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  image: {
    width: 84,
    height: 105,
    borderRadius: Radius.sm,
  },
  lineText: {
    flex: 1,
    gap: Spacing.one,
  },
  lineBottom: {
    marginTop: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
  stepperButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.5,
  },
  remove: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  summary: {
    gap: Spacing.two,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
});
