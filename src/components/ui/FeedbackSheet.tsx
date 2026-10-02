/**
 * FeedbackSheet — soru geri bildirimi. Doğru: kısa kutlama; yanlış: nazik
 * "bir daha düşünelim" + çok kısa doğru bilgi (§12, §13). Çocuk asla cezalandırılmış hissetmez.
 * Giriş yumuşak (~220ms + stagger), çıkış daha hızlı (~140ms) — motion kuralı.
 */

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { GlassCard } from '@/components/glass/GlassCard';
import { palette, space, surface, type } from '@/theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { Button } from './Button';

export type FeedbackState = 'correct' | 'wrong';

interface FeedbackSheetProps {
  state: FeedbackState;
  fact: string;
  points: number;
  correctLabel?: string;
  onContinue: () => void;
}

export function FeedbackSheet({ state, fact, points, correctLabel, onContinue }: FeedbackSheetProps) {
  const reduced = useReducedMotion();
  const enter = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    enter.value = reduced
      ? 1
      : withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [enter, reduced]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 46 }],
  }));

  const correct = state === 'correct';

  return (
    <Animated.View style={cardStyle}>
      <GlassCard
        level="strong"
        glint
        style={[styles.card, correct ? styles.correctCard : styles.wrongCard]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.emoji} maxFontSizeMultiplier={1.1}>
            {correct ? '🎉' : '💡'}
          </Text>
          <View style={styles.headerText}>
            <Text style={[type.h2, { color: correct ? palette.success : palette.ink }]}>
              {correct ? 'Harika!' : 'Bir daha düşünelim!'}
            </Text>
            {correct ? (
              <View style={styles.pointsRow}>
                <Text style={[type.bodySemi, { color: palette.inkSoft }]}>✅ Doğru cevap</Text>
                <View style={styles.pointsChip}>
                  <Text style={[type.label, { color: palette.rewardDeep }]}>+{points} puan ⭐</Text>
                </View>
              </View>
            ) : correctLabel ? (
              <Text style={[type.bodySemi, { color: palette.inkSoft }]} numberOfLines={2}>
                Doğru cevap: {correctLabel}
              </Text>
            ) : null}
          </View>
        </View>
        <Text style={[type.body, { color: palette.inkSoft }]}>{fact}</Text>
        <Button
          label="DEVAM →"
          variant="primary"
          onPress={onContinue}
          accessibilityHint="Sonraki soruya geçer"
        />
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: surface.glassBorder,
  },
  correctCard: {
    borderColor: palette.success,
  },
  wrongCard: {
    borderColor: palette.reward,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  headerText: {
    flex: 1,
    gap: space.xs,
  },
  emoji: {
    fontSize: 40,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  pointsChip: {
    backgroundColor: palette.rewardSoft,
    borderRadius: 999,
    paddingHorizontal: space.md,
    paddingVertical: 2,
  },
});
