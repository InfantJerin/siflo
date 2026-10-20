import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/tokens';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  bordered?: boolean;
  tone?: 'white' | 'green' | 'soft';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const tones = { white: colors.white, green: colors.green, soft: colors.greenSoft };

export function Card({ children, onPress, bordered, tone = 'white', style, accessibilityLabel }: Props) {
  const cardStyle = [styles.card, { backgroundColor: tones[tone] }, bordered && styles.bordered, style];
  if (!onPress) return <View style={cardStyle}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius[16], padding: 16 },
  bordered: { borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.85 },
});
