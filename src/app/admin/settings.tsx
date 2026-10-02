/**
 * Admin — Ayarlar (kiosk uyarlaması): kademe soru sayısı/zorluk (§3),
 * sertifika başlıkları (§20), PIN değiştirme (§35) ve katılımcı verisi sıfırlama.
 * Tekrar politikası YOKTUR: kiosk modelinde her katılımcı teste bir kez girer.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Stepper } from '@/components/ui/Stepper';
import { TextField } from '@/components/ui/TextField';
import { changeAdminPin, clearParticipantData, updateConfig, updateGradeSetting } from '@/data/actions';
import { useConfig, useGradeSettings, useResults } from '@/data/hooks';
import type { Difficulty, Grade } from '@/domain/models';
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

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  const saveCertForm = () => {
    updateConfig(certForm);
    setCertSaved(true);
  };

  const changePin = async () => {
    setPinError(null);
    setPinMessage(null);
    if (!/^\d{4}$/.test(newPin)) {
      setPinError('PIN 4 haneli olmalı.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINler aynı değil.');
      return;
    }
    await changeAdminPin(newPin);
    setNewPin('');
    setConfirmPin('');
    setPinMessage('✅ PIN güncellendi.');
  };

  return (
    <Screen title="Ayarlar" onBack={() => router.back()} scroll keyboard>
      <View style={styles.container}>
        <Reveal>
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

        <Reveal delay={60}>
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

        <Reveal delay={120}>
          <GlassCard style={styles.card}>
            <Text style={[type.h3, { color: palette.ink }]}>🔐 Admin PIN</Text>
            <TextField
              label="Yeni PIN"
              value={newPin}
              onChangeText={(value) => setNewPin(value.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
            <TextField
              label="Yeni PIN (tekrar)"
              value={confirmPin}
              onChangeText={(value) => setConfirmPin(value.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              error={pinError ?? undefined}
            />
            {pinMessage ? (
              <Text style={[type.caption, { color: palette.success }]}>{pinMessage}</Text>
            ) : null}
            <Button
              label="PIN'İ GÜNCELLE"
              variant="glass"
              onPress={() => void changePin()}
              disabled={newPin.length < 4 || confirmPin.length < 4}
            />
          </GlassCard>
        </Reveal>

        <Reveal delay={180}>
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
  dangerActions: {
    gap: space.sm,
  },
});
