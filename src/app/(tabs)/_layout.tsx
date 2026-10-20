import { Feather } from '@expo/vector-icons';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/AppText';
import { colors, radius } from '@/theme/tokens';

const ICONS: Record<string, ComponentProps<typeof Feather>['name']> = {
  index: 'home',
  'my-work': 'file-text',
  profile: 'user',
};

const LABELS: Record<string, string> = {
  index: 'tabs.today',
  'my-work': 'tabs.myWork',
  profile: 'tabs.profile',
};

function SifTabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  const { t } = useTranslation();
  return (
    <View style={[styles.bar, { paddingBottom: 12 + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const label = t(LABELS[route.name]);
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              if (!focused) navigateToTab(route.key);
            }}
            style={[styles.item, focused && styles.itemActive]}
          >
            <Feather name={ICONS[route.name]} size={20} color={focused ? colors.green : colors.muted} />
            <AppText variant="caption" color={focused ? colors.green : colors.ink}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <SifTabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="my-work" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: radius[12],
  },
  itemActive: { backgroundColor: colors.greenSoft },
});
