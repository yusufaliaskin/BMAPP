/**
 * Admin dashboard (§21) — toplam katılımcı, test, puan, ortalama ve
 * sınıf seviyesi kırılımı; tüm alt yönetim ekranlarına giriş.
 */

import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { useConfig, useResults, useStudents, useGradeSettings } from '@/data/hooks';
import { representativeResult } from '@/domain/engine/ranking';
import { GRADES } from '@/domain/models';
import { glassSurface, palette, radius, space, type } from '@/theme';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const students = useStudents();
  const results = useResults();
  const config = useConfig();
  const gradeSettings = useGradeSettings();

  const bests = students
    .map((student) => representativeResult(results, student.id, student.grade, config.retakePolicy))
    .filter((result) => result !== undefined);
  const participants = bests.length;
  const totalScore = bests.reduce((sum, result) => sum + result.score, 0);
  const averageScore = participants > 0 ? Math.round(totalScore / participants) : 0;

  return (
    <Screen title="Yönetim Paneli" onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <Reveal style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard emoji="👥" value={participants} label="Katılımcı öğrenci" accent="sky" />
            <StatCard emoji="📝" value={results.length} label="Toplam test" accent="mint" />
          </View>
          <View style={styles.statsRow}>
            <StatCard emoji="⭐" value={totalScore} label="Toplam puan" accent="amber" />
            <StatCard emoji="📊" value={averageScore} label="Ortalama puan" accent="lavender" />
          </View>
        </Reveal>

        <Reveal delay={80}>
          <GlassCard style={styles.gradeCard}>
            <Text style={[type.h3, { color: palette.ink }]}>🏫 Sınıf Seviyesi Katılımı</Text>
            {GRADES.map((grade) => {
              const gradeStudents = students.filter((s) => s.grade === grade);
              const gradeParticipants = bests.filter((r) => r.grade === grade).length;
              const ratio = gradeStudents.length > 0 ? gradeParticipants / gradeStudents.length : 0;
              const settings = gradeSettings.find((g) => g.grade === grade);
              return (
                <View key={grade} style={styles.gradeRow}>
                  <View style={styles.gradeLabelRow}>
                    <Text style={[type.bodyBold, { color: palette.ink }]}>
                      {grade}. Sınıflar
                    </Text>
                    <Text style={[type.caption, { color: palette.inkSoft }]}>
                      {gradeParticipants}/{gradeStudents.length} katıldı · {settings?.questionCount} soru
                    </Text>
                  </View>
                  <ProgressBar progress={ratio} height={10} />
                </View>
              );
            })}
          </GlassCard>
        </Reveal>

        <Reveal delay={140} style={styles.links}>
          <AdminLink emoji="🧑‍🎓" label="Öğrenciler" detail="Liste, filtre ve detay" onPress={() => router.push('/admin/students')} />
          <AdminLink emoji="🏫" label="Sınıflar" detail="Şube istatistikleri" onPress={() => router.push('/admin/classes')} />
          <AdminLink emoji="🏆" label="Sıralamalar" detail="İlk 3 ve sertifika üretimi" onPress={() => router.push('/admin/rankings')} />
          <AdminLink emoji="📈" label="Test Analizi" detail="Ortalamalar, zor sorular" onPress={() => router.push('/admin/analytics')} />
          <AdminLink emoji="📚" label="Sorular" detail="Soru bankası yönetimi" onPress={() => router.push('/admin/questions')} />
          <AdminLink emoji="🎓" label="Sertifikalar" detail="Üretilen sertifikalar" onPress={() => router.push('/admin/certificates')} />
          <AdminLink emoji="⚙️" label="Ayarlar" detail="Soru sayısı, kurallar, PIN" onPress={() => router.push('/admin/settings')} />
        </Reveal>
      </View>
    </Screen>
  );
}

interface AdminLinkProps {
  emoji: string;
  label: string;
  detail: string;
  onPress: () => void;
}

function AdminLink({ emoji, label, detail, onPress }: AdminLinkProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${detail}`}
      haptic="light"
      onPress={onPress}
    >
      <GlassCard padded={false}>
        <View style={styles.linkRow}>
          <View style={[styles.linkEmoji, glassSurface('strong')]}>
            <Text style={styles.linkEmojiText} maxFontSizeMultiplier={1.1}>
              {emoji}
            </Text>
          </View>
          <View style={styles.linkText}>
            <Text style={[type.bodyBold, { color: palette.ink }]}>{label}</Text>
            <Text style={[type.caption, { color: palette.inkFaint }]}>{detail}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.inkFaint} />
        </View>
      </GlassCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  statsGrid: {
    gap: space.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  gradeCard: {
    gap: space.lg,
  },
  gradeRow: {
    gap: space.sm,
  },
  gradeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  links: {
    gap: space.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  linkEmoji: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkEmojiText: {
    fontSize: 22,
  },
  linkText: {
    flex: 1,
    gap: 2,
  },
});
