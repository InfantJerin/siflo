import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import agentData from '@/mocks/agent.json';
import { showToast } from '@/store/toast';
import { colors, radius } from '@/theme/tokens';

const PURPOSES = ['business', 'livestock', 'agriculture', 'education', 'household', 'other'] as const;
const AMOUNTS = ['lt25', '25to50', 'gt50'] as const;

type OtpStep = 'idle' | 'sent' | 'verified';

/** A17 · New Referral — OTP is mocked (see agent.json → mockOtp). */
export default function ReferralScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('idle');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [area, setArea] = useState('');
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number] | null>(null);
  const [amount, setAmount] = useState<(typeof AMOUNTS)[number] | null>(null);

  const mobileValid = /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''));
  const complete = name.trim() && otpStep === 'verified' && area.trim() && locationCaptured && purpose && amount;

  const verify = () => {
    if (otp === agentData.mockOtp) {
      setOtpStep('verified');
      setOtpError(false);
    } else {
      setOtpError(true);
    }
  };

  const submit = () => {
    if (!complete) {
      showToast(t('referral.incomplete'));
      return;
    }
    showToast(t('referral.submitted', { name: name.trim() }));
    router.back();
  };

  return (
    <Screen
      header={<ScreenHeader title={t('referral.title')} subtitle={t('referral.subtitle')} />}
      footer={<Button label={t('referral.submit')} onPress={submit} disabled={!complete} />}
    >
      <Card bordered style={styles.section}>
        <AppText variant="headingSm">{t('referral.customerDetails')}</AppText>
        <Field label={t('referral.name')} value={name} onChangeText={setName} placeholder={t('referral.namePlaceholder')} />

        <Field
          label={t('referral.mobile')}
          value={mobile}
          onChangeText={(v) => {
            setMobile(v.replace(/[^0-9 ]/g, '').slice(0, 11));
            if (otpStep !== 'idle') {
              setOtpStep('idle');
              setOtp('');
            }
          }}
          placeholder={t('referral.mobilePlaceholder')}
          keyboardType="phone-pad"
          editable={otpStep !== 'verified'}
          trailing={
            otpStep === 'verified' ? (
              <AppText variant="caption" color={colors.green}>
                {t('referral.verified')}
              </AppText>
            ) : otpStep === 'idle' ? (
              <Pressable
                accessibilityRole="button"
                disabled={!mobileValid}
                onPress={() => setOtpStep('sent')}
                hitSlop={8}
              >
                <AppText variant="label" color={mobileValid ? colors.green : colors.subtle}>
                  {t('referral.sendOtp')}
                </AppText>
              </Pressable>
            ) : null
          }
        />

        {otpStep === 'sent' && (
          <View style={styles.otp}>
            <View style={styles.otpRow}>
              <View style={styles.flex}>
                <Field
                  label={t('referral.otp')}
                  value={otp}
                  onChangeText={(v) => {
                    setOtp(v.replace(/\D/g, '').slice(0, 4));
                    setOtpError(false);
                  }}
                  keyboardType="number-pad"
                  autoFocus
                  maxLength={4}
                />
              </View>
              <Button label={t('referral.verify')} onPress={verify} disabled={otp.length < 4} style={styles.verify} />
            </View>
            <AppText variant="caption" color={otpError ? colors.red : colors.amber}>
              {otpError ? t('referral.wrongOtp', { otp: agentData.mockOtp }) : t('referral.otpHint', { otp: agentData.mockOtp })}
            </AppText>
          </View>
        )}
        {otpStep === 'verified' && (
          <AppText variant="caption" color={colors.muted}>
            {t('referral.consent')}
          </AppText>
        )}

        <Field label={t('referral.area')} value={area} onChangeText={setArea} placeholder={t('referral.areaPlaceholder')} />

        <View style={styles.group}>
          <AppText variant="label" color={colors.muted}>
            {t('referral.location')}
          </AppText>
          {locationCaptured ? (
            <View style={styles.location}>
              <Feather name="map-pin" size={18} color={colors.green} />
              <AppText variant="label" color={colors.green}>
                {t('referral.locationCaptured')}
              </AppText>
            </View>
          ) : (
            // GPS is intentionally mocked — no device location access.
            <Button
              variant="secondary"
              icon="map-pin"
              label={t('referral.captureLocation')}
              onPress={() => setLocationCaptured(true)}
            />
          )}
        </View>
      </Card>

      <Card bordered style={styles.section}>
        <AppText variant="headingSm">{t('referral.loanRequirement')}</AppText>
        <View style={styles.group}>
          <AppText variant="label" color={colors.muted}>
            {t('referral.purpose')}
          </AppText>
          {[PURPOSES.slice(0, 3), PURPOSES.slice(3)].map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((p) => (
                <Chip
                  key={p}
                  look="soft"
                  label={t(`referral.purposes.${p}`)}
                  selected={purpose === p}
                  onPress={() => setPurpose(p)}
                />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.group}>
          <AppText variant="label" color={colors.muted}>
            {t('referral.amount')}
          </AppText>
          <View style={styles.row}>
            {AMOUNTS.map((a) => (
              <Chip
                key={a}
                look="soft"
                label={t(`referral.amounts.${a}`)}
                selected={amount === a}
                onPress={() => setAmount(a)}
              />
            ))}
          </View>
        </View>
      </Card>

      <Card bordered style={styles.additional} onPress={() => showToast(t('common.notDesigned'))}>
        <AppText variant="label" style={styles.flex}>
          {t('referral.additional')}
        </AppText>
        <Badge label={t('common.optional')} tone="amber" />
        <Feather name="chevron-down" size={20} color={colors.green} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { gap: 12 },
  group: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  otp: { gap: 6 },
  otpRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  verify: { paddingHorizontal: 20 },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: radius[8],
    backgroundColor: colors.greenSoft,
  },
  additional: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
