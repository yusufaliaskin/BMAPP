/**
 * Admin — Sertifika önizleme: "oluştur → paylaş/kaydet" akışı.
 * Mobilde: PDF OLUŞTUR dosyayı hazırlar, PAYLAŞ / KAYDET paylaş menüsünü açar
 * (menüden "Dosyalara kaydet" ile telefona iner). Web'de yazdırma penceresi açılır.
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
import { createCertificatePdf, shareCertificatePdfFile } from '@/lib/certificate-pdf';
import { palette, space, type } from '@/theme';

export default function AdminCertificatePreviewScreen() {
  const router = useRouter();
  const { participantCode } = useLocalSearchParams<{ participantCode?: string }>();
  const certificates = useCertificates();
  const config = useConfig();
  const [generatedUri, setGeneratedUri] = useState<string | null>(null);
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

  const createPdf = async () => {
    if (busy !== 'none') return;
    setBusy('pdf');
    setError(null);
    setInfo(null);
    try {
      const outcome = await createCertificatePdf(certificate, config);
      if (Platform.OS === 'web') {
        setInfo('Yazdırma penceresinde "PDF olarak kaydet" seçeneğini kullanabilirsin.');
      } else if (outcome.uri) {
        setGeneratedUri(outcome.uri);
        setInfo('✅ PDF hazır — "PAYLAŞ / KAYDET" ile telefonuna kaydedebilirsin.');
      }
    } catch (issue) {
      console.warn('Sertifika PDF oluşturulamadı.', issue);
      setError('PDF oluşturulamadı. Lütfen tekrar dene.');
    } finally {
      setBusy('none');
    }
  };

  const sharePdf = async () => {
    if (busy !== 'none') return;
    setBusy('share');
    setError(null);
    setInfo(null);
    try {
      if (generatedUri) {
        await shareCertificatePdfFile(generatedUri, certificate.number);
      } else {
        await createCertificatePdf(certificate, config, { share: true });
      }
      setInfo('Paylaş menüsünden "Dosyalara kaydet" veya Drive’a yükle seçebilirsin.');
    } catch (issue) {
      console.warn('Sertifika paylaşılamadı.', issue);
      setError('Paylaşım açılamadı. Lütfen tekrar dene.');
    } finally {
      setBusy('none');
    }
  };

  return (
    <Screen title="Sertifika Önizleme 🎓" onBack={() => router.back()} scroll>
      <View style={styles.container}>
        <Reveal>
          <CertificateView certificate={certificate} config={config} />
          <Text style={[type.caption, styles.note, { color: palette.inkFaint }]}>
            Önizleme ekran genişliğine göre küçültüldü. PDF, A4 yatay sayfada baskı
            boyutunda üretilir.
          </Text>
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
          {Platform.OS === 'web' ? (
            <Button
              label="PDF OLARAK KAYDET 📄"
              onPress={() => void createPdf()}
              loading={busy === 'pdf'}
              disabled={busy !== 'none'}
            />
          ) : (
            <>
              <Button
                label={generatedUri ? 'PDF HAZIR ✅' : 'PDF OLUŞTUR 📄'}
                onPress={() => void createPdf()}
                loading={busy === 'pdf'}
                disabled={busy !== 'none' || generatedUri !== null}
                variant="glass"
              />
              <Button
                label="PAYLAŞ / KAYDET 📤"
                onPress={() => void sharePdf()}
                loading={busy === 'share'}
                disabled={busy !== 'none'}
                accessibilityHint="Paylaş menüsünü açar; menüden Dosyalara kaydet seçilebilir"
              />
            </>
          )}
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
    gap: space.md,
  },
  center: {
    textAlign: 'center',
  },
  note: {
    textAlign: 'center',
    marginTop: space.md,
    color: palette.inkFaint,
  },
  infoText: {
    padding: space.md,
    textAlign: 'center',
  },
});
