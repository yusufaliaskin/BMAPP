/**
 * Chip — filtre ve etiket pilleri (şube filtresi, konu etiketi).
 * Seçili durum dolgulu; dokunma hedefi ≥44px.
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import { glassSurface, palette, radius, space, type } from '@/theme';
import { PressableScale } from './PressableScale';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
}

export function Chip({ label, selected = false, onPress, icon }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      haptic="selection"
      onPress={onPress}
      style={[styles.chip, selected ? styles.selected : glassSurface('regular')]}
    >
      {icon}
      <Text
        numberOfLines={1}
        style={[type.label, { color: selected ? palette.white : palette.inkSoft }]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
  selected: {
    backgroundColor: palette.primary,
    borderWidth: 1,
    borderColor: palette.primary,
  },
});
