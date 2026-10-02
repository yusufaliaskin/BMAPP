/** Biçimlendirme yardımcıları — Türkçe tarih ve süre gösterimi. */

const TR_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** 02.10.2026 */
export function formatDateTR(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** 02.10.2026 · 14:30 */
export function formatDateTimeTR(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${formatDateTR(iso)} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 2 Ekim 2026 */
export function formatDateLongTR(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getDate()} ${TR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** 1 dk 24 sn / 45 sn */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds} sn`;
  return `${minutes} dk ${pad(seconds)} sn`;
}
