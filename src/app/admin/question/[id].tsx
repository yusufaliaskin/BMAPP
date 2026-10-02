/**
 * Admin — Soru düzenleme / yeni soru (§26).
 * Alanlar: sınıf, konu, zorluk, görsel emoji, soru metni, seçenekler (2-4),
 * doğru cevap, puan, kısa açıklama, aktiflik. Kayıt veri deposuna yazılır.
 */

import { useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Stepper } from '@/components/ui/Stepper';
import { TextField } from '@/components/ui/TextField';
import { upsertQuestion } from '@/data/actions';
import { useQuestions, useTopics } from '@/data/hooks';
import type { Difficulty, Grade, Question } from '@/domain/models';
import { palette, radius, space, type } from '@/theme';

const LETTERS = ['A', 'B', 'C', 'D'];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Kolay' },
  { value: 'easy-medium', label: 'K-E' },
  { value: 'medium', label: 'Orta' },
  { value: 'medium-hard', label: 'O-Z' },
];

interface DraftState {
  grade: Grade;
  topicId: string;
  difficulty: Difficulty;
  visual: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
  fact: string;
  isActive: boolean;
}

export default function AdminQuestionEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const questions = useQuestions();
  const topics = useTopics();

  const existing = id && id !== 'yeni' ? questions.find((q) => q.id === id) : undefined;
  const isNew = !existing;

  const [draft, setDraft] = useState<DraftState>(() => ({
    grade: existing?.grade ?? 1,
    topicId: existing?.topicId ?? topics[0]?.id ?? 'ekran',
    difficulty: existing?.difficulty ?? 'easy',
    visual: existing?.visual ?? '🧠❓',
    text: existing?.text ?? '',
    options: existing?.options ?? ['', ''],
    correctIndex: existing?.correctIndex ?? 0,
    points: existing?.points ?? 10,
    fact: existing?.fact ?? '',
    isActive: existing?.isActive ?? true,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (id && id !== 'yeni' && !existing) {
    return <Redirect href="/admin/questions" />;
  }

  const setOption = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const addOption = () => {
    setDraft((current) =>
      current.options.length >= 4
        ? current
        : { ...current, options: [...current.options, ''] },
    );
  };

  const removeOption = (index: number) => {
    setDraft((current) => {
      if (current.options.length <= 2) return current;
      const options = current.options.filter((_, i) => i !== index);
      const correctIndex = current.correctIndex >= options.length ? 0 : current.correctIndex;
      return { ...current, options, correctIndex };
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (draft.text.trim().length < 5) next.text = 'Soru metni en az 5 karakter olmalı.';
    if (draft.visual.trim().length === 0) next.visual = 'Bir görsel emoji gir.';
    const filled = draft.options.map((o) => o.trim());
    if (filled.filter((o) => o.length > 0).length < 2) next.options = 'En az 2 seçenek doldur.';
    if (!filled[draft.correctIndex] || filled[draft.correctIndex].length === 0) {
      next.correct = 'Doğru cevap dolu bir seçenek olmalı.';
    }
    if (draft.fact.trim().length < 5) next.fact = 'Kısa açıklama en az 5 karakter olmalı.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const filledOptions = draft.options.map((o) => o.trim().replace(/\s+/g, ' '));
    const question: Question = {
      id: existing?.id ?? `g${draft.grade}-x-${Date.now()}`,
      grade: draft.grade,
      topicId: draft.topicId,
      difficulty: draft.difficulty,
      visual: draft.visual.trim(),
      text: draft.text.trim(),
      options: filledOptions,
      correctIndex: draft.correctIndex,
      points: draft.points,
      fact: draft.fact.trim(),
      isActive: draft.isActive,
    };
    upsertQuestion(question);
    router.back();
  };

  return (
    <Screen title={isNew ? 'Yeni Soru' : 'Soruyu Düzenle'} onBack={() => router.back()} scroll keyboard>
      <View style={styles.container}>
        <Reveal>
          <GlassCard style={styles.card}>
            <Text style={[type.h3, { color: palette.ink }]}>Sınıf</Text>
            <SegmentedControl
              accessibilityLabel="Sınıf seçimi"
              options={([1, 2, 3, 4] as Grade[]).map((g) => ({ value: g, label: `${g}` }))}
              value={draft.grade}
              onChange={(value) => setDraft((current) => ({ ...current, grade: value }))}
            />
            <Text style={[type.h3, { color: palette.ink }]}>Konu</Text>
            <View style={styles.chipWrap}>
              {topics.map((topic) => (
                <Chip
                  key={topic.id}
                  label={`${topic.icon} ${topic.name}`}
                  selected={draft.topicId === topic.id}
                  onPress={() => setDraft((current) => ({ ...current, topicId: topic.id }))}
                />
              ))}
            </View>
            <Text style={[type.h3, { color: palette.ink }]}>Zorluk</Text>
            <SegmentedControl
              accessibilityLabel="Zorluk seçimi"
              options={DIFFICULTY_OPTIONS.map((option) => ({ ...option }))}
              value={draft.difficulty}
              onChange={(value) => setDraft((current) => ({ ...current, difficulty: value }))}
            />
          </GlassCard>
        </Reveal>

        <Reveal delay={60}>
          <GlassCard style={styles.card}>
            <TextField
              label="Görsel (emoji)"
              value={draft.visual}
              onChangeText={(value) => setDraft((current) => ({ ...current, visual: value }))}
              placeholder="Örn: 📱⏰"
              maxLength={12}
              error={errors.visual}
              hint="Soruyla birlikte gösterilecek büyük görsel."
            />
            <TextField
              label="Soru metni"
              value={draft.text}
              onChangeText={(value) => setDraft((current) => ({ ...current, text: value }))}
              placeholder="Kısa ve anlaşılır bir soru yaz…"
              multiline
              maxLength={140}
              error={errors.text}
            />
          </GlassCard>
        </Reveal>

        <Reveal delay={120}>
          <GlassCard style={styles.card}>
            <Text style={[type.h3, { color: palette.ink }]}>Seçenekler</Text>
            {draft.options.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <View style={styles.optionField}>
                  <TextField
                    label={`${LETTERS[index]} seçeneği`}
                    value={option}
                    onChangeText={(value) => setOption(index, value)}
                    placeholder="Seçenek metni"
                    maxLength={80}
                  />
                </View>
                {draft.options.length > 2 ? (
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel={`${LETTERS[index]} seçeneğini sil`}
                    haptic="light"
                    onPress={() => removeOption(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={palette.coral} />
                  </PressableScale>
                ) : null}
              </View>
            ))}
            {draft.options.length < 4 ? (
              <Button label="+ SEÇENEK EKLE" variant="glass" size="md" onPress={addOption} fullWidth={false} />
            ) : null}
            {errors.options ? (
              <Text style={[type.caption, { color: palette.coral }]}>{errors.options}</Text>
            ) : null}

            <Text style={[type.h3, { color: palette.ink }]}>Doğru cevap</Text>
            <View style={styles.chipWrap}>
              {draft.options.map((_, index) => (
                <Chip
                  key={index}
                  label={LETTERS[index]}
                  selected={draft.correctIndex === index}
                  onPress={() => setDraft((current) => ({ ...current, correctIndex: index }))}
                />
              ))}
            </View>
            {errors.correct ? (
              <Text style={[type.caption, { color: palette.coral }]}>{errors.correct}</Text>
            ) : null}
          </GlassCard>
        </Reveal>

        <Reveal delay={160}>
          <GlassCard style={styles.card}>
            <TextField
              label="Kısa açıklama (gerçek bilgi)"
              value={draft.fact}
              onChangeText={(value) => setDraft((current) => ({ ...current, fact: value }))}
              placeholder="Örn: Mola verince gözler dinlenir."
              multiline
              maxLength={140}
              error={errors.fact}
              hint="Doğru ve yanlış geri bildirimde gösterilir."
            />
            <View style={styles.pointsRow}>
              <Text style={[type.h3, { color: palette.ink }]}>Puan</Text>
              <Stepper
                accessibilityLabel="Soru puanı"
                value={draft.points}
                min={5}
                max={20}
                step={5}
                onChange={(value) => setDraft((current) => ({ ...current, points: value }))}
              />
            </View>
            <View style={styles.activeRow}>
              <Text style={[type.h3, { color: palette.ink }]}>Aktif</Text>
              <Switch
                accessibilityLabel="Soru aktif mi"
                value={draft.isActive}
                onValueChange={(value) => setDraft((current) => ({ ...current, isActive: value }))}
                trackColor={{ false: palette.track, true: palette.mintSoft }}
                thumbColor={draft.isActive ? palette.success : palette.inkFaint}
              />
            </View>
          </GlassCard>
        </Reveal>

        <Reveal delay={200}>
          <Button label="KAYDET 💾" onPress={save} accessibilityHint="Soruyu veri deposuna kaydeder" />
        </Reveal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
    paddingBottom: space.lg,
  },
  card: {
    gap: space.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
  },
  optionField: {
    flex: 1,
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
