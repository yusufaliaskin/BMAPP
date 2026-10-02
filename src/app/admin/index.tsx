/**
 * Admin dashboard (§21, kiosk uyarlaması) — toplam katılımcı, bugünkü katılım,
 * ortalama/en yüksek puan ve sınıf seviyesi kırılımı; alt yönetim ekranlarına giriş.
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
import { useAdminGate } from './_layout';
import { useGradeSettings, useResults, useTodayCount } from '@/data/hooks';
import { GRADES } from '@/domain/models';
import { glassSurface, palette, radius, space, type } from '@/theme';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { adminName } = useAdminGate();
  const results = useResults();
  const todayCount = useTodayCount();
  const gradeSettings = useGradeSettings();

  const participants = results.length;
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const averageScore = participants > 0 ? Math.round(totalScore / participants) : 0;
  const topScore = results.reduce((max, result) => Math.max(max, result.score), 0);
  const maxGradeCount = Math.max(
    1,
    ...GRADES.map((grade) => results.filter((result) => result.grade === grade).length),
  );

  return (
    <Screen
      title="Yönetim Paneli"
      onBack={() => router.replace('/onboarding/welcome')}
      scroll
    >
      <View style={styles.container}>
        <Reveal>
          <Text style={[type.caption, { color: palette.inkSoft }]}>
            👤 {adminName ?? 'Yönetici'} olarak giriş yapıldı · Hoş geldiniz
          </Text>
        </Reveal>
        <Reveal style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard emoji="👥" value={participants} label="Toplam katılımcı" accent="sky" />
            <StatCard emoji="📅" value={todayCount} label="Bugünkü katılım" accent="mint" />
          </View>
          <View style={styles.statsRow}>
            <StatCard emoji="📊" value={averageScore} label="Ortalama puan" accent="lavender" />
            <StatCard emoji="⭐" value={topScore} label="En yüksek puan" accent="amber" />
          </View>
        </Reveal>

        <Reveal delay={80}>
          <GlassCard style={styles.gradeCard}>
            <Text style={[type.h3, { color: palette.ink }]}>🏫 Sınıf Seviyesi Katılımı</Text>
            {GRADES.map((grade) => {
              const gradeResults = results.filter((result) => result.grade === grade);
              const settings = gradeSettings.find((g) => g.grade === grade);
              const gradeAvg =
                gradeResults.length > 0
                  ? Math.round(
                      gradeResults.reduce((sum, result) => sum + result.score, 0) /
                        gradeResults.length,
                    )
                  : 0;
              return (
                <View key={grade} style={styles.gradeRow}>
                  <View style={styles.gradeLabelRow}>
                    <Text style={[type.bodyBold, { color: palette.ink }]}>
                      {grade}. Sınıflar
                    </Text>
                    <Text style={[type.caption, { color: palette.inkSoft }]}>
                      {gradeResults.length} katılımcı · ort. {gradeAvg} · {settings?.questionCount} soru
                    </Text>
                  </View>
                  <ProgressBar progress={gradeResults.length / maxGradeCount} height={10} />
                </View>
              );
            })}
          </GlassCard>
        </Reveal>

        <Reveal delay={140} style={styles.links}>
          <AdminLink
            emoji="🧑‍🎓"
            label="Katılımcılar"
            detail="Liste, filtre, arama ve cevap detayı"
            onPress={() => router.push('/admin/participants')}
          />
          <AdminLink
            emoji="🏫"
            label="Sınıflar"
            detail="Şube istatistikleri"
            onPress={() => router.push('/admin/classes')}
          />
          <AdminLink
            emoji="🏆"
            label="Sıralamalar"
            detail="İlk 3 ve sertifika üretimi"
            onPress={() => router.push('/admin/rankings')}
          />
          <AdminLink
            emoji="📈"
            label="Test Analizi"
            detail="Ortalamalar, zor sorular"
            onPress={() => router.push('/admin/analytics')}
          />
          <AdminLink
            emoji="📚"
            label="Sorular"
            detail="Soru bankası yönetimi"
            onPress={() => router.push('/admin/questions')}
          />
          <AdminLink
            emoji="🎓"
            label="Sertifikalar"
            detail="Altın / gümüş / bronz sertifikalar"
            onPress={() => router.push('/admin/certificates')}
          />
          <AdminLink
            emoji="🧑‍💼"
            label="Yöneticiler"
            detail="Hesap ekleme, PIN belirleme, silme"
            onPress={() => router.push('/admin/admins')}
          />
          <AdminLink
            emoji="⚙️"
            label="Ayarlar"
            detail="Soru sayısı, sertifika başlıkları, PIN"
            onPress={() => router.push('/admin/settings')}
          />
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
