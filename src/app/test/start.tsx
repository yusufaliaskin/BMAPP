/**
 * Test başlangıç ekranı — yalnız gerekli bilgi: sınıf, soru sayısı, toplam puan (§9).
 * Uzun açıklama yok; tek aksiyon "BAŞLA 🚀".
 */

import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { startTestSession } from '@/features/test-session';
import {
  useAttemptAvailability,
  useCurrentStudent,
  useGradeSetting,
  useQuestions,
  useStudentResults,
} from '@/data/hooks';
import { buildTestPlan } from '@/domain/engine/quiz';
import type { Difficulty } from '@/domain/models';
import { palette, space, surface, type } from '@/theme';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Kolay',
  'easy-medium': 'Kolay-Orta',
  medium: 'Orta',
  'medium-hard': 'Orta-Zor',
};

export default function TestStartScreen() {
  const router = useRouter();
  const student = useCurrentStudent();
  const grade = student?.grade ?? 1;
  const settings = useGradeSetting(grade);
  const questions = useQuestions();
  const results = useStudentResults(student?.id);
  const availability = useAttemptAvailability(student?.id, grade);

  if (!student) return <Redirect href="/onboarding/welcome" />;

  const attempt = availability.attemptsUsed;
  const plan = buildTestPlan(questions, grade, settings, attempt);
  const section = student.classId.replace(String(student.grade), '');

  const begin = () => {
    startTestSession({
      plan,
      studentId: student.id,
      grade: student.grade,
      classId: student.classId,
      startedAt: new Date().toISOString(),
    });
    router.push('/test/question');
  };

  return (
    <Screen title="Test" onBack={() => router.back()}>
      <View style={styles.body}>
        <Reveal style={styles.hero}>
          <Text style={styles.emoji} maxFontSizeMultiplier={1.1}>
            🎯
          </Text>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>HAZIR MISIN?</Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            {student.grade}/{section} · {DIFFICULTY_LABEL[settings.difficulty]}
          </Text>
        </Reveal>

        <Reveal delay={80}>
          <GlassCard glint style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>📝</Text>
                <Text style={[type.h2, { color: palette.ink }]}>{plan.questions.length} Soru</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>⭐</Text>
                <Text style={[type.h2, { color: palette.ink }]}>{plan.totalPoints} Puan</Text>
              </View>
            </View>
          </GlassCard>
        </Reveal>

        {!availability.allowed ? (
          <Reveal delay={140}>
            <GlassCard style={styles.blockedCard}>
              <Text style={[type.bodySemi, styles.center, { color: palette.coral }]}>
                {availability.reason}
              </Text>
            </GlassCard>
          </Reveal>
        ) : null}
      </View>

      <Reveal delay={160}>
        <Button
          label="BAŞLA 🚀"
          onPress={begin}
          disabled={!availability.allowed || plan.questions.length === 0}
          accessibilityHint="İlk soruyu açar"
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
  hero: {
    alignItems: 'center',
    gap: space.sm,
  },
  emoji: {
    fontSize: 64,
  },
  center: {
    textAlign: 'center',
  },
  infoCard: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: space.sm,
  },
  infoEmoji: {
    fontSize: 30,
  },
  divider: {
    width: 1,
    height: 56,
    backgroundColor: surface.glassBorderSoft,
  },
  blockedCard: {
    paddingVertical: space.lg,
  },
});
