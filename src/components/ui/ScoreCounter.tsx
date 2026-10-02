/**
 * ScoreCounter — sayıp artan puan göstergesi. Değer değişince yumuşak sayaç
 * animasyonu; tabular hizalama ile zıplama yok.
 */

import { useEffect, useRef, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { type } from '@/theme';

interface ScoreCounterProps {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export function ScoreCounter({ value, duration = 650, style }: ScoreCounterProps) {
  const progress = useSharedValue(value);
  const last = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    progress.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) });
  }, [duration, progress, value]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (current) => {
      if (current !== last.current) {
        last.current = current;
        runOnJS(setDisplay)(current);
      }
    },
  );

  return (
    <AnimatedText style={[type.score, style]}>
      {display}
    </AnimatedText>
  );
}
