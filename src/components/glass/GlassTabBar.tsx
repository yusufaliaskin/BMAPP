/**
 * GlassTabBar — yüzen cam sekme çubuğu (Ana Sayfa / Sıralama / Profil).
 * Simetri: üç eşit öğe, aynı yükseklik; aktif durum hem renk hem dolguyla belli.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';

import { GlassCard } from './GlassCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { palette, radius, space, type } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  index: { active: 'home', inactive: 'home-outline' },
  leaderboard: { active: 'trophy', inactive: 'trophy-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <GlassCard padded={false} level="strong" style={styles.bar}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key].options;
            const label =
              typeof options.title === 'string' ? options.title : route.name;
            const icons = TAB_ICONS[route.name] ?? TAB_ICONS.index;

            return (
              <PressableScale
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}
                haptic="selection"
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                style={styles.item}
              >
                <View style={[styles.itemInner, focused ? styles.itemActive : null]}>
                  <Ionicons
                    name={focused ? icons.active : icons.inactive}
                    size={22}
                    color={focused ? palette.primary : palette.inkFaint}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      type.caption,
                      { color: focused ? palette.primary : palette.inkFaint },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layoutPadding(),
    paddingTop: space.sm,
    backgroundColor: 'transparent',
  },
  bar: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    padding: space.xs,
    gap: space.xs,
  },
  item: {
    flex: 1,
  },
  itemInner: {
    height: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  itemActive: {
    backgroundColor: palette.primarySoft,
  },
});

function layoutPadding(): number {
  return space.xl;
}
