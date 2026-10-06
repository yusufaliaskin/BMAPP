/**
 * Sertifika motoru — her sınıf seviyesinin ilk 3'ü (brief §19, §20).
 * Kiosk modeli: katılımcı kodu + dönem ile eşleşir. Numara benzersiz:
 * {PREFIX}-{yıl}-{sınıf}-{sıra:3}  →  BEUN-2026-3-001
 * Sıra → madalya: 1 altın, 2 gümüş, 3 bronz. Aynı katılımcı + dönem için tekrar üretimde
 * mevcut numara korunur; sıra/puan/madalya güncellenir.
 */

import type { AppConfig, Certificate, Grade, Medal, RankEntry, TestResult } from '../models';
import { medalForRank } from '../models';

function nextNumber(
  prefix: string,
  period: string,
  grade: Grade,
  existing: Certificate[],
): string {
  const used = new Set(
    existing
      .filter((c) => c.number.startsWith(`${prefix}-${period}-${grade}-`))
      .map((c) => c.number),
  );
  let seq = 1;
  while (used.has(`${prefix}-${period}-${grade}-${String(seq).padStart(3, '0')}`)) {
    seq += 1;
  }
  return `${prefix}-${period}-${grade}-${String(seq).padStart(3, '0')}`;
}

export interface IssueOutcome {
  certificates: Certificate[];
  created: Certificate[];
  updated: Certificate[];
}

/** İlk 3 için sertifika üretir/günceller. Puanı 0 olanlar sertifika almaz. */
export function issueTop3(
  ranked: RankEntry[],
  grade: Grade,
  existing: Certificate[],
  config: AppConfig,
  makeId: () => string,
  nowIso: string,
): IssueOutcome {
  const created: Certificate[] = [];
  const updated: Certificate[] = [];
  const result = [...existing];

  for (const entry of ranked.filter((e) => e.rank <= 3 && e.score > 0)) {
    const rank = entry.rank as 1 | 2 | 3;
    const medal: Medal = medalForRank(rank);
    const currentIndex = result.findIndex(
      (c) =>
        c.participantCode === entry.participantCode &&
        c.grade === grade &&
        c.period === config.period,
    );
    if (currentIndex >= 0) {
      const current = result[currentIndex];
      const needsUpgrade =
        current.kind !== 'medal' || current.rank !== rank || current.score !== entry.score;
      if (needsUpgrade) {
        const next: Certificate = {
          ...current,
          displayName: entry.displayName,
          rank,
          medal,
          kind: 'medal',
          score: entry.score,
          issuedAt: nowIso,
        };
        result[currentIndex] = next;
        updated.push(next);
      }
      continue;
    }
    const certificate: Certificate = {
      id: makeId(),
      number: nextNumber(config.certificatePrefix, config.period, grade, result),
      participantCode: entry.participantCode,
      displayName: entry.displayName,
      grade,
      section: entry.section,
      rank,
      medal,
      kind: 'medal',
      score: entry.score,
      period: config.period,
      issuedAt: nowIso,
    };
    result.push(certificate);
    created.push(certificate);
  }

  return { certificates: result, created, updated };
}

export interface EnsureCertificateOutcome {
  certificates: Certificate[];
  certificate: Certificate;
  created: boolean;
}

/**
 * Katılımcının belgesini garanti eder: varsa (derece ya da katılım) aynen döner,
 * yoksa "katılım belgesi" üretir. Böylece her çocuk sonuç ekranından belgesini
 * alabilir; sıralamada ilk üçe girenin belgesi yönetici üretince madalyaya yükselir
 * (numara korunur). Aynı katılımcı + dönem için tek belge vardır.
 */
export function ensureCertificateForResult(
  result: TestResult,
  existing: Certificate[],
  config: AppConfig,
  makeId: () => string,
  nowIso: string,
): EnsureCertificateOutcome {
  const found = certificateForParticipant(existing, result.participantCode, config.period);
  if (found) return { certificates: existing, certificate: found, created: false };

  const section = result.classId.replace(/^\d/, '');
  const certificate: Certificate = {
    id: makeId(),
    number: nextNumber(config.certificatePrefix, config.period, result.grade, existing),
    participantCode: result.participantCode,
    displayName: result.displayName,
    grade: result.grade,
    section,
    rank: null,
    medal: null,
    kind: 'participation',
    score: result.score,
    period: config.period,
    issuedAt: nowIso,
  };
  return { certificates: [...existing, certificate], certificate, created: true };
}

export function certificateForParticipant(
  certificates: Certificate[],
  participantCode: string,
  period?: string,
): Certificate | undefined {
  return certificates.find(
    (c) => c.participantCode === participantCode && (period === undefined || c.period === period),
  );
}
