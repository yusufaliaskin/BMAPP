/**
 * Yönetici girişi — PIN noktaları + dokunmatik tuş takımı (kiosk dostu tasarım).
 * 4. hane girilince otomatik doğrulanır; hatalı PIN'de noktalar sıfırlanır,
 * nazik uyarı ve kısa bir titreme gösterilir. Klavye açılmaz (tablet standı için ideal).
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '@/components/glass/GlassCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { useAdminGate } from './_layout';
import { useAdmins } from '@/data/hooks';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { findAdminByPin } from '@/lib/pin';
import { palette, radius, space, type } from '@/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'empty', '0', 'back'] as const;

export default function AdminLoginScreen() {
  const router = useRouter();
  const { unlock } = useAdminGate();
  const admins = useAdmins();
  const reduced = useReducedMotion();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const shake = useSharedValue(0);

  const submit = async (candidate: string) => {
    setChecking(true);
    setError(null);
    const admin = await findAdminByPin(candidate, admins);
    if (admin) {
      unlock(admin.name);
      router.replace('/admin');
      return;
    }
    setError('PIN hatalı, tekrar dene.');
    setPin('');
    setChecking(false);
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => undefined,
      );
    }
    if (!reduced) {
      shake.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  };

  const pressDigit = (digit: string) => {
    if (checking) return;
    setError(null);
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) void submit(next);
  };

  const pressBack = () => {
    if (checking) return;
    setError(null);
    setPin((current) => current.slice(0, -1));
  };

  const dotsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Screen title="Yönetici Girişi" onBack={() => router.back()}>
      <View style={styles.body}>
        <Reveal style={styles.hero}>
          <View style={styles.logoWrap}>
            <Text style={styles.logo} maxFontSizeMultiplier={1.1}>
              🔐
            </Text>
          </View>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>Yönetici Girişi</Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            Devam etmek için PIN’ini gir
          </Text>
        </Reveal>

        <Reveal delay={80}>
          <Animated.View style={[styles.dots, dotsStyle]}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index < pin.length ? styles.dotFilled : null,
                  error ? styles.dotError : null,
                ]}
              />
            ))}
          </Animated.View>
        </Reveal>

        <View style={styles.statusArea}>
          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[type.caption, styles.center, { color: palette.coral }]}
            >
              {error}
            </Text>
          ) : checking ? (
            <Text style={[type.caption, styles.center, { color: palette.inkSoft }]}>
              Kontrol ediliyor…
            </Text>
          ) : null}
        </View>

        <Reveal delay={140}>
          <GlassCard padded={false}>
            <View style={styles.keypad}>
              {KEYS.map((key, index) =>
                key === 'empty' ? (
                  <View key={index} style={styles.key} />
                ) : (
                  <PressableScale
                    key={index}
                    accessibilityRole="button"
                    accessibilityLabel={key === 'back' ? 'Sil' : key}
                    haptic="none"
                    disabled={checking}
                    onPress={() => (key === 'back' ? pressBack() : pressDigit(key))}
                    style={styles.key}
                  >
                    <View style={styles.keyInner}>
                      {key === 'back' ? (
                        <Ionicons name="backspace-outline" size={26} color={palette.inkSoft} />
                      ) : (
                        <Text style={styles.keyText} maxFontSizeMultiplier={1.1}>
                          {key}
                        </Text>
                      )}
                    </View>
                  </PressableScale>
                ),
              )}
            </View>
          </GlassCard>
        </Reveal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: space.lg,
  },
  hero: {
    alignItems: 'center',
    gap: space.xs,
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.primarySoft,
    borderWidth: 3,
    borderColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  logo: {
    fontSize: 44,
  },
  center: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.lg,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: palette.inkFaint,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotFilled: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  dotError: {
    borderColor: palette.coral,
  },
  statusArea: {
    minHeight: 20,
    justifyContent: 'center',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: space.sm,
  },
  key: {
    width: '33.33%',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xs,
  },
  keyInner: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontFamily: type.h2.fontFamily,
    fontSize: 24,
    color: palette.ink,
  },
});
