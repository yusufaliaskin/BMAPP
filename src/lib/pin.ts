/**
 * Kimlik ve PIN yardımcıları — expo-crypto üzerinden.
 * PIN düz metin saklanmaz; rastgele tuz + SHA-256 özeti tutulur (§35).
 */

import * as Crypto from 'expo-crypto';

import type { AppConfig } from '../domain/models';

export function makeId(): string {
  return Crypto.randomUUID();
}

export function makeSalt(): string {
  return Crypto.randomUUID();
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function verifyPin(pin: string, config: AppConfig): Promise<boolean> {
  const hash = await hashPin(pin, config.adminPinSalt);
  return hash === config.adminPinHash;
}
