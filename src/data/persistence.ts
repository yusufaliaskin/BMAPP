/**
 * Kalıcı depo adaptörü — cihaz üzerinde AsyncStorage (web'de localStorage).
 * Tüm uygulama durumu tek bir JSON belgesi olarak saklanır; şema sürümü taşınır.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DBState } from '../domain/models';

export const STORAGE_KEY = 'bilincli-kahraman/store/v1';
export const SCHEMA_VERSION = 1;

export async function loadState(): Promise<DBState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DBState;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== SCHEMA_VERSION) return null;
    if (!parsed.data || !parsed.session) return null;
    return parsed;
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
