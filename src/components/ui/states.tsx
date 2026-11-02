import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Button } from './button';
import { AppText } from './text';

export function LoadingState({ label = 'Wird geladen …' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator color={theme.accent} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <AppText variant="heading">Das hat nicht geklappt</AppText>
      <AppText variant="caption" style={styles.center}>
        {message}
      </AppText>
      {onRetry ? <Button label="Erneut versuchen" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

type EmptyStateProps = {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, text, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="title" style={styles.center}>
        {title}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.center}>
        {text}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  center: {
    textAlign: 'center',
  },
});
