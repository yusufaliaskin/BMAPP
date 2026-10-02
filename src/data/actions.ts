/**
 * İşlemler (actions) — UI'ın veri yazmak için kullandığı tek kapı.
 * Puan/sertifika hesapları burada, motor üzerinden yapılır; ekranlar asla doğrudan
 * koleksiyonlara yazmaz (§35). Kiosk modeli: sonuçlar benzersiz katılımcı kodu taşır.
 */

import type {
  AppConfig,
  Grade,
  GradeSettings,
  Medal,
  Question,
  TestResult,
} from '../domain/models';
import type { AnswerInput } from '../domain/engine/scoring';
import { gradeTest } from '../domain/engine/scoring';
import { issueTop3 } from '../domain/engine/certificates';
import { rankForGrade } from '../domain/engine/ranking';
import { flushPersist, getState, updateData } from './db';
import { makeId, makeSalt, hashPin } from '../lib/pin';

export interface SaveResultInput {
  participantCode: string;
  displayName: string;
  grade: Grade;
  classId: string;
  startedAt: string;
  questions: Question[];
  answers: AnswerInput[];
}

export interface SaveResultOutcome {
  result: TestResult;
}

/** Test sonucunu motorla doğrular, hesaplar ve kaydeder. Başarısızsa hata fırlatır. */
export function saveTestResult(input: SaveResultInput): SaveResultOutcome {
  const { data } = getState();
  const code = input.participantCode.trim().toUpperCase();
  if (code.length === 0) {
    throw new Error('Katılımcı kodu eksik.');
  }
  if (data.results.some((r) => r.participantCode === code)) {
    throw new Error('Bu katılımcı kodu zaten kayıtlı.');
  }

  const graded = gradeTest(input.answers, input.questions);
  const completedDate = new Date();
  const completedAt = completedDate.toISOString();
  const result: TestResult = {
    id: makeId(),
    participantCode: code,
    displayName: input.displayName.trim(),
    grade: input.grade,
    classId: input.classId,
    startedAt: input.startedAt,
    completedAt,
    durationMs: Math.max(0, completedDate.getTime() - new Date(input.startedAt).getTime()),
    answers: graded.answers,
    correct: graded.correct,
    wrong: graded.wrong,
    score: graded.score,
    maxScore: graded.maxScore,
  };

  updateData((current) => ({ ...current, results: [...current.results, result] }));
  void flushPersist();
  return { result };
}

export interface IssueOutcomeSummary {
  createdNumbers: string[];
  createdMedals: Medal[];
  updatedCount: number;
}

/** Sınıf seviyesinin ilk 3'ü için sertifika üretir/günceller (§19, §24). */
export function issueCertificatesForGrade(grade: Grade): IssueOutcomeSummary {
  const { data } = getState();
  const ranked = rankForGrade(data.results, grade);
  const outcome = issueTop3(
    ranked,
    grade,
    data.certificates,
    data.config,
    makeId,
    new Date().toISOString(),
  );
  updateData((current) => ({ ...current, certificates: outcome.certificates }));
  void flushPersist();
  return {
    createdNumbers: outcome.created.map((c) => c.number),
    createdMedals: outcome.created.map((c) => c.medal),
    updatedCount: outcome.updated.length,
  };
}

export function updateConfig(partial: Partial<AppConfig>): void {
  updateData((data) => ({ ...data, config: { ...data.config, ...partial } }));
}

export async function changeAdminPin(newPin: string): Promise<void> {
  const salt = makeSalt();
  const pinHash = await hashPin(newPin, salt);
  updateConfig({ adminPinHash: pinHash, adminPinSalt: salt });
  await flushPersist();
}

export function updateGradeSetting(
  grade: Grade,
  partial: Partial<Omit<GradeSettings, 'grade'>>,
): void {
  updateData((data) => ({
    ...data,
    gradeSettings: data.gradeSettings.map((g) => (g.grade === grade ? { ...g, ...partial } : g)),
  }));
}

export function upsertQuestion(question: Question): void {
  updateData((data) => {
    const exists = data.questions.some((q) => q.id === question.id);
    return {
      ...data,
      questions: exists
        ? data.questions.map((q) => (q.id === question.id ? question : q))
        : [...data.questions, question],
    };
  });
}

export function setQuestionActive(questionId: string, isActive: boolean): void {
  updateData((data) => ({
    ...data,
    questions: data.questions.map((q) => (q.id === questionId ? { ...q, isActive } : q)),
  }));
}

/** Tüm katılımcı sonuçlarını ve sertifikaları siler; soru bankası ve ayarlar korunur. */
export function clearParticipantData(): void {
  updateData((data) => ({ ...data, results: [], certificates: [] }));
  void flushPersist();
}
