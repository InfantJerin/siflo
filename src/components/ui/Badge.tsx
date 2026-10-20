import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Rating } from '@/store/types';
import { colors, radius } from '@/theme/tokens';
import { AppText } from './AppText';

type Tone = 'green' | 'red' | 'amber' | 'neutral';

const tones: Record<Tone, { bg: string; fg: string }> = {
  green: { bg: colors.greenSoft, fg: colors.green },
  red: { bg: colors.redSoft, fg: colors.red },
  amber: { bg: colors.amberSoft, fg: colors.amber },
  neutral: { bg: colors.line, fg: colors.muted },
};

export function Badge({ label, tone = 'green', icon }: { label: string; tone?: Tone; icon?: 'clock' | 'star' }) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {icon && <Feather name={icon} size={14} color={t.fg} />}
      <AppText variant="caption" color={t.fg}>
        {label}
      </AppText>
    </View>
  );
}

const ratingTone: Record<Rating, Tone> = {
  regular: 'green',
  sometimesLate: 'amber',
  oftenLate: 'red',
  new: 'neutral',
};

/** SIF / Repayment rating */
export function RatingBadge({ rating }: { rating: Rating }) {
  const { t } = useTranslation();
  return <Badge label={t(`rating.${rating}`)} tone={ratingTone[rating]} icon="clock" />;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius[8],
  },
});
