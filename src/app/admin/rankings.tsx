/**
 * Admin — Sıralamalar (§24, kiosk uyarlaması): sınıf seviyesi sekmeleri, ilk üç ve
 * tam liste; "SERTİFİKA OLUŞTUR" ile o seviyenin ilk 3'ü için benzersiz numaralı
 * ALTIN / GÜMÜŞ / BRONZ sertifika üretilir. Katılımcı kodu benzersizdir.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { AvatarBubble } from '@/components/ui/AvatarBubble';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/states';
import { deleteParticipantResult, issueCertificatesForGrade } from '@/data/actions';
import { useCertificates, useConfig, useRankingsFor, useResults } from '@/data/hooks';
import { GRADES, MEDAL_EMOJI, MEDAL_LABEL } from '@/domain/models';
import type { Grade } from '@/domain/models';
import { emojiForCode } from '@/lib/participant';
import { glassSurface, palette, radius, space, type } from '@/theme';

const GRADE_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
] as const;

export default function AdminRankingsScreen() {
  const router = useRouter();
  const certificates = useCertificates();
  const config = useConfig();
  const results = useResults();
  // Varsayılan sekme: sonucu olan ilk sınıf (boş seviye açılmasın).
  const [grade, setGrade] = useState<Grade>(() => {
    const firstWithData = GRADES.find((g) => results.some((r) => r.grade === g));
    return firstWithData ?? 1;
  });
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const ranked = useRankingsFor(grade, null);

  const issue = () => {
    if (busy) return;
    if (ranked.length === 0) {
      setReport(`ℹ️ ${grade}. sınıflarda henüz katılımcı yok — önce test çözülmeli.`);
      return;
    }
    setBusy(true);
    setReport(null);
    try {
      const outcome = issueCertificatesForGrade(grade);
      if (outcome.createdNumbers.length > 0) {
        const medals = outcome.createdMedals
          .map((medal) => MEDAL_LABEL[medal])
          .join(', ');
        setReport(
          `✅ ${outcome.createdNumbers.length} yeni sertifika üretildi (${medals}): ${outcome.createdNumbers.join(', ')}`,
        );
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
            accessibilityHint={`${grade}. sınıfların ilk üçü için altın/gümüş/bronz sertifika üretir`}
          />
        </Reveal>

        {report ? (
          <Reveal delay={80}>
            <GlassCard padded={false}>
              <Text style={[type.bodySemi, styles.reportText, { color: palette.ink }]}>
                {report}
              </Text>
            </GlassCard>
          </Reveal>
        ) : null}

        {ranked.length === 0 ? (
          <EmptyState
            emoji="🏆"
            title="Bu seviyede henüz sonuç yok"
            message="Katılımcılar test çözdükçe sıralama burada oluşur."
          />
        ) : (
          <View style={styles.list}>
            {ranked.map((entry, index) => {
              const certificate = certificates.find(
                (c) =>
                  c.participantCode === entry.participantCode &&
                  c.grade === grade &&
                  c.period === config.period,
              );
              const isTop3 = entry.rank <= 3;
              return (
                <Reveal key={entry.resultId} delay={Math.min(100 + index * 30, 360)}>
                  <View style={[styles.row, isTop3 ? styles.topRow : glassSurface('subtle')]}>
                    <View style={styles.rowMain}>
                      <View style={[styles.rankBubble, isTop3 ? styles.rankBubbleTop : null]}>
                        <Text style={styles.rankText} maxFontSizeMultiplier={1.1}>
                          {isTop3 ? MEDAL_EMOJI[entry.rank === 1 ? 'gold' : entry.rank === 2 ? 'silver' : 'bronze'] : `#${entry.rank}`}
                        </Text>
                      </View>
                      <AvatarBubble emoji={emojiForCode(entry.participantCode)} size={40} />
                      <View style={styles.rowText}>
                        <Text style={[type.bodyBold, { color: palette.ink }]} numberOfLines={2}>
                          {entry.displayName}
                        </Text>
                        <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={1}>
                          {entry.participantCode} · {entry.grade}/{entry.section}
                        </Text>
                      </View>
                      <View style={styles.rowScore}>
                        <Text style={[type.h3, { color: palette.rewardDeep }]} numberOfLines={1}>
                          ⭐ {entry.score}
                        </Text>
                        <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={1}>
                          ✅ {entry.correct} · ❌ {entry.wrong}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rowMeta}>
                      {certificate ? (
                        <Text
                          style={[type.caption, styles.certChip, { color: palette.primaryDeep }]}
                          numberOfLines={1}
                        >
                          🎓 {certificate.number}
                        </Text>
                      ) : (
                        <Text style={[type.caption, { color: palette.inkFaint }]}>
                          sertifika bekliyor
                        </Text>
                      )}
                      <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={`${entry.displayName} kaydını sil`}
                        haptic="light"
                        onPress={() => {
                          setConfirmId(entry.resultId);
                          setReport(null);
                        }}
                        style={styles.trashButton}
                      >
                        <Text style={styles.trashIcon} maxFontSizeMultiplier={1.1}>
                          🗑️
                        </Text>
                      </PressableScale>
                    </View>
                  </View>
                  {confirmId === entry.resultId ? (
                    <View style={styles.confirmRow}>
                      <Text style={[type.caption, styles.confirmText]}>
                        {entry.displayName} kaydı silinsin mi? Varsa sertifikası da silinir.
                      </Text>
                      <View style={styles.confirmActions}>
                        <Button
                          label="EVET, SİL"
                          variant="danger"
                          size="md"
                          fullWidth={false}
                          onPress={() => {
                            deleteParticipantResult(entry.resultId);
                            setConfirmId(null);
                            setReport(
                              `🗑️ ${entry.displayName} kaydı silindi. Sertifika gerekirse yeniden üretin.`,
                            );
                          }}
                        />
                        <Button
                          label="VAZGEÇ"
                          variant="glass"
                          size="md"
                          fullWidth={false}
                          onPress={() => setConfirmId(null)}
                        />
                      </View>
                    </View>
                  ) : null}
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
    gap: space.sm,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    marginLeft: space.xs,
  },
  certChip: {
    flexShrink: 1,
  },
  topRow: {
    backgroundColor: palette.rewardSoft,
    borderColor: palette.reward,
  },
  rankBubble: {
    minWidth: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  rankBubbleTop: {
    backgroundColor: palette.white,
  },
  rankText: {
    fontSize: 18,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowScore: {
    alignItems: 'flex-end',
    gap: 2,
  },
  trashButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashIcon: {
    fontSize: 16,
  },
  confirmRow: {
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
  },
  confirmText: {
    color: palette.coral,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: space.sm,
    flexWrap: 'wrap',
  },
});
