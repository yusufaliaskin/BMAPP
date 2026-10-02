/**
 * Puanlama motoru — puanın tek yetkili kaynağı (brief §15, §35).
 * UI'dan gelen hiçbir puan/doğru bilgisine güvenilmez; yalnız seçilen şıklar alınır
 * ve doğruluk burada, soru bankasına karşı yeniden hesaplanır.
 */

import type { Grade, Question, TestAnswer } from '../models';

export interface AnswerInput {
  questionId: string;
  selectedIndex: number;
}

export interface GradedTest {
  answers: TestAnswer[];
  correct: number;
  wrong: number;
  score: number;
  maxScore: number;
}

export function gradeTest(inputs: AnswerInput[], questions: Question[]): GradedTest {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const answers: TestAnswer[] = [];
  let score = 0;
  let maxScore = 0;

  for (const input of inputs) {
    const question = byId.get(input.questionId);
    if (!question) continue;
    const selectedIndex =
      Number.isInteger(input.selectedIndex) &&
      input.selectedIndex >= 0 &&
      input.selectedIndex < question.options.length
        ? input.selectedIndex
        : -1;
    const isCorrect = selectedIndex === question.correctIndex;
    if (isCorrect) score += question.points;
    maxScore += question.points;
    answers.push({ questionId: question.id, selectedIndex, isCorrect });
  }

  const correct = answers.filter((a) => a.isCorrect).length;
  return { answers, correct, wrong: answers.length - correct, score, maxScore };
}

export function percentOf(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/** Bir sorunun verilen cevapta doğru olup olmadığını söyler — UI yalnız geri bildirim için kullanır. */
export function isAnswerCorrect(question: Question, selectedIndex: number): boolean {
  return selectedIndex === question.correctIndex;
}

export function questionsForGrade(questions: Question[], grade: Grade): Question[] {
  return questions.filter((q) => q.isActive && q.grade === grade);
}
