/**
 * Unvan motoru — sonuç ekranındaki puan bazlı unvan (§18, kiosk uyarlaması).
 * Kural seti config'ten gelir (yüksek eşik önce); birikimli rozet yoktur,
 * unvan yalnız o testin başarısına göre anlık hesaplanır.
 */

import type { TitleRule } from '../models';
import { percentOf } from './scoring';

export function titleForResult(
  score: number,
  maxScore: number,
  rules: TitleRule[],
): TitleRule | null {
  const percent = percentOf(score, maxScore);
  const sorted = [...rules].sort((a, b) => b.minPercent - a.minPercent);
  for (const rule of sorted) {
    if (percent >= rule.minPercent) return rule;
  }
  return null;
}
