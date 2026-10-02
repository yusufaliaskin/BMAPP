/**
 * Admin girişi — 4 haneli PIN, SHA-256 özetiyle doğrulanır (§35).
 * Hatalı girişte nazik hata; başarıda admin paneline geçilir.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAdminGate } from './_layout';
import { useAdmins } from '@/data/hooks';
import { findAdminByPin } from '@/lib/pin';
import { palette, space, type } from '@/theme';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { unlock } = useAdminGate();
  const admins = useAdmins();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    if (checking) return;
    setChecking(true);
    setError(null);
    const admin = await findAdminByPin(pin, admins);
    if (admin) {
      unlock(admin.name);
      router.replace('/admin');
    } else {
      setError('PIN hatalı. Tekrar dene.');
      setChecking(false);
    }
  };

  return (
    <Screen title="Yönetici Girişi" onBack={() => router.back()} keyboard>
      <View style={styles.body}>
        <Reveal style={styles.header}>
          <Text style={styles.emoji} maxFontSizeMultiplier={1.1}>
            🛠️
          </Text>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>Yönetici Girişi</Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            Devam etmek için 4 haneli PIN gir.
          </Text>
        </Reveal>
        <Reveal delay={80}>
          <GlassCard style={styles.card}>
            <TextField
              label="PIN"
              placeholder="••••"
              value={pin}
              onChangeText={(value) => {
                setPin(value.replace(/[^0-9]/g, '').slice(0, 4));
                if (error) setError(null);
              }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              autoFocus
              onSubmitEditing={() => void submit()}
              error={error ?? undefined}
            />
            <Button
              label="GİRİŞ YAP"
              onPress={() => void submit()}
              loading={checking}
              disabled={pin.length < 4}
              accessibilityHint="PIN doğruysa yönetim paneline geçer"
            />
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
    gap: space.xxl,
  },
  header: {
    alignItems: 'center',
    gap: space.sm,
  },
  emoji: {
    fontSize: 52,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    gap: space.lg,
  },
});
