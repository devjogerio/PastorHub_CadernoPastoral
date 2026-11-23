/* ============================================================
   Foto de perfil — validação de formato e tamanho antes de
   gravar localStorage. Regras: JPEG/PNG/WebP/GIF, até 4 MB.
   ============================================================ */

export const FOTO_FORMATOS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/** Tamanho máximo aceito (4 MB) — erro acima dele. */
export const FOTO_MAX_BYTOS = 4 * 1024 * 1024;

/** Tamanho máximo de alerta — ainda valida, mas avisa o tamanho ideal. */
export const FOTO_AVISO_MAX_BYTOS = 3.5 * 1024 * 1024;

const FORMATOS = FOTO_FORMATOS as readonly string[];

/**
 * Valida o arquivo antes do preview.
 * Retorna null quando válido, ou a mensagem de erro para toast.
 */
export function validarFotoPerfil(arquivo: File | null | undefined): string | null {
  if (!arquivo) return 'Selecione uma imagem primeiro.';
  if (!FORMATOS.includes(arquivo.type)) {
    return 'Formato não suportado. Envie JPEG, PNG ou WebP.';
  }
  if (arquivo.size > FOTO_MAX_BYTOS) {
    return 'A imagem é muito grande. Tente até 4 MB.';
  }
  if (arquivo.size > FOTO_AVISO_MAX_BYTOS) {
    return `Tamanho de ${(arquivo.size / 1024 / 1024).toFixed(1)} MB — recomendado até 3,5 MB.`;
  }
  return null;
}

/** Gera a URL para o preview do arquivo selecionado. */
export function criarPreview(arquivo: File): string {
  return URL.createObjectURL(arquivo);
}

/** Libera a URL de preview criada para não vazamento de memória. */
export function revogarPreview(url: string | null | undefined): void {
  if (!url) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    /* preview inexistente: nada a fazer */
  }
}
