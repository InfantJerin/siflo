import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import performance from '@/mocks/performance.json';
import { useMonthPerformance } from '@/store/selectors';
import { colors } from '@/theme/tokens';
import { inrShort } from '@/utils/format';

/** A13b · Past performance */
export default function PastPerformanceScreen() {
  const { t } = useTranslation();
  const current = useMonthPerformance();

  const months = [
    {
      key: 'current',
      title: t('past.inProgress', { month: current.label }),
      rating: current.rating,
      collected: current.collected,
      target: current.target,
    },
    ...performance.pastMonths.map((m) => ({ key: m.label, title: m.label, ...m })),
  ];

  return (
    <Screen header={<ScreenHeader title={t('past.title')} />}>
      <AppText variant="body" color={colors.muted}>
        {t('past.subtitle')}
      </AppText>
      {months.map((m) => {
        const pct = Math.round((m.collected / m.target) * 100);
        return (
          <Card key={m.key} style={styles.card}>
            <View style={styles.row}>
              <AppText variant="label">{m.title}</AppText>
              <View style={styles.rating}>
                <MaterialCommunityIcons name="star" size={16} color={colors.green} />
                <AppText variant="label" color={colors.green}>
                  {`${m.rating.toFixed(1)} / 5`}
                </AppText>
              </View>
            </View>
            <View style={styles.row}>
              <AppText variant="label">{t('past.ofTarget', { percent: pct })}</AppText>
              <AppText variant="label">{`${inrShort(m.collected)} / ${inrShort(m.target)}`}</AppText>
            </View>
            <ProgressBar value={pct / 100} />
          </Card>
        );
      })}
      <AppText variant="caption" color={colors.muted}>
        {t('past.footnote')}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, paddingVertical: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
