/**
 * Sıralama motoru — sınıf seviyesine göre ayrı listeler (brief §16, §34).
 * Kiosk modeli: her test sonucu benzersiz bir katılımcıya aittir; sıralama doğrudan
 * sonuç kayıtları üzerinden kurulur. Deterministik tie-break:
 * 1) yüksek puan, 2) az yanlış, 3) erken tamamlama, 4) katılımcı kodu.
 */

import type { Grade, RankEntry, TestResult } from '../models';
import { sectionOf } from '../models';

export function rankForGrade(results: TestResult[], grade: Grade): RankEntry[] {
  const entries = results.filter((result) => result.grade === grade);
  entries.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.wrong !== b.wrong) return a.wrong - b.wrong;
    if (a.completedAt !== b.completedAt) return a.completedAt < b.completedAt ? -1 : 1;
    return a.participantCode < b.participantCode ? -1 : 1;
  });
  return entries.map((result, index) => ({
    resultId: result.id,
    participantCode: result.participantCode,
    displayName: result.displayName,
    grade: result.grade,
    section: sectionOf(result.classId),
    score: result.score,
    correct: result.correct,
    wrong: result.wrong,
    completedAt: result.completedAt,
    rank: index + 1,
  }));
}

export function rankForSection(results: TestResult[], grade: Grade, section: string): RankEntry[] {
  const inSection = results.filter(
    (result) => result.grade === grade && sectionOf(result.classId) === section,
  );
  return rankForGrade(inSection, grade);
}

export function rankOf(entries: RankEntry[], resultId: string): RankEntry | undefined {
  return entries.find((entry) => entry.resultId === resultId);
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
  classes: { id: string; grade: Grade; section: string; isActive: boolean }[],
  grade: Grade,
): SectionStanding[] {
  return classes
    .filter((c) => c.grade === grade && c.isActive)
    .map((c) => {
      const scored = results.filter((result) => result.classId === c.id);
      const totalScore = scored.reduce((sum, result) => sum + result.score, 0);
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
