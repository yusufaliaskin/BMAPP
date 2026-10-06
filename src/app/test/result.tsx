/**
 * Test sonucu — sade: kutlama satırı + toplam puan + tek aksiyon.
 * Sertifika bu ekranda VERİLMEZ; belgeleri yönetici üretir (Sıralamalar).
 * YENİ KATILIMCI yalnız geçici durumu temizler; kayıtlar silinmez.
 */

import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { GlassCard } from '@/components/glass/GlassCard';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { ScoreCounter } from '@/components/ui/ScoreCounter';
import { EmptyState } from '@/components/ui/states';
import { clearTestSession } from '@/features/test-session';
import { useResultById } from '@/data/hooks';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { palette, space, type } from '@/theme';

export default function ResultScreen() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();
  const result = useResultById(resultId);

  const reset = () => {
    clearTestSession();
    router.replace('/onboarding/welcome');
  };

  // Android donanım geri tuşu kiosk başına döner (sonuç kayıtlı).
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      clearTestSession();
      router.replace('/onboarding/welcome');
      return true;
    });
    return () => subscription.remove();
  }, [router]);

  if (!result) {
    return (
      <Screen title="Sonuç">
        <View style={styles.centerWrap}>
          <EmptyState
            title="Sonuç bulunamadı"
            message="Bu sonuç kayıtlarda yok. Sıradaki katılımcı için sıfırlayabilirsin."
            actionLabel="SIFIRLA"
            onAction={reset}
          />
        </View>
      </Screen>
    );
  }

  const section = result.classId.replace(/^\d/, '');

  return (
    <Screen>
      {!reduced ? <Confetti /> : null}
      <View style={styles.body}>
        <Reveal style={styles.head}>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>
            🎉 Test tamamlandı
          </Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            {result.displayName} · {result.grade}/{section}
          </Text>
        </Reveal>

        <Reveal delay={80}>
          <GlassCard glint level="strong" style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreStar} maxFontSizeMultiplier={1.1}>
                ⭐
              </Text>
              <ScoreCounter value={result.score} duration={900} style={{ color: palette.ink }} />
              <Text style={[type.bodySemi, { color: palette.inkSoft }]}>/ {result.maxScore}</Text>
            </View>
            <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
              Sonucun kaydedildi · Katılımcı No: {result.participantCode}
            </Text>
          </GlassCard>
        </Reveal>
      </View>

      <Reveal delay={140} style={styles.footer}>
        <Button
          label="YENİ KATILIMCI"
          onPress={reset}
          accessibilityHint="Geçici durumu temizler ve karşılama ekranını açar"
        />
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: space.giant,
  },
  head: {
    alignItems: 'center',
    gap: space.sm,
  },
  center: {
    textAlign: 'center',
  },
  scoreCard: {
    alignItems: 'center',
    gap: space.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.sm,
  },
  scoreStar: {
    fontSize: 28,
  },
  footer: {
    gap: space.md,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
