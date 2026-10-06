/**
 * ConfirmDialog — "Emin misin?" onay penceresi (kiosk).
 * Akışı bozan hareketlerden (çıkış, iptal, silme) önce tek tip onay ister:
 * karartılmış zemin + ortada cam kart; güvenli seçenek ÜSTTE, vazgeçilebilir aksiyon altta.
 */

import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from './Button';
import { surface, palette, space, type } from '@/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Güvenli/iptal seçeneği (üstte). */
  cancelLabel?: string;
  /** Asıl aksiyon (altta). */
  confirmLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  cancelLabel = 'VAZGEÇ',
  confirmLabel = 'ÇIK',
  destructive = true,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <GlassCard level="strong" glint style={styles.card} contentStyle={styles.cardContent}>
        <Text style={[type.h3, styles.center, { color: palette.ink }]}>{title}</Text>
        {message ? (
          <Text style={[type.body, styles.center, { color: palette.inkSoft }]}>{message}</Text>
        ) : null}
        <Button label={cancelLabel} variant="glass" onPress={onCancel} />
        <Button
          label={confirmLabel}
          variant={destructive ? 'danger' : 'primary'}
          onPress={onConfirm}
        />
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: surface.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    zIndex: 10,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: palette.white,
  },
  cardContent: {
    gap: space.md,
  },
  center: {
    textAlign: 'center',
  },
});
