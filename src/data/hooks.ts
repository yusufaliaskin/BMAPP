/**
 * React bağlantı noktaları — useSyncExternalStore ile depoya abone olunur.
 * Türetilmiş veriler (sıralama vb.) motor fonksiyonlarıyla burada hesaplanır.
 * Kiosk modeli: öğrenci/oturum hook'ları yoktur.
 */

import { useMemo, useSyncExternalStore } from 'react';

import type {
  AdminUser,
  Certificate,
  DBState,
  Grade,
  GradeSettings,
  Question,
  RankEntry,
  SchoolClass,
  TestResult,
  Topic,
} from '../domain/models';
import { getState, subscribe } from './db';
import { rankForGrade } from '../domain/engine/ranking';

export function useDB(): DBState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useConfig() {
  return useDB().data.config;
}

export function useTopics(): Topic[] {
  return useDB().data.topics;
}

export function useQuestions(): Question[] {
  return useDB().data.questions;
}

export function useClasses(): SchoolClass[] {
  return useDB().data.classes;
}

export function useClassesForGrade(grade: Grade): SchoolClass[] {
  const classes = useDB().data.classes;
  return useMemo(
    () =>
      classes
        .filter((c) => c.grade === grade && c.isActive)
        .sort((a, b) => a.section.localeCompare(b.section)),
    [classes, grade],
  );
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

export function useResultById(resultId: string | undefined): TestResult | null {
  const results = useDB().data.results;
  if (!resultId) return null;
  return results.find((r) => r.id === resultId) ?? null;
}

export function useCertificates(): Certificate[] {
  return useDB().data.certificates;
}

export function useAdmins(): AdminUser[] {
  return useDB().data.admins;
}

export function useRankingsFor(grade: Grade, section: string | null): RankEntry[] {
  const results = useDB().data.results;
  return useMemo(() => {
    const ranked = rankForGrade(results, grade);
    if (!section) return ranked;
    return ranked.filter((entry) => entry.section === section);
  }, [results, grade, section]);
}

export function useTodayCount(): number {
  const results = useDB().data.results;
  return useMemo(() => {
    const today = new Date();
    const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`;
    return results.filter((r) => r.completedAt.slice(0, 10) === stamp).length;
  }, [results]);
}
