import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';

interface Props {
  value: number;
  tone?: 'onGreen' | 'green';
}

export function ProgressBar({ value, tone = 'green' }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const track = tone === 'onGreen' ? 'rgba(255,255,255,0.35)' : colors.line;
  const fill = tone === 'onGreen' ? colors.white : colors.green;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[styles.track, { backgroundColor: track }]}
    >
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
