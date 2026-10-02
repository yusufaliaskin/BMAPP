/**
 * Admin — Sertifika önizleme (kiosk uyarlaması): katılımcı koduna göre sertifika;
 * madalya sınıfı görünür. PDF üretimi gerçek: mobilde dosya + paylaşım,
 * web'de yazdırma penceresi.
 */

import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { CertificateView } from '@/components/certificate/CertificateView';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/states';
import { useCertificates, useConfig } from '@/data/hooks';
import { certificateForParticipant } from '@/domain/engine/certificates';
import { createCertificatePdf } from '@/lib/certificate-pdf';
import { palette, space, type } from '@/theme';

export default function AdminCertificatePreviewScreen() {
  const router = useRouter();
  const { participantCode } = useLocalSearchParams<{ participantCode?: string }>();
  const certificates = useCertificates();
  const config = useConfig();
  const [busy, setBusy] = useState<'none' | 'pdf' | 'share'>('none');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const certificate = participantCode
    ? certificateForParticipant(certificates, participantCode)
    : undefined;

  if (!certificate) {
    return (
      <Screen title="Sertifika" onBack={() => router.back()}>
        <View style={styles.centerWrap}>
          <EmptyState
            emoji="🎓"
            title="Sertifika bulunamadı"
            message="Bu katılımcı için üretilmiş sertifika yok. Sıralamalar ekranından üretebilirsin."
            actionLabel="SIRALAMALARA GİT"
            onAction={() => router.push('/admin/rankings')}
          />
        </View>
      </Screen>
    );
  }

  const run = async (mode: 'pdf' | 'share') => {
    if (busy !== 'none') return;
    setBusy(mode);
    setError(null);
    setInfo(null);
    try {
      const outcome = await createCertificatePdf(certificate, config, {
        share: mode === 'share',
      });
      if (Platform.OS === 'web') {
        setInfo('Yazdırma penceresinde "PDF olarak kaydet" seçeneğini kullanabilirsin.');
      } else if (outcome.uri && mode === 'pdf') {
        setInfo(`PDF hazır: ${certificate.number}.pdf`);
      }
    } catch (issue) {
      console.warn('Sertifika PDF oluşturulamadı.', issue);
      setError('PDF oluşturulamadı. Lütfen tekrar dene.');
    } finally {
      setBusy('none');
    }
  };

  return (
    <Screen title="Sertifika Önizleme 🎓" onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <Reveal>
          <CertificateView certificate={certificate} config={config} />
        </Reveal>
        <Reveal delay={100} style={styles.actions}>
          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[type.caption, styles.center, { color: palette.coral }]}
            >
              {error}
            </Text>
          ) : null}
          {info ? (
            <GlassCard padded={false}>
              <Text style={[type.caption, styles.infoText, { color: palette.inkSoft }]}>
                {info}
              </Text>
            </GlassCard>
          ) : null}
          <Button
            label={Platform.OS === 'web' ? 'PDF OLARAK KAYDET 📄' : 'PDF OLUŞTUR 📄'}
            onPress={() => void run('pdf')}
            loading={busy === 'pdf'}
            disabled={busy !== 'none'}
          />
          {Platform.OS !== 'web' ? (
            <Button
              label="PAYLAŞ 📤"
              variant="glass"
              onPress={() => void run('share')}
              loading={busy === 'share'}
              disabled={busy !== 'none'}
            />
          ) : null}
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
  actions: {
    gap: space.sm,
  },
  center: {
    textAlign: 'center',
  },
  infoText: {
    padding: space.md,
    textAlign: 'center',
  },
});
