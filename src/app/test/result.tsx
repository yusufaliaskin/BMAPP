/**
 * Test sonucu (§14) — kaydedilmiş gerçek sonuçtan okunur; puan burada yeniden
 * hesaplanmaz, motordan gelen kayıt gösterilir. Sıra ve yeni rozetler de canlı veriden gelir.
 */

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { ScoreCounter } from '@/components/ui/ScoreCounter';
import { EmptyState } from '@/components/ui/states';
import {
  useBadges,
  useCurrentStudent,
  useRankingsFor,
  useStudentBadges,
  useResultById,
} from '@/data/hooks';
import { rankOf } from '@/domain/engine/ranking';
import { formatDuration } from '@/lib/format';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { palette, radius, space, type } from '@/theme';

export default function ResultScreen() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();
  const student = useCurrentStudent();
  const result = useResultById(resultId);
  const ranked = useRankingsFor(student?.grade ?? 1, null);
  const allBadges = useBadges();
  const myBadges = useStudentBadges(student?.id);
  const [showConfetti, setShowConfetti] = useState(!reduced);

  if (!student) return <Redirect href="/onboarding/welcome" />;

  if (!result) {
    return (
      <Screen title="Sonuç" onBack={() => router.back()}>
        <View style={styles.centerWrap}>
          <EmptyState
            emoji="🔎"
            title="Sonuç bulunamadı"
            message="Bu sonuç kayıtlarda yok. Ana sayfadan yeni bir teste başlayabilirsin."
            actionLabel="ANA SAYFA"
            onAction={() => router.replace('/')}
          />
        </View>
      </Screen>
    );
  }

  const myRank = rankOf(ranked, student.id);
  const newBadges = myBadges
    .filter((badge) => badge.resultId === result.id)
    .map((badge) => ({ awarded: badge, def: allBadges.find((b) => b.id === badge.badgeId) }))
    .filter((item) => item.def);

  return (
    <Screen scroll contentStyle={styles.root}>
      {showConfetti ? <Confetti onDone={() => setShowConfetti(false)} /> : null}
      <View style={styles.stack}>
        <Reveal style={styles.hero}>
          <Text style={styles.heroEmoji} maxFontSizeMultiplier={1.1}>
            🎉
          </Text>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>TEST BİTTİ!</Text>
        </Reveal>

        <Reveal delay={70}>
          <GlassCard glint level="strong" style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreStar} maxFontSizeMultiplier={1.1}>
                ⭐
              </Text>
              <ScoreCounter value={result.score} duration={900} style={{ color: palette.ink }} />
              <Text style={[type.bodySemi, { color: palette.inkSoft }]}>
                / {result.maxScore}
              </Text>
            </View>
            <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
              {result.correct} doğru · {result.wrong} yanlış · {formatDuration(result.durationMs)}
            </Text>
          </GlassCard>
        </Reveal>

        {myRank ? (
          <Reveal delay={140}>
            <GlassCard style={styles.rankCard}>
              <Text style={[type.bodySemi, { color: palette.inkSoft }]}>
                🏆 Sıralamadaki yerin
              </Text>
              <Text style={[type.display, { color: palette.rewardDeep }]}>
                {myRank.rank}.
              </Text>
              <Text style={[type.caption, { color: palette.inkFaint }]}>
                {student.grade}. sınıflar arasında
              </Text>
            </GlassCard>
          </Reveal>
        ) : null}

        {newBadges.length > 0 ? (
          <Reveal delay={200}>
            <GlassCard style={styles.badgeCard}>
              <Text style={[type.h3, { color: palette.ink }]}>🎖️ Yeni unvan kazandın!</Text>
              {newBadges.map((item) => (
                <View key={item.def!.id} style={styles.badgeRow}>
                  <Text style={styles.badgeEmoji} maxFontSizeMultiplier={1.1}>
                    {item.def!.emoji}
                  </Text>
                  <Text style={[type.bodyBold, { color: palette.ink }]}>{item.def!.name}</Text>
                </View>
              ))}
            </GlassCard>
          </Reveal>
        ) : null}

        {myRank && myRank.rank <= 3 ? (
          <Reveal delay={240}>
            <GlassCard style={styles.certCard}>
              <Text style={[type.bodySemi, styles.center, { color: palette.ink }]}>
                🥳 İlk üçtesin! Sertifikan seni bekliyor.
              </Text>
              <Button
                label="SERTİFİKAMI GÖR 🎓"
                variant="glass"
                onPress={() => router.push('/certificate')}
              />
            </GlassCard>
          </Reveal>
        ) : null}
      </View>

      <Reveal delay={280} style={styles.footer}>
        <Button label="SIRALAMAYA BAK 🏆" onPress={() => router.replace('/leaderboard')} />
        <Button label="ANA SAYFA" variant="glass" onPress={() => router.replace('/')} />
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
    gap: space.xs,
  },
  heroEmoji: {
    fontSize: 56,
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
  rankCard: {
    alignItems: 'center',
    gap: space.xs,
  },
  badgeCard: {
    gap: space.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  certCard: {
    gap: space.md,
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
