/* ============================================================
   Busca do painel administrativo (React): lógica pura e tipada.
   Mesma semântica da busca do painel estático (admin-busca-core.js):
   - mínimo de 3 caracteres para pesquisar;
   - texto parcial: todas as palavras digitadas devem aparecer no conteúdo;
   - "texto entre aspas": correspondência exata com um dos campos;
   - categorias: conteúdo, funcionalidade e ação.
   ============================================================ */

export type TipoBusca = 'conteudo' | 'funcionalidade' | 'acao';

export interface ItemBusca {
  tipo: TipoBusca;
  grupo: string;
  titulo: string;
  sub: string;
  status: string;
  campos: string[];
  executar?: () => void;
}

export interface FiltrosBusca {
  termo: string;
  tipo: string;
  grupo: string;
  status: string;
}

export interface GrupoTipo {
  id: TipoBusca;
  rotulo: string;
  itens: ItemBusca[];
}

export const MIN_CARACTERES = 3;
export const TODOS = 'todos';

export const TIPOS: { id: TipoBusca; rotulo: string }[] = [
  { id: 'conteudo', rotulo: 'Conteúdo' },
  { id: 'funcionalidade', rotulo: 'Funcionalidade' },
  { id: 'acao', rotulo: 'Ação' },
];

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

export function termoEhPesquisavel(bruto: string): boolean {
  return interpretarTermo(bruto).texto.length >= MIN_CARACTERES;
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
  if (termo.texto.length < MIN_CARACTERES) return [];
  return itens.filter((item) => {
    if (filtros.tipo !== TODOS && item.tipo !== filtros.tipo) return false;
    if (filtros.grupo !== TODOS && item.grupo !== filtros.grupo) return false;
    if (filtros.status !== TODOS && item.status !== filtros.status) return false;
    return correspondeItem(item, termo);
  });
}

/* Agrupa na ordem fixa de TIPOS e descarta categorias vazias. */
export function agruparPorTipo(lista: ItemBusca[]): GrupoTipo[] {
  return TIPOS.map((t) => ({
    id: t.id,
    rotulo: t.rotulo,
    itens: lista.filter((item) => item.tipo === t.id),
  })).filter((g) => g.itens.length > 0);
}

export interface FontesAdmin {
  usuarios: { nome: string; email: string; igreja: string; cidade: string; plano: string; status: string }[];
  contas: { nome: string; email: string; papel: string; origem?: string }[];
  logs: { usuario: string; acao: string; alvo: string; tipo: string; hora: string }[];
  planos: { nome: string; desc: string }[];
  navegar: (aba: string) => void;
}

/* Funcionalidades e ações apontam para as abas reais do painel React. */
function funcionalidadesEAcoes(navegar: (aba: string) => void): ItemBusca[] {
  return [
    {
      tipo: 'funcionalidade', grupo: 'Funcionalidades', titulo: 'Painel', sub: 'Visão geral de cobrança e operação',
      status: '', campos: ['Painel', 'visao geral dashboard indicadores kpi'], executar: () => navegar('painel'),
    },
    {
      tipo: 'funcionalidade', grupo: 'Funcionalidades', titulo: 'Financeiro', sub: 'Cobrança, Pix e recorrência',
      status: '', campos: ['Financeiro', 'cobranca receita pix recorrencia'], executar: () => navegar('financeiro'),
    },
    {
      tipo: 'funcionalidade', grupo: 'Funcionalidades', titulo: 'Planos', sub: 'Planos e limites da assinatura',
      status: '', campos: ['Planos', 'assinatura preco limites faturamento'], executar: () => navegar('planos'),
    },
    {
      tipo: 'acao', grupo: 'Ações', titulo: 'Configurar chave Pix', sub: 'Abre o Financeiro para salvar a chave',
      status: '', campos: ['configurar chave pix salvar'], executar: () => navegar('financeiro'),
    },
    {
      tipo: 'acao', grupo: 'Ações', titulo: 'Editar planos', sub: 'Abre a edição de nome e limites dos planos',
      status: '', campos: ['editar planos nome limites'], executar: () => navegar('planos'),
    },
  ];
}

export function montarIndiceAdmin(fontes: FontesAdmin): ItemBusca[] {
  const usuarios = fontes.usuarios.map((u): ItemBusca => ({
    tipo: 'conteudo', grupo: 'Usuários', titulo: u.nome, sub: `${u.email} · ${u.igreja}`, status: u.status,
    campos: [u.nome, u.email, u.igreja, u.cidade, u.plano],
  }));
  const contas = fontes.contas.map((c): ItemBusca => ({
    tipo: 'conteudo', grupo: 'Contas', titulo: c.nome, sub: `${c.email} · ${c.papel}`, status: c.papel,
    campos: [c.nome, c.email, c.papel, c.origem ?? ''],
  }));
  const logs = fontes.logs.map((l): ItemBusca => ({
    tipo: 'conteudo', grupo: 'Registros', titulo: l.acao, sub: `${l.usuario} · ${l.alvo} · ${l.hora}`, status: l.tipo,
    campos: [l.acao, l.usuario, l.alvo],
  }));
  const planos = fontes.planos.map((p): ItemBusca => ({
    tipo: 'conteudo', grupo: 'Planos', titulo: p.nome, sub: p.desc, status: '',
    campos: [p.nome, p.desc],
  }));
  return [...usuarios, ...contas, ...logs, ...planos, ...funcionalidadesEAcoes(fontes.navegar)];
}
