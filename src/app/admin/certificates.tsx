/**
 * Admin — Sertifikalar (§20, kiosk uyarlaması): üretilen tüm sertifikalar; numara,
 * katılımcı, madalya sınıfı (altın/gümüş/bronz), puan ve tarih.
 * Satır aksiyonu gerçek PDF üretir/paylaşır; satıra dokununca önizleme açılır.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/states';
import { useCertificates, useConfig } from '@/data/hooks';
import { MEDAL_EMOJI, MEDAL_LABEL } from '@/domain/models';
import { createCertificatePdf } from '@/lib/certificate-pdf';
import { formatDateTR } from '@/lib/format';
import { glassSurface, medal, palette, radius, space, type } from '@/theme';

const MEDAL_TONE: Record<string, string> = {
  gold: medal.gold,
  silver: medal.silver,
  bronze: medal.bronze,
};

export default function AdminCertificatesScreen() {
  const router = useRouter();
  const certificates = useCertificates();
  const config = useConfig();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sorted = [...certificates].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  const makePdf = async (certificateId: string) => {
    if (busyId) return;
    const certificate = certificates.find((c) => c.id === certificateId);
    if (!certificate) return;
    setBusyId(certificateId);
    setMessage(null);
    try {
      await createCertificatePdf(certificate, config, { share: true });
      setMessage(`${certificate.number} PDF hazır.`);
    } catch (error) {
      console.warn('PDF üretilemedi.', error);
      setMessage('PDF üretilemedi. Tekrar dene.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen title={`Sertifikalar (${sorted.length})`} onBack={() => router.back()} scroll>
      <View style={styles.container}>
        {message ? (
          <GlassCard padded={false}>
            <Text style={[type.bodySemi, styles.message, { color: palette.ink }]}>{message}</Text>
          </GlassCard>
        ) : null}

        {sorted.length === 0 ? (
          <EmptyState
            emoji="🎓"
            title="Henüz sertifika üretilmedi"
            message="Sıralamalar ekranından her sınıf seviyesinin ilk 3'ü için altın, gümüş ve bronz sertifika üretebilirsin."
            actionLabel="SIRALAMALARA GİT"
            onAction={() => router.push('/admin/rankings')}
          />
        ) : (
          <View style={styles.list}>
            {sorted.map((certificate, index) => (
              <Reveal key={certificate.id} delay={Math.min(index * 40, 320)}>
                <GlassCard padded={false}>
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel={`${certificate.number} ${certificate.medal ? MEDAL_LABEL[certificate.medal] : 'Katılım'} belgesini önizle`}
                    haptic="light"
                    onPress={() =>
                      router.push(`/admin/certificate?participantCode=${certificate.participantCode}`)
                    }
                  >
                    <View style={styles.row}>
                      <View
                        style={[
                          styles.medalBubble,
                          { backgroundColor: `${MEDAL_TONE[certificate.medal] ?? palette.primary}22` },
                        ]}
                      >
                        <Text style={styles.medalEmoji} maxFontSizeMultiplier={1.1}>
                          {MEDAL_EMOJI[certificate.medal] ?? '🎓'}
                        </Text>
                      </View>
                      <View style={styles.mid}>
                        <Text style={[type.bodyBold, { color: palette.ink }]} numberOfLines={2}>
                          {certificate.displayName}
                        </Text>
                        <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={2}>
                          {certificate.medal ? MEDAL_LABEL[certificate.medal] : 'Katılım'} · {certificate.number} ·{' '}
                          {certificate.grade}/{certificate.section} ·{' '}
                          {formatDateTR(certificate.issuedAt)}
                        </Text>
                      </View>
                      <Text style={[type.h3, { color: palette.rewardDeep }]} numberOfLines={1}>
                        ⭐ {certificate.score}
                      </Text>
                    </View>
                  </PressableScale>
                  <View style={styles.rowFooter}>
                    <PressableScale
                      accessibilityRole="button"
                      accessibilityLabel={`${certificate.number} PDF oluştur`}
                      haptic="light"
                      onPress={() => void makePdf(certificate.id)}
                      style={[styles.pdfButton, glassSurface('strong')]}
                    >
                      <Text style={[type.label, { color: palette.primary }]}>
                        {busyId === certificate.id ? 'Hazırlanıyor…' : 'PDF'}
                      </Text>
                    </PressableScale>
                  </View>
                </GlassCard>
              </Reveal>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.md,
  },
  message: {
    padding: space.md,
  },
  list: {
    gap: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    paddingBottom: space.sm,
  },
  medalBubble: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalEmoji: {
    fontSize: 20,
  },
  mid: {
    flex: 1,
    gap: 2,
  },
  rowFooter: {
    paddingHorizontal: space.md,
    paddingBottom: space.md,
  },
  pdfButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
});
