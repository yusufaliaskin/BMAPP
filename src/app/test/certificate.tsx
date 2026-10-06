/**
 * Sertifika ekranı (kiosk) — katılımcının belgesi tam genişlikte, yatay oranda.
 * Masaüstünde büyük ve okunur; telefonda ekran genişliğine sığar, oran korunur.
 * Tek birincil aksiyon: PDF olarak kaydet/paylaş. İkincil: yeni katılımcı.
 */

import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';

import { CertificateView } from '@/components/certificate/CertificateView';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/states';
import { requestCertificate } from '@/data/actions';
import { useCertificates, useConfig, useResultById } from '@/data/hooks';
import { certificateForParticipant } from '@/domain/engine/certificates';
import { clearTestSession } from '@/features/test-session';
import { createCertificatePdf, shareCertificatePdfFile } from '@/lib/certificate-pdf';
import { palette, space, type } from '@/theme';

export default function KioskCertificateScreen() {
  const router = useRouter();
  const { resultId } = useLocalSearchParams<{ resultId?: string }>();
  const result = useResultById(resultId);
  const config = useConfig();
  const certificates = useCertificates();

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  // Belge yoksa burada üretilir (sonuç ekranından gelinmese bile çalışır).
  useEffect(() => {
    if (resultId) requestCertificate(resultId);
  }, [resultId]);

  const reset = () => {
    clearTestSession();
    router.replace('/onboarding/welcome');
  };

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      reset();
      return true;
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const certificate = result
    ? certificateForParticipant(certificates, result.participantCode, config.period)
    : undefined;

  if (!result || !certificate) {
    return (
      <Screen title="Sertifika" onBack={reset}>
        <View style={styles.centerWrap}>
          <EmptyState
            title="Belge bulunamadı"
            message="Bu katılımcı için belge oluşturulamadı. Başa dönüp yeniden deneyebilirsin."
            actionLabel="BAŞA DÖN"
            onAction={reset}
          />
        </View>
      </Screen>
    );
  }

  const savePdf = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (Platform.OS === 'web') {
        await createCertificatePdf(certificate, config);
        setMessage('Yazdırma penceresinde “PDF olarak kaydet”i seç.');
      } else if (pdfUri) {
        await shareCertificatePdfFile(pdfUri, certificate.number);
      } else {
        const outcome = await createCertificatePdf(certificate, config, { share: true });
        if (outcome.uri) setPdfUri(outcome.uri);
        setMessage('Paylaşım menüsünden “Dosyalara kaydet”i seçebilirsin.');
      }
    } catch (issue) {
      console.warn('Belge PDF olarak oluşturulamadı.', issue);
      setError('Belge kaydedilemedi. Lütfen tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Sertifika" onBack={reset} scroll width="wide">
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
          {message ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[type.caption, styles.center, { color: palette.success }]}
            >
              {message}
            </Text>
          ) : null}
          <Button
            label={Platform.OS === 'web' ? 'PDF OLARAK KAYDET' : 'PAYLAŞ / KAYDET'}
            onPress={() => void savePdf()}
            loading={busy}
            accessibilityHint="Belgeyi PDF olarak kaydeder veya paylaşır"
          />
          <Button label="YENİ KATILIMCI" variant="glass" onPress={reset} />
        </Reveal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  actions: {
    gap: space.sm,
  },
  center: {
    textAlign: 'center',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
  },
});
