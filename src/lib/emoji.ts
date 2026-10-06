/**
 * Emoji sayımı — Hermes'te Intl.Segmenter guarantee olmadığı için kod noktası
 * taramasıyla yapılır. Kural: bir soru görseli TAM BİR emoji olmalı; yan yana
 * iki emoji (ör. "📱⏰") cevabı ele veren bir ipucu olduğundan reddedilir.
 * ZWJ dizileri (👩‍🏫), ten rengi değiştiriciler ve VS16 (☀️) tek emoji sayılır.
 */

const ZWJ = 0x200d;
const MODIFIER_BASE = 0x1f3fb;
const MODIFIER_LAST = 0x1f3ff;

const PICTOGRAPHIC_RANGES: readonly [number, number][] = [
  [0x2300, 0x23ff],
  [0x2600, 0x27bf],
  [0x2b00, 0x2bff],
  [0x1f000, 0x1faff],
];

const PICTOGRAPHIC_SINGLES: readonly number[] = [0x00a9, 0x00ae, 0x203c, 0x2049, 0x2122, 0x2139];

function isPictographic(codePoint: number): boolean {
  return (
    PICTOGRAPHIC_SINGLES.includes(codePoint) ||
    PICTOGRAPHIC_RANGES.some(([from, to]) => codePoint >= from && codePoint <= to)
  );
}

/** Metindeki emoji sayısı (grafik küme bazında). */
export function emojiCount(value: string): number {
  let count = 0;
  let joined = false;
  for (const char of Array.from(value)) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint === ZWJ) {
      joined = true;
      continue;
    }
    if (codePoint === 0xfe0f || (codePoint >= MODIFIER_BASE && codePoint <= MODIFIER_LAST)) {
      continue;
    }
    if (isPictographic(codePoint)) {
      if (joined) {
        joined = false;
        continue;
      }
      count += 1;
      continue;
    }
    joined = false;
  }
  return count;
}

export function isSingleEmoji(value: string): boolean {
  return emojiCount(value) === 1;
}

/** Metnin başındaki emojiyi atar (ör. "⏸️ Mola veririm" → "Mola veririm"). */
export function stripLeadingEmoji(value: string): string {
  const space = value.indexOf(' ');
  return (space > 0 ? value.slice(space + 1) : value).trim();
}
