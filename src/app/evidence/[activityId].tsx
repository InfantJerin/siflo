import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PhotoProofView } from '@/components/PhotoProofView';
import { AppText } from '@/components/ui/AppText';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { useApp } from '@/store/app';
import { colors } from '@/theme/tokens';
import { time } from '@/utils/format';

/** Evidence · View photo */
export default function EvidenceScreen() {
  const { t } = useTranslation();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const activity = useApp((s) => s.activities.find((a) => a.id === activityId));
  const customer = useApp((s) => s.customers.find((c) => c.id === activity?.customerId));

  if (!activity || activity.kind !== 'visit' || !activity.photo || !customer) return null;

  return (
    <Screen header={<ScreenHeader title={t('photo.proofTitle')} />}>
      <AppText variant="heading">{customer.name}</AppText>
      <PhotoProofView photo={activity.photo} height={480} />
      <AppText variant="caption" color={colors.muted}>
        {t('photo.visitPhoto', { time: time(new Date(activity.at)) })}
      </AppText>
    </Screen>
  );
}
