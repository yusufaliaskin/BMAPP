/**
 * Admin — Sınıflar (§23): her seviyenin şubeleri; öğrenci sayısı, katılım,
 * ortalama ve en yüksek puan. Şubeye tıklanınca filtrelenmiş öğrenci listesi açılır.
 */

import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { useClasses, useConfig, useResults, useStudents } from '@/data/hooks';
import { representativeResult } from '@/domain/engine/ranking';
import { GRADES } from '@/domain/models';
import { glassSurface, palette, radius, space, type } from '@/theme';

export default function AdminClassesScreen() {
  const router = useRouter();
  const classes = useClasses();
  const students = useStudents();
  const results = useResults();
  const config = useConfig();

  return (
    <Screen title="Sınıflar" onBack={() => router.back()} scroll>
      <View style={styles.container}>
        {GRADES.map((grade, gradeIndex) => {
          const gradeClasses = classes.filter((c) => c.grade === grade);
          return (
            <Reveal key={grade} delay={gradeIndex * 60}>
              <GlassCard style={styles.gradeCard}>
                <Text style={[type.h3, { color: palette.ink }]}>🏫 {grade}. Sınıflar</Text>
                {gradeClasses.map((item) => {
                  const members = students.filter((s) => s.classId === item.id);
                  const bests = members
                    .map((s) => representativeResult(results, s.id, s.grade, config.retakePolicy))
                    .filter((r) => r !== undefined);
                  const average =
                    bests.length > 0
                      ? Math.round(bests.reduce((sum, r) => sum + r.score, 0) / bests.length)
                      : 0;
                  const top = bests.reduce((max, r) => Math.max(max, r.score), 0);
                  return (
                    <PressableScale
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${grade}/${item.section} şubesi`}
                      haptic="light"
                      onPress={() => router.push(`/admin/students?grade=${grade}&section=${item.section}`)}
                    >
                      <View style={[styles.sectionRow, glassSurface('subtle')]}>
                        <View style={styles.sectionBadge}>
                          <Text style={[type.h3, { color: palette.primary }]}>
                            {item.grade}/{item.section}
                          </Text>
                        </View>
                        <View style={styles.sectionStats}>
                          <Text style={[type.caption, { color: palette.inkSoft }]}>
                            👥 {bests.length}/{members.length} katıldı
                          </Text>
                          <Text style={[type.caption, { color: palette.inkFaint }]}>
                            ⭐ ort. {average} · en yüksek {top}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={palette.inkFaint} />
                      </View>
                    </PressableScale>
                  );
                })}
              </GlassCard>
            </Reveal>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  gradeCard: {
    gap: space.md,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.lg,
    padding: space.md,
  },
  sectionBadge: {
    minWidth: 64,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  sectionStats: {
    flex: 1,
    gap: 2,
  },
});
