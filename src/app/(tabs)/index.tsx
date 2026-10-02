/**
 * Ana sayfa — tek ana görev: TESTE BAŞLA (§8, §38).
 * Selamlama + puan/sıra özeti + büyük CTA + son sonuç.
 */

import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { useAttemptAvailability, useCurrentStudent, useStudentResults, useRankingsFor } from '@/data/hooks';
import { rankOf } from '@/domain/engine/ranking';
import { formatDateTR } from '@/lib/format';
import { glassSurface, palette, radius, space, type } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const student = useCurrentStudent();
  const results = useStudentResults(student?.id);
  const ranked = useRankingsFor(student?.grade ?? 1, null);
  const availability = useAttemptAvailability(student?.id, student?.grade ?? 1);

  if (!student) return <Redirect href="/onboarding/welcome" />;

  const myRank = rankOf(ranked, student.id);
  const lastResult = results[0];
  const firstName = student.fullName.split(' ')[0];

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Reveal style={styles.helloRow}>
          <View style={styles.helloText}>
            <Text style={[type.h1, { color: palette.ink }]} numberOfLines={1}>
              👋 Merhaba {firstName}!
            </Text>
            <Text style={[type.bodySemi, { color: palette.inkSoft }]}>
              🏫 {student.grade}/{student.classId.replace(String(student.grade), '')} · {student.nickname}
            </Text>
          </View>
          <View style={[styles.avatarMini, glassSurface('strong')]}>
            <Text style={styles.avatarEmoji} maxFontSizeMultiplier={1.1}>
              {student.emoji}
            </Text>
          </View>
        </Reveal>

        <Reveal delay={60} style={styles.statsRow}>
          <StatCard
            emoji="⭐"
            value={myRank ? myRank.score : '—'}
            label="En iyi puanın"
            accent="amber"
          />
          <StatCard
            emoji="🏆"
            value={myRank ? `${myRank.rank}.` : '—'}
            label={`${student.grade}. sınıflar sıralaması`}
            accent="lavender"
          />
        </Reveal>

        <Reveal delay={120}>
          <GlassCard glint level="strong" style={styles.ctaCard}>
            <View style={styles.ctaHeader}>
              <Text style={[type.h2, { color: palette.ink }]}>🔥 Bugünkü Test</Text>
              <Text style={[type.body, { color: palette.inkSoft }]}>
                Kısa sorular, büyük puanlar! Hazır olduğunda başla. 🚀
              </Text>
            </View>
            {availability.allowed ? (
              <Button
                label="TESTE BAŞLA 🚀"
                onPress={() => router.push('/test/start')}
                accessibilityHint="Test başlangıç ekranını açar"
              />
            ) : (
              <View style={styles.lockedArea}>
                <Text style={[type.bodySemi, { color: palette.inkSoft }]}>
                  {availability.reason}
                </Text>
                <Button
                  label="SONUCUMU GÖR"
                  variant="glass"
                  onPress={() =>
                    lastResult && router.push(`/test/result?resultId=${lastResult.id}`)
                  }
                />
              </View>
            )}
          </GlassCard>
        </Reveal>

        {lastResult ? (
          <Reveal delay={180}>
            <PressableLastResult
              onPress={() => router.push(`/test/result?resultId=${lastResult.id}`)}
              score={lastResult.score}
              correct={lastResult.correct}
              wrong={lastResult.wrong}
              date={formatDateTR(lastResult.completedAt)}
            />
          </Reveal>
        ) : (
          <Reveal delay={180}>
            <GlassCard style={styles.firstTime}>
              <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
                🌱 İlk testini çözerek rozetini kazanmaya başla!
              </Text>
            </GlassCard>
          </Reveal>
        )}
      </View>
    </Screen>
  );
}

interface LastResultProps {
  onPress: () => void;
  score: number;
  correct: number;
  wrong: number;
  date: string;
}

function PressableLastResult({ onPress, score, correct, wrong, date }: LastResultProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Son sonucun: ${score} puan, ${date}`}
      haptic="light"
      onPress={onPress}
      style={styles.lastWrap}
    >
      <GlassCard padded={false}>
        <View style={styles.lastInner}>
          <Text style={styles.lastEmoji} maxFontSizeMultiplier={1.1}>
            📋
          </Text>
          <View style={styles.lastText}>
            <Text style={[type.bodyBold, { color: palette.ink }]}>Son sonucun</Text>
            <Text style={[type.caption, { color: palette.inkFaint }]}>
              {date} · ✅ {correct} · ❌ {wrong}
            </Text>
          </View>
          <Text style={[type.h2, { color: palette.rewardDeep }]}>⭐ {score}</Text>
        </View>
      </GlassCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
    paddingTop: space.sm,
  },
  helloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  helloText: {
    flex: 1,
    gap: space.xs,
  },
  avatarMini: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  ctaCard: {
    marginTop: space.xs,
  },
  ctaHeader: {
    gap: space.xs,
    marginBottom: space.lg,
  },
  lockedArea: {
    gap: space.md,
  },
  firstTime: {
    paddingVertical: space.md,
  },
  center: {
    textAlign: 'center',
  },
  lastWrap: {
    marginTop: space.xs,
  },
  lastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  lastEmoji: {
    fontSize: 26,
  },
  lastText: {
    flex: 1,
    gap: 2,
  },
});
