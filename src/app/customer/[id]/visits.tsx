import { useLocalSearchParams } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { VoicePlayerButton } from '@/components/VoicePlayerButton';
import { useCustomer } from '@/store/selectors';
import { colors } from '@/theme/tokens';
import { earlierOutcomeLabel } from '@/utils/activity';
import { dateShort } from '@/utils/format';

export default function EarlierVisitsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customer = useCustomer(id);
  if (!customer) return null;

  return (
    <Screen header={<ScreenHeader title={t('visits.title')} />}>
      <View>
        <AppText variant="title">{`${customer.name} · ${customer.loanId}`}</AppText>
        <AppText variant="caption" color={colors.muted}>
          {t('visits.assigned', { date: dateShort(new Date(customer.assignedOn)) })}
        </AppText>
      </View>

      {customer.earlierVisits.length === 0 && (
        <AppText variant="body" color={colors.muted}>
          {t('visits.empty')}
        </AppText>
      )}

      {customer.earlierVisits.map((v) => {
        const outcome = earlierOutcomeLabel(t, v.outcome, v.amount);
        return (
          <Fragment key={v.id}>
            <Card style={styles.visit}>
              <AppText variant="overline" color={colors.muted} upper>
                {`${dateShort(new Date(v.date))} · ${v.agent}`}
              </AppText>
              <AppText variant="label" color={outcome.color}>
                {outcome.label}
              </AppText>
              <AppText variant="body">{v.note}</AppText>
            </Card>
            {v.voice && <VoicePlayerButton voice={v.voice} seconds={v.voiceSeconds} />}
          </Fragment>
        );
      })}

      {!!customer.tip && (
        <Card tone="soft" style={styles.tip}>
          <AppText variant="label" color={colors.green}>
            {t('visits.fromEarlier')}
          </AppText>
          <AppText variant="body" color={colors.muted}>
            {customer.tip}
          </AppText>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  visit: { gap: 6, paddingVertical: 20 },
  tip: { gap: 4, paddingVertical: 20 },
});
