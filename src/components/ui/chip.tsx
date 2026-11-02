import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FAMILIES, type ScentFamily } from '@/lib/scent/families';

import { AppText } from './text';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  dotColor?: string;
};

export function Chip({ label, selected = false, onPress, dotColor }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={onPress ? { selected } : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.text : theme.surface,
          borderColor: selected ? theme.text : theme.border,
        },
        pressed && styles.pressed,
      ]}>
      {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
      <AppText variant="caption" style={{ color: selected ? theme.background : theme.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function FamilyChip({
  family,
  onPress,
  selected,
}: {
  family: ScentFamily;
  onPress?: () => void;
  selected?: boolean;
}) {
  const info = FAMILIES[family];
  return <Chip label={info.label} dotColor={info.color} onPress={onPress} selected={selected} />;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two - 2,
    paddingVertical: Spacing.two - 1,
    paddingHorizontal: Spacing.three - 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
