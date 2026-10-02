/**
 * AvatarBubble — karakter/emoji balonu. Sıralama, profil ve seçim ekranlarında
 * tek geometri; seçili durumda halka + küçük onay işareti (renk + ikon birlikte).
 */

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { glassSurface, palette, radius } from '@/theme';

interface AvatarBubbleProps {
  emoji: string;
  size?: number;
  selected?: boolean;
}

export function AvatarBubble({ emoji, size = 56, selected = false }: AvatarBubbleProps) {
  return (
    <View
      style={[
        styles.bubble,
        glassSurface('strong'),
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
        },
        selected ? styles.selected : null,
      ]}
    >
      <Text style={{ fontSize: size * 0.52 }} maxFontSizeMultiplier={1.1}>
        {emoji}
      </Text>
      {selected ? (
        <View style={[styles.check, { width: size * 0.34, height: size * 0.34 }]}>
          <Ionicons name="checkmark" size={size * 0.22} color={palette.white} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: palette.primary,
    borderWidth: 2.5,
  },
  check: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
