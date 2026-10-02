/**
 * Admin — Öğrenci detayı (§22): tam kayıt, tüm test sonuçları, rozetler,
 * sıralama ve sertifika durumu. Gerçek veriler; düzenleme yok, salt görünüm.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { AvatarBubble } from '@/components/ui/AvatarBubble';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/states';
import {
  useBadges,
  useCertificates,

  useRankingsFor,
  useStudentBadges,
  useStudentById,
  useStudentResults,
} from '@/data/hooks';
import { certificateForStudent } from '@/domain/engine/certificates';
import { rankOf } from '@/domain/engine/ranking';
import { formatDateTimeTR, formatDuration } from '@/lib/format';
import { glassSurface, palette, radius, space, type } from '@/theme';

export default function AdminStudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const student = useStudentById(id);
  const results = useStudentResults(student?.id);
  const ranked = useRankingsFor(student?.grade ?? 1, null);
  const allBadges = useBadges();
  const myBadges = useStudentBadges(student?.id);
  const certificates = useCertificates();

  if (!student) {
    return (
      <Screen title="Öğrenci" onBack={() => router.back()}>
        <View style={styles.centerWrap}>
          <EmptyState emoji="🔎" title="Öğrenci bulunamadı" message="Bu kayıt silinmiş olabilir." />
        </View>
      </Screen>
    );
  }

  const myRank = rankOf(ranked, student.id);
  const certificate = certificateForStudent(certificates, student.id);
  const section = student.classId.replace(String(student.grade), '');
  const correctTotal = results.reduce((sum, result) => sum + result.correct, 0);

  return (
    <Screen title={student.fullName} onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <Reveal>
          <GlassCard glint level="strong" style={styles.hero}>
            <AvatarBubble emoji={student.emoji} size={72} />
            <View style={styles.heroText}>
              <Text style={[type.h2, { color: palette.ink }]}>{student.fullName}</Text>
              <Text style={[type.bodySemi, { color: palette.inkSoft }]}>
                {student.nickname} · {student.grade}/{section}
              </Text>
              <Text style={[type.caption, { color: palette.inkFaint }]}>
                Kayıt: {formatDateTimeTR(student.createdAt)}
              </Text>
            </View>
          </GlassCard>
        </Reveal>

        <Reveal delay={60} style={styles.statsRow}>
          <StatCard emoji="⭐" value={myRank ? myRank.score : '—'} label="En iyi puan" accent="amber" />
          <StatCard emoji="🏆" value={myRank ? `${myRank.rank}.` : '—'} label="Sıralama" accent="lavender" />
          <StatCard emoji="✅" value={correctTotal} label="Toplam doğru" accent="mint" />
        </Reveal>

        {certificate ? (
          <Reveal delay={90}>
            <GlassCard style={styles.certCard}>
              <Text style={[type.bodyBold, { color: palette.ink }]}>
                🎓 Sertifika: {certificate.number}
              </Text>
              <Button
                label="SERTİFİKAYI GÖR"
                variant="glass"
                onPress={() => router.push(`/certificate?studentId=${student.id}`)}
              />
            </GlassCard>
          </Reveal>
        ) : null}

        <Reveal delay={120}>
          <GlassCard style={styles.badgesCard}>
            <Text style={[type.h3, { color: palette.ink }]}>🎖️ Rozetler ({myBadges.length})</Text>
            {myBadges.length === 0 ? (
              <Text style={[type.caption, { color: palette.inkFaint }]}>Henüz rozet yok.</Text>
            ) : (
              <View style={styles.badgeWrap}>
                {myBadges.map((badge) => {
                  const def = allBadges.find((b) => b.id === badge.badgeId);
                  if (!def) return null;
                  return (
                    <View key={badge.badgeId} style={styles.badgeChip}>
                      <Text style={styles.badgeEmoji} maxFontSizeMultiplier={1.1}>
                        {def.emoji}
                      </Text>
                      <Text style={[type.caption, { color: palette.ink }]}>{def.name}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </GlassCard>
        </Reveal>

        <Reveal delay={150}>
          <GlassCard style={styles.resultsCard}>
            <Text style={[type.h3, { color: palette.ink }]}>
              📝 Test Sonuçları ({results.length})
            </Text>
            {results.length === 0 ? (
              <Text style={[type.caption, { color: palette.inkFaint }]}>
                Bu öğrenci henüz test çözmedi.
              </Text>
            ) : (
              results.map((result) => (
                <View key={result.id} style={[styles.resultRow, glassSurface('subtle')]}>
                  <View style={styles.resultText}>
                    <Text style={[type.bodySemi, { color: palette.ink }]}>
                      ⭐ {result.score} / {result.maxScore} puan
                    </Text>
                    <Text style={[type.caption, { color: palette.inkFaint }]}>
                      {formatDateTimeTR(result.completedAt)} · {formatDuration(result.durationMs)} ·{' '}
                      {result.attempt + 1}. deneme
                    </Text>
                  </View>
                  <Text style={[type.bodyBold, { color: palette.inkSoft }]}>
                    ✅ {result.correct} · ❌ {result.wrong}
                  </Text>
                </View>
              ))
            )}
          </GlassCard>
        </Reveal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  heroText: {
    flex: 1,
    gap: space.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  certCard: {
    gap: space.md,
  },
  badgesCard: {
    gap: space.md,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: palette.rewardSoft,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  resultsCard: {
    gap: space.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.md,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
});
