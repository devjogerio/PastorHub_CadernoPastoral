/* @vitest-environment jsdom */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminBusca } from '../AdminBusca';
import type { ItemBusca } from '../busca';

let container: HTMLElement;
let root: ReturnType<typeof createRoot>;

const itens: ItemBusca[] = Array.from({ length: 7 }, (_, i) => ({
  grupo: 'Usuários',
  titulo: `Pastor Teste ${i + 1}`,
  sub: `p${i}@teste.app`,
  status: 'Ativo',
  campos: [`Pastor Teste ${i + 1}`, `p${i}@teste.app`],
}));

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  root.unmount();
  container.remove();
  vi.useRealTimers();
});

function renderBusca() {
  act(() => {
    root.render(<AdminBusca itens={itens} />);
  });
}

function digitar(texto: string) {
  const input = container.querySelector('input[role="searchbox"]') as HTMLInputElement;
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

describe('AdminBusca', () => {
  it('aguarda o debounce antes de mostrar resultados e indica carregamento', () => {
    renderBusca();
    digitar('pastor');
    expect(container.textContent).toContain('Pesquisando');
    avancar(100);
    expect(container.textContent).toContain('Pesquisando');
    avancar(200);
    expect(container.textContent).toContain('7 resultados');
  });

  it('mostra mensagem de resultado vazio com o termo pesquisado', () => {
    renderBusca();
    digitar('zzzz');
    avancar(300);
    expect(container.textContent).toContain('Nenhum resultado para "zzzz"');
  });

  it('orienta quando o termo tem menos de 2 caracteres', () => {
    renderBusca();
    digitar('a');
    avancar(300);
    expect(container.textContent).toContain('Digite pelo menos 2 caracteres');
  });

  it('pagina os resultados e permite voltar à página anterior', () => {
    renderBusca();
    digitar('pastor teste');
    avancar(300);
    expect(container.textContent).toContain('Página 1 de 2');
    const proxima = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Próxima'))!;
    act(() => proxima.click());
    expect(container.textContent).toContain('Página 2 de 2');
    expect(container.textContent).toContain('Pastor Teste 7');
    const anterior = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Anterior'))!;
    act(() => anterior.click());
    expect(container.textContent).toContain('Página 1 de 2');
  });

  it('filtra por status pelo seletor', () => {
    renderBusca();
    digitar('pastor');
    avancar(300);
    const select = container.querySelectorAll('select')[1] as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.value)).toEqual(['todos', 'Ativo']);
    act(() => {
      select.value = 'Ativo';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(container.textContent).toContain('7 resultados');
  });
});
