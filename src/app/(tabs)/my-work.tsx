import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ActivitySheet } from '@/components/ActivitySheet';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { WorkCard } from '@/components/WorkCard';
import { useToday, type WorkItem } from '@/store/selectors';
import { colors } from '@/theme/tokens';

type Filter = 'all' | 'received' | 'pending' | 'issues' | 'completed';
const FILTERS: Filter[] = ['all', 'received', 'pending', 'issues', 'completed'];

export default function MyWorkScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ filter?: Filter }>();
  const today = useToday();
  const [filter, setFilter] = useState<Filter>('all');
  const [sheetId, setSheetId] = useState<string | null>(null);

  // "View all" on Today deep-links into a filter.
  const [linkedFilter, setLinkedFilter] = useState<string | undefined>();
  if (params.filter !== linkedFilter) {
    setLinkedFilter(params.filter);
    if (params.filter && FILTERS.includes(params.filter)) setFilter(params.filter);
  }

  const lists: Record<Filter, WorkItem[]> = {
    all: [...today.completed, ...today.pending],
    received: today.received,
    pending: today.pending,
    issues: today.issues,
    completed: today.completed,
  };
  const labels: Record<Filter, string> = {
    all: 'myWork.filterAll',
    received: 'myWork.filterReceived',
    pending: 'myWork.filterPending',
    issues: 'myWork.filterIssues',
    completed: 'myWork.filterCompleted',
  };
  const items = lists[filter];

  const open = (item: WorkItem) => {
    if (item.activity) setSheetId(item.activity.id);
    else router.push({ pathname: '/customer/[id]', params: { id: item.customer.id } });
  };

  return (
    <Screen inTabs>
      <AppText variant="heading" accessibilityRole="header" style={styles.title}>
        {t('myWork.title')}
      </AppText>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={t(labels[f], { count: lists[f].length })}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      <AppText variant="overline" color={colors.amber} upper>
        {filter === 'completed'
          ? t('myWork.completedHeader')
          : t('myWork.scheduledHeader', { count: today.visitsTotal })}
      </AppText>

      <View style={styles.list}>
        {items.length === 0 ? (
          <AppText variant="body" color={colors.muted}>
            {t('myWork.empty')}
          </AppText>
        ) : (
          items.map((item) => <WorkCard key={item.customer.id} item={item} onPress={() => open(item)} />)
        )}
      </View>

      <ActivitySheet activityId={sheetId} onClose={() => setSheetId(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { paddingTop: 24 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  list: { gap: 12 },
});
