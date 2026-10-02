/**
 * Stepper — ± değer seçici (admin ayarları). Simetrik: iki yanda eşit 44px buton,
 * ortada tabular değer.
 */

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from './PressableScale';
import { palette, radius, space, type } from '@/theme';

interface StepperProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
}

export function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  accessibilityLabel,
}: StepperProps) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <View style={styles.row} accessibilityLabel={`${accessibilityLabel}: ${value}`}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} azalt`}
        haptic="selection"
        disabled={value <= min}
        onPress={dec}
        style={[styles.button, value <= min ? styles.disabled : null]}
      >
        <Ionicons name="remove" size={20} color={palette.primary} />
      </PressableScale>
      <Text style={[type.h3, styles.value, { color: palette.ink }]}>{value}</Text>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} artır`}
        haptic="selection"
        disabled={value >= max}
        onPress={inc}
        style={[styles.button, value >= max ? styles.disabled : null]}
      >
        <Ionicons name="add" size={20} color={palette.primary} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  value: {
    minWidth: 40,
    textAlign: 'center',
  },
});
