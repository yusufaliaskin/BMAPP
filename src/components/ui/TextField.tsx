/**
 * TextField — cam giriş alanı. Görünür etiket, odak halkası, hata satırı (a11y).
 * Çocuk dostu: büyük dokunma alanı (56px), yumuşak radius, net odak durumu.
 */

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { glassSurface, layout, palette, radius, space, type } from '@/theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
}

export function TextField({ label, error, hint, style, ...inputProps }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={style}>
      <Text style={[type.label, styles.label]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          glassSurface('strong'),
          { borderRadius: radius.lg },
          focused ? styles.focused : null,
          error ? styles.errored : null,
        ]}
      >
        <TextInput
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          placeholderTextColor={palette.inkFaint}
          style={[type.bodySemi, styles.input, { color: palette.ink }]}
          accessibilityLabel={label}
          maxFontSizeMultiplier={1.3}
        />
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[type.caption, styles.error]}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={[type.caption, styles.hint]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: palette.inkSoft,
    marginBottom: space.sm,
  },
  inputWrap: {
    height: layout.inputHeight,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  focused: {
    borderColor: palette.primary,
    borderWidth: 2,
  },
  errored: {
    borderColor: palette.coral,
    borderWidth: 2,
  },
  input: {
    height: '100%',
  },
  error: {
    color: palette.coral,
    marginTop: space.sm,
  },
  hint: {
    color: palette.inkFaint,
    marginTop: space.sm,
  },
});
