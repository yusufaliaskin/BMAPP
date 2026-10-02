/**
 * PIN yardımcıları — yönetici hesapları için (v2.1).
 * PIN düz metin saklanmaz; her yöneticinin kendi rastgele tuzu + SHA-256 özeti tutulur (§35).
 */

import * as Crypto from 'expo-crypto';

import type { AdminUser } from '../domain/models';

export function makeId(): string {
  return Crypto.randomUUID();
}

export function makeSalt(): string {
  return Crypto.randomUUID();
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function verifyAdminPin(pin: string, admin: AdminUser): Promise<boolean> {
  const hash = await hashPin(pin, admin.salt);
  return hash === admin.pinHash;
}

/** PIN'i kayıtlı yöneticilerle eşleştirir; eşleşen yöneticiyi döndürür. */
export async function findAdminByPin(
  pin: string,
  admins: AdminUser[],
): Promise<AdminUser | null> {
  for (const admin of admins) {
    if (await verifyAdminPin(pin, admin)) return admin;
  }
  return null;
}
