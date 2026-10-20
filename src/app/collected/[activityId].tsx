import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { useApp } from '@/store/app';
import { colors, radius } from '@/theme/tokens';
import { dateTime, inr } from '@/utils/format';

export default function CollectionStatusScreen() {
  const { t } = useTranslation();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const activity = useApp((s) => s.activities.find((a) => a.id === activityId));
  const customer = useApp((s) => s.customers.find((c) => c.id === activity?.customerId));

  const backToToday = () => {
    router.dismissAll();
    router.navigate('/');
  };

  // Hardware back from a confirmation goes home too, never back into the form.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      backToToday();
      return true;
    });
    return () => sub.remove();
  }, []);

  if (!activity || activity.kind !== 'collection' || !customer) return null;

  return (
    <Screen
      header={<ScreenHeader title={t('collected.title')} back={false} />}
      footer={<Button label={t('collected.backToToday')} onPress={backToToday} />}
    >
      <Card tone="green" style={styles.receipt}>
        <View style={styles.top}>
          <View style={styles.flex}>
            <AppText variant="display" color={colors.white}>
              {inr(activity.amount)}
            </AppText>
            <AppText variant="title" color={colors.white}>
              {customer.name}
            </AppText>
          </View>
          <View style={styles.check} accessibilityLabel="Recorded">
            <Feather name="check" size={30} color={colors.green} />
          </View>
        </View>
        <AppText variant="body" color={colors.white}>
          {`${t(`common.${activity.method}`)} · ${dateTime(new Date(activity.at))}`}
        </AppText>
        <View style={styles.rule} />
        <AppText variant="caption" color={colors.white} upper>
          {t('collected.reference')}
        </AppText>
        <AppText variant="label" color={colors.white} selectable>
          {activity.reference}
        </AppText>
      </Card>

      <View style={styles.notice}>
        <Feather name="info" size={16} color={colors.amber} />
        <AppText variant="caption" color={colors.amber}>
          {t('collected.accountantNotified')}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  receipt: { padding: 24, gap: 8, marginTop: 16 },
  top: { flexDirection: 'row', alignItems: 'flex-start' },
  check: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#dfe8e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rule: { height: 1, backgroundColor: 'rgba(255,255,255,0.8)', marginVertical: 8 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius[12],
    backgroundColor: colors.amberSoft,
  },
});
