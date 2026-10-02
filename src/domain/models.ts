/**
 * Alan modelleri — brief §32'deki minimum veri yapıları.
 * Puan/doğru/yanlış alanları UI tarafından asla yazılmaz;
 * yalnız src/domain/engine içindeki motor hesaplar (bkz. scoring.ts).
 */

export type Grade = 1 | 2 | 3 | 4;

export type Difficulty = 'easy' | 'easy-medium' | 'medium' | 'medium-hard';

export type RetakePolicy = 'first' | 'best' | 'max_attempts';

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: 'sky' | 'mint' | 'coral' | 'lavender' | 'amber';
  isActive: boolean;
  targetGrades: Grade[];
}

export interface SchoolClass {
  id: string;
  grade: Grade;
  section: string;
  isActive: boolean;
}

export interface AvatarCharacter {
  id: string;
  emoji: string;
  name: string;
}

export interface Student {
  id: string;
  /** Gerçek ad — yalnız admin görür (§7, §35). */
  fullName: string;
  characterId: string;
  nickname: string;
  emoji: string;
  grade: Grade;
  classId: string;
  createdAt: string;
}

export interface Question {
  id: string;
  grade: Grade;
  topicId: string;
  difficulty: Difficulty;
  /** Büyük görsel: emoji kompozisyonu (§10, §39). */
  visual: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
  /** Kısa "neden" cümlesi — doğru ve yanlış geri bildirimde kullanılır (§12, §13). */
  fact: string;
  isActive: boolean;
}

export interface TestAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface TestResult {
  id: string;
  studentId: string;
  grade: Grade;
  classId: string;
  attempt: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  answers: TestAnswer[];
  correct: number;
  wrong: number;
  score: number;
  maxScore: number;
}

export type BadgeRuleKind =
  | 'first_test'
  | 'tests_count'
  | 'min_percent'
  | 'perfect'
  | 'correct_total';

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rule: { kind: BadgeRuleKind; threshold?: number };
}

export interface StudentBadge {
  studentId: string;
  badgeId: string;
  earnedAt: string;
  resultId: string;
}

export interface Certificate {
  id: string;
  /** Benzersiz numara, ör. BEUN-2026-3-001 (§20). */
  number: string;
  studentId: string;
  grade: Grade;
  section: string;
  rank: 1 | 2 | 3;
  score: number;
  period: string;
  issuedAt: string;
}

export interface GradeSettings {
  grade: Grade;
  difficulty: Difficulty;
  questionCount: number;
}

export interface AppConfig {
  retakePolicy: RetakePolicy;
  maxAttempts: number;
  certificatePrefix: string;
  period: string;
  projectTitle: string;
  universityName: string;
  signatoryLeft: string;
  signatoryRight: string;
  adminPinHash: string;
  adminPinSalt: string;
}

export interface RankEntry {
  studentId: string;
  score: number;
  correct: number;
  wrong: number;
  completedAt: string;
  resultId: string;
  rank: number;
}

export interface DBData {
  students: Student[];
  classes: SchoolClass[];
  topics: Topic[];
  questions: Question[];
  results: TestResult[];
  studentBadges: StudentBadge[];
  certificates: Certificate[];
  gradeSettings: GradeSettings[];
  badges: BadgeDef[];
  config: AppConfig;
}

export interface SessionState {
  studentId: string | null;
}

export interface DBState {
  version: number;
  data: DBData;
  session: SessionState;
}

export const GRADES: readonly Grade[] = [1, 2, 3, 4] as const;

export function gradeLabel(grade: Grade): string {
  return `${grade}. Sınıflar`;
}
