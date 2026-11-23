import { CHAVES, lerJSON, salvarJSON } from './armazenamento';
import { normalizar, protocolo } from './format';

/* ============================================================
   Acervo da Biblioteca Digital — dados portados de
   pastorhub-static/js/biblioteca.js, agora tipados.
   ============================================================ */

export interface CategoriaBiblioteca {
  id: string;
  nome: string;
  cor: string;
}

export interface LivroBiblioteca {
  id: string;
  titulo: string;
  autor: string;
  ano: number;
  categoria: string;
  paginas: number;
  licenca: string;
  emoji: string;
  gradiente: string;
  descricao: string;
  destaques: string[];
}

export type TipoAquisicao = 'comprar' | 'alugar';

export interface PedidoBiblioteca {
  protocolo: string;
  livroId: string;
  titulo: string;
  tipo: TipoAquisicao;
  pagamento: string;
  email: string;
  data: string;
}

export const CATEGORIAS: CategoriaBiblioteca[] = [
  { id: 'patristica', nome: 'Patrística', cor: '#7c3aed' },
  { id: 'sistematica', nome: 'Teologia Sistemática', cor: '#3261AB' },
  { id: 'devocional', nome: 'Devocional', cor: '#95C121' },
  { id: 'pastoral', nome: 'Vida Pastoral', cor: '#f59e0b' },
  { id: 'historia', nome: 'História & Apologética', cor: '#0b7285' },
  { id: 'homiletica', nome: 'Homilética', cor: '#d4183d' },
];

