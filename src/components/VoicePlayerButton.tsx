import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { StyleProp, ViewStyle } from 'react-native';

import { voiceSource } from '@/mocks/media';
import { duration } from '@/utils/format';
import { Button } from './ui/Button';

interface Props {
  voice: string;
  /** Known length, shown before the file has loaded. */
  seconds?: number;
  /** Show the length on the button ("Play voice note · 0:38"). */
  showLength?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function VoicePlayerButton({ voice, seconds, showLength = true, style }: Props) {
  const { t } = useTranslation();
  const player = useAudioPlayer(voiceSource(voice));
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (status.didJustFinish) {
      player.pause();
      player.seekTo(0);
    }
  }, [status.didJustFinish, player]);

  const total = status.duration > 0 ? status.duration : (seconds ?? 0);
  const playing = status.playing;

  const toggle = async () => {
    if (playing) {
      player.pause();
      return;
    }
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    player.play();
  };

  const label = playing
    ? t('common.pauseVoiceNote', { time: duration(total - status.currentTime) })
    : showLength && total > 0
      ? t('common.playVoiceNoteWithTime', { time: duration(total) })
      : t('common.playVoiceNote');

  return <Button variant="secondary" label={label} onPress={toggle} style={style} />;
}
