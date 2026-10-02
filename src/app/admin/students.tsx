/**
 * Admin — Öğrenciler (§22): sınıf/şube filtresi + isim/lakap arama.
 * Satırlar gerçek kayıtlarla: en iyi puan, test durumu, katılım tarihi.
 */

import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { AvatarBubble } from '@/components/ui/AvatarBubble';
import { Chip } from '@/components/ui/Chip';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/states';
import { TextField } from '@/components/ui/TextField';
import { useClasses, useConfig, useResults, useStudents } from '@/data/hooks';
import { representativeResult } from '@/domain/engine/ranking';
import { formatDateTR } from '@/lib/format';
import type { Grade } from '@/domain/models';
import { glassSurface, palette, radius, space, type } from '@/theme';

export default function AdminStudentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ grade?: string; section?: string }>();
  const students = useStudents();
  const results = useResults();
  const classes = useClasses();
  const config = useConfig();

  const [grade, setGrade] = useState<Grade | null>(
    params.grade ? (Number(params.grade) as Grade) : null,
  );
  const [section, setSection] = useState<string | null>(params.section ?? null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return students
      .filter((student) => (grade === null ? true : student.grade === grade))
      .filter((student) =>
        section === null ? true : student.classId === `${grade ?? student.grade}${section}`,
      )
      .filter((student) =>
        q.length === 0
          ? true
          : student.fullName.toLocaleLowerCase('tr').includes(q) ||
            student.nickname.toLocaleLowerCase('tr').includes(q),
      )
      .sort((a, b) => a.classId.localeCompare(b.classId) || a.fullName.localeCompare(b.fullName, 'tr'));
  }, [students, grade, section, query]);

  const sectionsForGrade = grade
    ? classes.filter((c) => c.grade === grade && c.isActive)
    : [];

  return (
    <Screen title={`Öğrenciler (${filtered.length})`} onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <TextField
          label="Ara"
          placeholder="İsim veya lakap yaz…"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />

        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip
              label="Tüm Sınıflar"
              selected={grade === null}
              onPress={() => {
                setGrade(null);
                setSection(null);
              }}
            />
            {([1, 2, 3, 4] as Grade[]).map((g) => (
              <Chip
                key={g}
                label={`${g}. Sınıf`}
                selected={grade === g}
                onPress={() => {
                  setGrade(g);
                  setSection(null);
                }}
              />
            ))}
          </ScrollView>
          {grade !== null ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <Chip label="Tüm Şubeler" selected={section === null} onPress={() => setSection(null)} />
              {sectionsForGrade.map((item) => (
                <Chip
                  key={item.id}
                  label={item.section}
                  selected={section === item.section}
                  onPress={() => setSection(item.section)}
                />
              ))}
            </ScrollView>
          ) : null}
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            emoji="🧑‍🎓"
            title="Öğrenci bulunamadı"
            message={
              students.length === 0
                ? 'Henüz kayıtlı öğrenci yok. Öğrenciler uygulamaya kaydoldukça burada listelenir.'
                : 'Bu filtreyle eşleşen öğrenci yok. Farklı bir arama ya da filtre dene.'
            }
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((student, index) => {
              const best = representativeResult(results, student.id, student.grade, config.retakePolicy);
              const sectionLabel = student.classId.replace(String(student.grade), '');
              return (
                <Reveal key={student.id} delay={Math.min(index * 30, 300)}>
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel={`${student.fullName}, ${student.grade}/${sectionLabel}`}
                    haptic="light"
                    onPress={() => router.push(`/admin/student/${student.id}`)}
                  >
                    <GlassCard padded={false}>
                      <View style={styles.row}>
                        <AvatarBubble emoji={student.emoji} size={44} />
                        <View style={styles.rowText}>
                          <Text style={[type.bodyBold, { color: palette.ink }]} numberOfLines={1}>
                            {student.fullName}
                          </Text>
                          <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={1}>
                            {student.nickname} · {student.grade}/{sectionLabel}
                          </Text>
                        </View>
                        <View style={styles.rowRight}>
                          {best ? (
                            <>
                              <Text style={[type.h3, { color: palette.rewardDeep }]}>
                                ⭐ {best.score}
                              </Text>
                              <Text style={[type.caption, { color: palette.inkFaint }]}>
                                {formatDateTR(best.completedAt)}
                              </Text>
                            </>
                          ) : (
                            <View style={[styles.pendingChip, glassSurface('subtle')]}>
                              <Text style={[type.caption, { color: palette.inkSoft }]}>
                                ⏳ Test yok
                              </Text>
                            </View>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={palette.inkFaint} />
                      </View>
                    </GlassCard>
                  </PressableScale>
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
  },
  filters: {
    gap: space.sm,
  },
  chips: {
    gap: space.sm,
    paddingRight: space.lg,
  },
  list: {
    gap: space.sm,
    marginTop: space.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  pendingChip: {
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
});
