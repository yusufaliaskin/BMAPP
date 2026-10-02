/**
 * React bağlantı noktaları — useSyncExternalStore ile depoya abone olunur.
 * Türetilmiş veriler (sıralama, rozet vb.) motor fonksiyonlarıyla burada hesaplanır.
 */

import { useMemo, useSyncExternalStore } from 'react';

import type {
  AvatarCharacter,
  BadgeDef,
  Certificate,
  DBState,
  Grade,
  GradeSettings,
  Question,
  RankEntry,
  SchoolClass,
  Student,
  StudentBadge,
  TestResult,
  Topic,
} from '../domain/models';
import { getState, subscribe } from './db';
import { rankForGrade } from '../domain/engine/ranking';
import { canAttempt } from '../domain/engine/quiz';
import { seedCharacters } from '../domain/content/seed';

export function useDB(): DBState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useConfig() {
  return useDB().data.config;
}

export function useTopics(): Topic[] {
  return useDB().data.topics;
}

export function useActiveTopics(grade?: Grade): Topic[] {
  const topics = useDB().data.topics;
  return useMemo(
    () =>
      topics.filter(
        (t) => t.isActive && (grade === undefined || t.targetGrades.includes(grade)),
      ),
    [topics, grade],
  );
}

export function useStudents(): Student[] {
  return useDB().data.students;
}

export function useCurrentStudent(): Student | null {
  const db = useDB();
  const { studentId } = db.session;
  if (!studentId) return null;
  return db.data.students.find((s) => s.id === studentId) ?? null;
}

export function useStudentById(studentId: string | undefined): Student | null {
  const students = useDB().data.students;
  if (!studentId) return null;
  return students.find((s) => s.id === studentId) ?? null;
}

export function useClasses(): SchoolClass[] {
  return useDB().data.classes;
}

export function useClassesForGrade(grade: Grade): SchoolClass[] {
  const classes = useDB().data.classes;
  return useMemo(
    () => classes.filter((c) => c.grade === grade && c.isActive).sort((a, b) => a.section.localeCompare(b.section)),
    [classes, grade],
  );
}

export function useQuestions(): Question[] {
  return useDB().data.questions;
}

export function useGradeSettings(): GradeSettings[] {
  return useDB().data.gradeSettings;
}

export function useGradeSetting(grade: Grade): GradeSettings {
  const settings = useDB().data.gradeSettings;
  return (
    settings.find((s) => s.grade === grade) ?? { grade, difficulty: 'easy', questionCount: 5 }
  );
}

export function useResults(): TestResult[] {
  return useDB().data.results;
}

export function useStudentResults(studentId: string | undefined): TestResult[] {
  const results = useDB().data.results;
  return useMemo(
    () =>
      studentId
        ? results
            .filter((r) => r.studentId === studentId)
            .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
        : [],
    [results, studentId],
  );
}

export function useResultById(resultId: string | undefined): TestResult | null {
  const results = useDB().data.results;
  if (!resultId) return null;
  return results.find((r) => r.id === resultId) ?? null;
}

export function useBadges(): BadgeDef[] {
  return useDB().data.badges;
}

export function useStudentBadges(studentId: string | undefined): StudentBadge[] {
  const badges = useDB().data.studentBadges;
  return useMemo(
    () => (studentId ? badges.filter((b) => b.studentId === studentId) : []),
    [badges, studentId],
  );
}

export function useCertificates(): Certificate[] {
  return useDB().data.certificates;
}

export function useCharacters(): AvatarCharacter[] {
  const db = useDB();
  return useMemo(() => {
    void db;
    return seedCharacters;
  }, [db]);
}

export function useRankingsFor(grade: Grade, section: string | null): RankEntry[] {
  const data = useDB().data;
  return useMemo(() => {
    const ranked = rankForGrade(data.results, data.students, grade, data.config);
    if (!section) return ranked;
    const classId = `${grade}${section}`;
    const inSection = new Set(data.students.filter((s) => s.classId === classId).map((s) => s.id));
    return ranked.filter((e) => inSection.has(e.studentId));
  }, [data, grade, section]);
}

export function useAttemptAvailability(studentId: string | undefined, grade: Grade) {
  const data = useDB().data;
  return useMemo(
    () =>
      studentId
        ? canAttempt(data.results, studentId, grade, data.config)
        : { allowed: false, reason: 'Öğrenci bulunamadı.', attemptsUsed: 0, maxAttempts: null },
    [data, studentId, grade],
  );
}
