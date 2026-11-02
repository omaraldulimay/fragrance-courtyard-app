import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'caption' | 'label';

export type AppTextProps = TextProps & {
  variant?: Variant;
  color?: keyof ThemeColors;
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const defaultColor = variant === 'caption' || variant === 'label' ? 'textSecondary' : 'text';
  return (
    <Text style={[{ color: theme[color ?? defaultColor] }, styles[variant], style]} {...rest} />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: Fonts?.serif,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: Fonts?.serif,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500',
  },
  heading: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
