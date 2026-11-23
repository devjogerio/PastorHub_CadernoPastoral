/* @vitest-environment jsdom */
/* ============================================================
   Perfil — o card "Meu perfil" (article) é exibido exclusivamente
   em modal popup, aberto pelo botão "Editar perfil" da seção de
   foto e fechado pelo controle do próprio diálogo.
   ============================================================ */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PerfilPage } from '../PerfilPage';
import { solicitarCardPerfil } from '../../../lib/perfil';

const TEXTO_CARD = 'Veja e edite suas informações.';

let container: HTMLElement;
let root: ReturnType<typeof createRoot>;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  root?.unmount();
  container?.remove();
});

const textoCorpo = () => document.body.textContent || '';

describe('PerfilPage — modal do card "Meu perfil"', () => {
  it('não renderiza o artigo fora do modal', async () => {
    await act(async () => {
      root.render(<PerfilPage />);
    });
    expect(textoCorpo()).not.toContain(TEXTO_CARD);
  });

  it('"Editar perfil" abre o formulário de edição, não o card', async () => {
    await act(async () => {
      root.render(<PerfilPage />);
    });

    const botaoEditar = container.querySelector(
      '[data-testid="btn-editar-perfil"]',
    ) as HTMLButtonElement;
    expect(botaoEditar).toBeTruthy();

    await act(async () => {
      botaoEditar.click();
    });
    expect(document.querySelector('#perfil-nome')).toBeTruthy();
    expect(textoCorpo()).not.toContain(TEXTO_CARD);

    const cancelar = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent === 'Cancelar',
    ) as HTMLButtonElement;
    await act(async () => {
      cancelar.click();
    });
  });

  it('o avatar do cabeçalho (solicitarCardPerfil) abre o card em modal', async () => {
    await act(async () => {
      root.render(<PerfilPage />);
    });
    expect(textoCorpo()).not.toContain(TEXTO_CARD);

    await act(async () => {
      solicitarCardPerfil();
    });
    expect(textoCorpo()).toContain(TEXTO_CARD);

    const fechar = document.querySelector(
      '[data-slot="dialog-content"] > button',
    ) as HTMLButtonElement;
    await act(async () => {
      fechar.click();
    });
    expect(textoCorpo()).not.toContain(TEXTO_CARD);
  });

  it('não mantém inputs de arquivo fixos no DOM', async () => {
    await act(async () => {
      root.render(<PerfilPage />);
    });
    expect(document.querySelectorAll('input[type="file"]')).toHaveLength(0);
  });
});
