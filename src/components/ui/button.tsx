import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './text';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'inverse';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme();
  const palette = {
    primary: { background: theme.text, text: theme.background, border: theme.text },
    secondary: { background: 'transparent', text: theme.text, border: theme.border },
    inverse: { background: theme.heroText, text: theme.hero, border: theme.heroText },
  }[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.background, borderColor: palette.border },
        (pressed || inactive) && styles.dimmed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <AppText variant="heading" style={{ color: palette.text }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.6,
  },
});
