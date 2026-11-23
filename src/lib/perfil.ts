import { CHAVES, lerJSON, salvarJSON } from './armazenamento';

/** Perfil local do usuário — mesma chave e formato do app estático. */
export interface PerfilUsuario {
  nome: string;
  apelido: string;
  email: string;
  cidade: string;
  membroDesde: string;
  /** Data URL da foto do perfil (compatível com app estático). */
  fotoUrl?: string | null;
}

export const PERFIL_PADRAO: PerfilUsuario = {
  nome: 'Ana Silva',
  apelido: 'Serva de Cristo',
  email: 'ana.silva@email.com',
  cidade: 'São Paulo - SP',
  membroDesde: '2021',
  fotoUrl: null,
};

const EVENTO_ABRIR_CARD = 'pastorhub:abrir-card-perfil';
const CHAVE_ABRIR_CARD = 'pastorhub_abrir_card_perfil';

/* Pede que a tela de perfil abra o card "Meu perfil" em modal. O flag em
   sessionStorage cobre a montagem da tela; o evento cobre tela já aberta. */
export function solicitarCardPerfil(): void {
  sessionStorage.setItem(CHAVE_ABRIR_CARD, '1');
  window.dispatchEvent(new Event(EVENTO_ABRIR_CARD));
}

export function consumirSolicitacaoCardPerfil(): boolean {
  const pedido = sessionStorage.getItem(CHAVE_ABRIR_CARD) === '1';
  sessionStorage.removeItem(CHAVE_ABRIR_CARD);
  return pedido;
}

export function ouvirSolicitacaoCardPerfil(ouvinte: () => void): () => void {
  window.addEventListener(EVENTO_ABRIR_CARD, ouvinte);
  return () => window.removeEventListener(EVENTO_ABRIR_CARD, ouvinte);
}

export function carregarPerfil(): PerfilUsuario {
  return { ...PERFIL_PADRAO, ...lerJSON<Partial<PerfilUsuario>>(CHAVES.perfil, {}) };
}

export function salvarPerfil(dados: PerfilUsuario): boolean {
  return salvarJSON(CHAVES.perfil, dados);
}

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Valida nome e e-mail antes de persistir. */
export function validarPerfil(dados: PerfilUsuario): string | null {
  if (!dados.nome.trim()) return 'Informe seu nome.';
  if (!dados.apelido.trim()) return 'Informe um apelido ou frase.';
  if (!EMAIL_VALIDO.test(dados.email.trim())) return 'Informe um e-mail válido.';
  if (!dados.cidade.trim()) return 'Informe sua cidade.';
  return null;
}

/** Compartilha pelo share sheet nativo; sem suporte, copia o resumo. */
export async function compartilharPerfil(
  perfil: PerfilUsuario,
): Promise<string> {
  const texto = `${perfil.nome} · ${perfil.apelido}`;
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'Meu perfil – PastorHub', text: texto });
      return 'Perfil compartilhado.';
    } catch {
      return '';
    }
  }
  try {
    await navigator.clipboard.writeText(texto);
    return 'Resumo do perfil copiado.';
  } catch {
    return 'Não foi possível compartilhar neste navegador.';
  }
}
