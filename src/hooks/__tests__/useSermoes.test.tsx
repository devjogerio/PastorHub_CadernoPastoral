/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';

// Mock do SupabaseService e OfflineStorage usados pelo hook
vi.mock('../../lib/supabaseService', () => {
  return {
    SupabaseService: {
      getSermoes: vi.fn(async () => [
        {
          id: 's1',
          titulo: 'Online',
          texto_biblico: 'Jo 3:16',
          tema: 'Amor',
          publico_alvo: 'Geral',
          tipo_sermao: 'Expositivo',
          conteudo_html: '<p>...</p>',
          conteudo_plain: '...',
          tags: [],
          data_criacao: new Date().toISOString(),
          data_pregado: null,
          status_pregado: false,
          local_pregado: '',
        },
      ]),
      createSermao: vi.fn(async (s: any) => ({ ...s, id: 's-new' })),
      updateSermao: vi.fn(async (id: string, u: any) => ({ id, ...u })),
      deleteSermao: vi.fn(async () => undefined),
      togglePregado: vi.fn(async (id: string, st: boolean) => ({
        id,
        status_pregado: st,
      })),
      searchSermoes: vi.fn(async () => []),
    },
  };
});

vi.mock('../../lib/offlineStorage', () => {
  let sermoes: any[] = [];
  let queue: any[] = [];
  // Espião para verificar a remoção individual de cada ação sincronizada
  const removeFromSyncQueue = vi.fn((id: string) => {
    queue = queue.filter((a) => a.id !== id);
  });
  return {
    OfflineStorage: {
      saveSermoes: (s: any[]) => {
        sermoes = s;
      },
      getSermoes: () => sermoes,
      addSermao: (s: any) => {
        sermoes.unshift(s);
      },
      updateSermao: (id: string, u: any) => {
        sermoes = sermoes.map((x) => (x.id === id ? { ...x, ...u } : x));
      },
      deleteSermao: (id: string) => {
        sermoes = sermoes.filter((x) => x.id !== id);
      },
      addToSyncQueue: (action: any) => {
        queue.push(action);
      },
      getSyncQueue: () => queue,
      removeFromSyncQueue,
      clearSyncQueue: () => {
        queue = [];
      },
      setLastSync: () => void 0,
      addOnlineListener: (cb: (online: boolean) => void) => {
        // Simula inscrição e retorna cleanup
        // Invoca uma vez com o estado atual do navigator
        cb((globalThis.navigator as any)?.onLine ?? true);
        return () => void 0;
      },
    },
  };
});

import { useSermoes } from '../useSermoes';

/**
 * Componente de teste que expõe o estado do hook via callback
 */
function TestHost({
  isAuthenticated,
  isConfigured,
  onReady,
}: {
  isAuthenticated: boolean;
  isConfigured: boolean;
  onReady: (data: any) => void;
}) {
  const state = useSermoes(isAuthenticated, isConfigured);
  React.useEffect(() => {
    if (!state.loading) onReady(state);
  }, [state.loading]);
  return null;
}

describe('useSermoes (integração)', () => {
  it('carrega do Supabase quando online e configurado', async () => {
    vi.stubGlobal('navigator', { onLine: true } as any);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const result: any = await new Promise((resolve) => {
      root.render(
        <TestHost
          isAuthenticated={true}
          isConfigured={true}
          onReady={resolve}
        />
      );
    });

    expect(result.useSupabase).toBe(true);
    expect(result.sermoes.length).toBe(1);
    expect(result.sermoes[0].titulo).toBe('Online');
  });

  it('carrega do OfflineStorage quando offline ou não configurado', async () => {
    vi.stubGlobal('navigator', { onLine: false } as any);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const result: any = await new Promise((resolve) => {
      root.render(
        <TestHost
          isAuthenticated={false}
          isConfigured={false}
          onReady={resolve}
        />
      );
    });

    expect(result.useSupabase).toBe(false);
    expect(Array.isArray(result.sermoes)).toBe(true);
  });

  it('sincroniza a fila removendo cada ação individualmente', async () => {
    vi.stubGlobal('navigator', { onLine: true } as any);
    const { OfflineStorage } = await import('../../lib/offlineStorage');

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const result: any = await new Promise((resolve) => {
      root.render(
        <TestHost
          isAuthenticated={true}
          isConfigured={true}
          onReady={resolve}
        />
      );
    });

    OfflineStorage.addToSyncQueue({ id: 'a1', type: 'create', data: { id: 'a1' } });
    OfflineStorage.addToSyncQueue({ id: 'a2', type: 'delete', data: null });

    await result.syncWithSupabase();

    // Cada ação sincronizada é removida individualmente e a fila fica vazia no fim
    expect(OfflineStorage.removeFromSyncQueue).toHaveBeenCalledWith('a1');
    expect(OfflineStorage.removeFromSyncQueue).toHaveBeenCalledWith('a2');
    expect(OfflineStorage.getSyncQueue().length).toBe(0);
  });
});
