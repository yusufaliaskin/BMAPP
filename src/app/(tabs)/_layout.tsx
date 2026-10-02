/**
 * Öğrenci sekmeleri — Ana Sayfa / Sıralama / Profil.
 * Test akışı bu sekmelerin dışında, tam ekran ilerler (§30).
 */

import { Tabs } from 'expo-router';

import { GlassTabBar } from '@/components/glass/GlassTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Ana Sayfa' }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Sıralama' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
