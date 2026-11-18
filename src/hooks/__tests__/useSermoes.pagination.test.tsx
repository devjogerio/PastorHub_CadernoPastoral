/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';

// Mock do SupabaseService para paginação
vi.mock('../../lib/supabaseService', () => {
  return {
    SupabaseService: {
      // Implementa retorno por página/limite
      getSermoes: vi.fn(async (opts?: { limit?: number; page?: number }) => {
        const limit = opts?.limit ?? 10;
        const page = opts?.page ?? 1;
        const total = 23; // base fictícia
        const from = (page - 1) * limit;
        const to = Math.min(from + limit, total);
        const result = [] as any[];
        for (let i = from; i < to; i++) {
          result.push({
            id: `s${i + 1}`,
            titulo: `Sermão ${i + 1}`,
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
          });
        }
        return result;
      }),
    },
  };
});

// Mock do OfflineStorage mínimo
vi.mock('../../lib/offlineStorage', () => {
  let sermoes: any[] = [];
  let queue: any[] = [];
  return {
    OfflineStorage: {
      saveSermoes: (s: any[]) => {
        sermoes = s;
      },
      getSermoes: () => sermoes,
      setLastSync: () => void 0,
      addOnlineListener: (_cb: (online: boolean) => void) => {
        return () => void 0;
      },
      needsSync: () => false,
      getSyncQueue: () => queue,
      clearSyncQueue: () => {
        queue = [];
      },
    },
  };
});

import { useSermoes } from '../useSermoes';

/**
 * Componente host para acessar estado do hook
 */
function Host({ onReady }: { onReady: (s: any) => void }) {
  const state = useSermoes(true, true);
  React.useEffect(() => {
    if (!state.loading) onReady(state);
  }, [state.loading, state.page, state.hasMore, state.sermoes.length]);
  return null;
}

describe('useSermoes – paginação', () => {
  it('carrega primeira página e permite carregar mais até finalizar', async () => {
    vi.stubGlobal('navigator', { onLine: true } as any);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    let nextResolve: ((s: any) => void) | undefined;
    let current: any = await new Promise((resolve) => {
      const onReady = (s: any) => {
        if (nextResolve) {
          const r = nextResolve;
          nextResolve = undefined;
          r(s);
        }
        resolve(s);
      };
      root.render(<Host onReady={onReady} />);
    });

    // Primeira página com limit padrão (10)
    expect(current.useSupabase).toBe(true);
    expect(current.page).toBe(1);
    expect(current.sermoes.length).toBe(10);
    expect(current.hasMore).toBe(true);

    // Carregar página 2
    await current.loadMore();
    current = await new Promise((resolve) => {
      nextResolve = resolve;
    });
    expect(current.page).toBe(2);
    expect(current.sermoes.length).toBe(20);
    expect(current.hasMore).toBe(true);

    // Carregar página 3 (total 23 -> última página terá 3 itens)
    await current.loadMore();
    current = await new Promise((resolve) => {
      nextResolve = resolve;
    });
    expect(current.page).toBe(3);
    expect(current.sermoes.length).toBe(23);
    expect(current.hasMore).toBe(false);
    // Cleanup para evitar efeitos após teardown
    root.unmount();
  });
});
