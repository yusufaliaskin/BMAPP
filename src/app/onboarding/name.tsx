/**
 * İsim adımı — tek soru: "Adın ne?" (brief §6). Uzun açıklama yok,
 * büyük giriş alanı, tek ana aksiyon. Ad yalnız admin tarafında görünür (§7).
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { palette, space, type } from '@/theme';

const NAME_PATTERN = /^[A-Za-zÇĞİÖŞÜçğıöşü' -]{2,20}$/;

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const trimmed = name.trim();
  const valid = NAME_PATTERN.test(trimmed);

  const goNext = () => {
    if (!valid) {
      setError('Lütfen adını yaz (2-20 harf).');
      return;
    }
    router.push({ pathname: '/onboarding/character', params: { name: trimmed } });
  };

  return (
    <Screen title="" onBack={() => router.back()} keyboard>
      <View style={styles.body}>
        <Reveal style={styles.heroRow}>
          <Text style={styles.emoji} maxFontSizeMultiplier={1.1}>
            👋
          </Text>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>Merhaba!</Text>
          <Text style={[type.h2, styles.center, { color: palette.inkSoft }]}>Adın ne?</Text>
        </Reveal>
        <Reveal delay={80}>
          <TextField
            label="Adın"
            placeholder="Örn: Efe"
            value={name}
            onChangeText={(value) => {
              setName(value);
              if (error) setError(undefined);
            }}
            onBlur={() => {
              if (trimmed.length > 0 && !valid) setError('Lütfen adını yaz (2-20 harf).');
            }}
            onSubmitEditing={goNext}
            autoFocus
            maxLength={20}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            error={error}
            hint="Görünen adın: karakterinle birlikte sıralamada görüneceksin."
          />
        </Reveal>
      </View>
      <Reveal delay={160}>
        <Button
          label="DEVAM ET →"
          onPress={goNext}
          disabled={trimmed.length === 0}
          accessibilityHint="Karakter seçme ekranına geçer"
        />
      </Reveal>
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
