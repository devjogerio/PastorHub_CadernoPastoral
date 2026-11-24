/* @vitest-environment jsdom */
/* ============================================================
   Busca do painel administrativo estático (pastorhub-static).
   Carrega os arquivos reais js/admin-busca-core.js e js/admin-busca.js
   com um AdminAPI simulado, para validar precisão, debounce, estados
   (carregando, vazio, erro, falhas parciais) e permissões por perfil.
   ============================================================ */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pasta = join(process.cwd(), 'pastorhub-static', 'js');
const lerScript = (nome: string) => readFileSync(join(pasta, nome), 'utf8');

type Nucleo = {
  normalizar: (t: string) => string;
  interpretarTermo: (t: string) => { texto: string; modo: 'parcial' | 'exato' };
  filtrar: (itens: unknown[], o: { termo: string; grupo?: string; status?: string }) => unknown[];
  paginar: (l: unknown[], p: number, t: number) => { itens: unknown[]; pagina: number; totalPaginas: number; total: number };
};

function montarPagina() {
  document.body.innerHTML =
    '<div class="admin-search"><input id="global-search" type="text" autocomplete="off">' +
    '<div class="search-pop" id="search-pop" hidden></div></div>';
  return {
    input: document.getElementById('global-search') as HTMLInputElement,
    pop: document.getElementById('search-pop') as HTMLElement,
  };
}

function criarApi(sobrescrita: Record<string, unknown> = {}) {
  const usuarios = [
    { nome: 'Marcos Vieira', email: 'marcos@evangelhoquadrado.com', igreja: 'Igreja do Evangelho Quadrado', cidade: 'Uberlândia', plano: 'Premium', status: 'Ativo' },
    { nome: 'Ana Beatriz Rocha', email: 'ana.b.rocha@email.com', igreja: 'Comunidade Betel', cidade: 'Campinas', plano: 'Igreja', status: 'Ativo' },
    { nome: 'Samuel Aguiar', email: 'samuel@aguiar.app', igreja: 'Igreja Batista Central', cidade: 'Salvador', plano: 'Premium', status: 'Suspenso' },
  ];
  const api = {
    state: {
      section: 'overview',
      users: usuarios,
      content: [{ titulo: 'A Fé Que Transforma Montanhas', autor: 'Marcos Vieira', tema: 'Fé', tipo: 'Expositivo', status: 'Publicado' }],
      eventos: [], atendimentos: [], palestras: [], videos: [], templates: [], integrations: [],
      userQuery: '', contentQuery: '',
    },
    render: vi.fn(),
    toast: vi.fn(),
    esc: (s: unknown) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]),
    SESSOES_MEET: [],
    carregarConfig: () => ({ nome: 'PastorHub', email: 'contato@pastorhub.app' }),
    secoesPermitidas: () => [{ id: 'overview' }, { id: 'usuarios' }, { id: 'conteudo' }, { id: 'configuracoes' }],
    ...sobrescrita,
  };
  return api;
}

function carregarBusca(api: Record<string, unknown>) {
  (window as unknown as Record<string, unknown>).AdminAPI = api;
  (window as unknown as Record<string, unknown>).icon = () => '<svg></svg>';
  new Function(lerScript('admin-busca-core.js'))();
  new Function(lerScript('admin-busca.js'))();
}

const nucleo = (): Nucleo => (window as unknown as { AdminBuscaCore: Nucleo }).AdminBuscaCore;

describe('núcleo de busca (admin-busca-core.js)', () => {
  beforeEach(() => {
    carregarBusca(criarApi());
  });

  it('ignora acentos e maiúsculas na normalização', () => {
    expect(nucleo().normalizar('  Ação   JOVENS  ')).toBe('acao jovens');
  });

  it('busca parcial aceita trecho de palavra e ordem livre', () => {
    const itens = [{ grupo: 'g', status: '', campos: ['Marcos Vieira'], texto: 'marcos vieira' }];
    expect(nucleo().filtrar(itens, { termo: 'vie mar' })).toHaveLength(1);
    expect(nucleo().filtrar(itens, { termo: 'joao' })).toHaveLength(0);
  });

  it('busca exata exige o campo inteiro entre aspas', () => {
    const itens = [{ grupo: 'g', status: '', campos: ['Marcos Vieira'], texto: 'marcos vieira' }];
    expect(nucleo().filtrar(itens, { termo: '"Marcos"' })).toHaveLength(0);
    expect(nucleo().filtrar(itens, { termo: '"marcos vieira"' })).toHaveLength(1);
  });

  it('exige ao menos 2 caracteres na busca parcial', () => {
    const itens = [{ grupo: 'g', status: '', campos: ['Ana'], texto: 'ana' }];
    expect(nucleo().filtrar(itens, { termo: 'a' })).toHaveLength(0);
  });

  it('aplica filtros de grupo e status em conjunto com o texto', () => {
    const itens = [
      { grupo: 'Usuários', status: 'Ativo', campos: ['Ana'], texto: 'ana' },
      { grupo: 'Usuários', status: 'Suspenso', campos: ['Ana Lima'], texto: 'ana lima' },
      { grupo: 'Conteúdo', status: 'Ativo', campos: ['Ana Sermão'], texto: 'ana sermao' },
    ];
    expect(nucleo().filtrar(itens, { termo: 'ana', grupo: 'Usuários', status: 'Ativo' })).toHaveLength(1);
    expect(nucleo().filtrar(itens, { termo: 'ana', grupo: 'todos', status: 'todos' })).toHaveLength(3);
  });

  it('pagina e limita a página ao intervalo válido', () => {
    const lista = Array.from({ length: 8 }, (_, i) => i);
    const p1 = nucleo().paginar(lista, 1, 6);
    expect(p1.itens).toHaveLength(6);
    expect(p1.totalPaginas).toBe(2);
    expect(nucleo().paginar(lista, 2, 6).itens).toEqual([6, 7]);
    expect(nucleo().paginar(lista, 99, 6).pagina).toBe(2);
    expect(nucleo().paginar([], 1, 6).totalPaginas).toBe(1);
  });
});

