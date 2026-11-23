/* @vitest-environment jsdom */
/* ============================================================
   Amostra da obra — conteúdo somente leitura (sem pagamento) e
   delegação de Comprar/Alugar ao catálogo. O diálogo é aberto por um
   clique (como no catálogo), o que mantém o portal Radix estável.
   ============================================================ */
import React, { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AmostraDialog } from '../AmostraDialog';
import { LIVROS, type TipoAquisicao } from '../../../lib/biblioteca';

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

interface HarnessProps {
  onEscolherTipo: (tipo: TipoAquisicao) => void;
}

/* Botão "Abrir" simula o gatilho Amostra do catálogo. */
function Harness({ onEscolherTipo }: HarnessProps) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAberto(true)}>
        Abrir
      </button>
      <AmostraDialog
        livro={LIVROS[0]}
        aberto={aberto}
        onOpenChange={setAberto}
        onEscolherTipo={(tipo) => {
          setAberto(false);
          onEscolherTipo(tipo);
        }}
      />
    </>
  );
}

const botao = (texto: string) =>
  Array.from(document.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === texto,
  ) as HTMLButtonElement | undefined;

async function abrirDialogo(onEscolherTipo = vi.fn()) {
  await act(async () => {
    root.render(<Harness onEscolherTipo={onEscolherTipo} />);
  });
  await act(async () => {
    botao('Abrir')?.click();
  });
}

describe('AmostraDialog', () => {
  it('mostra a amostra sem formulário de pagamento', async () => {
    await abrirDialogo();

    expect(document.body.textContent).toContain('Amostra do conteúdo');
    expect(document.body.textContent).toContain(LIVROS[0].descricao);
    expect(document.querySelector('input[type="email"]')).toBeNull();
    expect(botao('Comprar')).toBeTruthy();
    expect(botao('Alugar')).toBeTruthy();

    await act(async () => {
      botao('Fechar')?.click();
    });
  });

  it('delega Comprar ao catálogo com o tipo comprar', async () => {
    const onEscolherTipo = vi.fn();
    await abrirDialogo(onEscolherTipo);

    await act(async () => {
      botao('Comprar')?.click();
    });
    expect(onEscolherTipo).toHaveBeenCalledWith('comprar');
  });

  it('delega Alugar ao catálogo com o tipo alugar', async () => {
    const onEscolherTipo = vi.fn();
    await abrirDialogo(onEscolherTipo);

    await act(async () => {
      botao('Alugar')?.click();
    });
    expect(onEscolherTipo).toHaveBeenCalledWith('alugar');
  });
});
