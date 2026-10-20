import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, SelectField } from '@/components/ui/Field';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { useApp } from '@/store/app';
import { demoNow } from '@/store/clock';
import { useCustomer } from '@/store/selectors';
import { showToast } from '@/store/toast';
import type { PaymentMethod } from '@/store/types';
import { colors } from '@/theme/tokens';
import { dateLong, inr, time } from '@/utils/format';

export default function RecordCollectionScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customer = useCustomer(id);
  const recordCollection = useApp((s) => s.recordCollection);

  const [amountText, setAmountText] = useState(() => (customer ? customer.dueAmount.toLocaleString('en-IN') : ''));
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [note, setNote] = useState(t('collect.defaultCashNote'));
  const [noteTouched, setNoteTouched] = useState(false);
  const [now] = useState(demoNow);

  if (!customer) return null;

  const amount = Number(amountText.replace(/[^0-9]/g, ''));
  const valid = amount > 0;

  const chooseMethod = (m: PaymentMethod) => {
    setMethod(m);
    if (!noteTouched) setNote(t(m === 'cash' ? 'collect.defaultCashNote' : 'collect.defaultUpiNote'));
  };

  const save = () => {
    if (!valid) {
      showToast(t('collect.invalidAmount'));
      return;
    }
    const activity = recordCollection({ customerId: customer.id, amount, method, note: note.trim() });
    router.replace({ pathname: '/collected/[activityId]', params: { activityId: activity.id } });
  };

  return (
    <Screen
      header={<ScreenHeader title={t('collect.title')} />}
      footer={<Button label={t('collect.save', { amount: inr(amount || 0) })} onPress={save} disabled={!valid} />}
    >
      <View>
        <AppText variant="title">{customer.name}</AppText>
        <AppText variant="body" color={colors.muted}>
          {t('collect.subtitle', { loanId: customer.loanId, amount: inr(customer.dueAmount) })}
        </AppText>
      </View>

      <Field
        label={t('collect.amount')}
        prefix="₹"
        value={amountText}
        onChangeText={(v) => {
          const digits = v.replace(/[^0-9]/g, '').slice(0, 7);
          setAmountText(digits ? Number(digits).toLocaleString('en-IN') : '');
        }}
        keyboardType="number-pad"
        inputMode="numeric"
      />

      <View style={styles.group}>
        <AppText variant="label">{t('collect.method')}</AppText>
        <View style={styles.row}>
          {(['cash', 'upi'] as const).map((m) => (
            <Button
              key={m}
              label={m === method ? `✓ ${t(`common.${m}`)}` : t(`common.${m}`)}
              variant={m === method ? 'primary' : 'secondary'}
              style={styles.flex}
              onPress={() => chooseMethod(m)}
            />
          ))}
        </View>
      </View>

      <SelectField label={t('collect.date')} value={`${dateLong(now)} · ${time(now)}`} />

      <Field
        label={t('collect.note')}
        value={note}
        placeholder={t('collect.notePlaceholder')}
        onChangeText={(v) => {
          setNote(v);
          setNoteTouched(true);
        }}
      />

      <Card style={styles.confirm}>
        <AppText variant="label">{t('collect.confirmTitle')}</AppText>
        <AppText variant="small" color={colors.muted}>
          {t('collect.confirmBody')}
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  confirm: { gap: 4 },
});
