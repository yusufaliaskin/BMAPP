/**
 * Sertifika PDF üretimi — gerçek PDF (expo-print). Madalya sınıfına göre renk:
 * altın / gümüş / bronz. Web'de tarayıcı yazdırma penceresi (PDF olarak kaydet);
 * mobilde dosya üretilip paylaşılır (§19).
 */

import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { AppConfig, Certificate, Medal } from '@/domain/models';
import { MEDAL_LABEL } from '@/domain/models';
import { formatDateLongTR } from './format';

const MEDAL_COLORS: Record<Medal, { main: string; soft: string }> = {
  gold: { main: '#E89010', soft: '#FFF0C8' },
  silver: { main: '#8293B4', soft: '#EDF1F8' },
  bronze: { main: '#C77B3F', soft: '#F9E7D6' },
};

const MEDAL_GLYPH: Record<Medal, string> = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
};

function ordinalTR(rank: number): string {
  return `${rank}.`;
}

export function buildCertificateHtml(certificate: Certificate, config: AppConfig): string {
  const section = `${certificate.grade}/${certificate.section}`;
  const rankLabel = `${certificate.grade}. Sınıflar ${ordinalTR(certificate.rank)}liği`;
  const tone = MEDAL_COLORS[certificate.medal];
  const medalLabel = `${MEDAL_GLYPH[certificate.medal]} ${MEDAL_LABEL[certificate.medal].toUpperCase()} SERTİFİKA`;
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, 'Segoe UI', Roboto, sans-serif;
    background: #F4F8FF;
    color: #17233F;
    display: flex; align-items: center; justify-content: center;
    width: 297mm; height: 210mm;
  }
  .frame {
    width: 277mm; height: 190mm; border-radius: 6mm; padding: 4mm;
    background: linear-gradient(135deg, #5B6BF5, #7C5CF0);
  }
  .inner {
    width: 100%; height: 100%; border-radius: 4mm;
    background: #FFFFFF; border: 1mm solid ${tone.main};
    display: flex; flex-direction: column; align-items: center; justify-content: space-between;
    padding: 14mm 16mm; text-align: center;
  }
  .org { font-size: 5mm; letter-spacing: 2px; color: #5B6BF5; font-weight: 700; text-transform: uppercase; }
  .title { font-size: 15mm; font-weight: 800; color: #17233F; margin-top: 2mm; }
  .medal {
    display: inline-block; margin-top: 3mm; padding: 1.5mm 8mm; border-radius: 99mm;
    border: 0.5mm solid ${tone.main}; background: ${tone.soft};
    font-size: 5.5mm; font-weight: 800; color: ${tone.main}; letter-spacing: 1px;
  }
  .lead { font-size: 5mm; color: #5B6B8F; margin-top: 5mm; }
  .name { font-size: 17mm; font-weight: 800; color: #5B6BF5; margin: 3mm 0; }
  .line { width: 120mm; height: 0.8mm; background: ${tone.main}; border-radius: 1mm; }
  .achieve { font-size: 6.5mm; color: #17233F; font-weight: 600; margin-top: 2mm; }
  .meta { display: flex; gap: 12mm; margin-top: 5mm; }
  .meta .chip {
    background: #F4F8FF; border: 0.5mm solid #E4ECFC; border-radius: 3mm;
    padding: 3mm 8mm; font-size: 5mm; color: #17233F;
  }
  .meta .chip b { color: ${tone.main}; }
  .footer { display: flex; width: 100%; justify-content: space-between; align-items: flex-end; margin-top: 6mm; }
  .sign { font-size: 4.5mm; color: #17233F; text-align: center; }
  .sign .line2 { width: 40mm; height: 0.4mm; background: #8C99B5; margin-bottom: 2mm; }
  .no { font-size: 4mm; color: #8C99B5; }
</style>
</head>
<body>
  <div class="frame">
    <div class="inner">
      <div>
        <div class="org">${config.universityName} · ${config.projectTitle}</div>
        <div class="title">🏆 BAŞARI SERTİFİKASI</div>
        <div class="medal">${medalLabel}</div>
      </div>
      <div>
        <div class="lead">Bu sertifika</div>
        <div class="name">${certificate.displayName.toUpperCase()}</div>
        <div class="line"></div>
        <div class="achieve">${rankLabel} başarısını belgelemek amacıyla verilmiştir.</div>
        <div class="meta">
          <div class="chip"><b>${certificate.score}</b> puan</div>
          <div class="chip">${section} şubesi</div>
          <div class="chip">${formatDateLongTR(certificate.issuedAt)}</div>
        </div>
      </div>
      <div class="footer">
        <div class="sign"><div class="line2"></div>${config.signatoryLeft}</div>
        <div class="no">Sertifika No: ${certificate.number}</div>
        <div class="sign"><div class="line2"></div>${config.signatoryRight}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export interface CertificatePdfResult {
  /** Mobilde üretilen dosyanın yolu; web'de null (yazdırma penceresi açıldı). */
  uri: string | null;
}

export async function createCertificatePdf(
  certificate: Certificate,
  config: AppConfig,
  options?: { share?: boolean },
): Promise<CertificatePdfResult> {
  const html = buildCertificateHtml(certificate, config);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return { uri: null };
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (options?.share && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `${certificate.number} sertifikasını paylaş`,
      UTI: 'com.adobe.pdf',
    });
  }
  return { uri };
}

/** Üretilmiş PDF dosyasını paylaşır/kaydettirir (paylaş menüsü → "Dosyalara kaydet"). */
export async function shareCertificatePdfFile(
  uri: string,
  certificateNumber: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `${certificateNumber} — paylaş veya Dosyalara kaydet`,
    UTI: 'com.adobe.pdf',
  });
}
