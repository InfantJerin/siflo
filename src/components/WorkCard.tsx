import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { WorkItem } from '@/store/selectors';
import { colors } from '@/theme/tokens';
import { dateShort, inr, time } from '@/utils/format';
import { AppText } from './ui/AppText';
import { Card } from './ui/Card';

interface Props {
  item: WorkItem;
  onPress: () => void;
}

/** A customer row on My work. Visits recorded in this session get the highlighted style from A6d. */
export function WorkCard({ item, onPress }: Props) {
  const { t } = useTranslation();
  const { customer, activity, category } = item;

  if (activity?.recordedInApp) {
    const line =
      activity.kind === 'collection'
        ? t('myWork.justCollected', { amount: inr(activity.amount), method: t(`common.${activity.method}`).toLowerCase() })
        : t('myWork.justRecorded', { outcome: t(`outcome.${activity.outcome}`), time: time(new Date(activity.at)) });
    return (
      <Card tone="soft" onPress={onPress} style={styles.highlight} accessibilityLabel={`${customer.name}, ${line}`}>
        <Feather name="check" size={22} color={colors.green} />
        <View style={styles.flex}>
          <AppText variant="label">{customer.name}</AppText>
          <AppText variant="caption" color={colors.muted}>
            {line}
          </AppText>
        </View>
      </Card>
    );
  }

  let headline: string;
  let detail: string;
  if (category === 'pending') {
    headline = t('myWork.paymentPending', { amount: inr(customer.dueAmount) });
    detail =
      customer.overdueDays > 0
        ? t('status.daysOverdue', { count: customer.overdueDays })
        : t('myWork.scheduledNotDone');
  } else if (activity?.kind === 'collection') {
    headline = t('myWork.received', { amount: inr(activity.amount) });
    detail = t('myWork.paidToday', { method: t(`common.${activity.method}`) });
  } else if (activity?.kind === 'visit' && activity.outcome === 'willPay' && activity.amount) {
    headline = t('myWork.promised', { amount: inr(activity.amount) });
    detail = activity.followUp
      ? t('myWork.followUpOn', { date: dateShort(new Date(activity.followUp)) })
      : t('myWork.outcomeToday');
  } else {
    headline = activity?.kind === 'visit' ? t(`outcome.${activity.outcome}`) : '';
    detail =
      activity?.kind === 'visit' && activity.followUp
        ? t('myWork.followUpOn', { date: dateShort(new Date(activity.followUp)) })
        : t('myWork.outcomeToday');
  }

  return (
    <Card onPress={onPress} accessibilityLabel={`${customer.name}, ${headline}, ${detail}`}>
      <AppText variant="title" style={styles.name}>
        {customer.name}
      </AppText>
      <AppText variant="label">{headline}</AppText>
      <AppText variant="caption" color={category === 'pending' && customer.overdueDays > 0 ? colors.red : colors.muted}>
        {detail}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  highlight: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
  flex: { flex: 1 },
  name: { marginBottom: 2 },
});
