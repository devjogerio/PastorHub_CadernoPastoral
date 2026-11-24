/* ============================================================
   Busca do painel administrativo (React): lógica pura e tipada.
   Mesma semântica da busca do painel estático (admin-busca-core.js):
   - texto parcial: todas as palavras digitadas devem aparecer no conteúdo;
   - "texto entre aspas": correspondência exata com um dos campos;
   - mínimo de 2 caracteres para busca parcial.
   ============================================================ */

export interface ItemBusca {
  grupo: string;
  titulo: string;
  sub: string;
  status: string;
  campos: string[];
}

export interface FiltrosBusca {
  termo: string;
  grupo: string;
  status: string;
}

export interface Paginacao<T> {
  itens: T[];
  pagina: number;
  totalPaginas: number;
  total: number;
}

export const MIN_CARACTERES_PARCIAL = 2;
export const TODOS = 'todos';

export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function interpretarTermo(bruto: string): { texto: string; modo: 'parcial' | 'exato' } {
  const t = bruto.trim();
  const entreAspas = t.length >= 2 && t.startsWith('"') && t.endsWith('"');
  if (entreAspas) return { texto: normalizarTexto(t.slice(1, -1)), modo: 'exato' };
  return { texto: normalizarTexto(t), modo: 'parcial' };
}

function termoValido(termo: { texto: string; modo: 'parcial' | 'exato' }): boolean {
  return termo.modo === 'exato' ? termo.texto.length >= 1 : termo.texto.length >= MIN_CARACTERES_PARCIAL;
}

export function termoEhPesquisavel(bruto: string): boolean {
  return termoValido(interpretarTermo(bruto));
}

function correspondeItem(item: ItemBusca, termo: { texto: string; modo: 'parcial' | 'exato' }): boolean {
  if (termo.modo === 'exato') {
    return item.campos.some((campo) => normalizarTexto(campo) === termo.texto);
  }
  const texto = normalizarTexto(item.campos.join(' '));
  return termo.texto.split(' ').every((palavra) => texto.includes(palavra));
}

export function buscarItens(itens: ItemBusca[], filtros: FiltrosBusca): ItemBusca[] {
  const termo = interpretarTermo(filtros.termo);
  if (!termoValido(termo)) return [];
  return itens.filter((item) => {
    if (filtros.grupo !== TODOS && item.grupo !== filtros.grupo) return false;
    if (filtros.status !== TODOS && item.status !== filtros.status) return false;
    return correspondeItem(item, termo);
  });
}

export function paginarItens<T>(lista: T[], pagina: number, tamanho: number): Paginacao<T> {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / tamanho));
  const atual = Math.min(Math.max(1, pagina), totalPaginas);
  const inicio = (atual - 1) * tamanho;
  return {
    itens: lista.slice(inicio, inicio + tamanho),
    pagina: atual,
    totalPaginas,
    total: lista.length,
  };
}

export interface FontesAdmin {
  usuarios: { nome: string; email: string; igreja: string; cidade: string; plano: string; status: string }[];
  contas: { nome: string; email: string; papel: string; origem?: string }[];
  logs: { usuario: string; acao: string; alvo: string; tipo: string; hora: string }[];
  planos: { nome: string; desc: string }[];
}

export function montarIndiceAdmin(fontes: FontesAdmin): ItemBusca[] {
  const usuarios = fontes.usuarios.map((u): ItemBusca => ({
    grupo: 'Usuários', titulo: u.nome, sub: `${u.email} · ${u.igreja}`, status: u.status,
    campos: [u.nome, u.email, u.igreja, u.cidade, u.plano],
  }));
  const contas = fontes.contas.map((c): ItemBusca => ({
    grupo: 'Contas', titulo: c.nome, sub: `${c.email} · ${c.papel}`, status: c.papel,
    campos: [c.nome, c.email, c.papel, c.origem ?? ''],
  }));
  const logs = fontes.logs.map((l): ItemBusca => ({
    grupo: 'Registros', titulo: l.acao, sub: `${l.usuario} · ${l.alvo} · ${l.hora}`, status: l.tipo,
    campos: [l.acao, l.usuario, l.alvo],
  }));
  const planos = fontes.planos.map((p): ItemBusca => ({
    grupo: 'Planos', titulo: p.nome, sub: p.desc, status: '',
    campos: [p.nome, p.desc],
  }));
  return [...usuarios, ...contas, ...logs, ...planos];
}
