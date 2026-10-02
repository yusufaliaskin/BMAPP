/**
 * Admin — Sıralamalar (§24): sınıf seviyesi sekmeleri, ilk üç ve tam liste;
 * "SERTİFİKA OLUŞTUR" ile o seviyenin ilk 3'ü için benzersiz numaralı sertifika üretilir.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/states';
import { issueCertificatesForGrade } from '@/data/actions';
import { useConfig, useCertificates, useResults, useStudents } from '@/data/hooks';
import { medalForRank } from '@/domain/engine/certificates';
import { rankForGrade } from '@/domain/engine/ranking';
import type { Grade } from '@/domain/models';
import { glassSurface, medal, palette, radius, space, type } from '@/theme';

const GRADE_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
] as const;

export default function AdminRankingsScreen() {
  const router = useRouter();
  const students = useStudents();
  const results = useResults();
  const config = useConfig();
  const certificates = useCertificates();
  const [grade, setGrade] = useState<Grade>(3);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const ranked = rankForGrade(results, students, grade, config);

  const issue = () => {
    if (busy) return;
    setBusy(true);
    setReport(null);
    try {
      const outcome = issueCertificatesForGrade(grade);
      if (outcome.createdNumbers.length > 0) {
        setReport(`✅ ${outcome.createdNumbers.length} yeni sertifika üretildi: ${outcome.createdNumbers.join(', ')}`);
      } else if (outcome.updatedCount > 0) {
        setReport(`♻️ ${outcome.updatedCount} sertifika güncellendi (sıra/puan değişti).`);
      } else {
        setReport('ℹ️ Sertifikalar güncel — yeni üretim gerekmedi.');
      }
    } catch (error) {
      console.warn('Sertifika üretilemedi.', error);
      setReport('❌ Sertifika üretilemedi. Lütfen tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Sıralamalar" onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <Reveal>
          <SegmentedControl
            accessibilityLabel="Sınıf seviyesi seçimi"
            options={GRADE_OPTIONS.map((option) => ({ ...option }))}
            value={grade}
            onChange={(value) => {
              setGrade(value);
              setReport(null);
            }}
          />
        </Reveal>

        <Reveal delay={60}>
          <Button
            label="SERTİFİKA OLUŞTUR 🎖️"
            onPress={issue}
            loading={busy}
            accessibilityHint={`${grade}. sınıfların ilk üçü için sertifika üretir`}
          />
        </Reveal>

        {report ? (
          <Reveal delay={80}>
            <GlassCard padded={false}>
              <Text style={[type.bodySemi, styles.reportText, { color: palette.ink }]}>{report}</Text>
            </GlassCard>
          </Reveal>
        ) : null}

        {ranked.length === 0 ? (
          <EmptyState
            emoji="🏆"
            title="Bu seviyede henüz sonuç yok"
            message="Öğrenciler test çözdükçe sıralama burada oluşur."
          />
        ) : (
          <View style={styles.list}>
            {ranked.map((entry, index) => {
              const owner = students.find((s) => s.id === entry.studentId);
              if (!owner) return null;
              const certificate = certificates.find(
                (c) => c.studentId === owner.id && c.grade === grade && c.period === config.period,
              );
              const isTop3 = entry.rank <= 3;
              return (
                <Reveal key={entry.studentId} delay={Math.min(100 + index * 30, 360)}>
                  <View
                    style={[
                      styles.row,
                      isTop3 ? styles.topRow : glassSurface('subtle'),
                    ]}
                  >
                    <View style={[styles.rankBubble, isTop3 ? styles.rankBubbleTop : null]}>
                      <Text style={[type.label, { color: isTop3 ? medal.gold : palette.inkSoft }]}>
                        {medalForRank(entry.rank)}
                      </Text>
                    </View>
                    <View style={styles.rowText}>
                      <Text style={[type.bodyBold, { color: palette.ink }]} numberOfLines={1}>
                        {owner.fullName}
                      </Text>
                      <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={1}>
                        {owner.nickname} · {owner.classId}
                        {certificate ? ` · 🎓 ${certificate.number}` : ''}
                      </Text>
                    </View>
                    <View style={styles.rowScore}>
                      <Text style={[type.h3, { color: palette.rewardDeep }]}>⭐ {entry.score}</Text>
                      <Text style={[type.caption, { color: palette.inkFaint }]}>
                        ✅ {entry.correct} · ❌ {entry.wrong}
                      </Text>
                    </View>
                  </View>
                </Reveal>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  reportText: {
    padding: space.md,
  },
  list: {
    gap: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  topRow: {
    backgroundColor: palette.rewardSoft,
    borderColor: medal.gold,
  },
  rankBubble: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBubbleTop: {
    backgroundColor: palette.white,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowScore: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
