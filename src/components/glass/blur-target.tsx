/**
 * BlurTarget — Android'de gerçek cam bulanıklığı için arka plan görünümünün ref'i.
 * Screen, Aurora zeminin ref'ini bu context ile paylaşır; GlassCard, BlurView'a
 * blurTarget olarak verir (yeni expo-blur API'si; blurMethod + blurTarget).
 */

import { createContext, useContext, type RefObject } from 'react';
import type { View } from 'react-native';

export const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

export const BlurTargetProvider = BlurTargetContext.Provider;

export function useBlurTarget(): RefObject<View | null> | null {
  return useContext(BlurTargetContext);
}
