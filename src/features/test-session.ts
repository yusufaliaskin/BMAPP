/**
 * Aktif test oturumu — bellek içi, ekranlar arası geçici durum.
 * Test bitmeden kapanırsa sonuç kaydedilmez (§15: yalnız tamamlanmış test puanlanır);
 * derin bağlantıyla soru ekranına gelinirse start ekranına geri yönlendirilir.
 */

import type { Grade } from '@/domain/models';
import type { TestPlan } from '@/domain/engine/quiz';

export interface TestSession {
  plan: TestPlan;
  studentId: string;
  grade: Grade;
  classId: string;
  startedAt: string;
}

let session: TestSession | null = null;

export function startTestSession(next: TestSession): void {
  session = next;
}

export function getTestSession(): TestSession | null {
  return session;
}

export function clearTestSession(): void {
  session = null;
}
