/**
 * Admin dashboard (§21, kiosk uyarlaması) — toplam katılımcı, bugünkü katılım,
 * ortalama/en yüksek puan ve sınıf seviyesi kırılımı; alt yönetim ekranlarına giriş.
 * Panelden çıkış onay ister ("Çıkmak istiyor musunuz?").
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PressableScale } from '@/components/ui/PressableScale';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { useAdminGate } from './_layout';
import { useResults, useTodayCount } from '@/data/hooks';
import { GRADES, type Grade } from '@/domain/models';
import {
  fonts,
  glassSurface,
  palette,
  radius,
  space,
  topicAccents,
  type,
  type TopicAccent,
} from '@/theme';

/** Seviye başına renk tonu ve çubak gradiyeti — 2×2 ızgarada simetriyi taşır. */
const GRADE_TONES: { accent: TopicAccent; bar: 'primary' | 'reward' | 'success' }[] = [
  { accent: 'sky', bar: 'primary' },
  { accent: 'mint', bar: 'success' },
  { accent: 'lavender', bar: 'primary' },
  { accent: 'amber', bar: 'reward' },
];

interface GradeAttendance {
  grade: Grade;
  accent: TopicAccent;
  bar: 'primary' | 'reward' | 'success';
  count: number;
  average: number;
  share: number;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { adminName } = useAdminGate();
  const results = useResults();
  const todayCount = useTodayCount();
  const [showExit, setShowExit] = useState(false);

  // Android donanım geri tuşu panelden onaysız çıkarmasın.
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowExit(true);
      return true;
    });
    return () => subscription.remove();
  }, []);

  const participants = results.length;
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const averageScore = participants > 0 ? Math.round(totalScore / participants) : 0;
  const topScore = results.reduce((max, result) => Math.max(max, result.score), 0);

  const attendance: GradeAttendance[] = GRADES.map((grade, index) => {
    const rows = results.filter((result) => result.grade === grade);
    const count = rows.length;
    return {
      grade,
      accent: GRADE_TONES[index].accent,
      bar: GRADE_TONES[index].bar,
      count,
      average:
        count > 0 ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / count) : 0,
      share: participants > 0 ? Math.round((count / participants) * 100) : 0,
    };
  });
  const maxGradeCount = Math.max(1, ...attendance.map((row) => row.count));

  return (
    <Screen title="Yönetim Paneli" onBack={() => setShowExit(true)} scroll>
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
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[type.h3, { color: palette.ink }]}>🏫 Sınıf Seviyesi Katılımı</Text>
              <Text style={[type.caption, { color: palette.inkFaint }]}>
                Karta dokun → o seviyenin katılımcıları
              </Text>
            </View>
            <View style={styles.gradeGrid}>
              {attendance.map((row) => (
                <GradeAttendanceCard
                  key={row.grade}
                  row={row}
                  ratio={row.count / maxGradeCount}
                  onPress={() =>
                    router.push({ pathname: '/admin/participants', params: { grade: String(row.grade) } })
                  }
                />
              ))}
            </View>
          </View>
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
            detail="Soru sayısı, sertifika başlıkları"
            onPress={() => router.push('/admin/settings')}
          />
        </Reveal>
      </View>

      <ConfirmDialog
        visible={showExit}
        title="Çıkmak istiyor musunuz?"
        message="Yönetici panelinden çıkıp kiosk ekranına dönersiniz."
        cancelLabel="PANELDE KAL"
        confirmLabel="ÇIK"
        onCancel={() => setShowExit(false)}
        onConfirm={() => router.replace('/onboarding/welcome')}
      />
    </Screen>
  );
}

/** 2×2 seviye kartı: katılım sayısı, ortalama puan, seviye payı ve soru yükü. */
function GradeAttendanceCard({
  row,
  ratio,
  onPress,
}: {
  row: GradeAttendance;
  ratio: number;
  onPress: () => void;
}) {
  const tone = topicAccents[row.accent];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${row.grade}. sınıf: ${row.count} katılımcı, ortalama ${row.average} puan`}
      accessibilityHint="Bu seviyenin katılımcı listesini açar"
      haptic="light"
      onPress={onPress}
      style={styles.gradeGridItem}
    >
      <GlassCard padded={false} outline={tone.soft}>
        <View style={styles.gradeBody}>
          <View style={styles.gradeHead}>
            <View style={[styles.gradeBadge, { backgroundColor: tone.soft }]}>
              <Text style={[styles.gradeBadgeText, { color: tone.main }]} maxFontSizeMultiplier={1.1}>
                {row.grade}
              </Text>
            </View>
            <Text style={[type.label, styles.gradeHeadTitle, { color: palette.ink }]}>
              {row.grade}. Sınıf
            </Text>
            <Text style={[type.label, { color: tone.main }]}>{`%${row.share}`}</Text>
          </View>

          <View style={styles.gradeCountRow}>
            <Text style={[type.score, { color: palette.ink }]} maxFontSizeMultiplier={1.1}>
              {row.count}
            </Text>
            <Text style={[type.caption, { color: palette.inkSoft }]}>katılımcı</Text>
          </View>

          <ProgressBar progress={ratio} height={8} color={row.bar} />

          <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={1}>
            {row.count > 0 ? `ort. ${row.average} puan` : 'katılım yok'}
          </Text>
        </View>
      </GlassCard>
    </PressableScale>
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
    gap: space.xl,
  },
  statsGrid: {
    gap: space.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  section: {
    gap: space.lg,
  },
  sectionHead: {
    gap: space.xs,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  gradeGridItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '46%',
    minWidth: 0,
  },
  gradeBody: {
    padding: space.md,
    gap: space.md,
  },
  gradeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  gradeBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBadgeText: {
    fontFamily: fonts.display,
    fontSize: 15,
    lineHeight: 20,
  },
  gradeCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xs,
  },
  gradeHeadTitle: {
    flex: 1,
  },
  links: {
    gap: space.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
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
