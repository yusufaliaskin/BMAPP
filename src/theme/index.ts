/**
 * Tema giriş noktası — tokenlar ve ortak cam yüzey yardımcıları.
 */

import type { ViewStyle } from 'react-native';

import { radius, shadows, surface } from './tokens';

export * from './tokens';

export type GlassLevel = 'subtle' | 'regular' | 'strong';

/** Blur kullanılmayan yüzeyler için (liste satırları vb.) cam görünümü. */
export function glassSurface(level: GlassLevel = 'regular'): ViewStyle {
  const backgroundColor =
    level === 'strong' ? surface.glassStrong : level === 'subtle' ? surface.glassSubtle : surface.glass;
  return {
    backgroundColor,
    borderWidth: 1,
    borderColor: surface.glassBorderSoft,
  };
}

export const cardRadius = radius.card;
export const cardShadow = shadows.card;
