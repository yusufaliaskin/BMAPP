/**
 * Admin — Soru Yönetimi (§26): sınıf/konu filtreleri, aktif/pasif anahtarı,
 * düzenleme ve yeni soru. Sorular veri deposundan gelir; teste giren sorular
 * yalnız aktif olanlardır.
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { Chip } from '@/components/ui/Chip';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/states';
import { setQuestionActive } from '@/data/actions';
import { useQuestions, useTopics } from '@/data/hooks';
import type { Difficulty, Grade } from '@/domain/models';
import { palette, radius, space, type } from '@/theme';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Kolay',
  'easy-medium': 'Kolay-Orta',
  medium: 'Orta',
  'medium-hard': 'Orta-Zor',
};

export default function AdminQuestionsScreen() {
  const router = useRouter();
  const questions = useQuestions();
  const topics = useTopics();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      questions
        .filter((q) => (grade === null ? true : q.grade === grade))
        .filter((q) => (topicId === null ? true : q.topicId === topicId))
        .sort((a, b) => a.grade - b.grade || a.id.localeCompare(b.id)),
    [questions, grade, topicId],
  );

  return (
    <Screen
      title={`Sorular (${filtered.length})`}
      onBack={() => router.back()}
      right={
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Yeni soru ekle"
          haptic="light"
          onPress={() => router.push('/admin/question/yeni')}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={palette.white} />
        </PressableScale>
      }
      scroll
    >
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Tüm Sınıflar" selected={grade === null} onPress={() => setGrade(null)} />
          {([1, 2, 3, 4] as Grade[]).map((g) => (
            <Chip key={g} label={`${g}. Sınıf`} selected={grade === g} onPress={() => setGrade(g)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Tüm Konular" selected={topicId === null} onPress={() => setTopicId(null)} />
          {topics.map((topic) => (
            <Chip
              key={topic.id}
              label={`${topic.icon} ${topic.name}`}
              selected={topicId === topic.id}
              onPress={() => setTopicId(topic.id)}
            />
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <EmptyState
            emoji="📚"
            title="Soru bulunamadı"
            message="Bu filtreyle eşleşen soru yok."
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((question, index) => {
              const topic = topics.find((t) => t.id === question.topicId);
              return (
                <Reveal key={question.id} delay={Math.min(index * 25, 250)}>
                  <GlassCard padded={false}>
                    <View style={[styles.row, !question.isActive ? styles.inactive : null]}>
                      <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={`Soruyu düzenle: ${question.text}`}
                        haptic="light"
                        onPress={() => router.push(`/admin/question/${question.id}`)}
                        style={styles.rowPress}
                      >
                        <Text style={styles.visual} maxFontSizeMultiplier={1.1}>
                          {question.visual}
                        </Text>
                        <View style={styles.mid}>
                          <Text style={[type.bodySemi, { color: palette.ink }]} numberOfLines={2}>
                            {question.text}
                          </Text>
                          <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={1}>
                            {question.grade}. sınıf · {topic?.name ?? '—'} ·{' '}
                            {DIFFICULTY_LABEL[question.difficulty]} · {question.points} puan
                          </Text>
                        </View>
                      </PressableScale>
                      <Switch
                        accessibilityLabel={`${question.isActive ? 'Pasife al' : 'Aktif et'}: ${question.text}`}
                        value={question.isActive}
                        onValueChange={(value) => setQuestionActive(question.id, value)}
                        trackColor={{ false: palette.track, true: palette.mintSoft }}
                        thumbColor={question.isActive ? palette.success : palette.inkFaint}
                      />
                    </View>
                  </GlassCard>
                </Reveal>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.md,
    paddingBottom: space.lg,
  },
  chips: {
    gap: space.sm,
    paddingRight: space.lg,
  },
  list: {
    gap: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
  },
  rowPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  inactive: {
    opacity: 0.55,
  },
  visual: {
    fontSize: 26,
  },
  mid: {
    flex: 1,
    gap: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
