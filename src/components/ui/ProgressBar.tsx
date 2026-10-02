/**
 * ProgressBar — animasyonlu ilerleme çubuğu. scaleX + transformOrigin: 'left'
 * ile layout tetiklemeden büyür (performans kuralı).
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion, palette, surface } from '@/theme';

interface ProgressBarProps {
  progress: number;
  color?: 'primary' | 'reward' | 'success';
  height?: number;
}

const GRADIENTS: Record<NonNullable<ProgressBarProps['color']>, readonly [string, string]> = {
  primary: [palette.primary, palette.primaryDeep],
  reward: [palette.reward, palette.rewardDeep],
  success: [palette.success, palette.mint],
};

export function ProgressBar({ progress, color = 'primary', height = 12 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const scale = useSharedValue(clamped);

  useEffect(() => {
    scale.value = withTiming(clamped, { duration: motion.slow, easing: Easing.out(Easing.cubic) });
  }, [clamped, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: scale.value }],
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, borderRadius: height / 2 }]}
    >
      <Animated.View style={[styles.fill, { height, borderRadius: height / 2 }, animatedStyle]}>
        <LinearGradient
          colors={GRADIENTS[color]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: surface.track,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    width: '100%',
    transformOrigin: 'left center',
    overflow: 'hidden',
  },
});
