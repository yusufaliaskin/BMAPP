/**
 * Admin — Test Analizi (§25): gerçek sonuçlardan istatistikler.
 * Ortalamalar, en çok yanlış/doğru yapılan sorular, sınıf ve konu bazlı başarı yüzdeleri.
 */

import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/states';
import { useConfig, useQuestions, useResults, useStudents, useTopics } from '@/data/hooks';
import { representativeResult } from '@/domain/engine/ranking';
import { GRADES } from '@/domain/models';
import { glassSurface, palette, radius, space, type } from '@/theme';

interface QuestionStat {
  questionId: string;
  correct: number;
  wrong: number;
}

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const students = useStudents();
  const results = useResults();
  const questions = useQuestions();
  const topics = useTopics();
  const config = useConfig();

  const stats = useMemo(() => {
    const bests = students
      .map((student) => representativeResult(results, student.id, student.grade, config.retakePolicy))
      .filter((result) => result !== undefined);
    const avgScore =
      bests.length > 0 ? Math.round(bests.reduce((s, r) => s + r.score, 0) / bests.length) : 0;
    const avgCorrect =
      results.length > 0
        ? (results.reduce((s, r) => s + r.correct, 0) / results.length).toFixed(1)
        : '0.0';
    const avgWrong =
      results.length > 0
        ? (results.reduce((s, r) => s + r.wrong, 0) / results.length).toFixed(1)
        : '0.0';

    const perQuestion = new Map<string, QuestionStat>();
    for (const result of results) {
      for (const answer of result.answers) {
        const entry = perQuestion.get(answer.questionId) ?? {
          questionId: answer.questionId,
          correct: 0,
          wrong: 0,
        };
        if (answer.isCorrect) entry.correct += 1;
        else entry.wrong += 1;
        perQuestion.set(answer.questionId, entry);
      }
    }
    const statList = [...perQuestion.values()];
    const mostWrong = statList
      .filter((s) => s.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong || b.correct - a.correct)[0];
    const mostCorrect = statList
      .filter((s) => s.correct > 0)
      .sort((a, b) => b.correct - a.correct)[0];

    const perGrade = GRADES.map((grade) => {
      const gradeResults = results.filter((r) => r.grade === grade);
      const percent =
        gradeResults.length > 0
          ? Math.round(
              (gradeResults.reduce((s, r) => s + r.score / Math.max(1, r.maxScore), 0) /
                gradeResults.length) *
                100,
            )
          : 0;
      return { grade, count: gradeResults.length, percent };
    });

    const perTopic = topics
      .map((topic) => {
        let correct = 0;
        let total = 0;
        for (const [questionId, stat] of perQuestion) {
          const question = questions.find((q) => q.id === questionId);
          if (question?.topicId === topic.id) {
            correct += stat.correct;
            total += stat.correct + stat.wrong;
          }
        }
        return {
          topic,
          percent: total > 0 ? Math.round((correct / total) * 100) : 0,
          total,
        };
      })
      .filter((entry) => entry.total > 0);

    return {
      participants: bests.length,
      avgScore,
      avgCorrect,
      avgWrong,
      mostWrong,
      mostCorrect,
      perGrade,
      perTopic,
    };
  }, [students, results, questions, topics, config.retakePolicy]);

  const mostWrongQuestion = stats.mostWrong
    ? questions.find((q) => q.id === stats.mostWrong!.questionId)
    : undefined;
  const mostCorrectQuestion = stats.mostCorrect
    ? questions.find((q) => q.id === stats.mostCorrect!.questionId)
    : undefined;

  return (
    <Screen title="Test Analizi" onBack={() => router.back()} scroll>
      <View style={styles.container}>
        {results.length === 0 ? (
          <EmptyState
            emoji="📈"
            title="Henüz veri yok"
            message="Öğrenciler test çözdükçe analizler burada oluşur."
          />
        ) : (
          <>
            <Reveal style={styles.grid}>
              <View style={styles.row}>
                <StatCard emoji="👥" value={stats.participants} label="Katılımcı" accent="sky" />
                <StatCard emoji="⭐" value={stats.avgScore} label="Ortalama puan" accent="amber" />
              </View>
              <View style={styles.row}>
                <StatCard emoji="✅" value={stats.avgCorrect} label="Ort. doğru / test" accent="mint" />
                <StatCard emoji="❌" value={stats.avgWrong} label="Ort. yanlış / test" accent="coral" />
              </View>
            </Reveal>

            {mostWrongQuestion && stats.mostWrong ? (
              <Reveal delay={80}>
                <GlassCard style={styles.highlightCard}>
                  <Text style={[type.overline, { color: palette.coral }]}>En çok yanlış yapılan soru</Text>
                  <Text style={[type.bodyBold, { color: palette.ink }]}>
                    {mostWrongQuestion.visual} {mostWrongQuestion.text}
                  </Text>
                  <Text style={[type.caption, { color: palette.inkSoft }]}>
                    {mostWrongQuestion.grade}. sınıf · ❌ {stats.mostWrong.wrong} yanlış · ✅{' '}
                    {stats.mostWrong.correct} doğru
                  </Text>
                </GlassCard>
              </Reveal>
            ) : null}

            {mostCorrectQuestion && stats.mostCorrect ? (
              <Reveal delay={110}>
                <GlassCard style={styles.highlightCard}>
                  <Text style={[type.overline, { color: palette.success }]}>En çok doğru yapılan soru</Text>
                  <Text style={[type.bodyBold, { color: palette.ink }]}>
                    {mostCorrectQuestion.visual} {mostCorrectQuestion.text}
                  </Text>
                  <Text style={[type.caption, { color: palette.inkSoft }]}>
                    {mostCorrectQuestion.grade}. sınıf · ✅ {stats.mostCorrect.correct} doğru
                  </Text>
                </GlassCard>
              </Reveal>
            ) : null}

            <Reveal delay={140}>
              <GlassCard style={styles.barCard}>
                <Text style={[type.h3, { color: palette.ink }]}>🏫 Sınıf Bazlı Ortalama</Text>
                {stats.perGrade.map((entry) => (
                  <View key={entry.grade} style={styles.barRow}>
                    <View style={styles.barLabelRow}>
                      <Text style={[type.bodySemi, { color: palette.ink }]}>
                        {entry.grade}. Sınıflar
                      </Text>
                      <Text style={[type.caption, { color: palette.inkSoft }]}>
                        %{entry.percent} · {entry.count} test
                      </Text>
                    </View>
                    <ProgressBar progress={entry.percent / 100} height={10} color="primary" />
                  </View>
                ))}
              </GlassCard>
            </Reveal>

            <Reveal delay={170}>
              <GlassCard style={styles.barCard}>
                <Text style={[type.h3, { color: palette.ink }]}>📚 Konu Bazlı Başarı</Text>
                {stats.perTopic.map((entry) => (
                  <View key={entry.topic.id} style={styles.barRow}>
                    <View style={styles.barLabelRow}>
                      <Text style={[type.bodySemi, { color: palette.ink }]}>
                        {entry.topic.icon} {entry.topic.name}
                      </Text>
                      <Text style={[type.caption, { color: palette.inkSoft }]}>
                        %{entry.percent} · {entry.total} cevap
                      </Text>
                    </View>
                    <ProgressBar progress={entry.percent / 100} height={10} color="success" />
                  </View>
                ))}
              </GlassCard>
            </Reveal>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  grid: {
    gap: space.md,
  },
  row: {
    flexDirection: 'row',
    gap: space.md,
  },
  highlightCard: {
    gap: space.sm,
  },
  barCard: {
    gap: space.lg,
  },
  barRow: {
    gap: space.sm,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
