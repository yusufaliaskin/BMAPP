/**
 * Durum bileşenleri: EmptyState / ErrorView / LoadingView.
 * Her veri yüzeyi bu üç durumdan birini gösterebilir (§43);
 * hata mesajları her zaman çıkış yolu (tekrar dene) sunar (§8).
 */

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import { palette, space, type } from '@/theme';
import { Button } from './Button';

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.inner}>
        <Text style={styles.emoji} maxFontSizeMultiplier={1.1}>
          {emoji}
        </Text>
        <Text style={[type.h2, styles.center, { color: palette.ink }]}>{title}</Text>
        <Text style={[type.body, styles.center, { color: palette.inkSoft }]}>{message}</Text>
        {actionLabel && onAction ? (
          <Button label={actionLabel} onPress={onAction} variant="primary" style={styles.action} />
        ) : null}
      </View>
    </GlassCard>
  );
}

interface ErrorViewProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorView({
  title = 'Bir sorun oluştu',
  message,
  onRetry,
  retryLabel = 'Tekrar dene',
}: ErrorViewProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.inner}>
        <Text style={styles.emoji} maxFontSizeMultiplier={1.1}>
          😵‍💫
        </Text>
        <Text style={[type.h2, styles.center, { color: palette.ink }]}>{title}</Text>
        <Text style={[type.body, styles.center, { color: palette.inkSoft }]}>{message}</Text>
        {onRetry ? (
          <Button label={retryLabel} onPress={onRetry} variant="primary" style={styles.action} />
        ) : null}
      </View>
    </GlassCard>
  );
}

interface LoadingViewProps {
  label?: string;
}

export function LoadingView({ label = 'Yükleniyor…' }: LoadingViewProps) {
  return (
    <View style={styles.loading} accessibilityLabel={label} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={[type.bodySemi, { color: palette.inkSoft }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  inner: {
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
  },
  emoji: {
    fontSize: 46,
  },
  center: {
    textAlign: 'center',
  },
  action: {
    marginTop: space.sm,
    minWidth: 200,
  },
  loading: {
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.huge,
  },
});
