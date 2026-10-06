/**
 * Test hazırlık ekranı — yalnız gerekli bilgi: sınıf, soru sayısı, toplam puan (§9).
 * BAŞLA ile benzersiz katılımcı kodu üretilir ve test oturumu açılır (kiosk).
 */

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { startTestSession } from '@/features/test-session';
import { useClasses, useGradeSetting, useQuestions, useResults } from '@/data/hooks';
import { buildTestPlan } from '@/domain/engine/quiz';
import type { Difficulty, Grade } from '@/domain/models';
import { makeUniqueParticipantCode } from '@/lib/participant';
import { palette, space, surface, type } from '@/theme';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Kolay',
  'easy-medium': 'Kolay-Orta',
  medium: 'Orta',
  'medium-hard': 'Orta-Zor',
};

export default function TestStartScreen() {
  const router = useRouter();
  const { name, classId } = useLocalSearchParams<{ name?: string; classId?: string }>();
  const classes = useClasses();
  const questions = useQuestions();
  const results = useResults();

  const schoolClass = classes.find((c) => c.id === classId && c.isActive);
  const grade: Grade = schoolClass?.grade ?? 1;
  const settings = useGradeSetting(grade);

  if (!name || !schoolClass) return <Redirect href="/onboarding/welcome" />;

  const plan = buildTestPlan(questions, grade, settings);

  const begin = () => {
    const participantCode = makeUniqueParticipantCode(
      results.map((result) => result.participantCode),
    );
    startTestSession({
      plan,
      participantCode,
      displayName: name,
      grade: schoolClass.grade,
      classId: schoolClass.id,
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
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>Hazır mısın?</Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            {name} · {schoolClass.grade}/{schoolClass.section} · {DIFFICULTY_LABEL[settings.difficulty]}
          </Text>
        </Reveal>

        <Reveal delay={80}>
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>📝</Text>
                <Text style={[type.h2, { color: palette.ink }]}>{plan.questions.length} soru</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoEmoji}>⭐</Text>
                <Text style={[type.h2, { color: palette.ink }]}>{plan.totalPoints} puan</Text>
              </View>
            </View>
          </GlassCard>
        </Reveal>
      </View>

      <Reveal delay={160}>
        <Button
          label="BAŞLA"
          onPress={begin}
          disabled={plan.questions.length === 0}
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
    textAlign: 'center',
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
});
