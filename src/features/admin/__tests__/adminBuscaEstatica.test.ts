/* @vitest-environment jsdom */
/* ============================================================
   Busca do painel administrativo estático (pastorhub-static).
   Carrega os arquivos reais js/admin-busca-core.js e js/admin-busca.js
   com um AdminAPI simulado. Cobre o mínimo de 3 caracteres, categorias
   (conteúdo, funcionalidade, ação), ações executáveis, teclado, filtros,
   estados (carregando, vazio, erro, falha parcial) e permissões.
   ============================================================ */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const pasta = join(process.cwd(), 'pastorhub-static', 'js');
const lerScript = (nome: string) => readFileSync(join(pasta, nome), 'utf8');

type Nucleo = {
  MIN_CARACTERES: number;
  normalizar: (t: string) => string;
  termoPesquisavel: (t: string) => boolean;
  filtrar: (itens: unknown[], o: { termo: string; tipo?: string; grupo?: string; status?: string }) => unknown[];
  agrupar: (itens: unknown[]) => { id: string; itens: unknown[] }[];
};

const nucleo = (): Nucleo => (window as unknown as { AdminBuscaCore: Nucleo }).AdminBuscaCore;

function montarPagina() {
  document.body.innerHTML =
    '<button id="refresh-btn" type="button">Atualizar</button>' +
    '<button id="theme-btn" type="button">Tema</button>' +
    '<button data-action="export-users" type="button">Exportar</button>' +
    '<div class="admin-search"><input id="global-search" type="text" autocomplete="off">' +
    '<div class="search-pop" id="search-pop" hidden></div></div>';
  return {
    input: document.getElementById('global-search') as HTMLInputElement,
    pop: document.getElementById('search-pop') as HTMLElement,
  };
}

function criarApi(sobrescrita: Record<string, unknown> = {}) {
  const api = {
    state: {
      section: 'overview',
      users: [
        { nome: 'Marcos Vieira', email: 'marcos@evangelhoquadrado.com', igreja: 'Igreja do Evangelho Quadrado', cidade: 'Uberlândia', plano: 'Premium', status: 'Ativo' },
        { nome: 'Ana Beatriz Rocha', email: 'ana.b.rocha@email.com', igreja: 'Comunidade Betel', cidade: 'Campinas', plano: 'Igreja', status: 'Ativo' },
        { nome: 'Samuel Aguiar', email: 'samuel@aguiar.app', igreja: 'Igreja Batista Central', cidade: 'Salvador', plano: 'Premium', status: 'Suspenso' },
      ],
      content: [{ titulo: 'A Fé Que Transforma Montanhas', autor: 'Marcos Vieira', tema: 'Fé', tipo: 'Expositivo', status: 'Publicado' }],
      eventos: [], atendimentos: [], palestras: [], videos: [], templates: [], integrations: [],
      userQuery: '', contentQuery: '',
    },
    SECTIONS: [
      { id: 'overview', label: 'Visão geral', icon: 'chart' },
      { id: 'usuarios', label: 'Usuários', icon: 'users' },
      { id: 'conteudo', label: 'Conteúdo (Sermões)', icon: 'book-open' },
      { id: 'configuracoes', label: 'Configurações', icon: 'settings' },
      { group: 'Minha conta' },
      { id: 'sair', label: 'Sair do painel', icon: 'log-out', action: 'sair' },
    ],
    Actions: { sair: vi.fn() },
    render: vi.fn(),
    toast: vi.fn(),
    esc: (s: unknown) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]),
    SESSOES_MEET: [],
    carregarConfig: () => ({ nome: 'PastorHub', email: 'contato@pastorhub.app' }),
    secoesPermitidas: () => [{ id: 'overview' }, { id: 'usuarios' }, { id: 'conteudo' }, { id: 'configuracoes' }, { id: 'sair' }],
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

function digitar(input: HTMLInputElement, texto: string) {
  input.value = texto;
  input.dispatchEvent(new Event('input'));
}

