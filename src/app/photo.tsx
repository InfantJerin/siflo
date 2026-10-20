import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen, ScreenHeader } from '@/components/ui/Screen';
import { useCapture } from '@/store/capture';
import { colors } from '@/theme/tokens';

/** Photo · Capture and review — real camera; the result goes back to Record issue. */
export default function PhotoScreen() {
  const { t } = useTranslation();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shot, setShot] = useState<string | null>(null);

  const capture = async () => {
    if (!camera.current || !ready) return;
    setBusy(true);
    try {
      const photo = await camera.current.takePictureAsync({ quality: 0.6 });
      if (photo?.uri) setShot(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  const acceptPhoto = () => {
    useCapture.getState().setPhoto(shot);
    router.back();
  };

  const caption = t('photo.caption', { name: name ?? '' });

  let body: ReactNode;
  if (!permission) {
    body = <View style={styles.viewfinder} />;
  } else if (!permission.granted) {
    body = (
      <View style={[styles.viewfinder, styles.permission]}>
        <AppText variant="title" align="center">
          {t('photo.permissionTitle')}
        </AppText>
        <AppText variant="small" color={colors.muted} align="center">
          {t('photo.permissionBody')}
        </AppText>
        <Button label={t('photo.allow')} onPress={requestPermission} />
      </View>
    );
  } else if (shot) {
    body = <Image source={{ uri: shot }} style={styles.viewfinder} contentFit="cover" />;
  } else {
    body = <CameraView ref={camera} style={styles.viewfinder} facing="back" onCameraReady={() => setReady(true)} />;
  }

  return (
    <Screen
      header={<ScreenHeader title={t('photo.title')} />}
      footer={
        shot ? (
          <View style={styles.row}>
            <Button variant="secondary" label={t('photo.retake')} style={styles.flex} onPress={() => setShot(null)} />
            <Button label={t('photo.usePhoto')} style={styles.flex} onPress={acceptPhoto} />
          </View>
        ) : (
          <Button
            label={t('photo.capture')}
            icon="camera"
            onPress={capture}
            loading={busy}
            disabled={!permission?.granted || !ready}
          />
        )
      }
    >
      {body}
      <AppText variant="caption" color={colors.muted}>
        {caption}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  viewfinder: { width: '100%', aspectRatio: 364 / 480, backgroundColor: colors.ink, overflow: 'hidden' },
  permission: { backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
});
