/**
 * Rozetler — tüm rozetler listelenir; kazanılanlar renkli ve tarihli,
 * kilitliler soluk + kural açıklamalı (çocuk ne yaparsa kazanacağını görür).
 */

import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { useBadges, useCurrentStudent, useStudentBadges } from '@/data/hooks';
import { formatDateTR } from '@/lib/format';
import { palette, radius, space, type } from '@/theme';

export default function BadgesScreen() {
  const router = useRouter();
  const student = useCurrentStudent();
  const badges = useBadges();
  const myBadges = useStudentBadges(student?.id);

  if (!student) return <Redirect href="/onboarding/welcome" />;

  const earnedMap = new Map(myBadges.map((b) => [b.badgeId, b]));

  return (
    <Screen title="Rozetlerim" onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <Reveal style={styles.header}>
          <Text style={[type.h2, { color: palette.ink }]}>🎖️ Rozetlerim</Text>
          <Text style={[type.bodySemi, { color: palette.inkSoft }]}>
            {myBadges.length} / {badges.length} rozet kazandın
          </Text>
        </Reveal>
        <View style={styles.grid}>
          {badges.map((badge, index) => {
            const earned = earnedMap.get(badge.id);
            return (
              <Reveal key={badge.id} delay={60 + index * 45} style={styles.cell}>
                <GlassCard
                  style={[styles.card, earned ? styles.earnedCard : styles.lockedCard]}
                  padded={false}
                >
                  <View style={styles.cardInner}>
                    <View style={[styles.emojiWrap, earned ? styles.emojiEarned : styles.emojiLocked]}>
                      <Text style={styles.emoji} maxFontSizeMultiplier={1.1}>
                        {earned ? badge.emoji : '🔒'}
                      </Text>
                    </View>
                    <Text
                      style={[
                        type.bodyBold,
                        styles.center,
                        { color: earned ? palette.ink : palette.inkFaint },
                      ]}
                      numberOfLines={2}
                    >
                      {badge.name}
                    </Text>
                    <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
                      {badge.description}
                    </Text>
                    {earned ? (
                      <Text style={[type.caption, styles.earnedDate]}>
                        ✅ {formatDateTR(earned.earnedAt)}
                      </Text>
                    ) : null}
                  </View>
                </GlassCard>
              </Reveal>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  header: {
    gap: space.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  cell: {
    flexGrow: 1,
    flexBasis: '46%',
  },
  card: {
    borderRadius: radius.lg,
    height: '100%',
  },
  earnedCard: {
    borderColor: palette.reward,
  },
  lockedCard: {
    opacity: 0.75,
  },
  cardInner: {
    alignItems: 'center',
    gap: space.xs,
    padding: space.lg,
  },
  emojiWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xs,
  },
  emojiEarned: {
    backgroundColor: palette.rewardSoft,
  },
  emojiLocked: {
    backgroundColor: palette.primarySoft,
  },
  emoji: {
    fontSize: 28,
  },
  center: {
    textAlign: 'center',
  },
  earnedDate: {
    color: palette.success,
    marginTop: space.xs,
  },
});
