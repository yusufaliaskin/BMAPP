/**
 * Test kurgulama motoru — sınıf seviyesine göre soru seçimi (brief §3).
 * Kiosk modeli: katılımcı teste yalnız BİR kez girer; deneme/tekrar kavramı yoktur.
 * Seçim deterministiktir (Math.random yok — §37): aktif sorular id'ye göre sıralanır,
 * ayarlı soru sayısı kadar alınır. Havuz istenen sayıdan küçükse tümü kullanılır.
 */

import type { Grade, GradeSettings, Question } from '../models';

export interface TestPlan {
  questions: Question[];
  settings: GradeSettings;
  totalPoints: number;
}

export function buildTestPlan(
  questions: Question[],
  grade: Grade,
  settings: GradeSettings,
): TestPlan {
  const pool = questions
    .filter((q) => q.grade === grade && q.isActive)
    .sort((a, b) => a.id.localeCompare(b.id));
  const count = Math.max(1, Math.min(settings.questionCount, pool.length));
  const selected = pool.slice(0, count);
  return {
    questions: selected,
    settings,
    totalPoints: selected.reduce((sum, q) => sum + q.points, 0),
  };
}
