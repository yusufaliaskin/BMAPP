/**
 * Sertifika PDF üretimi — sade klasik belge (A4 yatay): fildişi zemin, çift altın
 * çerçeve, lacivert serif başlık, el yazısı ad, kısa künye, tarih, iki imza alanı
 * ve mühür. Metin, uygulama içi görünümle BİREBİR aynı kaynaktan gelir
 * (certificate-copy). Web'de tarayıcı yazdırma penceresi, mobilde gerçek PDF
 * dosyası üretilip paylaşılır.
 */

import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { AppConfig, Certificate } from '@/domain/models';
import { certificateCopy } from './certificate-copy';

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SCRIPT = "'Dancing Script', 'Snell Roundhand', 'Segoe Script', cursive";
const GOLD = '#C9A227';
const GOLD_DEEP = '#9C7A16';
const INK = '#17233F';
const INK_SOFT = '#3C4A68';

/** Katılımcı adı çocuk tarafından yazılır: HTML'e ham giremez. */
function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (char) => entities[char] ?? char);
}

export function buildCertificateHtml(certificate: Certificate, config: AppConfig): string {
  const copy = certificateCopy(certificate, config);
  const text = (value: string) => escapeHtml(value);
  // Uzun adlar tek satıra sığmalı (önizlemeyle aynı eşikler, PDF birimi: mm).
  const nameSize = copy.name.length > 26 ? '12mm' : copy.name.length > 18 ? '15mm' : '19mm';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<style>
  @page { size: 297mm 210mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { width: 297mm; height: 210mm; background: #ffffff; }
  body { display: flex; align-items: center; justify-content: center; font-family: ${SERIF}; color: ${INK}; }
  .sheet {
    width: 289mm; height: 202mm; margin: 4mm; padding: 2.4mm;
    background: linear-gradient(150deg, #FBF4E4, #F4E8CE);
    border: 1.7mm solid ${GOLD}; border-radius: 2mm;
  }
  .paper {
    width: 100%; height: 100%;
    border: 0.5mm solid ${GOLD_DEEP}; border-radius: 1mm;
    padding: 13mm 20mm 8mm; display: flex; flex-direction: column; align-items: center; text-align: center;
  }
  .university { font-size: 4.6mm; letter-spacing: 1.5mm; text-transform: uppercase; }
  .title { font-size: 16mm; line-height: 18mm; font-weight: 700; letter-spacing: 1.2mm; text-transform: uppercase; margin-top: 8mm; }
  .owner { font-size: 4.4mm; letter-spacing: 1.4mm; text-transform: uppercase; color: ${GOLD_DEEP}; margin-top: 9mm; }
  .name { font-family: ${SCRIPT}; font-size: ${nameSize}; line-height: 20mm; }
  .rule { width: 95mm; height: .5mm; background: ${GOLD}; margin-top: 2.5mm; }
  .achieve { font-size: 6mm; line-height: 8mm; margin-top: 4mm; }
  .detail { font-size: 4.8mm; line-height: 6.6mm; color: ${INK_SOFT}; margin-top: 1.5mm; }
  .footer { display: flex; width: 100%; align-items: flex-end; justify-content: space-between; margin-top: auto; }
  .sign { width: 55mm; display: flex; flex-direction: column; align-items: center; gap: 1.4mm; }
  .sign .line { width: 47mm; height: .35mm; background: rgba(23,35,63,.5); }
  .sign .role { font-size: 5.2mm; font-weight: 700; }
  .sign .caption { font-size: 3.7mm; letter-spacing: .8mm; text-transform: uppercase; color: ${INK_SOFT}; }
  .seal {
    position: relative; width: 27mm; height: 27mm; border-radius: 50%; background: #A32020;
    border: 0.9mm solid #7A1616; display: flex; align-items: center; justify-content: center;
    color: #FFF3E2; margin-bottom: .8mm;
  }
  .seal .ring { position: absolute; width: 23mm; height: 23mm; border-radius: 50%; border: .4mm solid rgba(255,236,214,.6); }
  .seal .word { position: relative; font-size: 3.6mm; letter-spacing: .2mm; font-weight: 700; }
  .number { font-size: 3.6mm; letter-spacing: .5mm; color: ${INK_SOFT}; margin-top: 4mm; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="paper">
      <div class="university">${text(copy.university)}</div>
      <div class="title">${text(copy.title)}</div>
      <div class="owner">${text(copy.ownerLabel)}</div>
      <div class="name">${text(copy.name)}</div>
      <div class="rule"></div>
      <div class="achieve">${text(copy.achievementLine)}</div>
      <div class="detail">${text(copy.detailLine)}</div>

      <div class="footer">
        <div class="sign">
          <div class="line"></div>
          <div class="role">${text(copy.leftRole)}</div>
          <div class="caption">${text(copy.signatureCaption)}</div>
        </div>
        <div class="seal"><div class="ring"></div><div class="word">${text(copy.sealText)}</div></div>
        <div class="sign">
          <div class="line"></div>
          <div class="role">${text(copy.rightRole)}</div>
          <div class="caption">${text(copy.signatureCaption)}</div>
        </div>
      </div>

      <div class="number">Belge No: ${text(copy.numberLabel)}</div>
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

/** Üretilmiş PDF dosyasını paylaşır/kaydettirir (paylaşım menüsü → "Dosyalara kaydet"). */
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
