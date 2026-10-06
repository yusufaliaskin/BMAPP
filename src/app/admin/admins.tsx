/**
 * Admin — Yöneticiler: hesap ekleme, PIN belirleme/değiştirme ve silme.
 * PIN'ler hash + tuz ile saklanır; son yönetici silinemez (panele giriş kapısı açık kalır).
 * Giriş: kiosk isim ekranına "admin" yazılır → buradaki PIN'lerden biri girilir.
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Reveal } from '@/components/ui/Reveal';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { addAdmin, changeAdminPin, deleteAdmin } from '@/data/actions';
import { useAdmins } from '@/data/hooks';
import { formatDateTR } from '@/lib/format';
import { glassSurface, palette, radius, space, type } from '@/theme';

export default function AdminAdminsScreen() {
  const router = useRouter();
  const admins = useAdmins();

  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [addMessage, setAddMessage] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [pinEditId, setPinEditId] = useState<string | null>(null);
  const [editPin, setEditPin] = useState('');
  const [editPin2, setEditPin2] = useState('');
  const [rowMessage, setRowMessage] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const submitAdd = async () => {
    if (busy) return;
    setAddError(null);
    setAddMessage(null);
    if (newPin !== newPin2) {
      setAddError('PINler aynı değil.');
      return;
    }
    setBusy(true);
    const result = await addAdmin(newName, newPin);
    setBusy(false);
    if (!result.ok) {
      setAddError(result.error ?? 'Eklenemedi.');
      return;
    }
    setNewName('');
    setNewPin('');
    setNewPin2('');
    setAddMessage('✅ Yönetici eklendi.');
  };

  const submitPinChange = async (adminId: string) => {
    if (busy) return;
    setRowError(null);
    setRowMessage(null);
    if (editPin !== editPin2) {
      setRowError('PINler aynı değil.');
      return;
    }
    setBusy(true);
    const result = await changeAdminPin(adminId, editPin);
    setBusy(false);
    if (!result.ok) {
      setRowError(result.error ?? 'Güncellenemedi.');
      return;
    }
    setPinEditId(null);
    setEditPin('');
    setEditPin2('');
    setRowMessage('✅ PIN güncellendi.');
  };

  const confirmDelete = (adminId: string, name: string) => {
    setRowError(null);
    setRowMessage(null);
    const result = deleteAdmin(adminId);
    setConfirmDeleteId(null);
    if (!result.ok) {
      setRowError(result.error ?? 'Silinemedi.');
      return;
    }
    setRowMessage(`🗑️ ${name} silindi.`);
  };

  return (
    <Screen title={`Yöneticiler (${admins.length})`} onBack={() => router.back()} scroll keyboard>
      <View style={styles.container}>
        {rowMessage ? (
          <GlassCard padded={false}>
            <Text style={[type.caption, styles.messageText, { color: palette.success }]}>
              {rowMessage}
            </Text>
          </GlassCard>
        ) : null}
        {rowError ? (
          <GlassCard padded={false}>
            <Text style={[type.caption, styles.messageText, { color: palette.coral }]}>
              {rowError}
            </Text>
          </GlassCard>
        ) : null}

        <Reveal>
          <GlassCard contentStyle={styles.card}>
            <Text style={[type.h3, { color: palette.ink }]}>🧑‍💼 Yeni Yönetici</Text>
            <Text style={[type.caption, { color: palette.inkFaint }]}>
              Kiosk girişinde isim alanına “admin” yazılır ve bu kişinin PIN’i girilir.
            </Text>
            <TextField
              label="Yönetici adı"
              placeholder="Örn: Müdür"
              value={newName}
              onChangeText={(value) => {
                setNewName(value);
                if (addError) setAddError(null);
              }}
              maxLength={30}
            />
            <TextField
              label="PIN (4 hane)"
              value={newPin}
              onChangeText={(value) => setNewPin(value.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
            <TextField
              label="PIN (tekrar)"
              value={newPin2}
              onChangeText={(value) => setNewPin2(value.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              error={addError ?? undefined}
            />
            {addMessage ? (
              <Text style={[type.caption, { color: palette.success }]}>{addMessage}</Text>
            ) : null}
            <Button
              label="YÖNETİCİ EKLE"
              onPress={() => void submitAdd()}
              loading={busy}
              disabled={newName.trim().length < 2 || newPin.length < 4 || newPin2.length < 4}
            />
          </GlassCard>
        </Reveal>

        <Reveal delay={80}>
          <GlassCard contentStyle={styles.card}>
            <Text style={[type.h3, { color: palette.ink }]}>👥 Kayıtlı Yöneticiler</Text>
            {admins.map((admin) => {
              const editing = pinEditId === admin.id;
              const confirming = confirmDeleteId === admin.id;
              const lastOne = admins.length <= 1;
              return (
                <View key={admin.id} style={styles.adminRow}>
                  <View style={styles.adminHead}>
                    <View style={styles.adminInfo}>
                      <Text style={[type.bodyBold, { color: palette.ink }]}>{admin.name}</Text>
                      <Text style={[type.caption, { color: palette.inkFaint }]}>
                        {formatDateTR(admin.createdAt)} tarihinde eklendi
                        {lastOne ? ' · son yönetici' : ''}
                      </Text>
                    </View>
                    <View style={styles.adminActions}>
                      <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={`${admin.name} PIN değiştir`}
                        haptic="light"
                        onPress={() => {
                          setRowError(null);
                          setRowMessage(null);
                          setConfirmDeleteId(null);
                          setPinEditId(editing ? null : admin.id);
                          setEditPin('');
                          setEditPin2('');
                        }}
                        style={[styles.chipButton, glassSurface('strong')]}
                      >
                        <Text style={[type.caption, { color: palette.primary }]}>
                          {editing ? 'VAZGEÇ' : 'PIN DEĞİŞTİR'}
                        </Text>
                      </PressableScale>
                      <PressableScale
                        accessibilityRole="button"
                        accessibilityLabel={`${admin.name} sil`}
                        haptic="light"
                        disabled={lastOne}
                        onPress={() => {
                          setRowError(null);
                          setRowMessage(null);
                          setPinEditId(null);
                          setConfirmDeleteId(confirming ? null : admin.id);
                        }}
                        style={[
                          styles.chipButton,
                          styles.dangerChip,
                          lastOne ? styles.disabledChip : null,
                        ]}
                      >
                        <Text style={[type.caption, { color: palette.coral }]}>SİL</Text>
                      </PressableScale>
                    </View>
                  </View>

                  {editing ? (
                    <View style={styles.editArea}>
                      <TextField
                        label="Yeni PIN (4 hane)"
                        value={editPin}
                        onChangeText={(value) =>
                          setEditPin(value.replace(/[^0-9]/g, '').slice(0, 4))
                        }
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                      />
                      <TextField
                        label="Yeni PIN (tekrar)"
                        value={editPin2}
                        onChangeText={(value) =>
                          setEditPin2(value.replace(/[^0-9]/g, '').slice(0, 4))
                        }
                        keyboardType="number-pad"
                        secureTextEntry
                        maxLength={4}
                      />
                      <Button
                        label="PIN'İ KAYDET"
                        variant="glass"
                        onPress={() => void submitPinChange(admin.id)}
                        disabled={editPin.length < 4 || editPin2.length < 4}
                      />
                    </View>
                  ) : null}

                  {confirming ? (
                    <View style={styles.confirmArea}>
                      <Text style={[type.caption, { color: palette.coral }]}>
                        {admin.name} silinsin mi? Bu kişinin PIN’i artık çalışmaz.
                      </Text>
                      <View style={styles.confirmActions}>
                        <Button
                          label="EVET, SİL"
                          variant="danger"
                          size="md"
                          fullWidth={false}
                          onPress={() => confirmDelete(admin.id, admin.name)}
                        />
                        <Button
                          label="VAZGEÇ"
                          variant="glass"
                          size="md"
                          fullWidth={false}
                          onPress={() => setConfirmDeleteId(null)}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
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
  messageText: {
    padding: space.md,
  },
  card: {
    gap: space.md,
  },
  adminRow: {
    gap: space.sm,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23,35,63,0.06)',
  },
  adminHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  adminInfo: {
    flex: 1,
    gap: 2,
  },
  adminActions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  chipButton: {
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  dangerChip: {
    backgroundColor: palette.coralSoft,
    borderWidth: 1,
    borderColor: palette.coralSoft,
  },
  disabledChip: {
    opacity: 0.4,
  },
  editArea: {
    gap: space.sm,
    marginTop: space.xs,
  },
  confirmArea: {
    gap: space.sm,
    marginTop: space.xs,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: space.sm,
    flexWrap: 'wrap',
  },
});
