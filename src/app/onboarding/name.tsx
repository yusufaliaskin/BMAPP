/**
 * Katılımcı adı — kiosk girişinin tek alanı (§6).
 * Çocuk için: herhangi bir ad/lakap → sınıf seçimi → test.
 * Görevli için gizli kapı: "admin" yazılınca PIN ekranı → yönetim paneli.
 * Benzersiz katılımcı kodunu sistem üretir.
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { palette, space, type } from '@/theme';

const NAME_PATTERN = /^[A-Za-zÇĞİÖŞÜçğıöşü0-9' -]{2,20}$/;

/** Gizli yönetici anahtarı — büyük/küçük harf duyarsız. */
const ADMIN_KEYWORD = 'admin';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [showExit, setShowExit] = useState(false);

  const trimmed = name.trim();
  const valid = NAME_PATTERN.test(trimmed);

  const goNext = () => {
    if (trimmed.toLowerCase() === ADMIN_KEYWORD) {
      setName('');
      router.push('/admin/login');
      return;
    }
    if (!valid) {
      setError('Lütfen adını yaz (2-20 karakter).');
      return;
    }
    router.push({ pathname: '/onboarding/grade', params: { name: trimmed } });
  };

  return (
    <Screen title="" onBack={() => setShowExit(true)} keyboard>
      <View style={styles.body}>
        <Reveal style={styles.heroRow}>
          <Text style={styles.emoji} maxFontSizeMultiplier={1.1}>
            👋
          </Text>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>Merhaba!</Text>
          <Text style={[type.h2, styles.center, { color: palette.inkSoft }]}>
            Adın veya lakabın ne?
          </Text>
        </Reveal>
        <Reveal delay={80}>
          <TextField
            label="Adın veya lakabın"
            placeholder="Örn: Efe"
            value={name}
            onChangeText={(value) => {
              setName(value);
              if (error) setError(undefined);
            }}
            onBlur={() => {
              if (trimmed.length > 0 && !valid) setError('Lütfen adını yaz (2-20 karakter).');
            }}
            onSubmitEditing={goNext}
            autoFocus
            maxLength={20}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            error={error}
            hint="Bu ad sonuç ekranında ve sıralamada görünecek."
          />
        </Reveal>
      </View>
      <Reveal delay={160}>
        <Button
          label="DEVAM ET →"
          onPress={goNext}
          disabled={trimmed.length === 0}
          accessibilityHint="Sınıf seçme ekranına geçer"
        />
      </Reveal>
      <ConfirmDialog
        visible={showExit}
        title="Çıkmak istiyor musunuz?"
        message="Yazdığın isim kaybolur."
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
    gap: space.xxl,
  },
  heroRow: {
    alignItems: 'center',
    gap: space.xs,
  },
  emoji: {
    fontSize: 52,
  },
  center: {
    textAlign: 'center',
  },
});
