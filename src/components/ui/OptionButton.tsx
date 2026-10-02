/**
 * OptionButton — test seçeneği. Büyük, kolay dokunulur (min 64px),
 * durumlar: idle / correct / wrong / dimmed / disabled.
 * Doğru ve yanlış yalnız renkle değil ikonla da gösterilir (§ a11y).
 */

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { glassSurface, layout, palette, radius, space, type } from '@/theme';
import { PressableScale } from './PressableScale';

export type OptionState = 'idle' | 'correct' | 'wrong' | 'dimmed';

interface OptionButtonProps {
  label: string;
  letter: string;
  state?: OptionState;
  disabled?: boolean;
  onPress?: () => void;
}

export function OptionButton({ label, letter, state = 'idle', disabled, onPress }: OptionButtonProps) {
  const inactive = disabled || state !== 'idle';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${letter} seçeneği: ${label}`}
      accessibilityState={{ disabled: inactive, selected: state === 'correct' }}
      disabled={inactive}
      haptic="selection"
      onPress={onPress}
      style={[
        styles.wrap,
        state === 'correct' ? styles.correct : null,
        state === 'wrong' ? styles.wrong : null,
      ]}
    >
      <View
        style={[
          styles.inner,
          glassSurface(state === 'idle' ? 'regular' : 'subtle'),
          state === 'correct' ? styles.correctInner : null,
          state === 'wrong' ? styles.wrongInner : null,
          state === 'dimmed' ? styles.dimmed : null,
        ]}
      >
        <View
          style={[
            styles.letter,
            state === 'correct' ? styles.letterCorrect : null,
            state === 'wrong' ? styles.letterWrong : null,
          ]}
        >
          <Text
            style={[
              type.button,
              { color: state === 'correct' || state === 'wrong' ? palette.white : palette.primary },
            ]}
          >
            {letter}
          </Text>
        </View>
        <Text style={[type.bodySemi, styles.label, { color: palette.ink }]} maxFontSizeMultiplier={1.3}>
          {label}
        </Text>
        {state === 'correct' ? (
          <Ionicons name="checkmark-circle" size={28} color={palette.success} />
        ) : state === 'wrong' ? (
          <Ionicons name="close-circle" size={28} color={palette.coral} />
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
  },
  inner: {
    minHeight: layout.optionHeight,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  correct: {
    backgroundColor: palette.successSoft,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: palette.success,
  },
  wrong: {
    backgroundColor: palette.coralSoft,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: palette.coral,
  },
  correctInner: {
    borderColor: 'transparent',
  },
  wrongInner: {
    borderColor: 'transparent',
  },
  dimmed: {
    opacity: 0.55,
  },
  letter: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterCorrect: {
    backgroundColor: palette.success,
  },
  letterWrong: {
    backgroundColor: palette.coral,
  },
  label: {
    flex: 1,
    color: palette.ink,
  },
});
