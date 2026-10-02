/**
 * Test kurgulama motoru — sınıf seviyesine göre soru seçimi (brief §3, §41/Aşama 4-5).
 * Soru sayısı ve zorluk config'ten (gradeSettings) gelir; koda gömülü değildir.
 * Seçim deterministiktir (Math.random yok — §37): aynı öğrenci + deneme numarası
 * her zaman aynı soru setini üretir; deneme ilerledikçe havuz döndürülür.
 */

import type { AppConfig, Grade, GradeSettings, Question, TestResult } from '../models';

export interface TestPlan {
  questions: Question[];
  settings: GradeSettings;
  attempt: number;
  totalPoints: number;
}

export function attemptCountFor(results: TestResult[], studentId: string, grade: Grade): number {
  return results.filter((r) => r.studentId === studentId && r.grade === grade).length;
}

export interface AttemptAvailability {
  allowed: boolean;
  reason?: string;
  attemptsUsed: number;
  maxAttempts: number | null;
}

/** Deneme hakkı kontrolü — politika config'ten (§33). */
export function canAttempt(
  results: TestResult[],
  studentId: string,
  grade: Grade,
  config: AppConfig,
): AttemptAvailability {
  const attemptsUsed = attemptCountFor(results, studentId, grade);
  if (config.retakePolicy === 'first' && attemptsUsed >= 1) {
    return {
      allowed: false,
      reason: 'Bu testi zaten tamamladın. Sonucun sıralamada görünüyor.',
      attemptsUsed,
      maxAttempts: 1,
    };
  }
  if (config.retakePolicy === 'max_attempts' && attemptsUsed >= config.maxAttempts) {
    return {
      allowed: false,
      reason: `Deneme hakkın doldu (${config.maxAttempts} deneme).`,
      attemptsUsed,
      maxAttempts: config.maxAttempts,
    };
  }
  return { allowed: true, attemptsUsed, maxAttempts: null };
}

/**
 * Test planı üretir. Havuz, id'ye göre sıralanır; başlangıç ofseti deneme sayısıyla
 * döndürülür ki her denemede farklı bir kesit gelsin. Havuz istenen sayıdan küçükse
 * tümü kullanılır.
 */
export function buildTestPlan(
  questions: Question[],
  grade: Grade,
  settings: GradeSettings,
  attempt: number,
): TestPlan {
  const pool = questions
    .filter((q) => q.grade === grade && q.isActive)
    .sort((a, b) => a.id.localeCompare(b.id));
  const count = Math.max(1, Math.min(settings.questionCount, pool.length));
  const offset = pool.length > 0 ? (attempt * count) % pool.length : 0;
  const selected: Question[] = [];
  for (let i = 0; i < count; i += 1) {
    selected.push(pool[(offset + i) % pool.length]);
  }
  const unique = Array.from(new Map(selected.map((q) => [q.id, q])).values());
  return {
    questions: unique,
    settings,
    attempt,
    totalPoints: unique.reduce((sum, q) => sum + q.points, 0),
  };
}
