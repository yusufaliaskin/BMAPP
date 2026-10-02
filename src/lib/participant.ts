/**
 * Katılımcı kodu ve avatar yardımcıları — kiosk modu.
 * Kod insan-okur ve karışması zor alfabeden üretilir: 4+4, ör. 9F3A-72K1.
 * Çocuk yazmak zorunda değildir; sistem otomatik üretir, sonuç bu kodla eşleşir.
 */

import * as Crypto from 'expo-crypto';

/** 0/O, 1/I/L gibi karışan karakterler yok. */
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 8;
const GROUP = 4;

const AVATARS = ['🦁', '🚀', '🐼', '🦉', '🐬', '🦊', '🐸', '🦄'] as const;

function randomChar(): string {
  const bytes = Crypto.getRandomBytes(1);
  return CODE_ALPHABET[bytes[0] % CODE_ALPHABET.length];
}

/** Benzersizlik çağıran tarafta doğrulanır (mevcut kodlarla çakışırsa yeniden üretilir). */
export function makeParticipantCode(): string {
  let raw = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    raw += randomChar();
  }
  return `${raw.slice(0, GROUP)}-${raw.slice(GROUP)}`;
}

export function makeUniqueParticipantCode(existing: string[]): string {
  const taken = new Set(existing);
  let code = makeParticipantCode();
  while (taken.has(code)) {
    code = makeParticipantCode();
  }
  return code;
}

/** Katılımcı kodundan deterministik avatar emojisi — aynı kod her zaman aynı avatar. */
export function emojiForCode(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i += 1) {
    hash = (hash * 31 + code.charCodeAt(i)) % 997;
  }
  return AVATARS[hash % AVATARS.length];
}
