/**
 * Sertifika metni — tek kaynak. Uygulama içi önizleme (CertificateView) ve PDF
 * üretimi (certificate-pdf) aynı sözleri kullanır; böylece ekranda görünen belge
 * ile basılan belge birbirinden sapmaz. Unvan/etiketler admin ayarından gelir.
 */

import type { AppConfig, Certificate, Medal } from '@/domain/models';
import { MEDAL_LABEL } from '@/domain/models';
import { formatDateLongTR } from './format';

export interface CertificateCopy {
  university: string;
  project: string;
  title: string;
  medalLine: string;
  ownerLabel: string;
  name: string;
  achievement: string;
  date: string;
  rankLabel: string;
  scoreLabel: string;
  sectionLabel: string;
  sealText: string;
  signatureCaption: string;
  leftRole: string;
  rightRole: string;
  numberLabel: string;
  periodLabel: string;
}

/** Türkçe sıra sayısı son eki: 1'lik, 2'lik, 3'lük. */
const RANK_SUFFIX: Record<1 | 2 | 3, string> = { 1: "1'lik", 2: "2'lik", 3: "3'lük" };

const MEDAL_LINE: Record<Medal, string> = {
  gold: 'ALTIN MADALYA',
  silver: 'GÜMÜŞ MADALYA',
  bronze: 'BRONZ MADALYA',
};

export function certificateCopy(certificate: Certificate, config: AppConfig): CertificateCopy {
  const date = formatDateLongTR(certificate.issuedAt);
  const rankLabel = `${RANK_SUFFIX[certificate.rank]} derece`;
  return {
    university: config.universityName,
    project: config.projectTitle,
    title: 'BAŞARI SERTİFİKASI',
    medalLine: MEDAL_LINE[certificate.medal],
    ownerLabel: 'Belge Sahibi',
    name: certificate.displayName,
    achievement:
      `${date} tarihinde uygulanan farkındalık testinde ` +
      `${certificate.grade}. Sınıflar ${certificate.section} şubesi arasında ${certificate.score} puanla ` +
      `${rankLabel} kazanarak bu belgeyi almaya hak kazanmıştır.`,
    date,
    rankLabel,
    scoreLabel: `${certificate.score} puan`,
    sectionLabel: `${certificate.grade}. Sınıflar ${certificate.section} şubesi`,
    sealText: 'ONAYLANDI',
    signatureCaption: 'İmza',
    leftRole: config.signatoryLeft,
    rightRole: config.signatoryRight,
    numberLabel: certificate.number,
    periodLabel: `${certificate.period} dönemi`,
  };
}

/** Ekran okuyucu için tek cümlelik özet (görsel belge, düz metin olarak). */
export function certificateAccessibilityLabel(certificate: Certificate, config: AppConfig): string {
  const copy = certificateCopy(certificate, config);
  return (
    `${copy.title} — ${MEDAL_LABEL[certificate.medal]} madalya. ` +
    `Belge sahibi ${copy.name}. ${copy.achievement} Belge numarası ${copy.numberLabel}.`
  );
}
