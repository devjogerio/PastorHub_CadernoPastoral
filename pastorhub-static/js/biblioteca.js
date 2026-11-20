/* ============================================================
   Biblioteca Digital PastorHub — dados do acervo, plano de ação
   e roadmap. Catálogo inicial composto por obras teológicas em
   domínio público / licenças abertas (sem restrição autoral).
   ============================================================ */
(function () {
  const categorias = [
    { id: 'patristica', nome: 'Patrística', cor: '#7c3aed' },
    { id: 'sistematica', nome: 'Teologia Sistemática', cor: '#3261AB' },
    { id: 'devocional', nome: 'Devocional', cor: '#95C121' },
    { id: 'pastoral', nome: 'Vida Pastoral', cor: '#f59e0b' },
    { id: 'historia', nome: 'História & Apologética', cor: '#0b7285' },
    { id: 'homiletica', nome: 'Homilética', cor: '#d4183d' },
  ];

  const livros = [
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
      descricao: 'A obra fundadora da autobiografia cristã: a jornada de Agostinho da busca intelectual ao encontro com Deus.',
      destaques: ['Clássico da espiritualidade ocidental', 'Modelo de testemunho e conversão', 'Ideal para aconselhamento e discipulado'],
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
      descricao: 'A primeira grande teologia da história: a tensão entre a cidade terrena e a cidade de Deus.',
      destaques: ['Base da doutrina social cristã', 'Leitura de formação teológica', 'Referência para sermões e ensino'],
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
      descricao: 'Um dos livros mais lidos da história cristã: simplicidade, humildade e vida interior.',
      destaques: ['Leitura diária de 5 minutos', 'Clássico devocional universal', 'Excelente para novos convertidos'],
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
      descricao: 'A alegoria da jornada cristã, escrita na prisão: fé, provações e perseverança até a Cidade Celestial.',
      destaques: ['Alegoria cristã mais traduzida', 'Ótima para séries de pregação', 'Linguagem acessível a todas as idades'],
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
      descricao: 'A autobiografia espiritual de Bunyan: da culpa ao consolo da graça.',
      destaques: ['Testemunho de restauração', 'Base para aconselhamento', 'Leitura pastoral profunda'],
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
      descricao: 'O manual clássico do ministério pastoral: cuidado das almas, pregação e vida de oração.',
      destaques: ['Leitura obrigatória para pastores', 'Plano de visitação e cuidado', 'Base para mentoria pastoral'],
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
      descricao: 'A sistematização da fé reformada: doutrina, igreja e vida cristã em uma obra monumental.',
      destaques: ['Referência da teologia reformada', 'Percursos orientados por tema', 'Formação de líderes e professores'],
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
      descricao: 'A catedral do pensamento medieval: fé e razão em diálogo rigoroso.',
      destaques: ['Método de perguntas e respostas', 'Formação filosófica e teológica', 'Seleção comentada por tema'],
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
      descricao: 'A apologia cristã mais brilhante da modernidade: o coração, a razão e o sentido da vida.',
      destaques: ['Apologética clássica', 'Ótimo para encontros e estudos', 'Frases marcantes para pregação'],
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
      descricao: 'A memória dos que deram a vida pela fé: história, coragem e fidelidade.',
      destaques: ['História da igreja em narrativa', 'Série de sermões sobre perseverança', 'Leitura inspiradora'],
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
      descricao: 'Cartas e conversas sobre viver na presença de Deus em meio às tarefas comuns.',
      destaques: ['Leitura curta e profunda', 'Devocional para a rotina', 'Ótimo para grupos pequenos'],
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
      descricao: 'O príncipe dos pregadores: estrutura, imaginação e unção em sermões que marcaram época.',
      destaques: ['Modelo de estrutura homilética', 'Ilustrações e aplicações', 'Estudo para pregadores'],
    },
  ];

  const planoAcao = [
    {
      id: 'f1',
      fase: 'Fase 1 — Fundação & acervo inicial',
      status: 'done',
      prazo: 'Concluída',
      entregas: [
        'Módulo de dados do acervo (js/biblioteca.js)',
        'Página de apresentação com plano, roadmap e catálogo',
        'Integração no site principal e na lista de documentos',
        'Vitrine da Biblioteca no app do usuário',
      ],
    },
    {
      id: 'f2',
      fase: 'Fase 2 — Leitor integrado',
      status: 'wip',
      prazo: '2–4 semanas',
      entregas: [
        'Leitura por capítulos com progresso salvo localmente',
        'Favoritos, marcações e anotações do leitor',
        'Modo noturno e ajuste de tipografia',
      ],
    },
    {
      id: 'f3',
      fase: 'Fase 3 — Curadoria & painel',
      status: 'next',
      prazo: '1–2 meses',
      entregas: [
        'Gestão de títulos, coleções e metadados no painel admin',
        'Importação de PDF/EPUB e indexação de conteúdo',
        'Trilhas de leitura por tema e por público',
      ],
    },
    {
      id: 'f4',
      fase: 'Fase 4 — Inteligência & áudio',
      status: 'next',
      prazo: '3–6 meses',
      entregas: [
        'Resumos e planos de estudo gerados por IA',
        'Busca semântica integrada ao assistente de estudo (RAG)',
        'Audiolivro com síntese de voz em português',
      ],
    },
  ];

  const roadmap = [
    { versao: 'v1.0 — Fundação', prazo: 'Concluído', status: 'done', entregas: ['Acervo inicial de 12 obras', 'Catálogo com busca e categorias', 'Página institucional e vitrine no app'] },
    { versao: 'v1.1 — Leitor', prazo: '2–4 semanas', status: 'wip', entregas: ['Leitor por capítulos', 'Progresso e favoritos', 'Modo noturno'] },
    { versao: 'v1.2 — Curadoria', prazo: '1–2 meses', status: 'next', entregas: ['Painel de gestão do acervo', 'Importação PDF/EPUB', 'Trilhas de leitura'] },
    { versao: 'v2.0 — IA & áudio', prazo: '3–6 meses', status: 'next', entregas: ['Resumos com IA', 'Busca semântica (RAG)', 'Audiolivro em português'] },
  ];

  const metricas = [
    { v: '12', l: 'obras no acervo inicial' },
    { v: '6', l: 'categorias teológicas' },
    { v: '100%', l: 'domínio público' },
    { v: '3', l: 'fases até o v2.0' },
  ];

  /* ---------------------- Acervo importável / exportável e pedidos (compras/aluguel) ---------------------- */
  const coresPaleta = ['#3261AB', '#95C121', '#f59e0b', '#0b7285', '#d4183d', '#7c3aed', '#16a34a', '#dc2626'];

  function normalizarLivro(l, idx, catsVinc) {
    const id = String(l && l.id || 'livro-' + (idx + 1));
    const catId = l && l.categoria ? String(l.categoria) : 'geral';
    let cat = (catsVinc || []).find((c) => c.id === catId);
    if (!cat) {
      cat = { id: catId, nome: catId, cor: coresPaleta[idx % coresPaleta.length] };
      catsVinc.push(cat);
    }
    return {
      id,
      titulo: String(l.titulo || 'Sobre ' + id),
      autor: String(l.autor || 'Autor não informado'),
      ano: Number(l.ano) || 0,
      paginas: Number(l.paginas) || 0,
      categoria: cat.id,
      licenca: String(l.licenca || 'Licença não especificada'),
      emoji: String(l.emoji || '📖'),
      gradiente: String(l.gradiente || 'linear-gradient(140deg, #7a7f9b, #b2b7c5)'),
      descricao: String(l.descricao || ''),
      destaques: Array.isArray(l.destaques) ? l.destaques.map(String) : [],
    };
  }

  function validarImportacao(dados) {
    if (!dados || typeof dados !== 'object') {
      return { ok: false, erros: ['O arquivo não é um acervo válido (objeto JSON esperado).'] };
    }
    const catsVinc = [];
    const seen = new Set();
    (Array.isArray(dados.categorias) ? dados.categorias : []).forEach((c) => {
      if (!c || !c.id || seen.has(String(c.id))) return;
      seen.add(String(c.id));
      catsVinc.push({ id: String(c.id), nome: String(c.nome || c.id), cor: String(c.cor || '#3261AB') });
    });
    const livros = Array.isArray(dados.livros) ? dados.livros : [];
    const livrosNorm = livros.map((l, i) => normalizarLivro(l, i, catsVinc));
    if (livrosNorm.length === 0) return { ok: false, erros: ['Nenhum livro encontrado no arquivo.'] };
    return {
      ok: true,
      categorias: catsVinc,
      livros: livrosNorm,
      mensagem: livrosNorm.length + ' livros · ' + catsVinc.length + ' categorias importadas.',
    };
  }

  window.BIBLIOTECA = {
    categorias, livros, planoAcao, roadmap, metricas,
    solicitacoes: [],
    ultimoImport: null,
    importar(jsonTexto) {
      let dados;
      try { dados = JSON.parse(jsonTexto); } catch (e) {
        return { ok: false, erros: ['JSON inválido: ' + (e.message || 'formato inválido')] };
      }
      const r = validarImportacao(dados);
      if (r.ok) { this.categorias = r.categorias; this.livros = r.livros; }
      return r;
    },
    exportar() {
      return JSON.stringify({
        exportadoEm: new Date().toISOString(),
        categorias: this.categorias,
        livros: this.livros,
      }, null, 2);
    },
    solicitar(livroId, tipo, meta) {
      const l = this.livros.find((x) => x.id === livroId);
      if (!l) return { ok: false, erros: ['Livro não encontrado no acervo.'] };
      const pedido = {
        id: 'bib-' + Date.now().toString(36) + '-' + this.solicitacoes.length,
        livroId: l.id,
        titulo: l.titulo,
        tipo: tipo === 'alugar' ? 'alugar' : 'comprar',
        meta: meta || {},
        fechado: false,
        data: new Date().toISOString(),
      };
      this.solicitacoes.push(pedido);
      return { ok: true, pedido };
    },
  };
})();
