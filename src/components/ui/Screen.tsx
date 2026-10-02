/**
 * Screen — tüm ekranların ortak iskeleti: aurora zemin, güvenli alan,
 * telefon-öncelikli genişlik (tablet/web'de ortalanır), opsiyonel başlık ve alt sabit alan.
 */

import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AuroraBackground } from '@/components/glass/AuroraBackground';
import { PressableScale } from '@/components/ui/PressableScale';
import { glassSurface, layout, palette, radius, space, type } from '@/theme';
import { Text } from 'react-native';

interface ScreenProps {
  children: ReactNode;
  /** Başlık çubuğu — geri oku simetrik sağ yuvayla hizalanır. */
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboard?: boolean;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  headerTransparent?: boolean;
}

export function Screen({
  children,
  title,
  onBack,
  right,
  scroll = false,
  padded = true,
  keyboard = false,
  footer,
  contentStyle,
  headerTransparent = false,
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        padded ? styles.padded : null,
        footer ? styles.scrollWithFooter : null,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded ? styles.padded : null, contentStyle]}>{children}</View>
  );

  const content = (
    <View style={styles.column}>
      {title || onBack || right ? (
        <View style={[styles.header, headerTransparent ? styles.headerTransparent : null]}>
          <View style={styles.headerSide}>
            {onBack ? (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel="Geri dön"
                haptic="light"
                onPress={onBack}
                style={[styles.backButton, glassSurface('strong')]}
              >
                <Ionicons name="chevron-back" size={24} color={palette.ink} />
              </PressableScale>
            ) : null}
          </View>
          {title ? (
            <Text
              style={[type.h3, styles.headerTitle, { color: palette.ink }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            <View style={styles.flex} />
          )}
          <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
        </View>
      ) : null}
      {body}
      {footer ? <View style={padded ? styles.footerPadded : undefined}>{footer}</View> : null}
    </View>
  );

  const keyboardWrap = keyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right', 'bottom']}>
        {keyboardWrap}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },
  flex: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  padded: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  scrollWithFooter: {
    paddingBottom: space.huge,
  },
  header: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    gap: space.sm,
  },
  headerTransparent: {
    backgroundColor: 'transparent',
  },
  headerSide: {
    width: 44,
    alignItems: 'flex-start',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  footerPadded: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: space.md,
  },
});
