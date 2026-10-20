import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { hideToast, useToast } from '@/store/toast';
import { colors, radius } from '@/theme/tokens';
import { AppText } from './AppText';

const VISIBLE_MS = 3500;

export function ToastHost() {
  const { message, action, key } = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hideToast, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, key]);

  if (!message) return null;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: 104 + insets.bottom }]}>
      <View style={styles.toast} accessibilityLiveRegion="polite">
        <AppText variant="small" color={colors.white} style={styles.text}>
          {message}
        </AppText>
        {action && (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              action.onPress();
              hideToast();
            }}
          >
            <AppText variant="label" color={colors.greenSoft}>
              {action.label}
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.ink,
    borderRadius: radius[12],
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: { flex: 1 },
});
