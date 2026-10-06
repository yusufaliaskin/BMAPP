/**
 * Sınıf/şube seçimi — tek alan (ülke seçici mantığı): alana dokununca
 * sınıf seviyeleri ve şubeler gruplu bir listede açılır; seçim anında teste geçilir.
 * Ekranı şubelerle doldurmuyoruz; tek alan + tek liste yeterli.
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
import { palette, space, type } from '@/theme';

export default function GradeScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const classes = useClasses();
  const [classId, setClassId] = useState<string | null>(null);
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

  const options = useMemo<SelectOption[]>(
    () =>
      [...classes]
        .filter((item) => item.isActive)
        .sort((a, b) => a.grade - b.grade || a.section.localeCompare(b.section))
        .map((item) => ({
          value: item.id,
          label: `${item.grade}/${item.section}`,
          group: `${item.grade}. Sınıf`,
        })),
    [classes],
  );

  if (!name) return <Redirect href="/onboarding/welcome" />;

  const pick = (nextId: string) => {
    setClassId(nextId);
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync().catch(() => undefined);
    }
    router.push({ pathname: '/test/start', params: { name, classId: nextId } });
  };

  return (
    <Screen title="" onBack={() => setShowExit(true)}>
      <View style={styles.body}>
        <Reveal style={styles.header}>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>Hangi sınıftasın?</Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            Sınıfını ve şubeni seç, hemen başlıyoruz.
          </Text>
        </Reveal>

        <Reveal delay={80}>
          <SelectField
            label="Sınıf ve şube"
            placeholder="Sınıf seç"
            value={classId}
            options={options}
            onChange={pick}
            sheetTitle="Sınıfını seç"
            accessibilityHint="Sınıf ve şube listesini açar; seçince test başlar"
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
  center: {
    textAlign: 'center',
  },
});
