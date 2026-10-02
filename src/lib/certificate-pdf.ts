/**
 * Sertifika PDF üretimi — klasik belge (A4 yatay): fildişi zemin, çift altın
 * çerçeve, lacivert serif başlık, el yazısı ad, köşe rozeti, balmumu mühür ve
 * iki imza bloğu. Metin, uygulama içi önizlemeyle birebir aynı kaynaktan
 * (certificate-copy) gelir; yazı tipleri platform üst kümesinden seçilir.
 *
 * Web'de tarayıcının yazdırma penceresi ("PDF olarak kaydet"), mobilde gerçek
 * PDF dosyası üretilip paylaşılır (§19).
 */

import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { AppConfig, Certificate, Medal } from '@/domain/models';
import { certificateCopy } from './certificate-copy';

const MEDAL_TONE: Record<Medal, { main: string; deep: string }> = {
  gold: { main: '#C9A227', deep: '#8A6B10' },
  silver: { main: '#8D9CB8', deep: '#5F6E88' },
  bronze: { main: '#C07A45', deep: '#8A5327' },
};

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SCRIPT = "'Dancing Script', 'Snell Roundhand', 'Segoe Script', cursive";

/** Katılımcı adı admin tarafından değil çocuk tarafından yazılır: HTML'e ham giremez. */
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
  const tone = MEDAL_TONE[certificate.medal];
  const text = (value: string) => escapeHtml(value);
  // Uzun adlar tek satıra sığmalı — önizlemeyle aynı eşikler (PDF birimi: mm).
  const nameSize = copy.name.length > 26 ? '12mm' : copy.name.length > 18 ? '15mm' : '19mm';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<style>
  @page { size: 297mm 210mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { width: 297mm; height: 210mm; background: #ffffff; }
  body { display: flex; align-items: center; justify-content: center; font-family: ${SERIF}; color: #17233F; }
  .sheet {
    width: 289mm; height: 202mm; margin: 4mm; padding: 2.4mm;
    background: linear-gradient(150deg, #FBF4E4, #F4E8CE);
    border: 1.7mm solid ${tone.main}; border-radius: 2mm;
  }
  .paper {
    position: relative; width: 100%; height: 100%;
    border: 0.5mm solid ${tone.deep}; border-radius: 1mm;
    padding: 11mm 18mm 8mm; display: flex; flex-direction: column; align-items: center; text-align: center;
  }
  .rosette { position: absolute; left: 7mm; top: 7mm; width: 24mm; height: 33mm; }
  .rosette .tail { position: absolute; top: 13mm; width: 6mm; height: 19mm; }
  .rosette .tail.left { left: 4.5mm; background: ${tone.main}; transform: rotate(-13deg); }
  .rosette .tail.right { left: 13.5mm; background: ${tone.deep}; transform: rotate(13deg); }
  .rosette .disc {
    position: absolute; left: 0; top: 0; width: 21mm; height: 21mm; border-radius: 50%;
    background: #17233F; border: 1.3mm solid ${tone.main};
    display: flex; align-items: center; justify-content: center;
  }
  .rosette .ring { position: absolute; width: 16.5mm; height: 16.5mm; border-radius: 50%; border: 0.35mm solid #E7CE7A; opacity: .75; }
  .rosette .star { position: relative; font-size: 8.5mm; line-height: 9mm; color: ${tone.main}; }
  .plate {
    position: absolute; right: 7mm; top: 8mm; border: 0.45mm solid ${tone.main}; border-radius: 1.5mm;
    padding: 2mm 4mm; display: flex; flex-direction: column; align-items: center; gap: .6mm;
  }
  .plate .k { font-size: 3.4mm; letter-spacing: .8mm; text-transform: uppercase; color: #9C7A16; }
  .plate .v { font-size: 5mm; font-weight: 700; color: #17233F; }
  .plate .p { font-size: 3.4mm; color: #3C4A68; }
  .head { display: flex; flex-direction: column; align-items: center; gap: 2.6mm; margin-top: 1mm; }
  .university { font-size: 5.4mm; letter-spacing: 1.7mm; text-transform: uppercase; }
  .ornament { display: flex; align-items: center; gap: 2.4mm; }
  .ornament .rule { width: 22mm; height: .35mm; background: ${tone.main}; }
  .ornament .dot { font-size: 3.6mm; color: ${tone.main}; }
  .project { font-size: 5.8mm; font-style: italic; color: #3C4A68; }
  .title { font-size: 17mm; line-height: 19mm; font-weight: 700; letter-spacing: 1.3mm; text-transform: uppercase; margin-top: 7mm; }
  .medal { font-size: 6mm; letter-spacing: 1.5mm; color: ${tone.deep}; font-weight: 700; margin-top: 2.4mm; }
  .owner { font-size: 5.2mm; letter-spacing: 1.5mm; text-transform: uppercase; color: #9C7A16; margin-top: 8mm; }
  .name { font-family: ${SCRIPT}; font-size: ${nameSize}; line-height: 21mm; margin-top: .5mm; }
  .underline { width: 95mm; height: .5mm; background: ${tone.main}; margin-top: 1.5mm; }
  .achieve { font-size: 5.9mm; line-height: 8.4mm; color: #3C4A68; max-width: 180mm; margin-top: 3mm; }
  .footer { display: flex; width: 100%; align-items: flex-end; justify-content: space-between; margin-top: auto; }
  .sign { width: 55mm; display: flex; flex-direction: column; align-items: center; gap: 1.4mm; }
  .sign .line { width: 47mm; height: .35mm; background: rgba(23,35,63,.55); }
  .sign .role { font-size: 5.2mm; font-weight: 700; }
  .sign .caption { font-size: 3.7mm; letter-spacing: .8mm; text-transform: uppercase; color: #3C4A68; }
  .seal {
    position: relative;
    width: 30mm; height: 30mm; border-radius: 50%; background: #A32020;
    border: 1mm solid #7A1616; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #FFF3E2; margin-bottom: .8mm;
  }
  .seal .ring { position: absolute; width: 25.5mm; height: 25.5mm; border-radius: 50%; border: .4mm solid rgba(255,236,214,.6); }
  .seal .star { font-size: 4.4mm; line-height: 5mm; color: #F7DFC8; }
  .seal .word { position: relative; font-size: 3.9mm; letter-spacing: .25mm; font-weight: 700; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="paper">
      <div class="rosette">
        <div class="tail left"></div>
        <div class="tail right"></div>
        <div class="disc"><div class="ring"></div><div class="star">&#9733;</div></div>
      </div>
      <div class="plate">
        <div class="k">Belge No</div>
        <div class="v">${text(copy.numberLabel)}</div>
        <div class="p">${text(copy.periodLabel)}</div>
      </div>

      <div class="head">
        <div class="university">${text(copy.university)}</div>
        <div class="ornament"><div class="rule"></div><div class="dot">&#9670;</div><div class="rule"></div></div>
        <div class="project">${text(copy.project)}</div>
      </div>

      <div class="title">${text(copy.title)}</div>
      <div class="medal">${text(copy.medalLine)}</div>

      <div class="owner">${text(copy.ownerLabel)}</div>
      <div class="name">${text(copy.name)}</div>
      <div class="underline"></div>
      <div class="achieve">${text(copy.achievement)}</div>

      <div class="footer">
        <div class="sign">
          <div class="line"></div>
          <div class="role">${text(copy.leftRole)}</div>
          <div class="caption">${text(copy.signatureCaption)}</div>
        </div>
        <div class="seal"><div class="ring"></div><div class="star">&#9733;</div><div class="word">${text(copy.sealText)}</div></div>
        <div class="sign">
          <div class="line"></div>
          <div class="role">${text(copy.rightRole)}</div>
          <div class="caption">${text(copy.signatureCaption)}</div>
        </div>
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
