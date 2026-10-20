import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { MapIllustration } from '@/components/MapIllustration';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/Screen';
import agentData from '@/mocks/agent.json';
import { useToday } from '@/store/selectors';
import { colors } from '@/theme/tokens';
import { openDirections } from '@/utils/device';
import { inr } from '@/utils/format';

const YOU = { x: 104, y: 509 };

/** A5 · Today's route — illustrative map; Navigate hands off to Google Maps. */
export default function RouteScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const today = useToday();
  const [selectedId, setSelectedId] = useState(today.next?.customer.id ?? today.items[0]?.customer.id);

  const selected = today.items.find((i) => i.customer.id === selectedId) ?? today.items[0];
  const total = today.items.length;

  const stops = today.items.map((i) => ({
    id: i.customer.id,
    number: i.customer.routeOrder,
    x: i.customer.map.x,
    y: i.customer.map.y,
    done: i.category !== 'pending',
    selected: i.customer.id === selected?.customer.id,
  }));

  if (!selected) return null;
  const c = selected.customer;
  const done = selected.category !== 'pending';
  const isNext = today.next?.customer.id === c.id;
  const status = c.overdueDays > 0 ? t('status.daysOverdue', { count: c.overdueDays }) : t('status.dueToday');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('route.title')}
        subtitle={t('route.subtitle', { count: today.pending.length, city: agentData.agent.city })}
      />
      <View style={styles.flex}>
        <MapIllustration stops={stops} you={YOU} youLabel={t('route.you')} onSelect={setSelectedId} />
      </View>
      <View style={[styles.panel, { paddingBottom: 24 + insets.bottom }]}>
        <AppText variant="overline" color={colors.muted} upper>
          {done
            ? t('route.completedStop', { stop: c.routeOrder, total })
            : `${isNext ? `${t('today.nextVisit')} · ` : ''}${t('route.stop', { stop: c.routeOrder, total, km: c.distanceKm })}`}
        </AppText>
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppText variant="heading">{c.name}</AppText>
            <AppText variant="small" color={colors.muted}>
              {t('route.dueLine', { amount: inr(c.dueAmount), status })}
            </AppText>
          </View>
          {!done && (
            <Button
              label={t('common.navigate')}
              onPress={() => openDirections(c.coords.lat, c.coords.lng, true)}
              style={styles.navigate}
            />
          )}
        </View>
        <Button
          variant="secondary"
          label={`${t('common.viewCustomer')} →`}
          onPress={() => router.push({ pathname: '/customer/[id]', params: { id: c.id } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  panel: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navigate: { paddingHorizontal: 28 },
});
