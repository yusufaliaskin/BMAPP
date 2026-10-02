/**
 * Aurora zemin — uygulamanın imza dokusu: pastel ışık kütleleri,
 * tüm cam yüzeylerin arkasında yavaşça süzülür. Yalnız transform animasyonu (60fps),
 * hareket azaltma açıkken tamamen sabittir.
 */

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface BlobProps {
  colors: readonly [string, string, ...string[]];
  size: number;
  position: { top?: number; bottom?: number; left?: number; right?: number };
  drift: { x: number; y: number };
  duration: number;
  opacity: number;
  reduced: boolean;
}

function Blob({ colors, size, position, drift, duration, opacity, reduced }: BlobProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      progress.value = 0;
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [duration, progress, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * drift.x },
      { translateY: progress.value * drift.y },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
        },
        position,
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={{ flex: 1, borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}

export function AuroraBackground() {
  const reduced = useReducedMotion();

  return (
    <View style={[StyleSheet.absoluteFill, styles.root, styles.noEvents]}>
      <LinearGradient
        colors={['#F7FBFF', '#EEF4FF', '#F7F3FF']}
        style={StyleSheet.absoluteFill}
      />
      <Blob
        colors={['rgba(143,203,255,0.9)', 'rgba(143,203,255,0)']}
        size={430}
        position={{ top: -110, left: -130 }}
        drift={{ x: 34, y: 28 }}
        duration={11000}
        opacity={0.6}
        reduced={reduced}
      />
      <Blob
        colors={['rgba(201,184,255,0.85)', 'rgba(201,184,255,0)']}
        size={390}
        position={{ top: 130, right: -150 }}
        drift={{ x: -30, y: 36 }}
        duration={13000}
        opacity={0.55}
        reduced={reduced}
      />
      <Blob
        colors={['rgba(167,239,221,0.8)', 'rgba(167,239,221,0)']}
        size={370}
        position={{ bottom: 40, left: -110 }}
        drift={{ x: 36, y: -22 }}
        duration={15000}
        opacity={0.5}
        reduced={reduced}
      />
      <Blob
        colors={['rgba(255,217,168,0.75)', 'rgba(255,217,168,0)']}
        size={330}
        position={{ bottom: -90, right: -90 }}
        drift={{ x: -32, y: -26 }}
        duration={9000}
        opacity={0.5}
        reduced={reduced}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  noEvents: {
    pointerEvents: 'none',
  },
});
