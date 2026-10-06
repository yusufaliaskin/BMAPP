/**
 * Sınıf/şube seçimi — iki adım: önce sınıf (1-4), sonra şube (A-Z).
 * Üst alan seçilmeden alt alan açılmaz; şube seçilince doğrudan teste geçilir.
 */

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SelectField, type SelectOption } from '@/components/ui/SelectField';
import { useClasses } from '@/data/hooks';
import { GRADES, type Grade } from '@/domain/models';
import { palette, space, type } from '@/theme';

export default function GradeScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const classes = useClasses();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const [showExit, setShowExit] = useState(false);

  // Android donanım geri tuşu da seçimden sessizce kaçırmasın: onay sor.
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowExit(true);
      return true;
    });
    return () => subscription.remove();
  }, []);

  const gradeOptions = useMemo<SelectOption[]>(
    () => GRADES.map((item) => ({ value: String(item), label: `${item}. Sınıf` })),
    [],
  );

  const sectionOptions = useMemo<SelectOption[]>(
    () =>
      grade === null
        ? []
        : classes
            .filter((item) => item.grade === grade && item.isActive)
            .sort((a, b) => a.section.localeCompare(b.section))
            .map((item) => ({ value: item.section, label: item.section })),
    [classes, grade],
  );

  if (!name) return <Redirect href="/onboarding/welcome" />;

  const pickGrade = (value: string) => {
    setGrade(Number(value) as Grade);
    setSection(null);
  };

  const pickSection = (value: string) => {
    setSection(value);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync().catch(() => undefined);
    }
    if (grade === null) return;
    router.push({ pathname: '/test/start', params: { name, classId: `${grade}${value}` } });
  };

  return (
    <Screen title="" onBack={() => setShowExit(true)}>
      <View style={styles.body}>
        <Reveal style={styles.header}>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>
            Hangi sınıftasın? 🏫
          </Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            Önce sınıfını, sonra şubeni seç.
          </Text>
        </Reveal>

        <Reveal delay={80} style={styles.fields}>
          <SelectField
            label="Sınıf"
            placeholder="Sınıf seç"
            value={grade === null ? null : String(grade)}
            options={gradeOptions}
            onChange={pickGrade}
            sheetTitle="Sınıfını seç"
            accessibilityHint="1-4 arası sınıf listesini açar"
          />
          <SelectField
            label="Şube"
            placeholder="Şube seç"
            value={section}
            options={sectionOptions}
            onChange={pickSection}
            sheetTitle="Şubeni seç"
            disabled={grade === null}
            disabledHint="Önce sınıfını seç."
            accessibilityHint="Şube listesini açar; seçince test başlar"
          />
        </Reveal>
      </View>

      <ConfirmDialog
        visible={showExit}
        title="Çıkmak istiyor musunuz?"
        message="Baştan başlarsın."
        cancelLabel="KAL"
        confirmLabel="ÇIK"
        onCancel={() => setShowExit(false)}
        onConfirm={() => router.back()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: space.xxl,
  },
  header: {
    gap: space.xs,
  },
  fields: {
    gap: space.lg,
  },
  center: {
    textAlign: 'center',
  },
});
