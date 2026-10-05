/**
 * Test sonucu (§14, kiosk akışı) — sade ve simetrik düzen:
 *   1) Kahraman bloğu: puana göre HAYVAN + unvan adı
 *   2) Puan kartı: ⭐ puan · doğru/yanlış/süre · "kaydedildi" satırı
 *   3) Derece kartı: sıra + ilk 3 önizlemesi
 *   4) Tek ana aksiyon: SIFIRLA (geçici state temizlenir; veritabanına DOKUNULMAZ)
 */

import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { ScoreCounter } from '@/components/ui/ScoreCounter';
import { EmptyState } from '@/components/ui/states';
import { clearTestSession } from '@/features/test-session';
import { useConfig, useRankingsFor, useResultById } from '@/data/hooks';
import { titleForResult } from '@/domain/engine/titles';
import { rankOf } from '@/domain/engine/ranking';
import { formatDuration } from '@/lib/format';
import { emojiForCode } from '@/lib/participant';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { glassSurface, palette, radius, space, type } from '@/theme';

function medalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '🏅';
}

function medalLabel(rank: number): string {
  if (rank === 1) return 'Altın';
  if (rank === 2) return 'Gümüş';
  return 'Bronz';
}

export default function ResultScreen() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();
  const result = useResultById(resultId);
  const config = useConfig();
  const [showConfetti, setShowConfetti] = useState(!reduced);

  const ranked = useRankingsFor(result?.grade ?? 1, null);

  const reset = () => {
    clearTestSession();
    router.replace('/onboarding/welcome');
  };

  // Android donanım geri tuşu sonuç ekranından kiosk başına döner (sonuç kayıtlı).
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
            emoji="🔎"
            title="Sonuç bulunamadı"
            message="Bu sonuç kayıtlarda yok. Sıradaki katılımcı için sıfırlayabilirsin."
            actionLabel="SIFIRLA 🔄"
            onAction={reset}
          />
        </View>
      </Screen>
    );
  }

  const myRank = rankOf(ranked, result.id);
  const top3 = ranked.slice(0, 3);
  const title = titleForResult(result.score, result.maxScore, config.titles);
  const section = result.classId.replace(/^\d/, '');

  return (
    <Screen scroll contentStyle={styles.root}>
      {showConfetti ? <Confetti onDone={() => setShowConfetti(false)} /> : null}
      <View style={styles.stack}>
        <Reveal style={styles.hero}>
          <View style={styles.portal}>
            <Text style={styles.portalEmoji} maxFontSizeMultiplier={1.05}>
              {title ? title.emoji : emojiForCode(result.participantCode)}
            </Text>
          </View>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>TEST BİTTİ!</Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            {result.displayName} · {result.grade}/{section}
          </Text>
          {title ? (
            <View style={[styles.titleChip, glassSurface('strong')]}>
              <Text style={[type.label, { color: palette.rewardDeep }]}>
                🎖️ {title.name}
              </Text>
            </View>
          ) : null}
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
            <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
              ✅ {result.correct} doğru · ❌ {result.wrong} yanlış · ⏱️{' '}
              {formatDuration(result.durationMs)}
            </Text>
            <View style={styles.divider} />
            <Text style={[type.caption, styles.center, { color: palette.success }]}>
              ✅ Sonucun kaydedildi · Katılımcı No: {result.participantCode}
            </Text>
          </GlassCard>
        </Reveal>

        <Reveal delay={140}>
          <GlassCard style={styles.rankCard}>
            <Text style={[type.bodySemi, { color: palette.inkSoft }]}>📜 Derece durumun</Text>
            {myRank ? (
              <>
                <Text style={[type.display, { color: palette.rewardDeep }]}>
                  {medalEmoji(myRank.rank)} {myRank.rank}.
                </Text>
                <Text style={[type.caption, { color: palette.inkFaint }]}>
                  {result.grade}. sınıflar sıralaması · {ranked.length} katılımcı
                </Text>
              </>
            ) : null}
            <View style={styles.top3}>
              {top3.map((entry) => {
                const isMe = myRank ? entry.resultId === myRank.resultId : false;
                return (
                  <View key={entry.resultId} style={[styles.topRow, isMe ? styles.topRowMe : null]}>
                    <Text style={styles.topMedal}>{medalEmoji(entry.rank)}</Text>
                    <Text style={styles.topAvatar}>{emojiForCode(entry.participantCode)}</Text>
                    <Text
                      style={[type.bodySemi, styles.topName, { color: palette.ink }]}
                      numberOfLines={2}
                    >
                      {entry.displayName}
                      {isMe ? ' (sen)' : ''}
                    </Text>
                    <Text style={[type.label, { color: palette.rewardDeep }]}>
                      ⭐ {entry.score}
                    </Text>
                  </View>
                );
              })}
            </View>
            {myRank && myRank.rank <= 3 ? (
              <Text style={[type.caption, styles.center, { color: palette.success }]}>
                {`🎓 İlk 3'tesin! ${medalLabel(myRank.rank)} sertifikan hazırlanacak.`}
              </Text>
            ) : null}
          </GlassCard>
        </Reveal>
      </View>

      <Reveal delay={200} style={styles.footer}>
        <Button
          label="SIFIRLA 🔄 YENİ KATILIMCI"
          onPress={reset}
          accessibilityHint="Geçici durumu temizler ve karşılama ekranını açar; kayıtlı sonuçlar silinmez"
        />
        <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
          Sonuç veritabanında güvende — sıradaki arkadaşın başlayabilir. 🙌
        </Text>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.lg,
  },
  stack: {
    gap: space.lg,
  },
  hero: {
    alignItems: 'center',
    gap: space.sm,
  },
  portal: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.primarySoft,
    borderWidth: 3,
    borderColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalEmoji: {
    fontSize: 52,
  },
  titleChip: {
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
  },
  center: {
    textAlign: 'center',
  },
  scoreCard: {
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.sm,
    marginBottom: space.xs,
  },
  scoreStar: {
    fontSize: 30,
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: 'rgba(23,35,63,0.08)',
    marginVertical: space.md,
  },
  rankCard: {
    alignItems: 'center',
    gap: space.sm,
  },
  top3: {
    alignSelf: 'stretch',
    gap: space.sm,
    marginTop: space.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.lg,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    backgroundColor: palette.primarySoft,
  },
  topRowMe: {
    borderWidth: 1.5,
    borderColor: palette.primary,
    backgroundColor: palette.white,
  },
  topMedal: {
    fontSize: 18,
  },
  topAvatar: {
    fontSize: 18,
  },
  topName: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    gap: space.sm,
    marginTop: space.sm,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
