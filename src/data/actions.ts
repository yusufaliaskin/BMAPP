/**
 * İşlemler (actions) — UI'ın veri yazmak için kullandığı tek kapı.
 * Puan/sertifika hesapları burada, motor üzerinden yapılır; ekranlar asla doğrudan
 * koleksiyonlara yazmaz (§35). Kiosk modeli: sonuçlar benzersiz katılımcı kodu taşır.
 */

import type {
  AdminUser,
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

export interface AdminMutationResult {
  ok: boolean;
  error?: string;
}

/** Yeni yönetici ekler; PIN doğrulanır ve hash'lenerek saklanır. */
export async function addAdmin(name: string, pin: string): Promise<AdminMutationResult> {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { ok: false, error: 'Yönetici adı en az 2 karakter olmalı.' };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { ok: false, error: 'PIN 4 haneli olmalı.' };
  }
  const { data } = getState();
  if (
    data.admins.some(
      (admin) => admin.name.toLocaleLowerCase('tr') === trimmed.toLocaleLowerCase('tr'),
    )
  ) {
    return { ok: false, error: 'Bu isimde bir yönetici zaten var.' };
  }
  const salt = makeSalt();
  const pinHash = await hashPin(pin, salt);
  const admin: AdminUser = {
    id: makeId(),
    name: trimmed,
    pinHash,
    salt,
    createdAt: new Date().toISOString(),
  };
  updateData((current) => ({ ...current, admins: [...current.admins, admin] }));
  await flushPersist();
  return { ok: true };
}

export async function changeAdminPin(adminId: string, pin: string): Promise<AdminMutationResult> {
  if (!/^\d{4}$/.test(pin)) {
    return { ok: false, error: 'PIN 4 haneli olmalı.' };
  }
  const { data } = getState();
  if (!data.admins.some((admin) => admin.id === adminId)) {
    return { ok: false, error: 'Yönetici bulunamadı.' };
  }
  const salt = makeSalt();
  const pinHash = await hashPin(pin, salt);
  updateData((current) => ({
    ...current,
    admins: current.admins.map((admin) =>
      admin.id === adminId ? { ...admin, pinHash, salt } : admin,
    ),
  }));
  await flushPersist();
  return { ok: true };
}

/** Yönetici siler — son yönetici silinemez (panele giriş kapısı açık kalmalı). */
export function deleteAdmin(adminId: string): AdminMutationResult {
  const { data } = getState();
  if (data.admins.length <= 1) {
    return { ok: false, error: 'Son yönetici silinemez.' };
  }
  if (!data.admins.some((admin) => admin.id === adminId)) {
    return { ok: false, error: 'Yönetici bulunamadı.' };
  }
  updateData((current) => ({
    ...current,
    admins: current.admins.filter((admin) => admin.id !== adminId),
  }));
  void flushPersist();
  return { ok: true };
}

/** Katılımcı kaydını siler; aynı katılımcının sertifikaları da silinir (yeniden üretilebilir). */
export function deleteParticipantResult(resultId: string): void {
  updateData((data) => {
    const target = data.results.find((result) => result.id === resultId);
    if (!target) return data;
    return {
      ...data,
      results: data.results.filter((result) => result.id !== resultId),
      certificates: data.certificates.filter(
        (certificate) => certificate.participantCode !== target.participantCode,
      ),
    };
  });
  void flushPersist();
}

/**
 * Katılımcının sınıf/şubesini düzeltir (yanlış seçim telafisi).
 * Sıralama yeni sınıfa göre işler; varsa sertifika kaydının grade/section alanları da
 * güncellenir (numara değişmez — benzersiz kimlik korunur).
 */
export function updateParticipantClass(resultId: string, grade: Grade, section: string): void {
  updateData((data) => {
    const target = data.results.find((result) => result.id === resultId);
    if (!target) return data;
    const classId = `${grade}${section}`;
    return {
      ...data,
      results: data.results.map((result) =>
        result.id === resultId ? { ...result, grade, classId } : result,
      ),
      certificates: data.certificates.map((certificate) =>
        certificate.participantCode === target.participantCode
          ? { ...certificate, grade, section }
          : certificate,
      ),
    };
  });
  void flushPersist();
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
    // Elle kaydedilen soru artık admin'e aittir: tohum senkronizasyonu üstüne yazmaz.
    const owned: Question = { ...question, edited: true };
    return {
      ...data,
      questions: exists
        ? data.questions.map((q) => (q.id === question.id ? owned : q))
        : [...data.questions, owned],
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
