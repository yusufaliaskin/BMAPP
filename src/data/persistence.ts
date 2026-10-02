/**
 * Kalıcı depo adaptörü — cihaz üzerinde AsyncStorage (web'de localStorage).
 * Tüm uygulama durumu tek bir JSON belgesi olarak saklanır; şema sürümü taşınır.
 * v2: kiosk modeli. v2.1 alanı: `admins` koleksiyonu — eski tek-PIN'li belgeler
 * yüklenirken yerinde taşınır (katılımcı kayıtları SİLİNMEZ).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AdminUser, DBState } from '../domain/models';

export const STORAGE_KEY = 'bilincli-kahraman/store/v2';
export const SCHEMA_VERSION = 2;

interface LegacyConfigShape {
  adminPinHash?: string;
  adminPinSalt?: string;
}

export interface LoadResult {
  state: DBState;
  /** true ise yükleme sırasında taşıma yapıldı; hemen diske yazılmalı. */
  migrated: boolean;
}

function migrateAdmins(state: DBState): boolean {
  if (Array.isArray(state.data.admins) && state.data.admins.length > 0) return false;
  const legacy = state.data.config as unknown as LegacyConfigShape;
  if (!legacy.adminPinHash || !legacy.adminPinSalt) return false;
  const admin: AdminUser = {
    id: 'admin-1',
    name: 'Yönetici',
    pinHash: legacy.adminPinHash,
    salt: legacy.adminPinSalt,
    createdAt: new Date().toISOString(),
  };
  state.data.admins = [admin];
  delete legacy.adminPinHash;
  delete legacy.adminPinSalt;
  return true;
}

export async function loadState(): Promise<LoadResult | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DBState;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== SCHEMA_VERSION) return null;
    if (!parsed.data) return null;
    const migrated = migrateAdmins(parsed);
    if (!Array.isArray(parsed.data.admins) || parsed.data.admins.length === 0) return null;
    return { state: parsed, migrated };
  } catch (error) {
    console.warn('Kayıtlı veri okunamadı, yeniden başlatılacak.', error);
    return null;
  }
}

export async function saveState(state: DBState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