function tecla(input: HTMLInputElement, key: string) {
  input.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

describe('núcleo de busca (admin-busca-core.js)', () => {
  beforeEach(() => carregarBusca(criarApi()));

  it('exige ao menos 3 caracteres (aspas não contam)', () => {
    expect(nucleo().MIN_CARACTERES).toBe(3);
    expect(nucleo().termoPesquisavel('ab')).toBe(false);
    expect(nucleo().termoPesquisavel('abc')).toBe(true);
    expect(nucleo().termoPesquisavel('"ab"')).toBe(false);
    expect(nucleo().termoPesquisavel('"abc"')).toBe(true);
  });

  it('normaliza acentos e maiúsculas', () => {
    expect(nucleo().normalizar('  Ação   JOVENS ')).toBe('acao jovens');
  });

  it('parcial encontra trechos em ordem livre; exata exige o campo inteiro', () => {
    const itens = [{ tipo: 'conteudo', grupo: 'g', status: '', campos: ['Marcos Vieira'], texto: 'marcos vieira' }];
    expect(nucleo().filtrar(itens, { termo: 'vie mar' })).toHaveLength(1);
    expect(nucleo().filtrar(itens, { termo: '"Marcos"' })).toHaveLength(0);
    expect(nucleo().filtrar(itens, { termo: '"marcos vieira"' })).toHaveLength(1);
  });

  it('filtra por tipo, módulo e status em conjunto com o texto', () => {
    const itens = [
      { tipo: 'conteudo', grupo: 'Usuários', status: 'Ativo', campos: ['Ana'], texto: 'ana' },
      { tipo: 'acao', grupo: 'Ações', status: '', campos: ['Ana ação'], texto: 'ana acao' },
    ];
    expect(nucleo().filtrar(itens, { termo: 'ana', tipo: 'acao' })).toHaveLength(1);
    expect(nucleo().filtrar(itens, { termo: 'ana', grupo: 'Usuários', status: 'Ativo' })).toHaveLength(1);
  });

  it('agrupa por tipo na ordem fixa e omite categorias vazias', () => {
    const itens = [
      { tipo: 'acao', titulo: 'a' },
      { tipo: 'conteudo', titulo: 'c' },
    ];
    expect(nucleo().agrupar(itens).map((g) => g.id)).toEqual(['conteudo', 'acao']);
  });
});

describe('interface da busca (admin-busca.js)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('não pesquisa com 2 caracteres e mostra a orientação', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    digitar(input, 'ma');
    vi.advanceTimersByTime(500);
    expect(pop.textContent).toContain('Digite pelo menos 3 caracteres');
    expect(pop.querySelector('[data-idx]')).toBeNull();
  });

  it('com 3 caracteres, mostra carregamento e depois os resultados', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    digitar(input, 'mar');
    expect(pop.textContent).toContain('Pesquisando');
    vi.advanceTimersByTime(100);
    expect(pop.textContent).toContain('Pesquisando');
    vi.advanceTimersByTime(200);
    expect(pop.textContent).toContain('2 resultados');
    expect(pop.textContent).toContain('marcos@evangelhoquadrado.com');
  });

  it('separa os resultados em conteúdo, funcionalidade e ação', () => {
    const api = criarApi();
    api.state.users[0].nome = 'Usuario Marcos';
    const { input, pop } = montarPagina();
    carregarBusca(api);
    digitar(input, 'usuario');
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Conteúdo ·');
    expect(pop.textContent).toContain('Funcionalidade ·');
    expect(pop.textContent).toContain('Ação ·');
    expect(pop.textContent).toContain('Exportar usuários (CSV)');
  });

  it('encontra funcionalidades pelos sinônimos do módulo', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    digitar(input, 'sermao');
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Conteúdo (Sermões)');
    expect(pop.textContent).toContain('Funcionalidade ·');
  });

  it('Enter executa o primeiro resultado e limpa a busca', () => {
    const api = criarApi();
    const { input } = montarPagina();
    carregarBusca(api);
    digitar(input, 'marcos');
    vi.advanceTimersByTime(300);
    tecla(input, 'Enter');
    expect(api.state.section).toBe('usuarios');
    expect(api.state.userQuery).toBe('Marcos Vieira');
    expect(api.render).toHaveBeenCalled();
    expect(input.value).toBe('');
  });

  it('setas movem o item ativo e Enter executa o escolhido', () => {
    const api = criarApi();
    const { input } = montarPagina();
    carregarBusca(api);
    digitar(input, 'marcos');
    vi.advanceTimersByTime(300);
    tecla(input, 'Enter');
    expect(api.state.userQuery).toBe('Marcos Vieira');
    digitar(input, 'marcos');
    vi.advanceTimersByTime(300);
    tecla(input, 'ArrowDown');
    tecla(input, 'Enter');
    expect(api.state.section).toBe('conteudo');
    expect(api.state.contentQuery).toBe('A Fé Que Transforma Montanhas');
  });

  it('ação de atualizar aciona o botão real do painel', () => {
    const { input } = montarPagina();
    const botao = document.getElementById('refresh-btn') as HTMLButtonElement;
    const clique = vi.fn();
    botao.addEventListener('click', clique);
    carregarBusca(criarApi());
    digitar(input, 'atualizar');
    vi.advanceTimersByTime(300);
    tecla(input, 'Enter');
    expect(clique).toHaveBeenCalledTimes(1);
  });

  it('ação de exportar aciona o botão da própria seção', () => {
    const { input } = montarPagina();
    const clique = vi.fn();
    (document.querySelector('[data-action="export-users"]') as HTMLButtonElement).addEventListener('click', clique);
    carregarBusca(criarApi());
    digitar(input, 'exportar usuarios');
    vi.advanceTimersByTime(300);
    tecla(input, 'Enter');
    expect(clique).toHaveBeenCalledTimes(1);
  });

  it('ação de sair chama Actions.sair', () => {
    const api = criarApi();
    const { input } = montarPagina();
    carregarBusca(api);
    digitar(input, 'sair do painel');
    vi.advanceTimersByTime(300);
    tecla(input, 'Enter');
    expect(api.Actions.sair).toHaveBeenCalledTimes(1);
  });

  it('filtro de categoria mostra só o tipo escolhido', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    digitar(input, 'usuarios');
    vi.advanceTimersByTime(300);
    (pop.querySelector('[data-tipo="acao"]') as HTMLButtonElement).click();
    expect(pop.textContent).toContain('Ação ·');
    expect(pop.textContent).not.toContain('Funcionalidade ·');
  });

  it('mostra mensagem clara quando não há resultados', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    digitar(input, 'zzzzzz');
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Nenhum resultado para “zzzzzz”');
  });

  it('mostra erro com opção de tentar novamente quando a busca falha', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi({ secoesPermitidas: () => { throw new Error('falha'); } }));
    digitar(input, 'marcos');
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Não foi possível pesquisar agora');
    expect(pop.querySelector('[data-retry]')).not.toBeNull();
  });

  it('informa o módulo que falhou sem esconder os demais resultados', () => {
    const api = criarApi();
    Object.defineProperty(api.state, 'content', { get() { throw new Error('quebrou'); } });
    const { input, pop } = montarPagina();
    carregarBusca(api);
    digitar(input, 'marcos');
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Não foi possível pesquisar em: Conteúdo');
    expect(pop.textContent).toContain('Marcos Vieira');
  });

  it('respeita as permissões: usuário comum não recebe usuários nem ações restritas', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi({ secoesPermitidas: () => [{ id: 'overview' }, { id: 'conteudo' }] }));
    digitar(input, 'marcos');
    vi.advanceTimersByTime(300);
    expect(pop.textContent).not.toContain('marcos@evangelhoquadrado.com');
    digitar(input, 'exportar usuarios');
    vi.advanceTimersByTime(300);
    expect(pop.textContent).toContain('Nenhum resultado');
  });

  it('Escape limpa a busca e fecha a lista', () => {
    const { input, pop } = montarPagina();
    carregarBusca(criarApi());
    digitar(input, 'marcos');
    vi.advanceTimersByTime(300);
    tecla(input, 'Escape');
    expect(input.value).toBe('');
    expect(pop.hidden).toBe(true);
  });
});
