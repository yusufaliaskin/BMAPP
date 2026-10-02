/**
 * Aktif test oturumu — bellek içi, ekranlar arası geçici durum (kiosk).
 * SIFIRLA bu modülü temizler; veritabanına dokunulmaz.
 * Test bitmeden uygulama kapanırsa sonuç kaydedilmez (yalnız tamamlanmış test puanlanır).
 */

import type { Grade } from '@/domain/models';
import type { TestPlan } from '@/domain/engine/quiz';

export interface TestSession {
  plan: TestPlan;
  participantCode: string;
  displayName: string;
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
