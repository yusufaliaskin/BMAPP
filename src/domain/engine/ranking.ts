/**
 * Sıralama motoru — sınıf seviyesine göre ayrı listeler (brief §16, §34).
 * Deterministik tie-break: 1) yüksek puan, 2) az yanlış, 3) erken tamamlama, 4) öğrenci id.
 * Tekrar politikası burada uygulanır: 'best' → öğrencinin en iyi sonucu,
 * 'first' → ilk sonucu, 'max_attempts' → en iyi sonucu.
 */

import type { AppConfig, Grade, RankEntry, Student, TestResult } from '../models';

function isBetter(a: TestResult, b: TestResult): boolean {
  if (a.score !== b.score) return a.score > b.score;
  if (a.wrong !== b.wrong) return a.wrong < b.wrong;
  if (a.completedAt !== b.completedAt) return a.completedAt < b.completedAt;
  return a.id < b.id;
}

/** Öğrencinin politikaya göre temsilci sonucu. */
export function representativeResult(
  results: TestResult[],
  studentId: string,
  grade: Grade,
  policy: AppConfig['retakePolicy'],
): TestResult | undefined {
  const own = results.filter((r) => r.studentId === studentId && r.grade === grade);
  if (own.length === 0) return undefined;
  if (policy === 'first') {
    return [...own].sort((a, b) => a.completedAt.localeCompare(b.completedAt))[0];
  }
  return own.reduce((best, current) => (isBetter(current, best) ? current : best));
}

export function rankForGrade(
  results: TestResult[],
  students: Student[],
  grade: Grade,
  config: AppConfig,
): RankEntry[] {
  const entries: Omit<RankEntry, 'rank'>[] = [];
  for (const student of students) {
    if (student.grade !== grade) continue;
    const best = representativeResult(results, student.id, grade, config.retakePolicy);
    if (!best) continue;
    entries.push({
      studentId: student.id,
      score: best.score,
      correct: best.correct,
      wrong: best.wrong,
      completedAt: best.completedAt,
      resultId: best.id,
    });
  }
  entries.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.wrong !== b.wrong) return a.wrong - b.wrong;
    if (a.completedAt !== b.completedAt) return a.completedAt < b.completedAt ? -1 : 1;
    return a.studentId < b.studentId ? -1 : 1;
  });
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function rankForSection(
  results: TestResult[],
  students: Student[],
  grade: Grade,
  section: string,
  config: AppConfig,
): RankEntry[] {
  const inSection = new Set(
    students.filter((s) => s.grade === grade && s.classId === `${grade}${section}`).map((s) => s.id),
  );
  return rankForGrade(
    results.filter((r) => inSection.has(r.studentId)),
    students,
    grade,
    config,
  );
}

export function rankOf(entries: RankEntry[], studentId: string): RankEntry | undefined {
  return entries.find((e) => e.studentId === studentId);
}

export interface SectionStanding {
  classId: string;
  grade: Grade;
  section: string;
  totalScore: number;
  participants: number;
  averageScore: number;
}

export function sectionStandings(
  results: TestResult[],
  students: Student[],
  classes: { id: string; grade: Grade; section: string; isActive: boolean }[],
  grade: Grade,
  config: AppConfig,
): SectionStanding[] {
  return classes
    .filter((c) => c.grade === grade && c.isActive)
    .map((c) => {
      const members = students.filter((s) => s.classId === c.id);
      const scored = members
        .map((s) => representativeResult(results, s.id, grade, config.retakePolicy))
        .filter((r): r is TestResult => Boolean(r));
      const totalScore = scored.reduce((sum, r) => sum + r.score, 0);
      return {
        classId: c.id,
        grade: c.grade,
        section: c.section,
        totalScore,
        participants: scored.length,
        averageScore: scored.length > 0 ? Math.round(totalScore / scored.length) : 0,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore || a.classId.localeCompare(b.classId));
}
