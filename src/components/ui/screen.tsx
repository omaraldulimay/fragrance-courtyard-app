import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// The web build uses a floating tab bar at the bottom instead of the native one.
const WEB_TAB_BAR_SPACE = Platform.OS === 'web' ? 96 : 0;

type ScreenProps = {
  children: ReactNode;
  // Content starts at the very top and spans the full width, e.g. a hero image.
  edgeToEdge?: boolean;
  // Screens pushed over the tabs, like the product page, have no tab bar to leave room for.
  withTabBar?: boolean;
  footer?: ReactNode;
};

export function Screen({ children, edgeToEdge = false, withTabBar = true, footer }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarSpace = withTabBar ? WEB_TAB_BAR_SPACE : 0;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: edgeToEdge ? 0 : insets.top + Spacing.three,
          paddingBottom: insets.bottom + tabBarSpace + (footer ? 120 : Spacing.six),
        }}>
        <View style={[styles.content, edgeToEdge && styles.edgeToEdge]}>{children}</View>
      </ScrollView>
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.border,
              paddingBottom: insets.bottom + Spacing.three + tabBarSpace,
            },
          ]}>
          <View style={styles.footerContent}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three + Spacing.one,
    gap: Spacing.four,
  },
  edgeToEdge: {
    paddingHorizontal: 0,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three + Spacing.one,
  },
});
