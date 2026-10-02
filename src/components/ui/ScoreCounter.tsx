/**
 * ScoreCounter — sayıp artan puan göstergesi.
 * Saf JS sayaç (setInterval + ease-out): worklet köprüsüne bağımlı değildir,
 * web ve native'de birebir aynı davranır; değer değişince yumuşak sayar.
 */

import { useEffect, useRef, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { type } from '@/theme';

interface ScoreCounterProps {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
}

const TICK_MS = 30;

export function ScoreCounter({ value, duration = 650, style }: ScoreCounterProps) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const from = displayRef.current;
    if (from === value || duration <= 0) {
      displayRef.current = value;
      setDisplay(value);
      return;
    }
    const start = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (value - from) * eased);
      displayRef.current = next;
      setDisplay(next);
      if (t >= 1 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, TICK_MS);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, duration]);

  return <Text style={[type.score, style]}>{display}</Text>;
}