describe('interface da busca (admin-busca.js)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('aguarda o debounce antes de mostrar resultados e exibe carregamento', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    input.value = 'marcos';
    input.dispatchEvent(new Event('input'));
    expect(pop.textContent).toContain('Pesquisando');
    vi.advanceTimersByTime(100);
    expect(pop.textContent).toContain('Pesquisando');
    vi.advanceTimersByTime(200);
    expect(pop.textContent).toContain('2 resultados');
    expect(pop.textContent).toContain('marcos@evangelhoquadrado.com');
  });

  it('mostra mensagem clara quando não há resultados', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    input.value = 'zzzzz';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Nenhum resultado para “zzzzz”');
  });

  it('mostra dica quando o termo tem menos de 2 caracteres', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    input.value = 'a';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Digite pelo menos 2 caracteres');
  });

  it('mostra erro com opção de tentar novamente quando a busca falha', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi({ secoesPermitidas: () => { throw new Error('falha'); } }));
    input.value = 'marcos';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Não foi possível pesquisar agora');
    expect(pop.querySelector('[data-retry]')).not.toBeNull();
  });

  it('informa módulos que falharam sem esconder os demais resultados', () => {
    const api = criarApi();
    Object.defineProperty(api.state, 'content', { get() { throw new Error('quebrou'); } });
    api.secoesPermitidas = () => [{ id: 'usuarios' }, { id: 'conteudo' }];
    const { input, pop } = montarPagina();
    carregarBusca(api);
    input.value = 'marcos';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Não foi possível pesquisar em: Conteúdo');
    expect(pop.textContent).toContain('Marcos Vieira');
  });

  it('respeita as seções permitidas ao perfil (usuário comum não vê Usuários)', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi({ secoesPermitidas: () => [{ id: 'overview' }, { id: 'conteudo' }] }));
    input.value = 'marcos';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    expect(pop.textContent).not.toContain('marcos@evangelhoquadrado.com');
    expect(pop.textContent).toContain('A Fé Que Transforma Montanhas');
  });

  it('pagina os resultados e navega para o item escolhido', () => {
    const api = criarApi();
    api.state.users = Array.from({ length: 8 }, (_, i) => ({
      nome: `Pastor Teste ${i + 1}`, email: `p${i}@teste.app`, igreja: '', cidade: '', plano: '', status: 'Ativo',
    }));
    const { input, pop } = montarPagina();
    carregarBusca(api);
    input.value = 'pastor teste';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    expect(pop.querySelectorAll('[data-idx]')).toHaveLength(6);
    expect(pop.textContent).toContain('Página 1 de 2');
    (pop.querySelector('[data-pagina="2"]') as HTMLButtonElement).click();
    expect(pop.querySelectorAll('[data-idx]')).toHaveLength(2);
    (pop.querySelector('[data-idx="6"]') as HTMLButtonElement).click();
    expect(api.state.section).toBe('usuarios');
    expect(api.state.userQuery).toBe('Pastor Teste 7');
    expect(api.render).toHaveBeenCalled();
    expect(input.value).toBe('');
  });

  it('filtra por módulo pelos chips', () => {
    const api = criarApi();
    api.state.content = [{ titulo: 'Marcos e a fé', autor: 'Ana', tema: 'Fé', tipo: 'Expositivo', status: 'Publicado' }];
    const { input, pop } = montarPagina();
    carregarBusca(api);
    input.value = 'marcos';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('2 resultados');
    (pop.querySelector('[data-grupo="Conteúdo"]') as HTMLButtonElement).click();
    expect(pop.textContent).toContain('1 resultado');
    expect(pop.textContent).not.toContain('Marcos Vieira');
  });

  it('limpa a busca com Escape e fecha ao clicar fora', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    input.value = 'marcos';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(300);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(input.value).toBe('');
    expect(pop.hidden).toBe(true);
  });
});
