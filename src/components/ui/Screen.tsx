import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/tokens';
import { AppText } from './AppText';

interface ScreenProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  /** Bottom tab screens let the tab bar handle the bottom inset. */
  inTabs?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({ header, footer, children, scroll = true, inTabs, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = footer || inTabs ? 24 : 24 + insets.bottom;
  return (
    <KeyboardAvoidingView style={[styles.root, { paddingTop: insets.top }]} behavior="padding">
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad }, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
      {footer && <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>{footer}</View>}
    </KeyboardAvoidingView>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, back = true, onBack, right }: HeaderProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      {back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={12}
          onPress={onBack ?? (() => router.back())}
          style={styles.back}
        >
          <Feather name="arrow-left" size={22} color={colors.green} />
        </Pressable>
      )}
      <View style={styles.flex}>
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" color={colors.muted}>
            {subtitle}
          </AppText>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 8, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 56,
  },
  back: { marginLeft: -2 },
  footer: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 8,
  },
});
