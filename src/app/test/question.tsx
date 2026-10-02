/**
 * Soru ekranı — uygulamanın kalbi (§10).
 * Üst: canlı puan + ilerleme. Orta: büyük görsel + kısa soru. Alt: büyük seçenekler.
 * Cevap sonrası anlık geri bildirim paneli (doğru: kutlama, yanlış: nazik düzeltme).
 * Çıkışta onay istenir; test tamamlanınca sonuç motor tarafından hesaplanıp kaydedilir.
 */

import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { FeedbackSheet, type FeedbackState } from '@/components/ui/FeedbackSheet';
import { OptionButton, type OptionState } from '@/components/ui/OptionButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ScoreCounter } from '@/components/ui/ScoreCounter';
import { Screen } from '@/components/ui/Screen';
import { LoadingView } from '@/components/ui/states';
import { clearTestSession, getTestSession } from '@/features/test-session';
import { saveTestResult } from '@/data/actions';
import { flushPersist } from '@/data/db';
import { gradeTest, type AnswerInput } from '@/domain/engine/scoring';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { palette, radius, space, type } from '@/theme';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionScreen() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const session = getTestSession();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerInput[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showExit, setShowExit] = useState(false);

  const question = session?.plan.questions[index];
  const liveScore = session ? gradeTest(answers, session.plan.questions).score : 0;

  if (!session || !question) return <Redirect href="/test/start" />;

  const total = session.plan.questions.length;
  const isLast = index === total - 1;

  const answer = (optionIndex: number) => {
    if (feedback || selected !== null) return;
    const isCorrect = optionIndex === question.correctIndex;
    setSelected(optionIndex);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setAnswers((current) => [
      ...current,
      { questionId: question.id, selectedIndex: optionIndex },
    ]);
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(
        isCorrect
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      ).catch(() => undefined);
    }
  };

  const finishAndSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const outcome = saveTestResult({
        studentId: session.studentId,
        grade: session.grade,
        classId: session.classId,
        attempt: session.plan.attempt,
        startedAt: session.startedAt,
        questions: session.plan.questions,
        answers,
      });
      await flushPersist();
      clearTestSession();
      router.replace(`/test/result?resultId=${outcome.result.id}`);
    } catch (error) {
      console.warn('Sonuç kaydedilemedi.', error);
      setSaveError('Sonucun kaydedilemedi. İnternet ya da depolama sorunu olabilir.');
      setSaving(false);
    }
  };

  const next = () => {
    if (isLast) {
      void finishAndSave();
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setFeedback(null);
  };

  const optionState = (optionIndex: number): OptionState => {
    if (!feedback) return 'idle';
    if (optionIndex === question.correctIndex) return 'correct';
    if (optionIndex === selected) return 'wrong';
    return 'dimmed';
  };

  if (saving) {
    return (
      <Screen>
        <View style={styles.savingWrap}>
          <GlassCard glint style={styles.savingCard}>
            <Text style={styles.savingEmoji} maxFontSizeMultiplier={1.1}>
              💾
            </Text>
            <LoadingView label="Sonucun kaydediliyor…" />
          </GlassCard>
        </View>
      </Screen>
    );
  }

  if (saveError) {
    return (
      <Screen>
        <View style={styles.savingWrap}>
          <GlassCard style={styles.savingCard}>
            <Text style={styles.savingEmoji} maxFontSizeMultiplier={1.1}>
              😵‍💫
            </Text>
            <Text style={[type.h3, styles.center, { color: palette.ink }]}>
              Kaydedilemedi
            </Text>
            <Text style={[type.body, styles.center, { color: palette.inkSoft }]}>{saveError}</Text>
            <Button label="TEKRAR DENE" onPress={() => void finishAndSave()} />
            <Button
              label="Ana sayfaya dön"
              variant="ghost"
              onPress={() => {
                clearTestSession();
                router.replace('/');
              }}
            />
          </GlassCard>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} contentStyle={styles.root}>
      {feedback === 'correct' && !reduced ? <Confetti /> : null}

      <View style={styles.topBar}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Testten çık"
          haptic="light"
          onPress={() => setShowExit(true)}
          style={styles.exitButton}
        >
          <Text style={styles.exitIcon} maxFontSizeMultiplier={1.1}>
            ✕
          </Text>
        </PressableScale>
        <View style={styles.scorePill}>
          <Text style={styles.scoreStar} maxFontSizeMultiplier={1.1}>
            ⭐
          </Text>
          <ScoreCounter value={liveScore} style={styles.scoreText} />
        </View>
        <View style={styles.counterPill}>
          <Text style={[type.label, { color: palette.inkSoft }]}>
            {index + 1} / {total}
          </Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar progress={(index + (feedback ? 1 : 0)) / total} />
      </View>

      <ScrollView
        style={styles.middle}
        contentContainerStyle={styles.middleContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard glint style={styles.questionCard}>
          <View style={styles.visualWrap}>
            <Text style={styles.visual} maxFontSizeMultiplier={1.05}>
              {question.visual}
            </Text>
          </View>
          <Text style={[type.h2, styles.questionText, { color: palette.ink }]} maxFontSizeMultiplier={1.25}>
            {question.text}
          </Text>
        </GlassCard>

        <View style={styles.optionsArea}>
          {question.options.map((option, optionIndex) => (
            <OptionButton
              key={`${question.id}-${optionIndex}`}
              label={option}
              letter={LETTERS[optionIndex]}
              state={optionState(optionIndex)}
              onPress={() => answer(optionIndex)}
            />
          ))}
        </View>
      </ScrollView>

      {feedback && selected !== null ? (
        <View style={styles.sheetWrap}>
          <FeedbackSheet
            state={feedback}
            fact={question.fact}
            points={question.points}
            correctLabel={question.options[question.correctIndex]}
            onContinue={next}
          />
        </View>
      ) : (
        <View style={styles.hintWrap}>
          <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
            Bir seçenek dokun 👆
          </Text>
        </View>
      )}

      {showExit ? (
        <View style={styles.exitOverlay}>
          <GlassCard level="strong" style={styles.exitCard}>
            <Text style={[type.h3, styles.center, { color: palette.ink }]}>
              Testten çıkılsın mı?
            </Text>
            <Text style={[type.body, styles.center, { color: palette.inkSoft }]}>
              Puanın kaydedilmez ve baştan başlarsın.
            </Text>
            <Button
              label="TESTE DÖN →"
              onPress={() => setShowExit(false)}
              accessibilityHint="Teste kaldığın yerden devam eder"
            />
            <Button
              label="Çık"
              variant="danger"
              onPress={() => {
                clearTestSession();
                router.back();
              }}
            />
          </GlassCard>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitIcon: {
    fontSize: 18,
    color: palette.inkSoft,
  },
  scorePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    height: 44,
  },
  scoreStar: {
    fontSize: 18,
  },
  scoreText: {
    fontSize: 22,
    lineHeight: 26,
    color: palette.ink,
  },
  counterPill: {
    minWidth: 64,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    marginTop: space.md,
  },
  middle: {
    flex: 1,
  },
  middleContent: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: space.lg,
    paddingVertical: space.md,
  },
  questionCard: {},
  visualWrap: {
    alignItems: 'center',
    marginBottom: space.md,
  },
  visual: {
    fontSize: 60,
  },
  questionText: {
    textAlign: 'center',
  },
  optionsArea: {
    gap: space.sm,
  },
  sheetWrap: {
    paddingBottom: space.md,
  },
  hintWrap: {
    paddingBottom: space.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  savingWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  savingCard: {
    alignItems: 'center',
  },
  savingEmoji: {
    fontSize: 52,
  },
  exitOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(23,35,63,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    zIndex: 10,
  },
  exitCard: {
    width: '100%',
    maxWidth: 400,
    gap: space.md,
    backgroundColor: palette.white,
  },
});
