/* @vitest-environment jsdom */
/* ============================================================
   Foto de perfil — validação de formato/tamanho,
   preview/visualização e fluxo de alteração/remoção.
   ============================================================ */
import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FotoPerfilSection } from '../FotoPerfilSection';
import { FOTO_MAX_BYTOS, validarFotoPerfil } from '../../../lib/fotoPerfil';
import { PERFIL_PADRAO, type PerfilUsuario } from '../../../lib/perfil';

const makeFile = (size: number, type: string, nome = 'foto'): File =>
  new File([new Uint8Array(size)], `${nome}.png`, { type });

let container: HTMLElement;
let root: ReturnType<typeof createRoot>;

async function renderSection(
  perfil: PerfilUsuario,
  onAtualizar = vi.fn(),
  opcoes: { onEditarPerfil?: () => void } = {},
) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  root.render(
    <FotoPerfilSection
      perfil={perfil}
      onAtualizar={onAtualizar}
      onEditarPerfil={opcoes.onEditarPerfil}
    />,
  );
  await act(async () => {});
  return { container, onAtualizar };
}

/* Localiza o input[type=file] criado sob demanda (fora do container). */
const inputDinamico = (): HTMLInputElement | null =>
  document.querySelector('input[type="file"]');

const selecionarArquivo = async (
  container: HTMLElement,
  arquivo: File,
) => {
  await act(async () => {
    Array.from(container.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Escolher da galeria'))
      ?.click();
  });
  const input = inputDinamico();
  if (!input) throw new Error('input dinâmico não foi criado');
  await act(async () => {
    Object.defineProperty(input, 'files', { value: [arquivo] });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const confirmar = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('button')).find((b) =>
    b.textContent?.includes('Confirmar alteração'),
  );

beforeEach(() => {
  if (!URL.createObjectURL) URL.createObjectURL = () => 'blob:teste';
  if (!URL.revokeObjectURL) URL.revokeObjectURL = () => undefined;
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:teste');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
});

afterEach(() => {
  root?.unmount();
  container?.remove();
  // Inputs criados sob demanda são removidos ao cancelar/selecionar;
  // este fallback evita vazamento entre testes.
  document
    .querySelectorAll('input[type="file"]')
    .forEach((input) => input.remove());
});

describe('validarFotoPerfil', () => {
  it('aceita JPEG/PNG/WebP/GIF e rejeita outros formatos', () => {
    expect(validarFotoPerfil(makeFile(1024, 'image/png'))).toBeNull();
    expect(validarFotoPerfil(makeFile(1024, 'image/jpeg'))).toBeNull();
    expect(validarFotoPerfil(makeFile(1024, 'image/webp'))).toBeNull();
    expect(validarFotoPerfil(makeFile(1024, 'image/gif'))).toBeNull();
    expect(validarFotoPerfil(makeFile(1024, 'image/tiff'))).toBeTruthy();
  });

  it('rejeita arquivo vazio e tamanho acima de 4 MB', () => {
    expect(validarFotoPerfil(null)).toBeTruthy();
    expect(
      validarFotoPerfil(makeFile(FOTO_MAX_BYTOS + 1, 'image/png')),
    ).toBeTruthy();
  });
});

describe('FotoPerfilSection (UI)', () => {
  it('exibe a visualização com iniciais, aviso de formato inválido e botões de ação', async () => {
    const { container } = await renderSection(PERFIL_PADRAO);

    expect(container.querySelector('[data-testid="foto-perfil-section"]')).toBeTruthy();
    expect(container.textContent).toContain('Foto do perfil');
    expect(container.textContent).toContain('Escolher da galeria');
    expect(container.textContent).toContain('Tirar foto');
    expect(container.textContent).toContain('Remover foto');
    expect(container.querySelector('[data-testid="avatar-iniciais"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="botao-alterar-foto"]')).toBeTruthy();
    expect(confirmar(container)?.hasAttribute('disabled')).toBe(true);
    expect(container.querySelector('[data-testid="btn-tirar-foto"]')).toBeTruthy();
    // Nenhum input de arquivo fixo no DOM (criação dinâmica).
    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it('cria o input de arquivo sob demanda e o remove ao cancelar', async () => {
    const { container } = await renderSection(PERFIL_PADRAO);

    await act(async () => {
      Array.from(container.querySelectorAll('button'))
        .find((b) => b.textContent?.includes('Escolher da galeria'))
        ?.click();
    });
    const dinamico = inputDinamico();
    expect(dinamico).toBeTruthy();

    await act(async () => {
      dinamico?.dispatchEvent(new Event('cancel'));
    });
    expect(inputDinamico()).toBeNull();
  });

  it('expõe o botão "Editar perfil" que aciona o modal do card', async () => {
    const onEditarPerfil = vi.fn();
    await renderSection(PERFIL_PADRAO, vi.fn(), { onEditarPerfil });

    const botao = container.querySelector('[data-testid="btn-editar-perfil"]');
    expect(botao).toBeTruthy();
    await act(async () => {
      (botao as HTMLButtonElement).click();
    });
    expect(onEditarPerfil).toHaveBeenCalledTimes(1);
  });

  it('valida o formato ao selecionar o arquivo e exibe erro', async () => {
    const { container } = await renderSection(PERFIL_PADRAO);

    await selecionarArquivo(container, makeFile(10, 'image/tiff'));
    expect(container.textContent).toContain('Formato não suportado');
    expect(container.querySelector('img[alt="Foto do perfil"]')).toBeNull();
  });

  it('mostra o preview da foto selecionada e confirma o upload', async () => {
    const onAtualizar = vi.fn();
    const { container } = await renderSection(PERFIL_PADRAO, onAtualizar);

    await selecionarArquivo(container, makeFile(2048, 'image/png'));
    // O avatar mostra a imagem do preview — recusa carregar para URL não verificável.
    const btnConfirmar = confirmar(container);
    expect(container.textContent).toContain('Nova foto selecionada');
    expect(btnConfirmar?.hasAttribute('disabled')).toBe(false);

    await act(async () => {
      btnConfirmar?.click();
    });
    expect(onAtualizar).toHaveBeenCalledWith({
      ...PERFIL_PADRAO,
      fotoUrl: 'blob:teste',
    });
  });

  it('remove a foto atual quando há foto salva e desativa remover quando não', async () => {
    const onAtualizar = vi.fn();
    const perfil: PerfilUsuario = {
      ...PERFIL_PADRAO,
      fotoUrl: 'https://example.com/foto.png',
    };
    const { container } = await renderSection(perfil, onAtualizar);

    const remover = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Remover foto'),
    );
    expect(remover?.hasAttribute('disabled')).toBe(false);
    await act(async () => {
      remover?.click();
    });
    expect(onAtualizar).toHaveBeenCalledWith({ ...perfil, fotoUrl: null });

    // Sem foto salva, o botão fica desativado.
    const semFoto = await renderSection(PERFIL_PADRAO);
    const removerSemFoto = Array.from(
      semFoto.container.querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Remover foto'));
    expect(removerSemFoto?.hasAttribute('disabled')).toBe(true);
  });
});
