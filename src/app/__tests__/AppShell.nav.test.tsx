/* @vitest-environment jsdom */
/* ============================================================
   Menu lateral — a seção "Documentos" saiu da navegação e a
   entrada "Biblioteca Digital" fica logo abaixo de "Painel admin",
   tanto na sidebar quanto no drawer.
   ============================================================ */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AppShell } from '../AppShell';

let container: HTMLElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  root.unmount();
  container.remove();
});

/* Renderiza o shell autenticado sem depender de contexto externo. */
function renderShell() {
  act(() => {
    root.render(
      <AppShell
        rota="inicio"
        nome="Ana Souza"
        email="ana@exemplo.com"
        onBuscar={() => undefined}
      >
        conteúdo
      </AppShell>,
    );
  });
}

describe('AppShell — navegação lateral', () => {
  it('remove Documentos e posiciona Biblioteca Digital após Painel admin', () => {
    renderShell();

    const menus = Array.from(container.querySelectorAll('nav'));
    expect(menus.length).toBeGreaterThan(0);
    expect(menus.some((menu) => (menu.textContent ?? '').includes('Documentos'))).toBe(false);

    const rotulos = Array.from(container.querySelectorAll('nav a')).map(
      (link) => link.textContent?.trim() ?? '',
    );
    const posicaoAdmin = rotulos.indexOf('Painel admin');
    const posicaoBiblioteca = rotulos.indexOf('Biblioteca Digital');

    expect(posicaoAdmin).toBeGreaterThanOrEqual(0);
    expect(posicaoBiblioteca).toBe(posicaoAdmin + 1);
  });
});
