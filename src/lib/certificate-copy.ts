/**
 * Sertifika metni — tek kaynak. Uygulama içi önizleme (CertificateView) ve PDF
 * üretimi (certificate-pdf) aynı cümleleri kullanır.
 * Belge yalnızca sıralamada ilk üç için üretilir (Altın / Gümüş / Bronz).
 */

import type { AppConfig, Certificate, Medal } from '@/domain/models';
import { MEDAL_LABEL } from '@/domain/models';
import { formatDateLongTR } from './format';

export interface CertificateCopy {
  university: string;
  title: string;
  ownerLabel: string;
  name: string;
  /** Başarı satırı: "1.'lik derece (Altın Madalya)" veya "Katılımını tamamladı". */
  achievementLine: string;
  /** Kısa künye: "3/B · 80 puan · 02.10.2026". */
  detailLine: string;
  date: string;
  numberLabel: string;
  sealText: string;
  signatureCaption: string;
  leftRole: string;
  rightRole: string;
}

/** Türkçe sıra sayısı son eki: 1'lik, 2'lik, 3'lük. */
const RANK_SUFFIX: Record<1 | 2 | 3, string> = { 1: "1'lik", 2: "2'lik", 3: "3'lük" };

const MEDAL_TITLE: Record<Medal, string> = {
  gold: 'Altın Madalya',
  silver: 'Gümüş Madalya',
  bronze: 'Bronz Madalya',
};

export function certificateCopy(certificate: Certificate, config: AppConfig): CertificateCopy {
  const date = formatDateLongTR(certificate.issuedAt);
  // Eski/katılım kayıtlarında derece bilgisi boş olabilir; güvenli metin üretilir.
  const rank = certificate.rank;
  const medal = certificate.medal;
  const achievementLine =
    rank && medal
      ? `${RANK_SUFFIX[rank]} derece · ${MEDAL_TITLE[medal]}`
      : 'Farkındalık testini tamamladı';
  return {
    university: config.universityName,
    title: 'BAŞARI SERTİFİKASI',
    ownerLabel: 'Belge Sahibi',
    name: certificate.displayName,
    achievementLine,
    detailLine: `${certificate.grade}/${certificate.section} · ${certificate.score} puan · ${date}`,
    date,
    numberLabel: certificate.number,
    sealText: 'ONAYLANDI',
    signatureCaption: 'İmza',
    leftRole: config.signatoryLeft,
    rightRole: config.signatoryRight,
  };
}

/** Ekran okuyucu için tek cümlelik özet (belge görsel, metin olarak okunur). */
export function certificateAccessibilityLabel(certificate: Certificate, config: AppConfig): string {
  const copy = certificateCopy(certificate, config);
  return (
    `${copy.title} — ${certificate.medal ? MEDAL_LABEL[certificate.medal] : 'katılım'} belgesi. Belge sahibi ${copy.name}. ` +
    `${copy.achievementLine}. ${copy.detailLine}. Belge numarası ${copy.numberLabel}.`
  );
}
