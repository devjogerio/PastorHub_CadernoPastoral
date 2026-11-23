/**
 * Acesso seguro ao localStorage. Todas as operações são tolerantes a falhas:
 * navegadores em modo privado e o APK podem bloquear o storage, e a aplicação
 * não deve quebrar por causa disso.
 */

export function lerJSON<T>(chave: string, padrao: T): T {
  try {
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return padrao;
    const valor = JSON.parse(bruto) as T;
    return valor ?? padrao;
  } catch {
    return padrao;
  }
}

export function salvarJSON(chave: string, valor: unknown): boolean {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function lerTexto(chave: string, padrao = ''): string {
  try {
    return window.localStorage.getItem(chave) ?? padrao;
  } catch {
    return padrao;
  }
}

export function salvarTexto(chave: string, valor: string): boolean {
  try {
    window.localStorage.setItem(chave, valor);
    return true;
  } catch {
    return false;
  }
}

export function removerChave(chave: string): void {
  try {
    window.localStorage.removeItem(chave);
  } catch {
    /* storage indisponível: nada a fazer */
  }
}

/** Chaves usadas pela migração, centralizadas para evitar strings soltas. */
export const CHAVES = {
  perfil: 'pastorhub_perfil_usuario',
  agenda: 'pastorhub_usuario_agenda',
  chats: 'pastorhub_usuario_chats',
  favoritos: 'pastorhub_favoritos',
  favoritosBiblioteca: 'pastorhub_biblioteca_favs',
  pedidosBiblioteca: 'pastorhub_biblioteca_pedidos',
  progressoLeitura: 'pastorhub_biblioteca_progresso',
  tema: 'pastorhub_tema',
} as const;
