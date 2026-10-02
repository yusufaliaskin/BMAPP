/**
 * CertificateView — sertifikanın uygulama içi önizlemesi (kiosk uyarlaması).
 * Madalya sınıfına göre çerçeve rengi: altın / gümüş / bronz.
 * Alanlar: proje başlığı, katılımcı adı, derece, puan, tarih, numara, imzalar (§19).
 */

import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import type { AppConfig, Certificate } from '@/domain/models';
import { MEDAL_EMOJI, MEDAL_LABEL } from '@/domain/models';
import { formatDateLongTR } from '@/lib/format';
import { medal, palette, space, type } from '@/theme';

interface CertificateViewProps {
  certificate: Certificate;
  config: AppConfig;
}

const MEDAL_TONE = {
  gold: medal.gold,
  silver: medal.silver,
  bronze: medal.bronze,
} as const;

export function CertificateView({ certificate, config }: CertificateViewProps) {
  const tone = MEDAL_TONE[certificate.medal];
  const section = `${certificate.grade}/${certificate.section}`;

  return (
    <GlassCard glint level="strong" style={styles.outer}>
      <View style={[styles.medalBorder, { borderColor: tone }]}>
        <View style={styles.inner}>
          <Text style={[type.overline, styles.center, { color: palette.primary }]}>
            {config.universityName}
          </Text>
          <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
            {config.projectTitle}
          </Text>
          <Text style={[type.h2, styles.title, { color: palette.ink }]}>
            🏆 BAŞARI SERTİFİKASI
          </Text>
          <View style={[styles.medalChip, { backgroundColor: `${tone}22`, borderColor: tone }]}>
            <Text style={[type.label, { color: tone }]}>
              {MEDAL_EMOJI[certificate.medal]} {MEDAL_LABEL[certificate.medal].toUpperCase()}{' '}
              SERTİFİKA
            </Text>
          </View>
          <Text style={[type.body, styles.center, { color: palette.inkSoft }]}>Bu sertifika</Text>
          <Text style={[type.h1, styles.center, { color: palette.primary }]}>
            {certificate.displayName.toUpperCase()}
          </Text>
          <View style={[styles.divider, { backgroundColor: tone }]} />
          <Text style={[type.bodySemi, styles.center, { color: palette.ink }]}>
            {`${certificate.grade}. Sınıflar ${certificate.rank}.'liği başarısını belgelemek amacıyla verilmiştir.`}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={[type.label, { color: palette.rewardDeep }]}>
                ⭐ {certificate.score} puan
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Text style={[type.label, { color: palette.inkSoft }]}>🏫 {section}</Text>
            </View>
          </View>
          <Text style={[type.caption, styles.center, { color: palette.inkSoft }]}>
            {formatDateLongTR(certificate.issuedAt)}
          </Text>
          <View style={styles.footerRow}>
            <View style={styles.signCol}>
              <View style={styles.signLine} />
              <Text style={[type.caption, { color: palette.inkSoft }]}>
                {config.signatoryLeft}
              </Text>
            </View>
            <Text style={[type.caption, styles.center, { color: palette.inkFaint }]}>
              No: {certificate.number}
            </Text>
            <View style={styles.signCol}>
              <View style={styles.signLine} />
              <Text style={[type.caption, { color: palette.inkSoft }]}>
                {config.signatoryRight}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  outer: {
    padding: space.sm,
  },
  medalBorder: {
    borderWidth: 2,
    borderRadius: 20,
    padding: space.xs,
  },
  inner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(23,35,63,0.06)',
    padding: space.xl,
    gap: space.sm,
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
  },
  title: {
    marginTop: space.xs,
  },
  medalChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
    marginBottom: space.xs,
  },
  divider: {
    width: 120,
    height: 3,
    borderRadius: 2,
    marginVertical: space.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: space.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: space.xs,
  },
  metaChip: {
    backgroundColor: palette.rewardSoft,
    borderRadius: 999,
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: space.lg,
    gap: space.sm,
  },
  signCol: {
    alignItems: 'center',
    gap: space.xs,
  },
  signLine: {
    width: 72,
    height: 1,
    backgroundColor: palette.inkFaint,
  },
});
