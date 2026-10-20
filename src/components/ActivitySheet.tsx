import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useApp } from '@/store/app';
import { demoNow } from '@/store/clock';
import { colors } from '@/theme/tokens';
import { activityHeadline, activityTone } from '@/utils/activity';
import { callNumber } from '@/utils/device';
import { dateLong, sameDay, time } from '@/utils/format';
import { AppText } from './ui/AppText';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { VoicePlayerButton } from './VoicePlayerButton';

interface Props {
  activityId: string | null;
  onClose: () => void;
}

/** Detail bottom sheet for a recorded collection or visit (My work and History). */
export function ActivitySheet({ activityId, onClose }: Props) {
  const { t } = useTranslation();
  const activity = useApp((s) => s.activities.find((a) => a.id === activityId));
  const customer = useApp((s) => s.customers.find((c) => c.id === activity?.customerId));

  if (!activity || !customer) return <BottomSheet visible={false} onClose={onClose}>{null}</BottomSheet>;

  const at = new Date(activity.at);
  const now = demoNow();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const recorded = sameDay(at, now)
    ? t('history.recordedAt', { time: time(at) })
    : sameDay(at, yesterday)
      ? t('history.recordedYesterday', { time: time(at) })
      : t('history.recordedOn', { date: dateLong(at), time: time(at) });

  const hasPhoto = activity.kind === 'visit' && !!activity.photo;
  const voice = activity.kind === 'visit' ? activity.voice : undefined;

  return (
    <BottomSheet visible onClose={onClose} title={customer.name}>
      <AppText variant="label" color={activityTone(activity)}>
        {activityHeadline(t, activity)}
      </AppText>
      {!!activity.note && <AppText variant="body">{activity.note}</AppText>}
      <View style={styles.meta}>
        <AppText variant="caption" color={colors.muted}>
          {recorded}
        </AppText>
        {activity.kind === 'collection' && (
          <AppText variant="caption" color={colors.muted}>
            {t('history.reference', { ref: activity.reference })}
          </AppText>
        )}
        {activity.kind === 'visit' && activity.followUp && (
          <AppText variant="caption" color={colors.muted}>
            {t('history.followUp', { date: dateLong(new Date(activity.followUp)) })}
          </AppText>
        )}
      </View>
      <Button variant="secondary" label={t('common.callCustomer')} onPress={() => callNumber(customer.phone)} />
      {(hasPhoto || voice) && (
        <View style={styles.row}>
          {hasPhoto && (
            <Button
              variant="secondary"
              label={t('common.viewPhoto')}
              style={styles.flex}
              onPress={() => {
                onClose();
                router.push({ pathname: '/evidence/[activityId]', params: { activityId: activity.id } });
              }}
            />
          )}
          {voice && (
            <VoicePlayerButton
              voice={voice}
              seconds={activity.kind === 'visit' ? activity.voiceSeconds : undefined}
              showLength={false}
              style={styles.flex}
            />
          )}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  meta: { gap: 2, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
