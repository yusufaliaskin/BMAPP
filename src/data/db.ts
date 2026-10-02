/**
 * Uygulama veri deposu — tek bellek içi kaynak (single source of truth).
 * useSyncExternalStore ile React'e bağlanır; her mutasyon yeni bir state nesnesi üretir,
 * yazma işlemi kısa bir debounce ile diske indirilir. Kiosk modeli: oturum durumu yoktur.
 */

import type { AdminUser, DBData, DBState } from '../domain/models';
import { buildSeedData, DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_PIN } from '../domain/content/seed';
import { makeSalt, hashPin } from '../lib/pin';
import { SCHEMA_VERSION, loadState, saveState } from './persistence';

let state: DBState | null = null;
const listeners = new Set<() => void>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;

export function getState(): DBState {
  if (!state) throw new Error('Veri deposu henüz hazır değil.');
  return state;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

async function persist(): Promise<void> {
  if (!state) return;
  try {
    await saveState(state);
  } catch (error) {
    console.warn('Veri kaydedilemedi.', error);
  }
}

function schedulePersist(): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void persist();
  }, 120);
}

/** Bekleyen yazmayı hemen diske indirir (kritik kayıtlardan sonra çağrılır). */
export async function flushPersist(): Promise<void> {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  await persist();
}

async function buildFirstAdmin(): Promise<AdminUser> {
  const salt = makeSalt();
  const pinHash = await hashPin(DEFAULT_ADMIN_PIN, salt);
  return {
    id: 'admin-1',
    name: DEFAULT_ADMIN_NAME,
    pinHash,
    salt,
    createdAt: new Date().toISOString(),
  };
}

export async function initStore(): Promise<void> {
  const loaded = await loadState();
  if (loaded) {
    state = loaded.state;
    emit();
    if (loaded.migrated) await flushPersist();
    return;
  }
  const seed = buildSeedData();
  state = {
    version: SCHEMA_VERSION,
    data: {
      admins: [await buildFirstAdmin()],
      results: [],
      certificates: [],
      ...seed,
    },
  };
  emit();
  await flushPersist();
}

export function updateData(mutator: (data: DBData) => DBData): void {
  if (!state) return;
  state = { ...state, data: mutator(state.data) };
  emit();
  schedulePersist();
}
