/**
 * Rozet motoru — kurallar config'ten (badges koleksiyonu), rastgele verilmez (§18).
 * Bir test kaydedildikten sonra yeni kazanılan rozetler burada deterministik hesaplanır.
 */

import type { BadgeDef, StudentBadge, TestResult } from '../models';
import { percentOf } from './scoring';

export function evaluateNewBadges(
  results: TestResult[],
  badges: BadgeDef[],
  existing: StudentBadge[],
  studentId: string,
  latestResultId: string,
  earnedAt: string,
): StudentBadge[] {
  const own = results.filter((r) => r.studentId === studentId);
  const already = new Set(existing.filter((b) => b.studentId === studentId).map((b) => b.badgeId));
  const testsCount = own.length;
  const correctTotal = own.reduce((sum, r) => sum + r.correct, 0);
  const bestPercent = own.reduce((max, r) => Math.max(max, percentOf(r.score, r.maxScore)), 0);
  const hasPerfect = own.some((r) => r.maxScore > 0 && r.score === r.maxScore);

  const earned: StudentBadge[] = [];
  for (const badge of badges) {
    if (already.has(badge.id)) continue;
    const { kind, threshold = 0 } = badge.rule;
    const ok =
      (kind === 'first_test' && testsCount >= 1) ||
      (kind === 'tests_count' && testsCount >= threshold) ||
      (kind === 'min_percent' && bestPercent >= threshold) ||
      (kind === 'perfect' && hasPerfect) ||
      (kind === 'correct_total' && correctTotal >= threshold);
    if (ok) {
      earned.push({ studentId, badgeId: badge.id, earnedAt, resultId: latestResultId });
    }
  }
  return earned;
}
