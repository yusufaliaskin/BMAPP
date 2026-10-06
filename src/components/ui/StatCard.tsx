/**
 * StatCard — tek istatistik kartı (dashboard, ana sayfa, sınıf özetleri).
 * Simge balonu + büyük değer + etiket; ızgara içinde eşit geometri.
 * Emoji yerine vektör simge kullanılır (platformlar arası tutarlı ve tema rengine uyar).
 */

import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { palette, space, topicAccents, type, type TopicAccent } from '@/theme';

interface StatCardProps {
  emoji: string;
  value: string | number;
  label: string;
  accent?: TopicAccent;
}

export function StatCard({ emoji, value, label, accent = 'sky' }: StatCardProps) {
  const tone = topicAccents[accent];
  return (
    <GlassCard padded={false} style={styles.card}>
      <View style={styles.inner}>
        <View style={[styles.bubble, { backgroundColor: tone.soft }]}>
          <Text style={styles.emoji} maxFontSizeMultiplier={1.1}>
            {emoji}
          </Text>
        </View>
        <Text style={[type.h2, { color: palette.ink }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {value}
        </Text>
        <Text
          style={[type.caption, { color: palette.inkSoft }]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.2}
        >
          {label}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  inner: {
    padding: space.lg,
    alignItems: 'center',
    gap: space.xs,
  },
  bubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
  emoji: {
    fontSize: 22,
  },
});
