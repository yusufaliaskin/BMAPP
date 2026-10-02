/**
 * Karşılama — ilk açılışta tek amaçlı ekran: çocuğu teste başlatmaya davet (§6, §38).
 */

import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { useCurrentStudent } from '@/data/hooks';
import { palette, space, type } from '@/theme';

const PILLS = [
  { emoji: '📝', label: 'Kısa testler' },
  { emoji: '⭐', label: 'Puan topla' },
  { emoji: '🎖️', label: 'Rozet kazan' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const student = useCurrentStudent();

  if (student) return <Redirect href="/" />;

  return (
    <Screen>
      <View style={styles.container}>
        <Reveal style={styles.hero}>
          <View style={styles.logoWrap}>
            <Text style={styles.logo} maxFontSizeMultiplier={1.1}>
              🦸
            </Text>
          </View>
        </Reveal>
        <Reveal delay={60}>
          <Text style={[type.display, styles.title, { color: palette.ink }]}>
            Bilinçli Kahraman
          </Text>
        </Reveal>
        <Reveal delay={110}>
          <Text style={[type.bodySemi, styles.subtitle, { color: palette.inkSoft }]}>
            Bağımlılıkla mücadele farkındalık testleri
          </Text>
        </Reveal>
        <Reveal delay={170} style={styles.pills}>
          {PILLS.map((pill) => (
            <GlassCard key={pill.label} padded={false} style={styles.pill}>
              <View style={styles.pillInner}>
                <Text style={styles.pillEmoji} maxFontSizeMultiplier={1.1}>
                  {pill.emoji}
                </Text>
                <Text style={[type.caption, { color: palette.ink }]}>{pill.label}</Text>
              </View>
            </GlassCard>
          ))}
        </Reveal>
      </View>
      <Reveal delay={240} style={styles.footer}>
        <Button
          label="BAŞLA →"
          onPress={() => router.push('/onboarding/name')}
          accessibilityHint="İsmni yazacağın ekrana geçer"
        />
        <Text style={[type.caption, styles.caption, { color: palette.inkFaint }]}>
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
  logoWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: palette.primarySoft,
    borderWidth: 3,
    borderColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 68,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.md,
  },
  pill: {
    borderRadius: 999,
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  pillEmoji: {
    fontSize: 16,
  },
  footer: {
    gap: space.md,
    paddingBottom: space.md,
  },
  caption: {
    textAlign: 'center',
  },
});
