import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './ui/text';

export function BackButton() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Zurück"
      hitSlop={8}
      // A shared link opens the product directly, so there may be no screen to go back to.
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={({ pressed }) => [
        styles.button,
        { top: insets.top + Spacing.two, backgroundColor: theme.surface },
        pressed && styles.pressed,
      ]}>
      <AppText style={styles.arrow}>←</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: Spacing.three,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
  },
  arrow: {
    fontSize: 20,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.7,
  },
});
