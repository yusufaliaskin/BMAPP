/**
 * FeedbackSheet — soru geri bildirimi, sade sürüm.
 * Doğru: "Doğru cevap" + "+N puan" + tek cümle açıklama.
 * Yanlış: "Bir daha düşünelim" + "Doğru cevap: …" — uzun metin ve emoji yok.
 * Giriş yumuşak (~240ms), çıkış daha hızlı — motion kuralı.
 */

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { GlassCard } from '@/components/glass/GlassCard';
import { palette, space, type } from '@/theme';
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
    enter.value = reduced ? 1 : withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) });
  }, [enter, reduced]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 40 }],
  }));

  const correct = state === 'correct';

  return (
    <Animated.View style={cardStyle}>
      <GlassCard level="strong" style={[styles.card, correct ? styles.correctCard : styles.wrongCard]}>
        <View style={styles.head}>
          <Text style={[type.h3, { color: correct ? palette.success : palette.ink }]}>
            {correct ? 'Doğru cevap' : 'Bir daha düşünelim'}
          </Text>
          {correct ? (
            <View style={styles.pointsChip}>
              <Text style={[type.label, { color: palette.rewardDeep }]}>+{points} puan</Text>
            </View>
          ) : null}
        </View>

        {correct ? (
          <Text style={[type.body, { color: palette.inkSoft }]}>{fact}</Text>
        ) : correctLabel ? (
          <Text style={[type.bodySemi, { color: palette.inkSoft }]} numberOfLines={2}>
            Doğru cevap: {correctLabel}
          </Text>
        ) : null}

        <Button
          label="DEVAM"
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
    gap: space.md,
  },
  correctCard: {
    borderColor: palette.success,
  },
  wrongCard: {
    borderColor: palette.reward,
  },
  head: {
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
