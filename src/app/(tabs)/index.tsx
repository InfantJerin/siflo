import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import agentData from '@/mocks/agent.json';
import { useToday, type WorkItem } from '@/store/selectors';
import { colors } from '@/theme/tokens';
import { dateBanner, inr } from '@/utils/format';

const MAX_LIST = 2;

export default function TodayScreen() {
  const { t } = useTranslation();
  const today = useToday();
  const { agent } = agentData;

  const hour = today.date.getHours();
  const greetingKey = hour < 12 ? 'greetingMorning' : hour < 17 ? 'greetingAfternoon' : 'greetingEvening';
  const upcoming = today.pending.slice(1);

  const openCustomer = (id: string) => router.push({ pathname: '/customer/[id]', params: { id } });

  return (
    <Screen inTabs>
      <View style={styles.greeting}>
        <AppText variant="heading" accessibilityRole="header">
          {t(`today.${greetingKey}`, { name: agent.firstName })}
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          {`${dateBanner(today.date)} · ${agent.city.toUpperCase()}`}
        </AppText>
      </View>

      <Card tone="green" style={styles.summary}>
        <View style={styles.summaryRow}>
          <View style={styles.flex}>
            <AppText variant="display" color={colors.white}>
              {inr(today.collected)}
            </AppText>
            <AppText variant="caption" color={colors.white}>
              {t('today.collectedOf', { target: inr(today.target) })}
            </AppText>
          </View>
          <View style={styles.flex}>
            <AppText variant="display" color={colors.white}>
              {`${today.visitsDone} / ${today.visitsTotal}`}
            </AppText>
            <AppText variant="caption" color={colors.white}>
              {t('today.visitsCompleted')}
            </AppText>
          </View>
        </View>
        <ProgressBar value={today.visitsDone / Math.max(1, today.visitsTotal)} tone="onGreen" />
      </Card>

      <Button variant="secondary" label={t('today.viewRoute')} onPress={() => router.push('/route')} />

      <View style={styles.sectionHead}>
        <AppText variant="headingSm">{t('today.nextVisit')}</AppText>
        <AppText variant="label" color={colors.muted}>
          {t('today.remaining', { count: today.pending.length })}
        </AppText>
      </View>

      {today.next ? (
        <NextVisitCard item={today.next} onOpen={() => openCustomer(today.next!.customer.id)} />
      ) : (
        <Card bordered>
          <AppText variant="title">{t('today.allDoneTitle')}</AppText>
          <AppText variant="body" color={colors.muted}>
            {t('today.allDoneBody')}
          </AppText>
        </Card>
      )}

      {upcoming.length > 0 && (
        <>
          <View style={styles.sectionHead}>
            <AppText variant="headingSm">{t('today.todaysVisits')}</AppText>
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={() => router.navigate({ pathname: '/my-work', params: { filter: 'pending' } })}
            >
              <AppText variant="label" color={colors.green}>
                {t('today.viewAll', { count: upcoming.length })}
              </AppText>
            </Pressable>
          </View>
          <View style={styles.list}>
            {upcoming.slice(0, MAX_LIST).map((item) => (
              <VisitRow key={item.customer.id} item={item} onPress={() => openCustomer(item.customer.id)} />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function NextVisitCard({ item, onOpen }: { item: WorkItem; onOpen: () => void }) {
  const { t } = useTranslation();
  const c = item.customer;
  const overdue = c.overdueDays > 0;
  return (
    <Card bordered style={styles.next}>
      <View style={styles.rowBetween}>
        <Badge label={overdue ? t('status.overdue') : t('status.dueToday')} tone={overdue ? 'red' : 'green'} />
        <AppText variant="caption" color={colors.muted}>
          {t('common.kmAway', { km: c.distanceKm })}
        </AppText>
      </View>
      <View>
        <AppText variant="heading">{c.name}</AppText>
        <AppText variant="body" color={colors.muted}>
          {overdue ? t('status.daysOverdue', { count: c.overdueDays }) : `${c.area} · ${c.loanType}`}
        </AppText>
      </View>
      <View style={styles.rowBetween}>
        <AppText variant="label" color={colors.muted}>
          {t('today.emiDue')}
        </AppText>
        <AppText variant="heading">{inr(c.dueAmount)}</AppText>
      </View>
      <Button label={`${t('common.viewCustomer')} →`} onPress={onOpen} />
    </Card>
  );
}

function VisitRow({ item, onPress }: { item: WorkItem; onPress: () => void }) {
  const { t } = useTranslation();
  const c = item.customer;
  const overdue = c.overdueDays > 0;
  const line = overdue
    ? `${t('status.daysOverdue', { count: c.overdueDays })} · ${inr(c.dueAmount)}`
    : `${t('status.dueToday')} · ${inr(c.dueAmount)}`;
  return (
    <Card onPress={onPress} style={styles.visitRow} accessibilityLabel={`${c.name}, ${line}`}>
      <Feather name="clock" size={20} color={colors.red} />
      <View style={styles.flex}>
        <AppText variant="label">{c.name}</AppText>
        <AppText variant="caption" color={overdue ? colors.red : colors.muted}>
          {line}
        </AppText>
      </View>
      <AppText variant="caption" color={colors.muted}>
        {t('common.km', { km: c.distanceKm })}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  greeting: { gap: 8, paddingTop: 24 },
  summary: { padding: 20, gap: 16 },
  summaryRow: { flexDirection: 'row', gap: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  next: { gap: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  list: { gap: 12 },
  visitRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});
