import { Feather } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/tokens';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'danger' | 'soft';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Feather>['name'];
  trailing?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.green, fg: colors.white, border: colors.green },
  secondary: { bg: colors.white, fg: colors.green, border: colors.line },
  danger: { bg: colors.red, fg: colors.white, border: colors.red },
  soft: { bg: colors.greenSoft, fg: colors.green, border: colors.greenSoft },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  trailing,
  disabled,
  loading,
  compact,
  style,
  accessibilityHint,
}: Props) {
  const p = palette[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        {
          backgroundColor: inactive && variant === 'primary' ? colors.greenDisabled : p.bg,
          borderColor: inactive && variant === 'primary' ? colors.greenDisabled : p.border,
        },
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Feather name={icon} size={18} color={p.fg} />}
          <AppText variant="bodyMedium" color={p.fg}>
            {label}
          </AppText>
          {trailing}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius[12],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  compact: { minHeight: 44 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pressed: { opacity: 0.85 },
});
