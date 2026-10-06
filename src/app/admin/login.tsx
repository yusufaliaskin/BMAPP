/**
 * Yönetici girişi — PIN.
 * Masaüstünde (geniş web) hem fiziksel klavyeyle yazılır hem ekrandaki sayı
 * tuşları kullanılır; mobilde yalnız input alanı ve cihaz klavyesi görünür.
 * 4 hane girilince otomatik doğrulanır; hatalı PIN'de alan sıfırlanır ve uyarı verilir.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '@/components/glass/GlassCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAdminGate } from './_layout';
import { useAdmins } from '@/data/hooks';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { findAdminByPin } from '@/lib/pin';
import { layout, palette, space, type } from '@/theme';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'empty', '0', 'back'] as const;

export default function AdminLoginScreen() {
  const router = useRouter();
  const { unlock } = useAdminGate();
  const admins = useAdmins();
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const shake = useSharedValue(0);

  // Sayı tuşları yalnız masaüstünde (geniş web): telefonda cihaz klavyesi kullanılır.
  const showKeypad = Platform.OS === 'web' && width >= layout.phoneWidth;

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

  const acceptDigits = (candidate: string) => {
    if (checking) return;
    setError(null);
    const next = candidate.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(next);
    if (next.length === PIN_LENGTH) void submit(next);
  };

  const pressDigit = (digit: string) => acceptDigits(pin + digit);
  const pressBack = () => {
    if (checking) return;
    setError(null);
    setPin((current) => current.slice(0, -1));
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Screen title="Yönetici Girişi" onBack={() => setShowExit(true)}>
      <Animated.View style={[styles.body, shakeStyle]}>
        <Reveal>
          <TextField
            label="PIN"
            placeholder="••••"
            value={pin}
            onChangeText={acceptDigits}
            keyboardType="number-pad"
            inputMode="numeric"
            secureTextEntry
            maxLength={PIN_LENGTH}
            autoFocus
            editable={!checking}
            error={error ?? undefined}
            hint={showKeypad ? undefined : 'Yönetici PIN’ini gir.'}
            accessibilityHint="Dört haneli yönetici PIN'i"
          />
        </Reveal>

        <View style={styles.statusArea}>
          {checking ? (
            <Text style={[type.caption, styles.center, { color: palette.inkSoft }]}>
              Kontrol ediliyor…
            </Text>
          ) : null}
        </View>

        {showKeypad ? (
          <Reveal delay={80}>
            <GlassCard padded={false} style={styles.keypadCard}>
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
        ) : null}
      </Animated.View>

      <ConfirmDialog
        visible={showExit}
        title="Çıkmak istiyor musunuz?"
        message="Girişten çıkıp kiosk ekranına dönersiniz."
        cancelLabel="KAL"
        confirmLabel="ÇIK"
        onCancel={() => setShowExit(false)}
        onConfirm={() => router.back()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: space.lg,
  },
  statusArea: {
    minHeight: 20,
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  keypadCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: space.sm,
  },
  key: {
    width: '33.33%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xs,
  },
  keyInner: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
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
