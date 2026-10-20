import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/tokens';
import { AppText } from './AppText';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** "solid" = filter chips (My work, History). "soft" = choice chips (Referral). */
  look?: 'solid' | 'soft';
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected, onPress, look = 'solid', style }: ChipProps) {
  const solid = look === 'solid';
  const bg = selected ? (solid ? colors.green : colors.greenSoft) : colors.white;
  const border = selected ? colors.green : colors.line;
  const fg = selected && solid ? colors.white : solid ? colors.green : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        solid ? styles.solid : styles.soft,
        { backgroundColor: bg, borderColor: solid && !selected ? colors.line : border },
        pressed && styles.pressed,
        style,
      ]}
    >
      <AppText variant={solid ? 'bodyMedium' : 'small'} color={fg} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

type Tone = 'neutral' | 'danger';

interface OptionTileProps {
  label: string;
  icon: ComponentProps<typeof Feather>['name'];
  selected?: boolean;
  tone?: Tone;
  onPress?: () => void;
}

/** Outcome tiles on the Record issue screen. */
export function OptionTile({ label, icon, selected, tone = 'neutral', onPress }: OptionTileProps) {
  const danger = tone === 'danger';
  const fg = danger ? colors.red : colors.ink;
  const bg = selected ? (danger ? colors.redSoft : colors.greenSoft) : colors.white;
  const border = danger ? colors.red : selected ? colors.green : colors.line;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: bg, borderColor: border }, pressed && styles.pressed]}
    >
      <Feather name={icon} size={18} color={fg} />
      <AppText variant="small" color={fg}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  solid: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: radius[16],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soft: {
    flex: 1,
    minHeight: 36,
    paddingHorizontal: 8,
    borderRadius: radius[12],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: radius[12],
    borderWidth: 1,
  },
  pressed: { opacity: 0.85 },
});
