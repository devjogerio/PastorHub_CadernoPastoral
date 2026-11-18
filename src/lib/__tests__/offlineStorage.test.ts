import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OfflineStorage } from '../offlineStorage';

// Mocks simples de localStorage, navigator e window
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((k: string) => store[k] ?? null),
  setItem: vi.fn((k: string, v: string) => {
    store[k] = v;
  }),
  removeItem: vi.fn((k: string) => {
    delete store[k];
  }),
  // Iteração usada em getStorageStats
  get length() {
    return Object.keys(store).length;
  },
  [Symbol.iterator]: function* () {
    for (const k of Object.keys(store)) yield [k, store[k]] as any;
  },
};

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  const listeners: Record<string, Function[]> = { online: [], offline: [] };
  vi.stubGlobal('localStorage', mockLocalStorage as any);
  vi.stubGlobal('navigator', { onLine: true } as any);
  vi.stubGlobal('window', {
    addEventListener: (evt: string, cb: Function) => {
      (listeners[evt] ||= []).push(cb);
    },
    removeEventListener: (evt: string, cb: Function) => {
      listeners[evt] = (listeners[evt] || []).filter((f) => f !== cb);
    },
    __emit: (evt: 'online' | 'offline') => {
      for (const cb of listeners[evt] || []) cb();
    },
  } as any);
});

describe('OfflineStorage', () => {
  it('salva e carrega sermões', () => {
    OfflineStorage.saveSermoes([{ id: '1' } as any]);
    const loaded = OfflineStorage.getSermoes();
    expect(loaded[0].id).toBe('1');
  });

  it('adiciona, atualiza e remove sermão', () => {
    OfflineStorage.addSermao({ id: '1', titulo: 'A' } as any);
    OfflineStorage.updateSermao('1', { titulo: 'B' } as any);
    let loaded = OfflineStorage.getSermoes();
    expect(loaded[0].titulo).toBe('B');
    OfflineStorage.deleteSermao('1');
    loaded = OfflineStorage.getSermoes();
    expect(loaded.length).toBe(0);
  });

  it('fila de sincronização adiciona e limpa', () => {
    OfflineStorage.addToSyncQueue({ id: 'x', type: 'create', data: {} });
    const q = OfflineStorage.getSyncQueue();
    expect(q.length).toBe(1);
    OfflineStorage.clearSyncQueue();
    expect(OfflineStorage.getSyncQueue().length).toBe(0);
  });

  it('last sync e needsSync funcionam', () => {
    OfflineStorage.setLastSync(Date.now());
    expect(OfflineStorage.getLastSync()).toBeTypeOf('number');
    expect(OfflineStorage.needsSync()).toBe(false);
  });

  it('getStorageStats retorna contagens coerentes', () => {
    OfflineStorage.saveSermoes([{ id: '1' } as any]);
    OfflineStorage.addToSyncQueue({ id: 'x', type: 'create', data: {} });
    const stats = OfflineStorage.getStorageStats();
    expect(stats.sermoesCount).toBe(1);
    expect(stats.syncQueueCount).toBe(1);
  });

  it('listeners de online/offline chamam callback', () => {
    const cb = vi.fn();
    const dispose = OfflineStorage.addOnlineListener(cb);
    // @ts-ignore
    window.__emit('offline');
    // @ts-ignore
    window.__emit('online');
    expect(cb).toHaveBeenCalledTimes(2);
    dispose();
  });
});
