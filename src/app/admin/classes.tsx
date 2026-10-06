/**
 * Admin — Sınıflar (§23, kiosk uyarlaması): her seviyenin şubeleri A'dan Z'ye kompakt
 * ızgarada. Kutu üzerindeki sayı, o şubeden test çözen katılımcı sayısıdır;
 * dokununca o şubenin filtrelenmiş katılımcı listesi açılır.
 */

import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { useClasses, useResults } from '@/data/hooks';
import { GRADES } from '@/domain/models';
import { palette, radius, space, type } from '@/theme';

export default function AdminClassesScreen() {
  const router = useRouter();
  const classes = useClasses();
  const results = useResults();

  // Şube başına katılımcı sayısı tek geçişte hesaplanır (104 × N filtre yok).
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const result of results) {
      map.set(result.classId, (map.get(result.classId) ?? 0) + 1);
    }
    return map;
  }, [results]);

  const gradeCounts = useMemo(() => {
    const map = new Map<number, number>();
    for (const result of results) {
      map.set(result.grade, (map.get(result.grade) ?? 0) + 1);
    }
    return map;
  }, [results]);

  return (
    <Screen title="Sınıflar" onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <Text style={[type.caption, { color: palette.inkFaint }]}>
          Kutudaki sayı = o şubeden test çözen katılımcı sayısı. Kutuya dokununca o
          şubenin katılımcıları açılır.
        </Text>
        {GRADES.map((grade, gradeIndex) => {
          const gradeClasses = classes
            .filter((c) => c.grade === grade && c.isActive)
            .sort((a, b) => a.section.localeCompare(b.section));
          const gradeCount = gradeCounts.get(grade) ?? 0;
          return (
            <Reveal key={grade} delay={gradeIndex * 60}>
              <GlassCard contentStyle={styles.gradeCard}>
                <View style={styles.headRow}>
                  <Text style={[type.h3, { color: palette.ink }]}>🏫 {grade}. Sınıflar</Text>
                  <Text style={[type.caption, { color: palette.inkSoft }]}>
                    {gradeCount} katılımcı
                  </Text>
                </View>
                <View style={styles.grid}>
                  {gradeClasses.map((item) => {
                    const count = counts.get(item.id) ?? 0;
                    return (
                      <PressableScale
                        key={item.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${grade}/${item.section} şubesi, ${count} katılımcı`}
                        haptic="light"
                        onPress={() =>
                          router.push(`/admin/participants?grade=${grade}&section=${item.section}`)
                        }
                        style={styles.cell}
                      >
                        <GlassCard padded={false} blur={false} style={styles.cellCard}>
                          <View style={styles.cellInner}>
                            <Text
                              style={[
                                type.h3,
                                { color: count > 0 ? palette.ink : palette.inkFaint },
                              ]}
                            >
                              {item.section}
                            </Text>
                            <Text
                              style={[
                                type.caption,
                                { color: count > 0 ? palette.primary : palette.inkFaint },
                              ]}
                            >
                              {count}
                            </Text>
                          </View>
                        </GlassCard>
                      </PressableScale>
                    );
                  })}
                </View>
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
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  cell: {
    flexGrow: 1,
    flexBasis: '15%',
    minWidth: 52,
  },
  cellCard: {
    borderRadius: radius.md,
  },
  cellInner: {
    alignItems: 'center',
    paddingVertical: space.sm,
    gap: 2,
  },
});
