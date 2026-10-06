/**
 * Alan modelleri — KIOSK / tek kullanımlık katılımcı modeli (v2).
 * Kalıcı öğrenci hesabı YOK: her test oturumu benzersiz bir katılımcı kodu üretir
 * (ör. 9F3A-72K1) ve sonuç bu kodla saklanır. Puan/doğru/yanlış alanları UI tarafından
 * asla yazılmaz; yalnız src/domain/engine içindeki motor hesaplar (§35).
 */

export type Grade = 1 | 2 | 3 | 4;

export type Difficulty = 'easy' | 'easy-medium' | 'medium' | 'medium-hard';

/** Sertifika sınıfı — ilk üç derece (§19). */
export type Medal = 'gold' | 'silver' | 'bronze';

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

export interface Question {
  id: string;
  grade: Grade;
  topicId: string;
  difficulty: Difficulty;
  /** Büyük görsel: TEK emoji (§10, §39 — cevabı ele vermez, sahneyi anlatır). */
  visual: string;
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
  /** Kısa "neden" cümlesi — doğru ve yanlış geri bildirimde kullanılır (§12, §13). */
  fact: string;
  isActive: boolean;
  /** Admin bu soruyu elle düzenlediyse true; tohum içeriği bir daha üzerine yazmaz. */
  edited?: boolean;
}

export interface TestAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface TestResult {
  id: string;
  /** İnsan-okur benzersiz katılımcı kodu, ör. 9F3A-72K1. */
  participantCode: string;
  /** Çocuğun girdiği görünen ad / lakap. */
  displayName: string;
  grade: Grade;
  classId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  answers: TestAnswer[];
  correct: number;
  wrong: number;
  score: number;
  maxScore: number;
}

/** Sonuç ekranında gösterilen, puanla kazanılan unvan kuralı (§18). */
export interface TitleRule {
  minPercent: number;
  name: string;
  emoji: string;
}

export interface Certificate {
  id: string;
  /** Benzersiz numara, ör. BEUN-2026-3-001 (§20). */
  number: string;
  participantCode: string;
  displayName: string;
  grade: Grade;
  section: string;
  rank: 1 | 2 | 3;
  medal: Medal;
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
  certificatePrefix: string;
  period: string;
  projectTitle: string;
  universityName: string;
  signatoryLeft: string;
  signatoryRight: string;
  /** Puana göre unvan kuralları (yüksek eşik önce gelir). */
  titles: TitleRule[];
}

/** Yönetici hesabı — PIN düz metin saklanmaz; SHA-256 + rastgele tuz (§35). */
export interface AdminUser {
  id: string;
  name: string;
  pinHash: string;
  salt: string;
  createdAt: string;
}

export interface RankEntry {
  resultId: string;
  participantCode: string;
  displayName: string;
  grade: Grade;
  section: string;
  score: number;
  correct: number;
  wrong: number;
  completedAt: string;
  rank: number;
}

export interface DBData {
  admins: AdminUser[];
  classes: SchoolClass[];
  topics: Topic[];
  questions: Question[];
  results: TestResult[];
  certificates: Certificate[];
  gradeSettings: GradeSettings[];
  config: AppConfig;
}

export interface DBState {
  version: number;
  data: DBData;
}

export const GRADES: readonly Grade[] = [1, 2, 3, 4] as const;

/** Şube harfleri — A'dan Z'ye (26 şube desteklenir). */
export const SECTION_LETTERS: readonly string[] = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

export function gradeLabel(grade: Grade): string {
  return `${grade}. Sınıflar`;
}

/** "3A" → "A" */
export function sectionOf(classId: string): string {
  return classId.replace(/^\d/, '');
}

export function medalForRank(rank: number): Medal {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  return 'bronze';
}

export const MEDAL_LABEL: Record<Medal, string> = {
  gold: 'Altın',
  silver: 'Gümüş',
  bronze: 'Bronz',
};

export const MEDAL_EMOJI: Record<Medal, string> = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
};

