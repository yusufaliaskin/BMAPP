/**
 * Sınıf/şube seçimi — büyük kartlar (§6, kiosk akışı).
 * Karakter adımı yoktur: sıradaki çocuk için akış kısa tutulur.
 * Seçim sonrası test hazırlık ekranına geçilir; kayıt ancak test bitince oluşur.
 */

import { useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useClassesForGrade } from '@/data/hooks';
import type { Grade } from '@/domain/models';
import { palette, radius, space, type } from '@/theme';

const GRADE_OPTIONS = [
  { value: 1, label: '1. Sınıf' },
  { value: 2, label: '2. Sınıf' },
  { value: 3, label: '3. Sınıf' },
  { value: 4, label: '4. Sınıf' },
] as const;

export default function GradeScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const classes = useClassesForGrade(grade ?? 1);

  if (!name) return <Redirect href="/onboarding/welcome" />;

  const goNext = () => {
    if (grade === null || !section) return;
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync().catch(() => undefined);
    }
    router.push({
      pathname: '/test/start',
      params: { name, classId: `${grade}${section}` },
    });
  };

  return (
    <Screen title="" onBack={() => router.back()}>
      <View style={styles.body}>
        <Reveal style={styles.header}>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>Hangi sınıftasın? 🏫</Text>
        </Reveal>
        <Reveal delay={70}>
          <SegmentedControl
            accessibilityLabel="Sınıf seçimi"
            options={GRADE_OPTIONS.map((option) => ({ ...option }))}
            value={grade ?? 0}
            onChange={(value) => {
              setGrade(value as Grade);
              setSection(null);
            }}
          />
        </Reveal>
        {grade !== null ? (
          <Reveal delay={130} style={styles.sectionArea}>
            <Text style={[type.label, { color: palette.inkSoft }]}>Şubeni seç</Text>
            <View style={styles.sections}>
              {classes.map((item) => {
                const isSelected = section === item.section;
                return (
                  <PressableScale
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.grade}/${item.section} şubesi`}
                    accessibilityState={{ selected: isSelected }}
                    haptic="selection"
                    onPress={() => setSection(item.section)}
                    style={styles.sectionWrap}
                  >
                    <GlassCard
                      padded={false}
                      style={[styles.sectionCard, isSelected ? styles.sectionSelected : null]}
                    >
                      <View style={styles.sectionInner}>
                        <Text style={[type.display, { color: palette.ink }]}>{item.section}</Text>
                        <Text style={[type.caption, { color: palette.inkFaint }]}>
                          {item.grade}/{item.section}
                        </Text>
                      </View>
                    </GlassCard>
                  </PressableScale>
                );
              })}
            </View>
          </Reveal>
        ) : (
          <Reveal delay={130}>
            <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
              Önce sınıfını seç 👆
            </Text>
          </Reveal>
        )}
      </View>
      <Reveal delay={190}>
        <Button
          label="DEVAM ET →"
          onPress={goNext}
          disabled={grade === null || !section}
          accessibilityHint="Test hazırlık ekranına geçer"
        />
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: space.xl,
    marginTop: space.sm,
  },
  header: {
    marginBottom: space.xs,
  },
  center: {
    textAlign: 'center',
  },
  sectionArea: {
    gap: space.md,
  },
  sections: {
    flexDirection: 'row',
    gap: space.md,
  },
  sectionWrap: {
    flex: 1,
  },
  sectionCard: {
    borderRadius: radius.lg,
  },
  sectionSelected: {
    borderColor: palette.primary,
  },
  sectionInner: {
    alignItems: 'center',
    paddingVertical: space.lg,
    gap: space.xs,
  },
});
