/**
 * PressableScale — tüm dokunulabilir yüzeylerin temeli.
 * Spring ölçek geri bildirimi + haptik + web'de klavye odak halkası.
 * Tam durum seti: idle / pressed (spring squish) / focused (web) / disabled.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { motion, palette } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type HapticKind = 'none' | 'light' | 'medium' | 'selection' | 'success' | 'warning';

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: HapticKind;
  scaleTo?: number;
}

function triggerHaptic(kind: HapticKind): void {
  if (kind === 'none' || Platform.OS === 'web') return;
  const promise =
    kind === 'light'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : kind === 'medium'
        ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        : kind === 'selection'
          ? Haptics.selectionAsync()
          : kind === 'success'
            ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  promise.catch(() => undefined);
}

export function PressableScale({
  children,
  style,
  haptic = 'light',
  scaleTo = motion.pressScale,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const [focused, setFocused] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const focusRing: ViewStyle | null =
    focused && Platform.OS === 'web'
      ? { borderColor: palette.primary, borderWidth: 2 }
      : null;

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(event) => {
        scale.set(withSpring(scaleTo, { damping: 22, stiffness: 320 }));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, { damping: 18, stiffness: 260 }));
        onPressOut?.(event);
      }}
      onPress={(event) => {
        triggerHaptic(haptic);
        onPress?.(event);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[style, focusRing, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
