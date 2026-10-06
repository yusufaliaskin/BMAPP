/**
 * Test sonucu — sade: "Test tamamlandı" + toplam puan + iki aksiyon.
 * Birincil aksiyon: SERTİFİKAMI AL (belge üretilir/açılır).
 * İkincil: YENİ KATILIMCI (yalnız geçici durum temizlenir; kayıtlar silinmez).
 */

import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { ScoreCounter } from '@/components/ui/ScoreCounter';
import { EmptyState } from '@/components/ui/states';
import { clearTestSession } from '@/features/test-session';
import { requestCertificate } from '@/data/actions';
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

  const openCertificate = () => {
    // Belgeyi burada üretiriz: katılım belgesi yoksa oluşur, varsa aynen açılır.
    requestCertificate(result.id);
    router.push({ pathname: '/test/certificate', params: { resultId: result.id } });
  };

  return (
    <Screen>
      {!reduced ? <Confetti /> : null}
      <View style={styles.body}>
        <Reveal style={styles.head}>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>Test tamamlandı</Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            {result.displayName} · {result.grade}/{section}
          </Text>
        </Reveal>

        <Reveal delay={80} style={styles.scoreBlock}>
          <ScoreCounter value={result.score} duration={900} style={{ color: palette.ink }} />
          <Text style={[type.bodySemi, { color: palette.inkSoft }]}>/ {result.maxScore} puan</Text>
          <Text style={[type.caption, { color: palette.inkFaint }]}>
            Sonucun kaydedildi · Katılımcı No: {result.participantCode}
          </Text>
        </Reveal>
      </View>

      <Reveal delay={140} style={styles.footer}>
        <Button
          label="SERTİFİKAMI AL"
          onPress={openCertificate}
          accessibilityHint="Belgeni açar; buradan PDF olarak kaydedebilirsin"
        />
        <Button
          label="YENİ KATILIMCI"
          variant="glass"
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
  scoreBlock: {
    alignItems: 'center',
    gap: space.xs,
  },
  footer: {
    gap: space.md,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
