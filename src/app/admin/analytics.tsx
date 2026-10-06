/**
 * Admin — Test Analizi (sıfırdan tasarım): ferah, katmanlı düzen.
 * 1) Genel Özet — satır satır büyük değerler
 * 2) Sınıf Bazlı Başarı — çubuklu
 * 3) Konu Bazlı Başarı — çubuklu
 * 4) Öne Çıkan Sorular — en çok yanlış / en çok doğru
 * Her blok arasında geniş boşluk; iç öğeler sıkıştırılmaz.
 */

import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/states';
import { useQuestions, useResults, useTopics } from '@/data/hooks';
import { GRADES } from '@/domain/models';
import { palette, radius, space, type } from '@/theme';

interface QuestionStat {
  questionId: string;
  correct: number;
  wrong: number;
}

interface SummaryRowProps {
  emoji: string;
  label: string;
  value: string | number;
}

function SummaryRow({ emoji, label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryEmoji}>
        <Text style={styles.summaryEmojiText} maxFontSizeMultiplier={1.1}>
          {emoji}
        </Text>
      </View>
      <Text style={[type.bodySemi, styles.summaryLabel, { color: palette.inkSoft }]}>
        {label}
      </Text>
      <Text style={[type.h2, { color: palette.ink }]}>{value}</Text>
    </View>
  );
}

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const results = useResults();
  const questions = useQuestions();
  const topics = useTopics();

  const stats = useMemo(() => {
    const avgScore =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 0;
    const avgCorrect =
      results.length > 0
        ? (results.reduce((sum, r) => sum + r.correct, 0) / results.length).toFixed(1)
        : '0.0';
    const avgWrong =
      results.length > 0
        ? (results.reduce((sum, r) => sum + r.wrong, 0) / results.length).toFixed(1)
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
      participants: results.length,
      avgScore,
      avgCorrect,
      avgWrong,
      mostWrong,
      mostCorrect,
      perGrade,
      perTopic,
    };
  }, [results, questions, topics]);

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
            message="Katılımcılar test çözdükçe analizler burada oluşur."
          />
        ) : (
          <>
            <Reveal>
              <GlassCard contentStyle={styles.sectionCard}>
                <Text style={[type.h3, { color: palette.ink }]}>📊 Genel Özet</Text>
                <SummaryRow emoji="👥" label="Katılımcı" value={stats.participants} />
                <SummaryRow emoji="⭐" label="Ortalama puan" value={stats.avgScore} />
                <SummaryRow emoji="✅" label="Ort. doğru / test" value={stats.avgCorrect} />
                <SummaryRow emoji="❌" label="Ort. yanlış / test" value={stats.avgWrong} />
              </GlassCard>
            </Reveal>

            <Reveal delay={80}>
              <GlassCard contentStyle={styles.sectionCard}>
                <Text style={[type.h3, { color: palette.ink }]}>🏫 Sınıf Bazlı Başarı</Text>
                <View style={styles.bars}>
                  {stats.perGrade.map((entry) => (
                    <View key={entry.grade} style={styles.barRow}>
                      <View style={styles.barLabelRow}>
                        <Text style={[type.bodyBold, { color: palette.ink }]}>
                          {entry.grade}. Sınıflar
                        </Text>
                        <Text style={[type.caption, { color: palette.inkSoft }]}>
                          %{entry.percent} · {entry.count} katılımcı
                        </Text>
                      </View>
                      <ProgressBar progress={entry.percent / 100} height={10} color="primary" />
                    </View>
                  ))}
                </View>
              </GlassCard>
            </Reveal>

            <Reveal delay={140}>
              <GlassCard contentStyle={styles.sectionCard}>
                <Text style={[type.h3, { color: palette.ink }]}>📚 Konu Bazlı Başarı</Text>
                <View style={styles.bars}>
                  {stats.perTopic.map((entry) => (
                    <View key={entry.topic.id} style={styles.barRow}>
                      <View style={styles.barLabelRow}>
                        <Text style={[type.bodyBold, { color: palette.ink }]}>
                          {entry.topic.icon} {entry.topic.name}
                        </Text>
                        <Text style={[type.caption, { color: palette.inkSoft }]}>
                          %{entry.percent} · {entry.total} cevap
                        </Text>
                      </View>
                      <ProgressBar progress={entry.percent / 100} height={10} color="success" />
                    </View>
                  ))}
                </View>
              </GlassCard>
            </Reveal>

            {mostWrongQuestion && stats.mostWrong ? (
              <Reveal delay={200}>
                <GlassCard contentStyle={styles.highlightCard}>
                  <View style={styles.highlightHead}>
                    <View style={styles.highlightBadge}>
                      <Text style={styles.highlightEmoji} maxFontSizeMultiplier={1.1}>
                        {mostWrongQuestion.visual}
                      </Text>
                    </View>
                    <Text style={[type.overline, { color: palette.coral }]}>
                      En çok yanlış yapılan soru
                    </Text>
                  </View>
                  <Text style={[type.bodyBold, { color: palette.ink }]}>
                    {mostWrongQuestion.text}
                  </Text>
                  <Text style={[type.caption, { color: palette.inkSoft }]}>
                    {mostWrongQuestion.grade}. sınıf · ❌ {stats.mostWrong.wrong} yanlış · ✅{' '}
                    {stats.mostWrong.correct} doğru
                  </Text>
                </GlassCard>
              </Reveal>
            ) : null}

            {mostCorrectQuestion && stats.mostCorrect ? (
              <Reveal delay={240}>
                <GlassCard contentStyle={styles.highlightCard}>
                  <View style={styles.highlightHead}>
                    <View style={styles.highlightBadge}>
                      <Text style={styles.highlightEmoji} maxFontSizeMultiplier={1.1}>
                        {mostCorrectQuestion.visual}
                      </Text>
                    </View>
                    <Text style={[type.overline, { color: palette.success }]}>
                      En çok doğru yapılan soru
                    </Text>
                  </View>
                  <Text style={[type.bodyBold, { color: palette.ink }]}>
                    {mostCorrectQuestion.text}
                  </Text>
                  <Text style={[type.caption, { color: palette.inkSoft }]}>
                    {mostCorrectQuestion.grade}. sınıf · ✅ {stats.mostCorrect.correct} doğru
                  </Text>
                </GlassCard>
              </Reveal>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.xl,
    paddingBottom: space.md,
  },
  sectionCard: {
    gap: space.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  summaryEmoji: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryEmojiText: {
    fontSize: 20,
  },
  summaryLabel: {
    flex: 1,
  },
  bars: {
    gap: space.xl,
  },
  barRow: {
    gap: space.sm,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.md,
  },
  highlightCard: {
    gap: space.lg,
  },
  highlightHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  highlightBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightEmoji: {
    fontSize: 22,
  },
});
