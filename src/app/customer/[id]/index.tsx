import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Badge, RatingBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import agentData from '@/mocks/agent.json';
import { useApp } from '@/store/app';
import { useCustomer, useToday } from '@/store/selectors';
import { colors } from '@/theme/tokens';
import { earlierOutcomeLabel } from '@/utils/activity';
import { callNumber, openDirections } from '@/utils/device';
import { dateLong, dateShort, inr } from '@/utils/format';

export default function CustomerScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customer = useCustomer(id);
  const conversation = useApp((s) => s.conversations[id]);
  const today = useToday();

  if (!customer) return null;

  const overdue = customer.overdueDays > 0;
  const doneToday = today.completed.some((i) => i.customer.id === customer.id);
  const lastMessage = [...(conversation?.items ?? [])].reverse().find((i) => i.type === 'message');
  const latestVisit = customer.earlierVisits[0];
  const visitCount = customer.earlierVisits.length;

  return (
    <Screen
      header={<ScreenHeader title={t('customer.title')} />}
      footer={
        <>
          <Button
            label={t('customer.recordCollection')}
            onPress={() => router.push({ pathname: '/customer/[id]/collect', params: { id: customer.id } })}
          />
          <Button
            variant="secondary"
            label={t('customer.recordIssue')}
            onPress={() => router.push({ pathname: '/customer/[id]/issue', params: { id: customer.id } })}
          />
        </>
      }
    >
      <View style={styles.identity}>
        <View style={styles.nameRow}>
          <AppText variant="heading" style={styles.flex}>
            {customer.name}
          </AppText>
          <Badge label={overdue ? t('status.overdue') : t('status.dueToday')} tone={overdue ? 'red' : 'green'} />
        </View>
        <AppText variant="body" color={colors.muted}>
          {`${customer.loanType} · ${customer.loanId}`}
        </AppText>
        <AppText variant="body" color={colors.muted}>
          {`${customer.area}, ${agentData.agent.city}`}
        </AppText>
        <RatingBadge rating={customer.rating} />
      </View>

      {doneToday && <Badge label={t('customer.completedToday')} tone="green" icon="star" />}

      <View style={styles.row}>
        <Button
          variant="secondary"
          label={t('common.call')}
          style={styles.flex}
          onPress={() => callNumber(customer.phone)}
        />
        <Button
          variant="secondary"
          label={t('common.directions')}
          style={styles.flex}
          onPress={() => openDirections(customer.coords.lat, customer.coords.lng)}
        />
      </View>

      <Card style={styles.dueCard}>
        <AppText variant="label" color={colors.muted}>
          {overdue ? t('customer.amountOverdue') : t('customer.amountDueToday')}
        </AppText>
        <AppText variant="display">{inr(customer.dueAmount)}</AppText>
        <View style={styles.divider} />
        <InfoRow label={t('customer.dueDate')} value={dateLong(new Date(customer.dueDate))} />
        <InfoRow label={t('customer.outstanding')} value={inr(customer.outstanding)} />
        <InfoRow
          label={t('customer.lastPayment')}
          value={
            customer.lastPayment
              ? `${inr(customer.lastPayment.amount)} · ${dateShort(new Date(customer.lastPayment.date))}`
              : t('customer.noPayments')
          }
        />
      </Card>

      <Card
        bordered
        style={styles.convo}
        onPress={() => router.push({ pathname: '/customer/[id]/conversation', params: { id: customer.id } })}
        accessibilityLabel={t('customer.conversation')}
      >
        <View style={styles.flex}>
          <AppText variant="label">{t('customer.conversation')}</AppText>
          <AppText variant="caption" color={colors.muted} numberOfLines={1}>
            {lastMessage?.type === 'message'
              ? `${lastMessage.author.name}: ${lastMessage.text}`
              : t('customer.noMessages')}
          </AppText>
        </View>
        {!!conversation?.unread && (
          <AppText variant="caption" color={colors.green}>
            {t('customer.newCount', { count: conversation.unread })}
          </AppText>
        )}
        <Feather name="chevron-right" size={18} color={colors.green} />
      </Card>

      <Card
        tone="soft"
        style={styles.history}
        onPress={() => router.push({ pathname: '/customer/[id]/visits', params: { id: customer.id } })}
        accessibilityLabel={t('customer.visitHistory', { count: visitCount })}
      >
        <AppText variant="label" color={colors.green}>
          {visitCount > 0 ? `${t('customer.visitHistory', { count: visitCount })}  →` : t('customer.noVisitHistory')}
        </AppText>
        {latestVisit && (
          <AppText variant="caption" color={colors.muted}>
            {`${dateShort(new Date(latestVisit.date))} · ${latestVisit.agent} · ${earlierOutcomeLabel(t, latestVisit.outcome, latestVisit.amount).label}`}
          </AppText>
        )}
      </Card>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="label" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  identity: { gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  dueCard: { gap: 8, paddingHorizontal: 20 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  convo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  history: { gap: 4, paddingVertical: 20 },
});
