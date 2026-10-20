import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivitySheet } from '@/components/ActivitySheet';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { demoNow } from '@/store/clock';
import { useHistory } from '@/store/selectors';
import { colors } from '@/theme/tokens';
import { activityHeadline, evidenceLabel } from '@/utils/activity';
import { dateLong, sameDay, time } from '@/utils/format';

type Filter = 'all' | 'collections' | 'visits';

/** A11 · History — All / Collections / Visits */
export default function HistoryScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');
  const [sheetId, setSheetId] = useState<string | null>(null);
  const groups = useHistory(filter);

  const now = demoNow();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const dayLabel = (d: Date) =>
    sameDay(d, now) ? t('common.today') : sameDay(d, yesterday) ? t('common.yesterday') : dateLong(d);

  return (
    <Screen header={<ScreenHeader title={t('history.title')} />}>
      <View style={styles.filters}>
        {(['all', 'collections', 'visits'] as const).map((f) => (
          <Chip key={f} label={t(`history.${f}`)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      {groups.length === 0 && (
        <AppText variant="body" color={colors.muted}>
          {t('history.empty')}
        </AppText>
      )}

      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <AppText variant="overline" color={colors.muted} upper>
            {dayLabel(group.date)}
          </AppText>
          {group.entries.map(({ activity, customer }) => {
            const evidence = evidenceLabel(t, activity);
            const headline = activityHeadline(t, activity);
            const line = evidence ? `${headline.replace(`${t('outcome.visit')} · `, '')} · ${evidence}` : headline;
            return (
              <Card
                key={activity.id}
                onPress={() => setSheetId(activity.id)}
                style={styles.entry}
                accessibilityLabel={`${customer.name}, ${line}`}
              >
                <AppText variant="title">{customer.name}</AppText>
                <AppText variant="label">{line}</AppText>
                <AppText variant="caption" color={activity.recordedInApp ? colors.amber : colors.muted}>
                  {time(new Date(activity.at))}
                </AppText>
              </Card>
            );
          })}
        </View>
      ))}

      <ActivitySheet activityId={sheetId} onClose={() => setSheetId(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 8 },
  group: { gap: 12 },
  entry: { gap: 2, paddingHorizontal: 16 },
});
