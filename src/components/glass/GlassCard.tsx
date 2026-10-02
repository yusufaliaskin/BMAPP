/**
 * GlassCard — buzlu cam yüzey. Tek geometri: radius 28, 1px ışık kenarı, yumuşak renkli gölge.
 * Liste gibi yoğun yüzeylerde blur=false ile hafif cam (rgba) kullanılır (Android performansı).
 */

import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { blur, radius, shadows, space, surface, type GlassLevel } from '@/theme';

interface GlassCardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  level?: GlassLevel;
  blur?: boolean;
  padded?: boolean;
  /** Üst kenarda ince ışık yansıması — yalnız öne çıkan kartlarda. */
  glint?: boolean;
  radiusValue?: number;
  /** Kenarlık rengi (ör. seçili durum) — verilirse 2px çizilir. */
  outline?: string;
  /** İç katman dolgu rengi (ör. seçili durumda marka rengi); cam beyazlığını değiştirir. */
  tint?: string;
}

const WHITE_TINT: Record<GlassLevel, string> = {
  subtle: 'rgba(255,255,255,0.32)',
  regular: 'rgba(255,255,255,0.5)',
  strong: 'rgba(255,255,255,0.64)',
};

const BLUR_INTENSITY: Record<GlassLevel, number> = {
  subtle: blur.glass - 10,
  regular: blur.glass,
  strong: blur.glassStrong,
};

export function GlassCard({
  children,
  style,
  level = 'regular',
  blur: withBlur = true,
  padded = true,
  glint = false,
  radiusValue = radius.card,
  outline,
  tint,
}: GlassCardProps) {
  return (
    <View style={[shadows.card, { borderRadius: radiusValue }, style]}>
      <View
        style={[
          styles.clip,
          {
            borderRadius: radiusValue,
            backgroundColor: surface.glass,
            borderColor: outline ?? surface.glassBorderSoft,
            borderWidth: outline ? 2 : 1,
          },
        ]}
      >
        {withBlur ? (
          <BlurView
            intensity={BLUR_INTENSITY[level]}
            tint="light"
            experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : 'none'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.noEvents,
            { backgroundColor: tint ?? WHITE_TINT[level] },
          ]}
        />
        {glint ? (
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.glint, styles.noEvents]}
          />
        ) : null}
        <View style={padded ? styles.padded : undefined}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noEvents: {
    pointerEvents: 'none',
  },
  clip: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  padded: {
    padding: space.xl,
  },
  glint: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1.5,
    borderRadius: 1,
  },
});