export const LIVROS: LivroBiblioteca[] = [
  {
    id: 'confissoes',
    titulo: 'Confissões',
    autor: 'Agostinho de Hipona',
    ano: 397,
    categoria: 'patristica',
    paginas: 400,
    licenca: 'Domínio público',
    emoji: '📜',
    gradiente: 'linear-gradient(140deg, #001a2f, #3261AB)',
    descricao:
      'A obra fundadora da autobiografia cristã: a jornada de Agostinho da busca intelectual ao encontro com Deus.',
    destaques: [
      'Clássico da espiritualidade ocidental',
      'Modelo de testemunho e conversão',
      'Ideal para aconselhamento e discipulado',
    ],
  },
  {
    id: 'cidade-de-deus',
    titulo: 'A Cidade de Deus (seleção)',
    autor: 'Agostinho de Hipona',
    ano: 426,
    categoria: 'patristica',
    paginas: 1100,
    licenca: 'Domínio público',
    emoji: '🏛️',
    gradiente: 'linear-gradient(140deg, #001a2f, #0b7285)',
    descricao:
      'A primeira grande teologia da história: a tensão entre a cidade terrena e a cidade de Deus.',
    destaques: [
      'Base da doutrina social cristã',
      'Leitura de formação teológica',
      'Referência para sermões e ensino',
    ],
  },
  {
    id: 'imitacao-de-cristo',
    titulo: 'A Imitação de Cristo',
    autor: 'Tomás de Kempis',
    ano: 1418,
    categoria: 'devocional',
    paginas: 180,
    licenca: 'Domínio público',
    emoji: '✝️',
    gradiente: 'linear-gradient(140deg, #14532d, #95C121)',
    descricao:
      'Um dos livros mais lidos da história cristã: simplicidade, humildade e vida interior.',
    destaques: [
      'Leitura diária de 5 minutos',
      'Clássico devocional universal',
      'Excelente para novos convertidos',
    ],
  },
  {
    id: 'o-peregrino',
    titulo: 'O Peregrino',
    autor: 'John Bunyan',
    ano: 1678,
    categoria: 'devocional',
    paginas: 220,
    licenca: 'Domínio público',
    emoji: '🛤️',
    gradiente: 'linear-gradient(140deg, #7c2d12, #f59e0b)',
    descricao:
      'A alegoria da jornada cristã, escrita na prisão: fé, provações e perseverança até a Cidade Celestial.',
    destaques: [
      'Alegoria cristã mais traduzida',
      'Ótima para séries de pregação',
      'Linguagem acessível a todas as idades',
    ],
  },
  {
    id: 'graca-abundante',
    titulo: 'Graça Abundante ao Principal dos Pecadores',
    autor: 'John Bunyan',
    ano: 1666,
    categoria: 'devocional',
    paginas: 160,
    licenca: 'Domínio público',
    emoji: '🌿',
    gradiente: 'linear-gradient(140deg, #134e4a, #10b981)',
    descricao:
      'A autobiografia espiritual de Bunyan: da culpa ao consolo da graça.',
    destaques: [
      'Testemunho de restauração',
      'Base para aconselhamento',
      'Leitura pastoral profunda',
    ],
  },
  {
    id: 'pastor-aprovado',
    titulo: 'O Pastor Aprovado',
    autor: 'Richard Baxter',
    ano: 1656,
    categoria: 'pastoral',
    paginas: 320,
    licenca: 'Domínio público',
    emoji: '🕯️',
    gradiente: 'linear-gradient(140deg, #78350f, #b45309)',
    descricao:
      'O manual clássico do ministério pastoral: cuidado das almas, pregação e vida de oração.',
    destaques: [
      'Leitura obrigatória para pastores',
      'Plano de visitação e cuidado',
      'Base para mentoria pastoral',
    ],
  },
  {
    id: 'instituto-calvino',
    titulo: 'Instituto da Religião Cristã (seleção)',
    autor: 'João Calvino',
    ano: 1536,
    categoria: 'sistematica',
    paginas: 480,
    licenca: 'Domínio público',
    emoji: '📚',
    gradiente: 'linear-gradient(140deg, #001a2f, #1d4ed8)',
    descricao:
      'A sistematização da fé reformada: doutrina, igreja e vida cristã em uma obra monumental.',
    destaques: [
      'Referência da teologia reformada',
      'Percursos orientados por tema',
      'Formação de líderes e professores',
    ],
  },
  {
    id: 'suma-teologica',
    titulo: 'Suma Teológica (seleção)',
    autor: 'Tomás de Aquino',
    ano: 1274,
    categoria: 'sistematica',
    paginas: 560,
    licenca: 'Domínio público',
    emoji: '⚖️',
    gradiente: 'linear-gradient(140deg, #1e1b4b, #6d28d9)',
    descricao:
      'A catedral do pensamento medieval: fé e razão em diálogo rigoroso.',
    destaques: [
      'Método de perguntas e respostas',
      'Formação filosófica e teológica',
      'Seleção comentada por tema',
    ],
  },
  {
    id: 'pensamentos',
    titulo: 'Pensamentos',
    autor: 'Blaise Pascal',
    ano: 1670,
    categoria: 'historia',
    paginas: 240,
    licenca: 'Domínio público',
    emoji: '🕊️',
    gradiente: 'linear-gradient(140deg, #0c4a6e, #0891b2)',
    descricao:
      'A apologia cristã mais brilhante da modernidade: o coração, a razão e o sentido da vida.',
    destaques: [
      'Apologética clássica',
      'Ótimo para encontros e estudos',
      'Frases marcantes para pregação',
    ],
  },
  {
    id: 'livro-dos-martires',
    titulo: 'O Livro dos Mártires',
    autor: 'John Foxe',
    ano: 1563,
    categoria: 'historia',
    paginas: 380,
    licenca: 'Domínio público',
    emoji: '🔥',
    gradiente: 'linear-gradient(140deg, #7f1d1d, #d4183d)',
    descricao:
      'A memória dos que deram a vida pela fé: história, coragem e fidelidade.',
    destaques: [
      'História da igreja em narrativa',
      'Série de sermões sobre perseverança',
      'Leitura inspiradora',
    ],
  },
  {
    id: 'pratica-da-presenca',
    titulo: 'A Prática da Presença de Deus',
    autor: 'Irmão Lourenço',
    ano: 1691,
    categoria: 'devocional',
    paginas: 96,
    licenca: 'Domínio público',
    emoji: '🌅',
    gradiente: 'linear-gradient(140deg, #0f766e, #14b8a6)',
    descricao:
      'Cartas e conversas sobre viver na presença de Deus em meio às tarefas comuns.',
    destaques: [
      'Leitura curta e profunda',
      'Devocional para a rotina',
      'Ótimo para grupos pequenos',
    ],
  },
  {
    id: 'sermoes-spurgeon',
    titulo: 'Sermões Selecionados',
    autor: 'Charles H. Spurgeon',
    ano: 1855,
    categoria: 'homiletica',
    paginas: 300,
    licenca: 'Domínio público',
    emoji: '🎙️',
    gradiente: 'linear-gradient(140deg, #001a2f, #95C121)',
    descricao:
      'O príncipe dos pregadores: estrutura, imaginação e unção em sermões que marcaram época.',
    destaques: [
      'Modelo de estrutura homilética',
      'Ilustrações e aplicações',
      'Estudo para pregadores',
    ],
  },
];

export const METRICAS = [
  { v: '12', l: 'obras no acervo inicial' },
  { v: '6', l: 'categorias teológicas' },
  { v: '100%', l: 'domínio público' },
  { v: '3', l: 'fases até o v2.0' },
];

const PALETA_IMPORTACAO = [
  '#3261AB',
  '#95C121',
  '#f59e0b',
  '#0b7285',
  '#d4183d',
  '#7c3aed',
  '#16a34a',
  '#dc2626',
];

/** Localiza a categoria de um livro, com fallback visual estável. */
export function categoriaDe(
  id: string,
  categorias: CategoriaBiblioteca[] = CATEGORIAS,
): CategoriaBiblioteca {
  return (
    categorias.find((categoria) => categoria.id === id) ?? {
      id,
      nome: id,
      cor: '#3261AB',
    }
  );
}

export function buscarLivro(
  id: string,
  livros: LivroBiblioteca[] = LIVROS,
): LivroBiblioteca | undefined {
  return livros.find((livro) => livro.id === id);
}

