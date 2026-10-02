/**
 * Sertifika motoru — her sınıf seviyesinin ilk 3'ü (brief §19, §20).
 * Numara benzersizdir: {PREFIX}-{yıl}-{sınıf}-{sıra:3}  →  BEUN-2026-3-001
 * Aynı öğrenci + dönem için tekrar üretimde mevcut numara korunur; sıra/puan güncellenir.
 */

import type { AppConfig, Certificate, Grade, RankEntry, Student } from '../models';

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
  students: Student[],
  existing: Certificate[],
  config: AppConfig,
  makeId: () => string,
  nowIso: string,
): IssueOutcome {
  const created: Certificate[] = [];
  const updated: Certificate[] = [];
  const result = [...existing];

  for (const entry of ranked.filter((e) => e.rank <= 3 && e.score > 0)) {
    const student = students.find((s) => s.id === entry.studentId);
    if (!student) continue;
    const rank = entry.rank as 1 | 2 | 3;
    const currentIndex = result.findIndex(
      (c) => c.studentId === entry.studentId && c.grade === grade && c.period === config.period,
    );
    if (currentIndex >= 0) {
      const current = result[currentIndex];
      if (current.rank !== rank || current.score !== entry.score) {
        const next: Certificate = { ...current, rank, score: entry.score, issuedAt: nowIso };
        result[currentIndex] = next;
        updated.push(next);
      }
      continue;
    }
    const certificate: Certificate = {
      id: makeId(),
      number: nextNumber(config.certificatePrefix, config.period, grade, result),
      studentId: entry.studentId,
      grade,
      section: student.classId.replace(String(grade), ''),
      rank,
      score: entry.score,
      period: config.period,
      issuedAt: nowIso,
    };
    result.push(certificate);
    created.push(certificate);
  }

  return { certificates: result, created, updated };
}

export function certificateForStudent(
  certificates: Certificate[],
  studentId: string,
  period?: string,
): Certificate | undefined {
  return certificates.find(
    (c) => c.studentId === studentId && (period === undefined || c.period === period),
  );
}

export function medalForRank(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}
