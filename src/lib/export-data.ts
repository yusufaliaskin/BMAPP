/**
 * Veri dışa aktarma — kiosk cihazındaki tek kopya olan kayıtları yedeklemek için.
 *  · CSV: katılımcı + sertifika listesi (Excel-TR için `;` ayraç, UTF-8 BOM)
 *  · JSON: tam belge yedeği (sorular, sınıflar, sonuçlar, sertifikalar, ayarlar)
 *
 * Güvenlik: dışa aktarılan dosyalar yönetici `pinHash`/`salt` değerlerini İÇERMEZ —
 * 4 haneli bir PIN'in karması, paylaşılabilir bir dosyada barındırılacak kadar
 * dayanıklı değildir. Yönetici hesapları yalnız ad + oluşturma tarihi olarak yazılır.
 *
 * Web'de tarayıcı indirmesi (data URL), mobilde önbelleğe dosya yazılıp sistem
 * paylaşma menüsü açılır ("Dosyalara kaydet" / Drive).
 */

import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { DBData, DBState } from '@/domain/models';
import { certificateKindLabel } from '@/domain/models';

export interface ExportOutcome {
  fileName: string;
  characters: number;
  /** 'download' web indirmesi, 'share' mobil paylaşım menüsü, 'file' yalnızca dosya. */
  via: 'download' | 'share' | 'file';
}

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

const row = (cells: (string | number)[]): string => cells.map(csvCell).join(';');

export function buildParticipantsCsv(data: DBData): string {
  const participantRows = [...data.results]
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .map((result) =>
      row([
        result.participantCode,
        result.displayName,
        `${result.grade}. sınıf`,
        result.classId.replace(`${result.grade}`, ''),
        result.score,
        result.maxScore,
        result.correct,
        result.wrong,
        Math.round(result.durationMs / 1000),
        result.startedAt.replace('T', ' ').slice(0, 16),
        result.completedAt.replace('T', ' ').slice(0, 16),
      ]),
    );

  const certificateRows = [...data.certificates]
    .sort((a, b) => a.number.localeCompare(b.number))
    .map((certificate) =>
      row([
        certificate.number,
        certificate.displayName,
        `${certificate.grade}. sınıf`,
        certificate.section,
        certificate.rank === null ? 'Katılım' : `${certificate.rank}.`,
        certificateKindLabel(certificate),
        certificate.score,
        certificate.period,
        certificate.issuedAt.replace('T', ' ').slice(0, 16),
      ]),
    );

  const blocks = [
    `# Katılımcılar (${participantRows.length})`,
    row([
      'Katılımcı No',
      'Ad',
      'Sınıf',
      'Şube',
      'Puan',
      'Tam Puan',
      'Doğru',
      'Yanlış',
      'Süre (sn)',
      'Başlama',
      'Bitiş',
    ]),
    ...(participantRows.length > 0 ? participantRows : ['(henüz kayıt yok)']),
  ];

  if (certificateRows.length > 0) {
    blocks.push(
      '',
      `# Sertifikalar (${certificateRows.length})`,
      row(['Belge No', 'Ad', 'Sınıf', 'Şube', 'Derece', 'Madalya', 'Puan', 'Dönem', 'Düzenlenme']),
      ...certificateRows,
    );
  }

  return `﻿${blocks.join('\r\n')}\r\n`;
}

/** Yedek JSON — PIN karmaları çıkarılmış hâliyle. */
export function buildBackupJson(state: DBState): string {
  const { admins, ...rest } = state.data;
  return JSON.stringify(
    {
      app: 'Bilinçli Kahraman',
      schemaVersion: state.version,
      exportedAt: new Date().toISOString(),
      note: 'Yönetici PIN karmaları güvenlik nedeniyle yedeğe dahil edilmez.',
      data: {
        ...rest,
        admins: admins.map((admin) => ({
          id: admin.id,
          name: admin.name,
          createdAt: admin.createdAt,
        })),
      },
    },
    null,
    2,
  );
}

interface WebAnchor {
  href: string;
  download: string;
  style: { display: string };
  click: () => void;
}

interface WebDocumentLike {
  createElement: (tag: 'a') => WebAnchor;
  body?: {
    appendChild: (node: WebAnchor) => void;
    removeChild: (node: WebAnchor) => void;
  };
}

function downloadOnWeb(fileName: string, mime: string, text: string): void {
  const doc = (globalThis as { document?: WebDocumentLike }).document;
  const body = doc?.body;
  if (!doc || !body) throw new Error('Tarayıcı indirmesi bu ortamda kullanılamıyor.');
  const anchor = doc.createElement('a');
  anchor.href = `data:${mime};charset=utf-8,${encodeURIComponent(text)}`;
  anchor.download = fileName;
  anchor.style.display = 'none';
  body.appendChild(anchor);
  anchor.click();
  body.removeChild(anchor);
}

export async function exportTextFile(
  fileName: string,
  mime: string,
  text: string,
): Promise<ExportOutcome> {
  if (Platform.OS === 'web') {
    downloadOnWeb(fileName, mime, text);
    return { fileName, characters: text.length, via: 'download' };
  }

  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(text);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: mime, dialogTitle: fileName });
    return { fileName, characters: text.length, via: 'share' };
  }
  return { fileName, characters: text.length, via: 'file' };
}