/** Busca tolerante a acentos por título, autor e descrição. */
export function filtrarLivros(
  livros: LivroBiblioteca[],
  filtros: { termo?: string; categoria?: string },
): LivroBiblioteca[] {
  const termo = normalizar(filtros.termo || '');
  const categoria = filtros.categoria || 'todos';
  return livros.filter((livro) => {
    const combinaCategoria =
      categoria === 'todos' || livro.categoria === categoria;
    if (!combinaCategoria) return false;
    if (!termo) return true;
    return (
      normalizar(
        `${livro.titulo} ${livro.autor} ${livro.descricao}`,
      ).indexOf(termo) !== -1
    );
  });
}

export interface AcervoImportado {
  categorias: CategoriaBiblioteca[];
  livros: LivroBiblioteca[];
}

export type ResultadoImportacao =
  | ({ ok: true; mensagem: string } & AcervoImportado)
  | { ok: false; erros: string[] };

/**
 * Valida e normaliza um acervo vindo de JSON. Regras idênticas às do projeto
 * estático: categorias ausentes são criadas, livros sem id recebem um.
 */
export function validarImportacao(dados: unknown): ResultadoImportacao {
  if (!dados || typeof dados !== 'object') {
    return {
      ok: false,
      erros: ['O arquivo não é um acervo válido (objeto JSON esperado).'],
    };
  }

  const bruto = dados as { categorias?: unknown; livros?: unknown };
  const categorias: CategoriaBiblioteca[] = [];
  const vistos = new Set<string>();

  (Array.isArray(bruto.categorias) ? bruto.categorias : []).forEach((item) => {
    const categoria = item as Partial<CategoriaBiblioteca>;
    if (!categoria?.id || vistos.has(String(categoria.id))) return;
    vistos.add(String(categoria.id));
    categorias.push({
      id: String(categoria.id),
      nome: String(categoria.nome || categoria.id),
      cor: String(categoria.cor || '#3261AB'),
    });
  });

  const livrosBrutos = Array.isArray(bruto.livros) ? bruto.livros : [];
  const livros = livrosBrutos.map((item, indice) =>
    normalizarLivro(
      item as Partial<LivroBiblioteca>,
      indice,
      categorias,
    ),
  );

  if (!livros.length) {
    return { ok: false, erros: ['Nenhum livro encontrado no arquivo.'] };
  }

  return {
    ok: true,
    categorias,
    livros,
    mensagem: `${livros.length} livros · ${categorias.length} categorias importadas.`,
  };
}

/** Normaliza um livro importado e registra a categoria usada. */
function normalizarLivro(
  livro: Partial<LivroBiblioteca>,
  indice: number,
  categorias: CategoriaBiblioteca[],
): LivroBiblioteca {
  const id = String(livro.id || `livro-${indice + 1}`);
  const categoriaId = livro.categoria ? String(livro.categoria) : 'geral';
  if (!categorias.some((categoria) => categoria.id === categoriaId)) {
    categorias.push({
      id: categoriaId,
      nome: categoriaId,
      cor: PALETA_IMPORTACAO[indice % PALETA_IMPORTACAO.length],
    });
  }
  return {
    id,
    titulo: String(livro.titulo || `Sobre ${id}`),
    autor: String(livro.autor || 'Autor não informado'),
    ano: Number(livro.ano) || 0,
    paginas: Number(livro.paginas) || 0,
    categoria: categoriaId,
    licenca: String(livro.licenca || 'Licença não especificada'),
    emoji: String(livro.emoji || '📖'),
    gradiente: String(
      livro.gradiente || 'linear-gradient(140deg, #7a7f9b, #b2b7c5)',
    ),
    descricao: String(livro.descricao || ''),
    destaques: Array.isArray(livro.destaques)
      ? livro.destaques.map(String)
      : [],
  };
}

export function exportarAcervo(acervo: AcervoImportado): string {
  return JSON.stringify(
    {
      exportadoEm: new Date().toISOString(),
      categorias: acervo.categorias,
      livros: acervo.livros,
    },
    null,
    2,
  );
}

export function lerPedidos(): PedidoBiblioteca[] {
  return lerJSON<PedidoBiblioteca[]>(CHAVES.pedidosBiblioteca, []);
}

/** Registra um pedido de compra/aluguel com protocolo único. */
export function registrarPedido(
  livro: LivroBiblioteca,
  tipo: TipoAquisicao,
  dados: { pagamento: string; email: string },
): PedidoBiblioteca {
  const pedido: PedidoBiblioteca = {
    protocolo: protocolo('PH'),
    livroId: livro.id,
    titulo: livro.titulo,
    tipo,
    pagamento: dados.pagamento,
    email: dados.email,
    data: new Date().toISOString(),
  };
  salvarJSON(CHAVES.pedidosBiblioteca, [...lerPedidos(), pedido]);
  return pedido;
}
