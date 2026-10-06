/**
 * Karşılama — kiosk standının ilk ekranı.
 * Tek amaç: çocuğu teste başlatmaya davet. Sade: bir simge, bir başlık, kısa bilgi.
 */

import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { palette, space, type } from '@/theme';

const NOTES = ['Kısa test', 'Puanını gör', 'Sertifikanı al'];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <Reveal style={styles.hero}>
          <Text style={styles.logo} maxFontSizeMultiplier={1.1}>
            🦸
          </Text>
        </Reveal>
        <Reveal delay={60}>
          <Text style={[type.display, styles.center, { color: palette.ink }]}>Hoş geldin!</Text>
        </Reveal>
        <Reveal delay={110}>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            Farkındalık testi · 1-3 dakika
          </Text>
        </Reveal>
        <Reveal delay={170} style={styles.notes}>
          {NOTES.map((note) => (
            <GlassCard key={note} padded={false} style={styles.note}>
              <View style={styles.noteInner}>
                <Text style={[type.caption, { color: palette.ink }]}>{note}</Text>
              </View>
            </GlassCard>
          ))}
        </Reveal>
      </View>
      <Reveal delay={240} style={styles.footer}>
        <Button
          label="BAŞLA"
          onPress={() => router.push('/onboarding/name')}
          accessibilityHint="Adını yazacağın ekrana geçer"
        />
        <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
          BEÜN · Bağımlılıkla Mücadele Farkındalık Projesi
        </Text>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  hero: {
    marginBottom: space.sm,
  },
  logo: {
    fontSize: 76,
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
  notes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.md,
  },
  note: {
    borderRadius: 999,
  },
  noteInner: {
    paddingHorizontal: space.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  footer: {
    gap: space.md,
    paddingBottom: space.md,
  },
});
