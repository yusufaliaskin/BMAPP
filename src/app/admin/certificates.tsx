/**
 * Admin — Sertifikalar (§20): üretilen tüm sertifikalar; numara, öğrenci, derece,
 * puan ve tarih. Satır aksiyonu gerçek PDF üretir/paylaşır; satıra dokununca önizleme açılır.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/states';
import { useCertificates, useConfig, useStudents } from '@/data/hooks';
import { medalForRank } from '@/domain/engine/certificates';
import { createCertificatePdf } from '@/lib/certificate-pdf';
import { formatDateTR } from '@/lib/format';
import { glassSurface, medal, palette, radius, space, type } from '@/theme';

export default function AdminCertificatesScreen() {
  const router = useRouter();
  const certificates = useCertificates();
  const students = useStudents();
  const config = useConfig();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sorted = [...certificates].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  const makePdf = async (certificateId: string) => {
    if (busyId) return;
    const certificate = certificates.find((c) => c.id === certificateId);
    if (!certificate) return;
    const student = students.find((s) => s.id === certificate.studentId);
    if (!student) return;
    setBusyId(certificateId);
    setMessage(null);
    try {
      await createCertificatePdf(certificate, student, config, { share: true });
      setMessage(`📄 ${certificate.number} PDF hazır.`);
    } catch (error) {
      console.warn('PDF üretilemedi.', error);
      setMessage('❌ PDF üretilemedi. Tekrar dene.');
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
            message="Sıralamalar ekranından her sınıf seviyesinin ilk 3'ü için sertifika üretebilirsin."
            actionLabel="SIRALAMALARA GİT"
            onAction={() => router.push('/admin/rankings')}
          />
        ) : (
          <View style={styles.list}>
            {sorted.map((certificate, index) => {
              const student = students.find((s) => s.id === certificate.studentId);
              return (
                <Reveal key={certificate.id} delay={Math.min(index * 40, 320)}>
                  <PressableScale
                    accessibilityRole="button"
                    accessibilityLabel={`${certificate.number} sertifikasını önizle`}
                    haptic="light"
                    onPress={() => router.push(`/certificate?studentId=${certificate.studentId}`)}
                  >
                    <GlassCard padded={false}>
                      <View style={styles.row}>
                        <View style={styles.medalBubble}>
                          <Text style={[type.label, { color: medal.gold }]}>
                            {medalForRank(certificate.rank)}
                          </Text>
                        </View>
                        <View style={styles.mid}>
                          <Text style={[type.bodyBold, { color: palette.ink }]} numberOfLines={1}>
                            {student?.fullName ?? 'Bilinmeyen öğrenci'}
                          </Text>
                          <Text style={[type.caption, { color: palette.inkFaint }]} numberOfLines={1}>
                            {certificate.number} · {certificate.grade}. sınıflar ·{' '}
                            {formatDateTR(certificate.issuedAt)}
                          </Text>
                        </View>
                        <Text style={[type.h3, { color: palette.rewardDeep }]}>
                          ⭐ {certificate.score}
                        </Text>
                      </View>
                      <View style={styles.rowFooter}>
                        <PressableScale
                          accessibilityRole="button"
                          accessibilityLabel={`${certificate.number} PDF oluştur`}
                          haptic="light"
                          onPress={() => void makePdf(certificate.id)}
                          style={[styles.pdfButton, glassSurface('strong')]}
                        >
                          <Text style={[type.label, { color: palette.primary }]}>
                            {busyId === certificate.id ? '⏳ Hazırlanıyor…' : '📄 PDF'}
                          </Text>
                        </PressableScale>
                      </View>
                    </GlassCard>
                  </PressableScale>
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
    gap: space.md,
  },
  message: {
    padding: space.md,
  },
  list: {
    gap: space.sm,
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
    backgroundColor: palette.rewardSoft,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: space.sm,
  },
});
