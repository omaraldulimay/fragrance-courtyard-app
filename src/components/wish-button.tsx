import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useIsWished, useWishlist } from '@/lib/wishlist/store';

import { AppText } from './ui/text';

export function WishButton({
  handle,
  title,
  size = 36,
}: {
  handle: string;
  title: string;
  size?: number;
}) {
  const theme = useTheme();
  const wished = useIsWished(handle);
  const toggle = useWishlist((state) => state.toggle);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={wished ? `${title} vom Merkzettel entfernen` : `${title} merken`}
      accessibilityState={{ selected: wished }}
      hitSlop={8}
      onPress={() => toggle(handle)}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.surface },
        pressed && styles.pressed,
      ]}>
      <AppText
        style={{
          fontSize: size * 0.5,
          lineHeight: size * 0.62,
          color: wished ? theme.danger : theme.text,
        }}>
        {wished ? '♥' : '♡'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
});
