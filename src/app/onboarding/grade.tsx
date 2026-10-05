/**
 * Sınıf/şube seçimi — TÜM sınıflar tek sayfada, gruplu ve dolu (§6, kiosk).
 * Sayfa asla boş kalmaz: 1-4. sınıflar ve şubeleri (A-Z) baştan görünür.
 * Harfe dokunmak seçim demektir ve çocuk HEMEN teste geçer.
 */

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '@/components/glass/GlassCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { useClasses } from '@/data/hooks';
import { GRADES } from '@/domain/models';
import { palette, radius, space, type } from '@/theme';

export default function GradeScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const classes = useClasses();
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

  if (!name) return <Redirect href="/onboarding/welcome" />;

  const pick = (classId: string) => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync().catch(() => undefined);
    }
    router.push({ pathname: '/test/start', params: { name, classId } });
  };

  return (
    <Screen title="" onBack={() => setShowExit(true)} scroll>
      <View style={styles.body}>
        <Reveal style={styles.header}>
          <Text style={[type.h1, styles.center, { color: palette.ink }]}>
            Hangi sınıftasın? 🏫
          </Text>
          <Text style={[type.bodySemi, styles.center, { color: palette.inkSoft }]}>
            Sınıfını bul, harfine dokun — hemen başlıyoruz! 🚀
          </Text>
        </Reveal>
        {GRADES.map((grade, gradeIndex) => {
          const gradeClasses = classes
            .filter((item) => item.grade === grade && item.isActive)
            .sort((a, b) => a.section.localeCompare(b.section));
          return (
            <Reveal key={grade} delay={60 + gradeIndex * 50}>
              <GlassCard style={styles.gradeCard}>
                <Text style={[type.h3, { color: palette.ink }]}>🏫 {grade}. Sınıflar</Text>
                <View style={styles.grid}>
                  {gradeClasses.map((item) => (
                    <PressableScale
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.grade}/${item.section} şubesi`}
                      haptic="selection"
                      onPress={() => pick(item.id)}
                      style={styles.cell}
                    >
                      <GlassCard padded={false} style={styles.cellCard}>
                        <View style={styles.cellInner}>
                          <Text style={[type.h2, { color: palette.ink }]}>{item.section}</Text>
                          <Text style={[type.caption, { color: palette.inkFaint }]}>
                            {item.grade}/{item.section}
                          </Text>
                        </View>
                      </GlassCard>
                    </PressableScale>
                  ))}
                </View>
              </GlassCard>
            </Reveal>
          );
        })}
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
    gap: space.lg,
    marginTop: space.sm,
    paddingBottom: space.md,
  },
  header: {
    gap: space.xs,
    marginBottom: space.xs,
  },
  center: {
    textAlign: 'center',
  },
  gradeCard: {
    gap: space.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  cell: {
    flexGrow: 1,
    flexBasis: '18%',
    minWidth: 58,
  },
  cellCard: {
    borderRadius: radius.lg,
  },
  cellInner: {
    alignItems: 'center',
    paddingVertical: space.md,
    gap: 2,
  },
});
