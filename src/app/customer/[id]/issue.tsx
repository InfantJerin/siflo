import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { OptionTile } from '@/components/ui/Chip';
import { Field, SelectField } from '@/components/ui/Field';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { VoicePlayerButton } from '@/components/VoicePlayerButton';
import agentData from '@/mocks/agent.json';
import { useApp } from '@/store/app';
import { useCapture } from '@/store/capture';
import { demoNow, toLocalIso } from '@/store/clock';
import { useCustomer } from '@/store/selectors';
import { showToast } from '@/store/toast';
import type { VisitOutcome } from '@/store/types';
import { colors, radius } from '@/theme/tokens';
import { dateLong, duration, time } from '@/utils/format';

const OUTCOMES: { key: VisitOutcome; icon: 'user-x' | 'credit-card' | 'flag' | 'more-horizontal' }[] = [
  { key: 'notAvailable', icon: 'user-x' },
  { key: 'willPay', icon: 'credit-card' },
  { key: 'escalate', icon: 'flag' },
  { key: 'other', icon: 'more-horizontal' },
];

const MIN_RECORDING_MS = 1000;

interface Voice {
  uri: string;
  seconds: number;
}

export default function RecordIssueScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const customer = useCustomer(id);
  const recordIssue = useApp((s) => s.recordIssue);

  const [openedAt] = useState(demoNow);
  const [outcome, setOutcome] = useState<VisitOutcome | null>(null);
  const [note, setNote] = useState('');
  const [followUp, setFollowUp] = useState<Date | null>(null);
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [voice, setVoice] = useState<Voice | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const holding = useRef(false);

  const dirty = !!(outcome || note.trim() || followUp || photoUri || voice);
  const [leaving, setLeaving] = useState(false);
  const pendingLeave = useRef<(() => void) | null>(null);

  // Pick up a photo handed back from the camera screen.
  useFocusEffect(
    useCallback(() => {
      const captured = useCapture.getState().photoUri;
      if (captured) {
        setPhotoUri(captured);
        useCapture.getState().setPhoto(null);
      }
    }, []),
  );

  // Ask before throwing away unsaved work (header back, hardware back, swipe back).
  const navigation = useNavigation();
  usePreventRemove(dirty && !leaving, ({ data }) => {
    pendingLeave.current = () => navigation.dispatch(data.action);
    setDiscardOpen(true);
  });

  // Leave only after the guard above has been lifted, or it would block us again.
  useEffect(() => {
    if (leaving) pendingLeave.current?.();
  }, [leaving]);

  if (!customer) return null;

  const pickDate = () => {
    const tomorrow = new Date(demoNow());
    tomorrow.setDate(tomorrow.getDate() + 1);
    const value = followUp ?? tomorrow;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode: 'date',
        minimumDate: demoNow(),
        onChange: (event, date) => {
          if (event.type === 'set' && date) setFollowUp(date);
        },
      });
    } else {
      if (!followUp) setFollowUp(value);
      setIosPickerOpen(true);
    }
  };

  const startRecording = async () => {
    holding.current = true;
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      showToast(t('issue.micDenied'));
      return;
    }
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    // The finger may already be lifted while the permission prompt was up.
    if (!holding.current) return;
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    holding.current = false;
    if (!recorder.isRecording) return;
    const elapsed = recorder.currentTime * 1000;
    await recorder.stop();
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    if (elapsed < MIN_RECORDING_MS || !recorder.uri) {
      showToast(t('issue.tooShort'));
      return;
    }
    setVoice({ uri: recorder.uri, seconds: Math.round(elapsed / 1000) });
  };

  const removePhoto = () => {
    const previous = photoUri;
    setPhotoUri(null);
    showToast(t('issue.photoRemoved'), { label: t('issue.undo'), onPress: () => setPhotoUri(previous) });
  };

  const removeVoice = () => {
    const previous = voice;
    setVoice(null);
    showToast(t('issue.voiceRemoved'), { label: t('issue.undo'), onPress: () => setVoice(previous) });
  };

  const save = () => {
    if (!outcome) {
      showToast(t('issue.chooseOutcome'));
      return;
    }
    recordIssue({
      customerId: customer.id,
      outcome,
      note: note.trim(),
      followUp: followUp ? toLocalIso(followUp).slice(0, 10) : undefined,
      photoUri: photoUri ?? undefined,
      voiceUri: voice?.uri,
      voiceSeconds: voice?.seconds,
      // A promise amount field isn't designed yet, so a promise assumes the amount due.
      ...(outcome === 'willPay' ? { amount: customer.dueAmount } : {}),
    });
    pendingLeave.current = () => {
      router.dismissAll();
      router.navigate('/');
      showToast(t('issue.saved'));
    };
    setLeaving(true);
  };

  const recording = recorderState.isRecording;

  return (
    <Screen
      header={<ScreenHeader title={t('issue.title')} />}
      footer={<Button label={t('issue.save')} onPress={save} disabled={!outcome} />}
    >
      <View style={styles.group}>
        <AppText variant="label">{`${customer.name} · ${customer.loanId}`}</AppText>
        <View style={styles.location}>
          <AppText variant="caption" color={colors.muted}>
            {t('issue.locationAccuracy', { meters: agentData.location.accuracyMeters, time: time(openedAt) })}
          </AppText>
        </View>
      </View>

      <View style={styles.group}>
        <AppText variant="title" color={colors.muted}>
          {t('issue.whatHappened')}
        </AppText>
        <View style={styles.grid}>
          {[OUTCOMES.slice(0, 2), OUTCOMES.slice(2)].map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((o) => (
                <OptionTile
                  key={o.key}
                  label={t(`outcome.${o.key}`)}
                  icon={o.icon}
                  tone={o.key === 'escalate' ? 'danger' : 'neutral'}
                  selected={outcome === o.key}
                  onPress={() => setOutcome(o.key)}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <Field
        label={t('issue.note')}
        value={note}
        onChangeText={setNote}
        placeholder={t('issue.notePlaceholder')}
        multiline
      />

      <SelectField
        label={t('issue.followUp')}
        value={followUp ? dateLong(followUp) : undefined}
        placeholder={t('issue.followUpPlaceholder')}
        onPress={pickDate}
        trailing={<Feather name="calendar" size={18} color={colors.muted} />}
      />

      <View style={styles.group}>
        <AppText variant="label">{t('issue.proof')}</AppText>
        <View style={styles.row}>
          <Button
            variant="secondary"
            icon="camera"
            label={t('issue.takePhoto')}
            style={[styles.flex, styles.outlineGreen]}
            onPress={() => router.push({ pathname: '/photo', params: { name: customer.name } })}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('issue.holdToRecord')}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={[styles.flex, styles.recordBtn, recording && styles.recording]}
          >
            <Feather name="mic" size={18} color={recording ? colors.white : colors.green} />
            <AppText variant="bodyMedium" color={recording ? colors.white : colors.green}>
              {recording ? duration(recorderState.durationMillis / 1000) : t('issue.holdToRecord')}
            </AppText>
          </Pressable>
        </View>
        {recording && (
          <AppText variant="caption" color={colors.red} align="center">
            {t('issue.recording')}
          </AppText>
        )}

        {photoUri && (
          <View style={styles.attachment}>
            <Image source={{ uri: photoUri }} style={styles.thumb} contentFit="cover" />
            <AppText variant="label" style={styles.flex}>
              {t('issue.photoAdded')}
            </AppText>
            <RemoveButton label={t('issue.remove')} onPress={removePhoto} />
          </View>
        )}
        {voice && (
          <View style={styles.attachment}>
            <VoicePlayerButton voice={voice.uri} seconds={voice.seconds} style={styles.flex} />
            <RemoveButton label={t('issue.remove')} onPress={removeVoice} />
          </View>
        )}
      </View>

      {Platform.OS === 'ios' && (
        <BottomSheet visible={iosPickerOpen} onClose={() => setIosPickerOpen(false)} title={t('issue.followUp')} titleStyle="title">
          <DateTimePicker
            value={followUp ?? demoNow()}
            mode="date"
            display="inline"
            minimumDate={demoNow()}
            accentColor={colors.green}
            onChange={(_, date) => date && setFollowUp(date)}
          />
        </BottomSheet>
      )}

      <BottomSheet visible={discardOpen} onClose={() => setDiscardOpen(false)} title={t('issue.discardTitle')} showClose={false}>
        <AppText variant="small" color={colors.muted}>
          {t('issue.discardBody')}
        </AppText>
        <Button label={t('issue.keepEditing')} onPress={() => setDiscardOpen(false)} />
        <Button
          variant="secondary"
          label={t('issue.discard')}
          onPress={() => {
            setDiscardOpen(false);
            setLeaving(true);
          }}
        />
      </BottomSheet>
    </Screen>
  );
}

function RemoveButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={10} onPress={onPress} style={styles.remove}>
      <Feather name="trash-2" size={18} color={colors.red} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: 8 },
  grid: { gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  location: { backgroundColor: colors.greenSoft, paddingHorizontal: 12, paddingVertical: 6 },
  outlineGreen: { borderColor: colors.green },
  recordBtn: {
    minHeight: 48,
    borderRadius: radius[12],
    borderWidth: 1,
    borderColor: colors.green,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recording: { backgroundColor: colors.red, borderColor: colors.red },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: radius[12],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  thumb: { width: 56, height: 56, borderRadius: radius[8] },
  remove: { padding: 8 },
});
