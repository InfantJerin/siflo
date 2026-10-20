import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors, radius } from '@/theme/tokens';
import { AppText } from './AppText';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** Title in the condensed heading face (detail sheets) vs. the plain title face (info sheets). */
  titleStyle?: 'heading' | 'title';
  showClose?: boolean;
  children: ReactNode;
}

export function BottomSheet({ visible, onClose, title, titleStyle = 'heading', showClose = true, children }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        />
        <View style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
          {(title || showClose) && (
            <View style={styles.head}>
              {title && (
                <AppText variant={titleStyle === 'heading' ? 'heading' : 'title'} style={styles.title}>
                  {title}
                </AppText>
              )}
              {showClose && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.close')}
                  onPress={onClose}
                  style={styles.close}
                  hitSlop={8}
                >
                  <Feather name="x" size={16} color={colors.green} />
                </Pressable>
              )}
            </View>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius[24],
    borderTopRightRadius: radius[24],
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { flex: 1, paddingTop: 6 },
  close: {
    width: 44,
    height: 44,
    borderRadius: radius[12],
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
