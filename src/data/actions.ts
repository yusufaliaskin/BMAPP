/**
 * İşlemler (actions) — UI'ın veri yazmak için kullandığı tek kapı.
 * Puan/sıralama/rozet/sertifika hesapları burada, motor üzerinden yapılır;
 * ekranlar asla doğrudan koleksiyonlara yazmaz.
 */

import type {
  AppConfig,
  Grade,
  GradeSettings,
  Question,
  Student,
  StudentBadge,
  TestResult,
} from '../domain/models';
import type { AnswerInput } from '../domain/engine/scoring';
import { gradeTest } from '../domain/engine/scoring';
import { canAttempt } from '../domain/engine/quiz';
import { evaluateNewBadges } from '../domain/engine/badges';
import { issueTop3 } from '../domain/engine/certificates';
import { rankForGrade } from '../domain/engine/ranking';
import { flushPersist, getState, setSessionStudent, updateData } from './db';
import { makeId, makeSalt, hashPin } from '../lib/pin';

export interface NewStudentInput {
  fullName: string;
  characterId: string;
  nickname: string;
  emoji: string;
  grade: Grade;
  classId: string;
}

export function createStudent(input: NewStudentInput): Student {
  const student: Student = {
    id: makeId(),
    fullName: input.fullName.trim(),
    characterId: input.characterId,
    nickname: input.nickname,
    emoji: input.emoji,
    grade: input.grade,
    classId: input.classId,
    createdAt: new Date().toISOString(),
  };
  updateData((data) => ({ ...data, students: [...data.students, student] }));
  setSessionStudent(student.id);
  void flushPersist();
  return student;
}

export function signIn(studentId: string): void {
  setSessionStudent(studentId);
}

export function signOut(): void {
  setSessionStudent(null);
}

export function updateStudentAvatar(studentId: string, characterId: string, nickname: string, emoji: string): void {
  updateData((data) => ({
    ...data,
    students: data.students.map((s) =>
      s.id === studentId ? { ...s, characterId, nickname, emoji } : s,
    ),
  }));
}

export interface SaveResultInput {
  studentId: string;
  grade: Grade;
  classId: string;
  attempt: number;
  startedAt: string;
  questions: Question[];
  answers: AnswerInput[];
}

export interface SaveResultOutcome {
  result: TestResult;
  newBadges: StudentBadge[];
}

/** Test sonucunu motorla doğrular, hesaplar ve kaydeder. Başarısızsa hata fırlatır. */
export function saveTestResult(input: SaveResultInput): SaveResultOutcome {
  const { data } = getState();
  const availability = canAttempt(data.results, input.studentId, input.grade, data.config);
  if (!availability.allowed) {
    throw new Error(availability.reason ?? 'Bu test şu anda tamamlanamaz.');
  }

  const graded = gradeTest(input.answers, input.questions);
  const completedDate = new Date();
  const completedAt = completedDate.toISOString();
  const result: TestResult = {
    id: makeId(),
    studentId: input.studentId,
    grade: input.grade,
    classId: input.classId,
    attempt: input.attempt,
    startedAt: input.startedAt,
    completedAt,
    durationMs: Math.max(0, completedDate.getTime() - new Date(input.startedAt).getTime()),
    answers: graded.answers,
    correct: graded.correct,
    wrong: graded.wrong,
    score: graded.score,
    maxScore: graded.maxScore,
  };

  const nextResults = [...data.results, result];
  const newBadges = evaluateNewBadges(
    nextResults,
    data.badges,
    data.studentBadges,
    input.studentId,
    result.id,
    completedAt,
  );

  updateData((current) => ({
    ...current,
    results: [...current.results, result],
    studentBadges: [...current.studentBadges, ...newBadges],
  }));
  void flushPersist();
  return { result, newBadges };
}

export interface IssueOutcomeSummary {
  createdNumbers: string[];
  updatedCount: number;
}

/** Sınıf seviyesinin ilk 3'ü için sertifika üretir/günceller (§19, §24). */
export function issueCertificatesForGrade(grade: Grade): IssueOutcomeSummary {
  const { data } = getState();
  const ranked = rankForGrade(data.results, data.students, grade, data.config);
  const outcome = issueTop3(
    ranked,
    grade,
    data.students,
    data.certificates,
    data.config,
    makeId,
    new Date().toISOString(),
  );
  updateData((current) => ({ ...current, certificates: outcome.certificates }));
  void flushPersist();
  return { createdNumbers: outcome.created.map((c) => c.number), updatedCount: outcome.updated.length };
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

export function updateGradeSetting(grade: Grade, partial: Partial<Omit<GradeSettings, 'grade'>>): void {
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

/** Öğrenci kayıtları ve sonuçları siler; soru bankası ve ayarlar korunur. */
export function clearStudentData(): void {
  updateData((data) => ({
    ...data,
    students: [],
    results: [],
    studentBadges: [],
    certificates: [],
  }));
  setSessionStudent(null);
  void flushPersist();
}
