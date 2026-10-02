/**
 * Button — tek buton sistemi, beş varyant, tam durum seti.
 * idle / pressed (squish) / focused / disabled / loading — simetrik geometri (§43).
 * Dokunma hedefi: lg 56px, md 48px (≥44px kuralı).
 */

import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  glassSurface,
  layout,
  palette,
  radius,
  shadows,
  space,
  type,
} from '@/theme';
import { PressableScale } from './PressableScale';

export type ButtonVariant = 'primary' | 'glass' | 'soft' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'lg' | 'md';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: palette.white,
  glass: palette.ink,
  soft: palette.primary,
  ghost: palette.inkSoft,
  danger: palette.coral,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  accessibilityHint,
}: ButtonProps) {
  const inactive = disabled || loading;
  const height = size === 'lg' ? layout.buttonHeight : layout.buttonHeightSmall;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      haptic={variant === 'primary' ? 'medium' : 'light'}
      onPress={onPress}
      style={[
        variant === 'primary' ? shadows.glow : null,
        { borderRadius: radius.button },
        fullWidth ? styles.fullWidth : styles.autoWidth,
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          { height, borderRadius: radius.button },
          variant === 'glass' ? glassSurface('strong') : null,
          variant === 'soft' ? { backgroundColor: palette.primarySoft } : null,
          variant === 'danger' ? { backgroundColor: palette.coralSoft } : null,
          inactive ? styles.inactive : null,
        ]}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={[palette.primary, palette.primaryDeep]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 0.8 }}
            style={[StyleSheet.absoluteFill, styles.noEvents]}
          />
        ) : null}
        {loading ? (
          <ActivityIndicator color={TEXT_COLOR[variant]} />
        ) : (
          <>
            {icon}
            <Text style={[type.button, { color: TEXT_COLOR[variant] }]} numberOfLines={1}>
              {label}
            </Text>
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  noEvents: {
    pointerEvents: 'none',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  autoWidth: {
    alignSelf: 'flex-start',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xxl,
    overflow: 'hidden',
  },
  inactive: {
    opacity: 0.45,
  },
});
