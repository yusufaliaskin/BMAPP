/**
 * StoreProvider — uygulama açılışında veri deposunu yükler (veya ilk kez tohumlar).
 * Hazır olana dek aurora zeminli önyükleme ekranı; hata durumunda gerçek bir
 * çıkış yolu sunan hata ekranı gösterilir (§31, §43).
 */

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuroraBackground } from '@/components/glass/AuroraBackground';
import { GlassCard } from '@/components/glass/GlassCard';
import { ErrorView, LoadingView } from '@/components/ui/states';
import { initStore } from './db';
import { palette, space, type } from '@/theme';

type Phase = 'loading' | 'ready' | 'error';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;
    setPhase('loading');
    initStore()
      .then(() => {
        if (mounted) setPhase('ready');
      })
      .catch((error) => {
        console.warn('Veri deposu başlatılamadı.', error);
        if (mounted) setPhase('error');
      });
    return () => {
      mounted = false;
    };
  }, [attempt]);

  if (phase === 'ready') return <>{children}</>;

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safe}>
        <View style={styles.column}>
          {phase === 'loading' ? (
            <GlassCard glint style={styles.card}>
              <View style={styles.inner}>
                <View style={styles.logoWrap}>
                  <Text style={styles.logo} maxFontSizeMultiplier={1.1}>
                    🦸
                  </Text>
                </View>
                <Text style={[type.h1, styles.title, { color: palette.ink }]}>
                  Bilinçli Kahraman
                </Text>
                <Text style={[type.bodySemi, styles.subtitle, { color: palette.inkSoft }]}>
                  Bağımlılıkla Mücadele Farkındalık Projesi
                </Text>
                <LoadingView label="Hazırlanıyor…" />
              </View>
            </GlassCard>
          ) : (
            <ErrorView
              title="Uygulama açılamadı"
              message="Veriler yüklenirken bir sorun oluştu. Tekrar denemek sorunu genellikle çözer."
              onRetry={() => setAttempt((value) => value + 1)}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },
  safe: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  card: {
    width: '100%',
  },
  inner: {
    alignItems: 'center',
    gap: space.sm,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  logo: {
    fontSize: 52,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});
