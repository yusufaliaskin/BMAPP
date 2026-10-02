/**
 * SegmentedControl — sınıf sekmeleri ve görünüm anahtarları için tek segmented sistem.
 * Simetri: eşit genişlikte öğeler, 4px iç boşluk, animasyonlu gösterge (translateX).
 * Açılış ~220ms, kapanış/kayma 160ms; reduced-motion'da animasyonsuz.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { glassSurface, palette, radius, space, type } from '@/theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { PressableScale } from './PressableScale';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

const PADDING = 4;
const GAP = 4;

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const [trackWidth, setTrackWidth] = useState(0);
  const reduced = useReducedMotion();
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const itemWidth = trackWidth > 0 ? (trackWidth - PADDING * 2 - GAP * (options.length - 1)) / options.length : 0;

  const offset = useSharedValue(0);

  useEffect(() => {
    const target = index * (itemWidth + GAP);
    offset.value = reduced
      ? target
      : withTiming(target, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [index, itemWidth, offset, reduced]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={[styles.track, glassSurface('regular')]}
    >
      {trackWidth > 0 ? (
        <Animated.View style={[styles.indicator, { width: itemWidth }, indicatorStyle]}>
          <LinearGradient
            colors={[palette.primary, palette.primaryDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
          />
        </Animated.View>
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={String(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            haptic="selection"
            onPress={() => onChange(option.value)}
            style={[styles.item, { width: itemWidth > 0 ? itemWidth : undefined }]}
          >
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
              style={[
                type.label,
                styles.itemText,
                { color: selected ? palette.white : palette.inkSoft },
              ]}
            >
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: PADDING,
    gap: GAP,
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    bottom: PADDING,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  itemText: {
    textAlign: 'center',
  },
});
