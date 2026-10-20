import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import agentData from '@/mocks/agent.json';
import performance from '@/mocks/performance.json';
import { useApp, type Language } from '@/store/app';
import { useMonthPerformance } from '@/store/selectors';
import { showToast } from '@/store/toast';
import { colors, radius } from '@/theme/tokens';
import { initials, inrShort } from '@/utils/format';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const month = useMonthPerformance();
  const language = useApp((s) => s.language);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { agent } = agentData;

  const menu: { key: string; label: string; value?: string; onPress: () => void }[] = [
    { key: 'referral', label: t('profile.newReferral'), onPress: () => router.push('/referral') },
    { key: 'history', label: t('profile.history'), onPress: () => router.push('/history') },
    {
      key: 'language',
      label: t('profile.language'),
      value: t(`language.${language === 'en' ? 'english' : language === 'ta' ? 'tamil' : 'hindi'}`),
      onPress: () => setLanguageOpen(true),
    },
    { key: 'settings', label: t('profile.settings'), onPress: () => showToast(t('common.notDesigned')) },
  ];

  return (
    <Screen inTabs>
      <AppText variant="heading" accessibilityRole="header" style={styles.title}>
        {t('profile.title')}
      </AppText>

      <View style={styles.identity}>
        <View style={styles.avatar}>
          <AppText variant="title" color={colors.green}>
            {initials(agent.name)}
          </AppText>
        </View>
        <View style={styles.flex}>
          <AppText variant="title">{agent.name}</AppText>
          <AppText variant="caption" color={colors.muted}>
            {agent.role}
          </AppText>
          <AppText variant="caption" color={colors.muted}>
            {agent.branch}
          </AppText>
        </View>
      </View>

      <Card style={styles.monthCard}>
        <AppText variant="label">{month.label}</AppText>
        <AppText variant="heading">{`${inrShort(month.collected)} / ${inrShort(month.target)}`}</AppText>
        <View style={styles.progressRow}>
          <View style={styles.flex}>
            <ProgressBar value={month.percent / 100} />
          </View>
          <AppText variant="caption">{`${month.percent}%`}</AppText>
        </View>
        <AppText variant="caption" color={colors.muted}>
          {t('profile.targetNote')}
        </AppText>
        <MenuLink onPress={() => setRatingOpen(true)} accessibilityLabel={`${month.rating} / 5 ${t('profile.performance')}`}>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={22} color={colors.green} />
            <AppText variant="headingSm">{`${month.rating.toFixed(1)} / 5`}</AppText>
            <AppText variant="label">{t('profile.performance')}</AppText>
          </View>
        </MenuLink>
        <MenuLink onPress={() => router.push('/performance')}>
          <AppText variant="label">{t('profile.pastPerformance')}</AppText>
        </MenuLink>
      </Card>

      {performance.managerNotes.map((note) => (
        <Card key={note.id} tone="soft" style={styles.note}>
          <MaterialCommunityIcons
            name={note.kind === 'recognition' ? 'hand-clap' : 'lightbulb-on-outline'}
            size={26}
            color={colors.green}
          />
          <View style={styles.flex}>
            <AppText variant="label">{note.text}</AppText>
            <AppText variant="caption" color={colors.muted}>
              {`${t('common.fromManager')} · ${note.from}`}
            </AppText>
          </View>
        </Card>
      ))}

      <Card style={styles.menu}>
        {menu.map((item, i) => (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={item.value ? `${item.label}, ${item.value}` : item.label}
            onPress={item.onPress}
            style={({ pressed }) => [styles.menuItem, i > 0 && styles.menuDivider, pressed && styles.pressed]}
          >
            <AppText variant="label" style={styles.flex}>
              {item.label}
            </AppText>
            {item.value && (
              <AppText variant="caption" color={colors.muted}>
                {item.value}
              </AppText>
            )}
            <Feather name="chevron-right" size={22} color={colors.muted} />
          </Pressable>
        ))}
      </Card>

      <RatingSheet visible={ratingOpen} onClose={() => setRatingOpen(false)} />
      <LanguageSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </Screen>
  );
}

function MenuLink({
  children,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <View style={styles.flex}>{children}</View>
      <Feather name="chevron-right" size={22} color={colors.muted} />
    </Pressable>
  );
}

function RatingSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('ratingSheet.title')} titleStyle="title">
      {performance.currentMonth.ratingBreakdown.map((row) => (
        <View key={row.key} style={styles.sheetRow}>
          <AppText variant="label">{t(`ratingSheet.${row.key}`)}</AppText>
          <AppText variant="label" color={row.level === 'good' ? colors.green : colors.amber}>
            {t(`ratingSheet.${row.level}`)}
          </AppText>
        </View>
      ))}
      <AppText variant="caption" color={colors.muted}>
        {t('ratingSheet.footnote')}
      </AppText>
    </BottomSheet>
  );
}

function LanguageSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const language = useApp((s) => s.language);
  const setLanguage = useApp((s) => s.setLanguage);
  const options: { code: Language; label: string; available: boolean }[] = [
    { code: 'en', label: t('language.english'), available: true },
    { code: 'ta', label: t('language.tamil'), available: false },
    { code: 'hi', label: t('language.hindi'), available: false },
  ];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('language.title')} titleStyle="title">
      <AppText variant="small" color={colors.muted}>
        {t('language.subtitle')}
      </AppText>
      {options.map((o) => {
        const selected = language === o.code;
        return (
          <Pressable
            key={o.code}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: !o.available }}
            disabled={!o.available}
            onPress={() => {
              setLanguage(o.code);
              onClose();
            }}
            style={[styles.langOption, selected && styles.langSelected]}
          >
            <AppText variant="bodyMedium" color={o.available ? colors.ink : colors.subtle} style={styles.flex}>
              {o.label}
            </AppText>
            {selected ? (
              <Feather name="check" size={20} color={colors.green} />
            ) : (
              !o.available && (
                <AppText variant="caption" color={colors.amber}>
                  {t('common.comingSoon')}
                </AppText>
              )
            )}
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { paddingTop: 24 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCard: { gap: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  link: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 20 },
  menu: { padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 56, paddingHorizontal: 16 },
  menuDivider: { borderTopWidth: 1, borderTopColor: colors.line },
  pressed: { opacity: 0.7 },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 56 },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: radius[12],
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  langSelected: { borderColor: colors.green, backgroundColor: colors.greenSoft },
});
