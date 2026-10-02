/**
 * CertificateView — sertifikanın uygulama içi önizlemesi.
 * Altın çift çerçeve, proje başlığı, öğrenci adı, derece, puan ve tarih (§19).
 */

import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass/GlassCard';
import type { AppConfig, Certificate, Student } from '@/domain/models';
import { formatDateLongTR } from '@/lib/format';
import { medal, palette, space, surface, type } from '@/theme';

interface CertificateViewProps {
  certificate: Certificate;
  student: Student;
  config: AppConfig;
}

export function CertificateView({ certificate, student, config }: CertificateViewProps) {
  const section = `${certificate.grade}/${certificate.section}`;

  return (
    <GlassCard glint level="strong" style={styles.outer}>
      <View style={styles.goldBorder}>
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
          <Text style={[type.body, styles.center, { color: palette.inkSoft }]}>
            Bu sertifika
          </Text>
          <Text style={[type.h1, styles.center, { color: palette.primary }]}>
            {student.fullName.toUpperCase()}
          </Text>
          <View style={styles.divider} />
          <Text style={[type.bodySemi, styles.center, { color: palette.ink }]}>
            {`${certificate.grade}. Sınıflar ${certificate.rank}.'liği başarısını belgelemek amacıyla verilmiştir.`}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={[type.label, { color: medal.gold }]}>⭐ {certificate.score} puan</Text>
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
            <Text style={[type.caption, { color: palette.inkFaint }]}>
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
  goldBorder: {
    borderWidth: 2,
    borderColor: medal.gold,
    borderRadius: 20,
    padding: space.xs,
  },
  inner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: surface.glassBorderSoft,
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
  divider: {
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: medal.gold,
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
