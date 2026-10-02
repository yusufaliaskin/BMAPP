/**
 * Sınıf/şube seçimi — büyük kartlar (§6). Sınıf seçimi şubeleri getirir;
 * kayıt tek "BAŞLA 🚀" ile tamamlanır ve oturum açılır.
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
import { createStudent } from '@/data/actions';
import { useCharacters, useClassesForGrade } from '@/data/hooks';
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
  const { name, character } = useLocalSearchParams<{ name?: string; character?: string }>();
  const characters = useCharacters();
  const [grade, setGrade] = useState<Grade>(3);
  const [section, setSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const classes = useClassesForGrade(grade);

  const characterInfo = characters.find((c) => c.id === character);

  if (!name || !characterInfo) return <Redirect href="/onboarding/welcome" />;

  const finish = () => {
    if (!section || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      createStudent({
        fullName: name,
        characterId: characterInfo.id,
        nickname: characterInfo.name,
        emoji: characterInfo.emoji,
        grade,
        classId: `${grade}${section}`,
      });
      if (Platform.OS !== 'web') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => undefined,
        );
      }
      router.replace('/');
    } catch (error) {
      console.warn('Öğrenci kaydedilemedi.', error);
      setSaveError('Kaydedilemedi. Lütfen tekrar dene.');
      setSaving(false);
    }
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
            value={grade}
            onChange={(value) => {
              setGrade(value);
              setSection(null);
            }}
          />
        </Reveal>
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
          <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
            Adın sıralamada gizli kalır; karakterin görünür. 😊
          </Text>
        </Reveal>
      </View>
      <Reveal delay={190} style={styles.footer}>
        {saveError ? (
          <Text accessibilityLiveRegion="polite" style={[type.caption, styles.center, { color: palette.coral }]}>
            {saveError}
          </Text>
        ) : null}
        <Button
          label="BAŞLA 🚀"
          onPress={finish}
          disabled={!section}
          loading={saving}
          accessibilityHint="Kaydı tamamlar ve ana sayfayı açar"
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
  footer: {
    gap: space.md,
    paddingBottom: space.md,
  },
});
