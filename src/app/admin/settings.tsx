/**
 * Admin — Ayarlar (kiosk uyarlaması): kademe soru sayısı/zorluk (§3),
 * sertifika başlıkları (§20), yönetici hesapları bağlantısı ve katılımcı verisi sıfırlama.
 * Tekrar politikası YOKTUR: kiosk modelinde her katılımcı teste bir kez girer.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Stepper } from '@/components/ui/Stepper';
import { TextField } from '@/components/ui/TextField';
import { clearParticipantData, updateConfig, updateGradeSetting } from '@/data/actions';
import { useCertificates, useConfig, useDB, useGradeSettings, useQuestions, useResults } from '@/data/hooks';
import type { Difficulty, Grade } from '@/domain/models';
import { buildBackupJson, buildParticipantsCsv, exportTextFile } from '@/lib/export-data';
import { palette, space, surface, type } from '@/theme';

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Kolay' },
  { value: 'easy-medium', label: 'K-Orta' },
  { value: 'medium', label: 'Orta' },
  { value: 'medium-hard', label: 'O-Zor' },
];

export default function AdminSettingsScreen() {
  const router = useRouter();
  const config = useConfig();
  const gradeSettings = useGradeSettings();
  const results = useResults();

  const [certForm, setCertForm] = useState({
    certificatePrefix: config.certificatePrefix,
    period: config.period,
    projectTitle: config.projectTitle,
    universityName: config.universityName,
    signatoryLeft: config.signatoryLeft,
    signatoryRight: config.signatoryRight,
  });
  const [certSaved, setCertSaved] = useState(false);

  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  const db = useDB();
  const certificates = useCertificates();
  const questions = useQuestions();
  const [exportKind, setExportKind] = useState<'csv' | 'json' | null>(null);
  const [exportReport, setExportReport] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const runExport = async (kind: 'csv' | 'json') => {
    if (exportKind) return;
    setExportKind(kind);
    setExportReport(null);
    setExportError(null);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const outcome =
        kind === 'csv'
          ? await exportTextFile(
              `bilincli-kahraman-katilimci-${stamp}.csv`,
              'text/csv',
              buildParticipantsCsv(db.data),
            )
          : await exportTextFile(
              `bilincli-kahraman-yedek-${stamp}.json`,
              'application/json',
              buildBackupJson(db),
            );
      const rows = kind === 'csv' ? `${db.data.results.length} katılımcı satırı` : 'tam belge';
      const where =
        outcome.via === 'share'
          ? 'Paylaşım menüsü açıldı — “Dosyalara kaydet”i seç.'
          : outcome.via === 'download'
            ? 'Tarayıcı dosyayı indirdi.'
            : 'Cihazın önbelleğine yazıldı; paylaşım menüsü kullanılamıyor.';
      setExportReport(`${outcome.fileName} hazır (${rows}, ${outcome.characters} karakter). ${where}`);
    } catch (error) {
      console.warn('Veri dışa aktarılamadı.', error);
      setExportError('Dışa aktarma başarısız oldu. Lütfen tekrar dene.');
    } finally {
      setExportKind(null);
    }
  };

  const saveCertForm = () => {
    updateConfig(certForm);
    setCertSaved(true);
  };

  return (
    <Screen title="Ayarlar" onBack={() => router.back()} scroll keyboard>
      <View style={styles.container}>
        <Reveal>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Yöneticiler. Hesap ekleme, PIN belirleme, silme"
            haptic="light"
            onPress={() => router.push('/admin/admins')}
          >
            <GlassCard padded={false}>
              <View style={styles.linkRow}>
                <View style={styles.linkIcon}>
                  <Ionicons name="person-circle" size={22} color={palette.primary} />
                </View>
                <View style={styles.linkText}>
                  <Text style={[type.bodyBold, { color: palette.ink }]}>Yöneticiler</Text>
                  <Text style={[type.caption, { color: palette.inkFaint }]}>
                    Hesap ekleme, PIN belirleme, silme
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={palette.inkFaint} />
              </View>
            </GlassCard>
          </PressableScale>
        </Reveal>

        <Reveal delay={50}>
          <GlassCard style={styles.card}>
            <Text style={[type.h3, { color: palette.ink }]}>📚 Kademe Ayarları</Text>
            <Text style={[type.caption, { color: palette.inkFaint }]}>
              Soru sayısı ve zorluk sınıf seviyesine göre buradan yönetilir.
            </Text>
            {gradeSettings.map((setting) => (
              <View key={setting.grade} style={styles.gradeRow}>
                <View style={styles.gradeHeader}>
                  <Text style={[type.bodyBold, { color: palette.ink }]}>
                    {setting.grade}. Sınıflar
                  </Text>
                  <Stepper
                    accessibilityLabel={`${setting.grade}. sınıf soru sayısı`}
                    value={setting.questionCount}
                    min={1}
                    max={20}
                    onChange={(value) =>
                      updateGradeSetting(setting.grade as Grade, { questionCount: value })
                    }
                  />
                </View>
                <SegmentedControl
                  accessibilityLabel={`${setting.grade}. sınıf zorluğu`}
                  options={DIFFICULTY_OPTIONS.map((option) => ({ ...option }))}
                  value={setting.difficulty}
                  onChange={(value) =>
                    updateGradeSetting(setting.grade as Grade, { difficulty: value })
                  }
                />
              </View>
            ))}
          </GlassCard>
        </Reveal>

        <Reveal delay={100}>
          <GlassCard style={styles.card}>
            <Text style={[type.h3, { color: palette.ink }]}>🎓 Sertifika Başlıkları</Text>
            <TextField
              label="Sertifika ön eki"
              value={certForm.certificatePrefix}
              onChangeText={(value) => setCertForm((c) => ({ ...c, certificatePrefix: value }))}
              maxLength={10}
              autoCapitalize="characters"
            />
            <TextField
              label="Dönem / yıl"
              value={certForm.period}
              onChangeText={(value) => setCertForm((c) => ({ ...c, period: value }))}
              maxLength={10}
            />
            <TextField
              label="Proje başlığı"
              value={certForm.projectTitle}
              onChangeText={(value) => setCertForm((c) => ({ ...c, projectTitle: value }))}
              maxLength={80}
            />
            <TextField
              label="Üniversite"
              value={certForm.universityName}
              onChangeText={(value) => setCertForm((c) => ({ ...c, universityName: value }))}
              maxLength={80}
            />
            <TextField
              label="Sol imza"
              value={certForm.signatoryLeft}
              onChangeText={(value) => setCertForm((c) => ({ ...c, signatoryLeft: value }))}
              maxLength={40}
            />
            <TextField
              label="Sağ imza"
              value={certForm.signatoryRight}
              onChangeText={(value) => setCertForm((c) => ({ ...c, signatoryRight: value }))}
              maxLength={40}
            />
            {certSaved ? (
              <Text style={[type.caption, { color: palette.success }]}>✅ Kaydedildi.</Text>
            ) : null}
            <Button label="BAŞLIKLARI KAYDET" onPress={saveCertForm} />
          </GlassCard>
        </Reveal>

        <Reveal delay={150}>
          <GlassCard style={styles.card}>
            <Text style={[type.h3, { color: palette.ink }]}>💾 Yedekleme ve Dışa Aktarma</Text>
            <Text style={[type.caption, { color: palette.inkSoft }]}>
              Kayıtlar yalnızca bu cihazda tutulur. Cihaz değişir veya uygulama silinirse
              veriler de gider — düzenli aralıklarla dışa aktar. Yedekte yönetici PIN’leri
              bulunmaz.
            </Text>
            <View style={styles.exportMeta}>
              <Text style={[type.caption, { color: palette.inkFaint }]}>
                {results.length} katılımcı · {certificates.length} sertifika ·{' '}
                {questions.length} soru
              </Text>
            </View>
            {exportReport ? (
              <Text accessibilityLiveRegion="polite" style={[type.caption, { color: palette.success }]}>
                {exportReport}
              </Text>
            ) : null}
            {exportError ? (
              <Text accessibilityLiveRegion="polite" style={[type.caption, { color: palette.coral }]}>
                {exportError}
              </Text>
            ) : null}
            <Button
              label="KATILIMCI LİSTESİ (CSV)"
              onPress={() => void runExport('csv')}
              loading={exportKind === 'csv'}
              disabled={exportKind !== null}
              accessibilityHint="Tüm katılımcı ve sertifika kayıtlarını tablo dosyası olarak indirir"
            />
            <Button
              label="TÜM VERİ YEDEĞİ (JSON)"
              variant="glass"
              onPress={() => void runExport('json')}
              loading={exportKind === 'json'}
              disabled={exportKind !== null}
              accessibilityHint="Sorular, sınıflar, sonuçlar ve ayarlar dahil tam yedek dosyası"
            />
          </GlassCard>
        </Reveal>

        <Reveal delay={200}>
          <GlassCard style={styles.dangerCard}>
            <Text style={[type.h3, { color: palette.coral }]}>⚠️ Katılımcı Verilerini Sil</Text>
            <Text style={[type.caption, { color: palette.inkSoft }]}>
              {results.length} katılımcı sonucu ve tüm sertifikalar silinir. Soru bankası ve
              ayarlar korunur. Bu işlem geri alınamaz.
            </Text>
            {cleared ? (
              <Text style={[type.caption, { color: palette.inkSoft }]}>Veriler silindi.</Text>
            ) : confirmClear ? (
              <View style={styles.dangerActions}>
                <Button
                  label="EVET, TÜM VERİYİ SİL"
                  variant="danger"
                  onPress={() => {
                    clearParticipantData();
                    setConfirmClear(false);
                    setCleared(true);
                  }}
                />
                <Button label="VAZGEÇ" variant="glass" onPress={() => setConfirmClear(false)} />
              </View>
            ) : (
              <Button
                label="VERİLERİ SİL"
                variant="danger"
                onPress={() => setConfirmClear(true)}
              />
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
    paddingBottom: space.lg,
  },
  card: {
    gap: space.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    flex: 1,
    gap: 2,
  },
  gradeRow: {
    gap: space.sm,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: surface.glassBorderSoft,
  },
  gradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerCard: {
    gap: space.md,
    borderColor: palette.coralSoft,
  },
  exportMeta: {
    paddingVertical: space.xs,
  },
  dangerActions: {
    gap: space.sm,
  },
});
