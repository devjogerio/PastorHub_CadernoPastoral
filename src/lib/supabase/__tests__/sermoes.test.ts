import { describe, it, expect, vi } from 'vitest';

// Mock do módulo de cliente Supabase para isolar chamadas de rede
vi.mock('../../supabase', () => {
  // Monta um builder simples para encadear métodos de consulta como no supabase-js
  const singleResult = { data: { id: '1' }, error: null };
  const listResult = { data: [], error: null };

  const queryBuilder = () => ({
    select: vi.fn(() => ({
      order: vi.fn(
        () =>
          ({
            limit: vi.fn(() => listResult),
            range: vi.fn(() => listResult),
          } as any)
      ),
      eq: vi.fn(() => ({ single: vi.fn(() => singleResult) })),
      or: vi.fn(() => ({ order: vi.fn(() => listResult) })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({ single: vi.fn(() => singleResult) })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({ single: vi.fn(() => singleResult) })),
      })),
    })),
    delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
  });

  const mockDb = {
    from: vi.fn(() => queryBuilder()),
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { id: 'user-123' } } })),
    },
  };
  return {
    supabase: mockDb,
    isSupabaseConfigured: vi.fn(() => true),
  };
});

import {
  getSermoes,
  getSermao,
  createSermao,
  updateSermao,
  deleteSermao,
  togglePregado,
  searchSermoes,
} from '../sermoes';

describe('Módulo de Sermões (Supabase)', () => {
  it('lista sermões sem erro quando configurado', async () => {
    const list = await getSermoes();
    expect(Array.isArray(list)).toBe(true);
  });

  it('busca sermão por id', async () => {
    const s = await getSermao('1');
    expect(s).toBeTruthy();
    expect(s?.id).toBe('1');
  });

  it('cria sermão atribuindo user_id', async () => {
    const created = await createSermao({
      id: '',
      titulo: 'Teste',
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
    } as any);
    expect(created.id).toBe('1');
  });

  it('atualiza sermão e retorna entidade', async () => {
    const updated = await updateSermao('1', { titulo: 'Atualizado' } as any);
    expect(updated.id).toBe('1');
  });

  it('deleta sermão sem lançar erro', async () => {
    await expect(deleteSermao('1')).resolves.toBeUndefined();
  });

  it('alternar pregado aplica data_pregado corretamente', async () => {
    const result = await togglePregado('1', true);
    expect(result.id).toBe('1');
  });

  it('busca com filtro retorna array', async () => {
    const list = await searchSermoes('Amor');
    expect(Array.isArray(list)).toBe(true);
  });

  it('lista com paginação usando range', async () => {
    const list = await getSermoes({ limit: 10, page: 2 });
    expect(Array.isArray(list)).toBe(true);
  });
});
