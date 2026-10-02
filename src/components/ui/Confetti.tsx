/**
 * Confetti — küçük, kısa kutlama patlaması (≤18 parçacık, ~900ms).
 * Deterministik yörüngeler (Math.random yok); yalnız transform + opacity.
 * Hareket azaltma açıkken hiç çizilmez.
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { palette } from '@/theme';

const COLORS = [
  palette.primary,
  palette.reward,
  palette.success,
  palette.coral,
  palette.lavender,
  palette.sky,
];

const COUNT = 16;

interface ParticleProps {
  index: number;
  progress: SharedValue<number>;
}

function Particle({ index, progress }: ParticleProps) {
  const angle = (index / COUNT) * Math.PI * 2;
  const distance = 90 + (index % 4) * 26;
  const dir = index % 2 === 0 ? 1 : -1;
  const color = COLORS[index % COLORS.length];

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const x = Math.cos(angle) * distance * p;
    const y = Math.sin(angle) * distance * 0.62 * p + 200 * p * p;
    return {
      opacity: p < 0.72 ? 1 : 1 - (p - 0.72) / 0.28,
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${p * 380 * dir}deg` }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        { backgroundColor: color, borderRadius: index % 3 === 0 ? 999 : 2 },
        style,
      ]}
    />
  );
}

interface ConfettiProps {
  onDone?: () => void;
}

export function Confetti({ onDone }: ConfettiProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: 900, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished && onDone) runOnJS(onDone)();
      },
    );
  }, [onDone, progress]);

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <View style={styles.origin}>
        {Array.from({ length: COUNT }).map((_, index) => (
          <Particle key={index} index={index} progress={progress} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  origin: {
    marginTop: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 9,
    height: 9,
  },
});
