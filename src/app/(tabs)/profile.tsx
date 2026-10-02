/**
 * Profil — çocuğun kendi bilgileri: karakteri, puanı, testleri (§38 PROFILE).
 * Rozetler, sertifika ve (küçük) yönetici girişi buradan erişilir.
 */

import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { AvatarBubble } from '@/components/ui/AvatarBubble';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { signOut } from '@/data/actions';
import {
  useBadges,
  useCertificates,
  useCurrentStudent,
  useRankingsFor,
  useStudentBadges,
  useStudentResults,
} from '@/data/hooks';
import { certificateForStudent } from '@/domain/engine/certificates';
import { rankOf } from '@/domain/engine/ranking';
import { glassSurface, palette, radius, space, type } from '@/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const student = useCurrentStudent();
  const results = useStudentResults(student?.id);
  const ranked = useRankingsFor(student?.grade ?? 1, null);
  const allBadges = useBadges();
  const myBadges = useStudentBadges(student?.id);
  const certificates = useCertificates();
  const [confirmExit, setConfirmExit] = useState(false);

  if (!student) return <Redirect href="/onboarding/welcome" />;

  const myRank = rankOf(ranked, student.id);
  const certificate = certificateForStudent(certificates, student.id);
  const section = student.classId.replace(String(student.grade), '');

  return (
    <Screen scroll>
      <View style={styles.container}>
        <Reveal>
          <GlassCard glint level="strong" style={styles.hero}>
            <AvatarBubble emoji={student.emoji} size={88} />
            <Text style={[type.h1, { color: palette.ink }]} numberOfLines={1}>
              {student.nickname}
            </Text>
            <View style={[styles.classChip, glassSurface('strong')]}>
              <Text style={[type.label, { color: palette.inkSoft }]}>
                🏫 {student.grade}/{section}
              </Text>
            </View>
          </GlassCard>
        </Reveal>

        <Reveal delay={70} style={styles.statsRow}>
          <StatCard emoji="⭐" value={myRank ? myRank.score : '—'} label="En iyi puan" accent="amber" />
          <StatCard emoji="📝" value={results.length} label="Çözülen test" accent="sky" />
          <StatCard
            emoji="🎖️"
            value={`${myBadges.length}/${allBadges.length}`}
            label="Rozet"
            accent="mint"
          />
        </Reveal>

        <Reveal delay={130} style={styles.actions}>
          <MenuRow
            emoji="🎖️"
            label="Rozetlerim"
            detail={`${myBadges.length} kazanıldı`}
            onPress={() => router.push('/badges')}
          />
          <MenuRow
            emoji="🎓"
            label="Sertifikam"
            detail={certificate ? certificate.number : 'İlk 3e girince kazanılır'}
            onPress={() => router.push('/certificate')}
          />
          <MenuRow
            emoji="🛠️"
            label="Yönetici Girişi"
            detail="Öğretmenler için"
            onPress={() => router.push('/admin/login')}
          />
        </Reveal>

        <Reveal delay={180}>
          {confirmExit ? (
            <GlassCard style={styles.exitCard}>
              <Text style={[type.bodySemi, styles.center, { color: palette.ink }]}>
                Çıkmak istediğine emin misin? 😊
              </Text>
              <Button
                label="EVET, ÇIK"
                variant="danger"
                onPress={() => {
                  signOut();
                  router.replace('/onboarding/welcome');
                }}
              />
              <Button label="VAZGEÇ" variant="glass" onPress={() => setConfirmExit(false)} />
            </GlassCard>
          ) : (
            <Button label="Çıkış Yap" variant="ghost" onPress={() => setConfirmExit(true)} />
          )}
        </Reveal>
      </View>
    </Screen>
  );
}

interface MenuRowProps {
  emoji: string;
  label: string;
  detail: string;
  onPress: () => void;
}

function MenuRow({ emoji, label, detail, onPress }: MenuRowProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${detail}`}
      haptic="light"
      onPress={onPress}
    >
      <GlassCard padded={false}>
        <View style={styles.menuRow}>
          <View style={styles.menuEmojiWrap}>
            <Text style={styles.menuEmoji} maxFontSizeMultiplier={1.1}>
              {emoji}
            </Text>
          </View>
          <View style={styles.menuText}>
            <Text style={[type.bodyBold, { color: palette.ink }]}>{label}</Text>
            <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={1}>
              {detail}
            </Text>
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
    paddingTop: space.sm,
  },
  hero: {
    alignItems: 'center',
    gap: space.sm,
  },
  classChip: {
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  actions: {
    gap: space.md,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  menuEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {
    fontSize: 22,
  },
  menuText: {
    flex: 1,
    gap: 2,
  },
  center: {
    textAlign: 'center',
  },
  exitCard: {
    gap: space.md,
  },
});
