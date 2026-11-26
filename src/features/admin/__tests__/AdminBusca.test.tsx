/* @vitest-environment jsdom */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { AdminBusca } from '../AdminBusca';
import type { ItemBusca } from '../busca';

// Este arquivo monta React diretamente e envolve todas as atualizações em act().
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLElement;
let root: ReturnType<typeof createRoot>;
let navegar: Mock;

/* Spies criados junto com os itens e reutilizados entre os testes. */
const executores: Mock[] = [];
const itens: ItemBusca[] = [
  ...Array.from({ length: 7 }, (_, i): ItemBusca => {
    const executar = vi.fn();
    executores.push(executar);
    return {
      tipo: 'conteudo',
      grupo: 'Usuários',
      titulo: `Pastor Teste ${i + 1}`,
      sub: `p${i}@teste.app`,
      status: 'Ativo',
      campos: [`Pastor Teste ${i + 1}`, `p${i}@teste.app`, 'Administracao Geral'],
      executar,
    };
  }),
  {
    tipo: 'funcionalidade', grupo: 'Funcionalidades', titulo: 'Financeiro', sub: 'Cobrança e Pix', status: '',
    campos: ['Financeiro', 'cobranca pix', 'Administracao Geral'], executar: () => navegar('financeiro'),
  },
  {
    tipo: 'acao', grupo: 'Ações', titulo: 'Configurar Pix', sub: 'Abre o Financeiro', status: '',
    campos: ['configurar chave pix', 'Administracao Geral'], executar: () => navegar('pix'),
  },
];

beforeEach(() => {
  vi.useFakeTimers();
  navegar = vi.fn();
  executores.forEach((executar) => executar.mockClear());
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

function renderBusca() {
  act(() => {
    root.render(<AdminBusca itens={itens} />);
  });
}

function campo(): HTMLInputElement {
  return container.querySelector('input[role="combobox"]') as HTMLInputElement;
}

function digitar(texto: string) {
  const input = campo();
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(input, texto);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function avancar(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function tecla(key: string) {
  act(() => {
    campo().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
}

function clicarTexto(texto: string) {
  const botao = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes(texto));
  expect(botao).toBeTruthy();
  act(() => botao!.click());
}

describe('AdminBusca', () => {
  it('aguarda o debounce antes de mostrar resultados e indica carregamento', () => {
    renderBusca();
    digitar('pastor');
    expect(container.textContent).toContain('Pesquisando');
    avancar(100);
    expect(container.textContent).toContain('Pesquisando');
    avancar(200);
    expect(container.textContent).toContain('7 resultados');
    expect(container.textContent).not.toContain('Pesquisando');
  });

  it('mostra mensagem de resultado vazio com o termo pesquisado', () => {
    renderBusca();
    digitar('zzzz');
    avancar(300);
    expect(container.textContent).toContain('Nenhum resultado para "zzzz"');
  });

  it('orienta e não pesquisa com menos de 3 caracteres', () => {
    renderBusca();
    digitar('ab');
    avancar(300);
    expect(container.textContent).toContain('Digite pelo menos 3 caracteres');
    expect(container.textContent).not.toContain('resultado');
  });

  it('separa os resultados em conteúdo, funcionalidade e ação, sem paginação', () => {
    renderBusca();
    digitar('administracao');
    avancar(300);
    expect(container.textContent).toContain('Conteúdo · 7');
    expect(container.textContent).toContain('Funcionalidade · 1');
    expect(container.textContent).toContain('Ação · 1');
    expect(container.textContent).toContain('9 resultados');
    expect(container.textContent).not.toContain('Página');
    expect(container.textContent).not.toContain('Próxima');
  });

  it('ação clicada navega e limpa a busca', () => {
    renderBusca();
    digitar('configurar pix');
    avancar(300);
    clicarTexto('Configurar Pix');
    expect(navegar).toHaveBeenCalledWith('pix');
    expect(campo().value).toBe('');
    expect(container.textContent).not.toContain('1 resultado');
  });

  it('setas movem o item ativo e Enter executa o escolhido', () => {
    renderBusca();
    digitar('pastor');
    avancar(300);
    tecla('ArrowDown');
    tecla('Enter');
    expect(executores[1]).toHaveBeenCalledTimes(1);
    expect(executores[0]).not.toHaveBeenCalled();
  });

  it('Escape limpa a busca e remove os resultados', () => {
    renderBusca();
    digitar('pastor');
    avancar(300);
    tecla('Escape');
    expect(campo().value).toBe('');
    expect(container.textContent).toContain('Digite pelo menos 3 caracteres');
    expect(container.textContent).not.toContain('7 resultados');
  });

  it('filtra por categoria e por status sem perder os controles', () => {
    renderBusca();
    digitar('administracao');
    avancar(300);
    clicarTexto('Ação');
    expect(container.textContent).toContain('1 resultado');
    expect(container.textContent).toContain('Configurar Pix');
    expect(container.textContent).not.toContain('Pastor Teste 1');

    const select = container.querySelectorAll('select')[1] as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['todos', 'Ativo']);
    act(() => {
      select.value = 'Ativo';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(container.textContent).toContain('Nenhum resultado');
    expect(container.querySelector('[role="group"][aria-label="Filtrar por categoria"]')).not.toBeNull();
  });
});
