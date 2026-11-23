/**
 * Utilitários de formatação compartilhados pela migração do app estático.
 * Mantidos sem dependências externas para funcionar no PWA/APK offline.
 */

/** Remove acentos e coloca em minúsculas para busca tolerante a digitação. */
export function normalizar(valor: string): string {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Primeira letra maiúscula, restante preservado. */
export function capitalizar(valor: string): string {
  const texto = String(valor || '');
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : texto;
}

/** Iniciais para avatar (máximo 2 letras). */
export function iniciais(nome: string): string {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return 'PH';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/** Data ISO -> dd/mm/aaaa. Retorna o próprio valor se a data for inválida. */
export function dataBR(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return String(iso || '');
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);
}

/** Data ISO -> "seg, 23 nov". */
export function dataCurta(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return String(iso || '');
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
    .format(data)
    .replace('.', '');
}

/** Data ISO -> "Hoje - segunda-feira, 23 de novembro". */
export function dataExtensa(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return String(iso || '');
  const texto = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(data);
  const hoje = new Date();
  const mesmoDia =
    data.getDate() === hoje.getDate() &&
    data.getMonth() === hoje.getMonth() &&
    data.getFullYear() === hoje.getFullYear();
  return (mesmoDia ? 'Hoje - ' : '') + texto;
}

/** Identificador curto e legível para protocolos e chaves locais. */
export function protocolo(prefixo = 'PH'): string {
  const base = Date.now().toString(36).toUpperCase().slice(-5);
  const aleatorio = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefixo}-${base}${aleatorio}`;
}

/** Trunca texto preservando palavras. */
export function resumir(texto: string, limite = 110): string {
  const valor = String(texto || '').trim();
  if (valor.length <= limite) return valor;
  return `${valor.slice(0, limite).trimEnd()}…`;
}
