/**
 * Test sonucu — detaylı ama derli toplu:
 *  1) Kutlama + katılımcı bilgisi + kazanılan hayvan unvanı
 *  2) Puan kartı: büyük puan, başarı çubuğu, doğru/yanlış/süre kırılımı, kayıt satırı
 *  3) Sıralama kartı: sıra + ilk 3 önizlemesi ("sen" işaretli)
 *  4) Tek aksiyon: YENİ KATILIMCI (geçici durum temizlenir; kayıtlar silinmez)
 * Sertifika bu ekranda VERİLMEZ; belgeleri yönetici üretir (Sıralamalar).
 */

import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { ScoreCounter } from '@/components/ui/ScoreCounter';
import { EmptyState } from '@/components/ui/states';
import { clearTestSession } from '@/features/test-session';
import { useConfig, useGradeSetting, useRankingsFor, useResultById } from '@/data/hooks';
import { rankOf } from '@/domain/engine/ranking';
import { titleForResult } from '@/domain/engine/titles';
import type { Difficulty } from '@/domain/models';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatDuration } from '@/lib/format';
import { emojiForCode } from '@/lib/participant';
import { glassSurface, palette, radius, space, surface, type } from '@/theme';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Kolay',
  'easy-medium': 'Kolay-Orta',
  medium: 'Orta',
  'medium-hard': 'Orta-Zor',
};

function medalEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '🏅';
}

export default function ResultScreen() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();
  const result = useResultById(resultId);
  const config = useConfig();
  const settings = useGradeSetting(result?.grade ?? 1);
  const ranked = useRankingsFor(result?.grade ?? 1, null);

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
  const title = titleForResult(result.score, result.maxScore, config.titles);
  const myRank = rankOf(ranked, result.id);
  const top3 = ranked.slice(0, 3);
  const percent = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;

  return (
    <Screen scroll>
      {!reduced ? <Confetti /> : null}
      <View style={styles.stack}>
        <Reveal style={styles.hero}>
          <View style={styles.portal}>
            <Text style={styles.portalEmoji} maxFontSizeMultiplier={1.05}>
              {title ? title.emoji : emojiForCode(result.participantCode)}
            </Text>
          </View>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>
            🎉 Test tamamlandı
          </Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            {result.displayName} · {result.grade}/{section} ·{' '}
            {DIFFICULTY_LABEL[settings.difficulty]}
          </Text>
          {title ? (
            <View style={[styles.titleChip, glassSurface('strong')]}>
              <Text style={[type.label, { color: palette.rewardDeep }]}>🎖️ {title.name}</Text>
            </View>
          ) : null}
        </Reveal>

        <Reveal delay={80}>
          <GlassCard glint level="strong" contentStyle={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreStar} maxFontSizeMultiplier={1.1}>
                ⭐
              </Text>
              <ScoreCounter value={result.score} duration={900} style={{ color: palette.ink }} />
              <Text style={[type.bodySemi, { color: palette.inkSoft }]}>/ {result.maxScore}</Text>
            </View>

            <View style={styles.barBlock}>
              <ProgressBar progress={percent / 100} height={10} />
              <Text style={[type.caption, { color: palette.inkFaint }]}>Başarı %{percent}</Text>
            </View>

            <View style={styles.breakdown}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownEmoji}>✅</Text>
                <Text style={[type.h3, { color: palette.ink }]}>{result.correct}</Text>
                <Text style={[type.caption, { color: palette.inkSoft }]}>doğru</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownEmoji}>❌</Text>
                <Text style={[type.h3, { color: palette.ink }]}>{result.wrong}</Text>
                <Text style={[type.caption, { color: palette.inkSoft }]}>yanlış</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownEmoji}>⏱️</Text>
                <Text style={[type.h3, { color: palette.ink }]}>
                  {formatDuration(result.durationMs)}
                </Text>
                <Text style={[type.caption, { color: palette.inkSoft }]}>süre</Text>
              </View>
            </View>

            <View style={styles.savedRow}>
              <Text style={[type.caption, styles.center, { color: palette.success }]}>
                Sonucun kaydedildi · Katılımcı No: {result.participantCode}
              </Text>
            </View>
          </GlassCard>
        </Reveal>

        {myRank && ranked.length > 0 ? (
          <Reveal delay={140}>
            <GlassCard contentStyle={styles.rankCard}>
              <Text style={[type.bodySemi, { color: palette.inkSoft }]}>Sıralaman</Text>
              <View style={styles.rankHead}>
                <Text style={styles.rankMedal}>{medalEmoji(myRank.rank)}</Text>
                <Text style={[type.display, { color: palette.rewardDeep }]}>{myRank.rank}.</Text>
              </View>
              <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
                {result.grade}. sınıflar · {ranked.length} katılımcı
              </Text>

              <View style={styles.top3}>
                {top3.map((entry) => {
                  const isMe = entry.resultId === result.id;
                  return (
                    <View
                      key={entry.resultId}
                      style={[styles.topRow, isMe ? styles.topRowMe : null]}
                    >
                      <Text style={styles.topMedal}>{medalEmoji(entry.rank)}</Text>
                      <Text style={styles.topAvatar}>{emojiForCode(entry.participantCode)}</Text>
                      <Text
                        style={[type.bodySemi, styles.topName, { color: palette.ink }]}
                        numberOfLines={2}
                      >
                        {entry.displayName}
                        {isMe ? ' (sen)' : ''}
                      </Text>
                      <Text style={[type.label, { color: palette.rewardDeep }]} numberOfLines={1}>
                        ⭐ {entry.score}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {myRank.rank <= 3 ? (
                <Text style={[type.caption, styles.center, { color: palette.success }]}>
                  İlk üçtesin — belgen hazırlanacak.
                </Text>
              ) : null}
            </GlassCard>
          </Reveal>
        ) : null}
      </View>

      <Reveal delay={200} style={styles.footer}>
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
  stack: {
    gap: space.xl,
  },
  hero: {
    alignItems: 'center',
    gap: space.sm,
  },
  portal: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.primarySoft,
    borderWidth: 3,
    borderColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalEmoji: {
    fontSize: 46,
    textAlign: 'center',
  },
  titleChip: {
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
    marginTop: space.xs,
  },
  center: {
    textAlign: 'center',
  },
  scoreCard: {
    alignItems: 'stretch',
    gap: space.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: space.sm,
  },
  scoreStar: {
    fontSize: 28,
  },
  barBlock: {
    gap: space.xs,
    alignItems: 'center',
  },
  breakdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  breakdownEmoji: {
    fontSize: 20,
  },
  divider: {
    width: 1,
    height: 44,
    backgroundColor: surface.glassBorderSoft,
  },
  savedRow: {
    alignItems: 'center',
  },
  rankCard: {
    alignItems: 'center',
    gap: space.sm,
  },
  rankHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  rankMedal: {
    fontSize: 26,
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
    marginTop: space.lg,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
