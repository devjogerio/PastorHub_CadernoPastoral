/* ============================================================
   Painel admin · Biblioteca Digital
   Acervo (importar/exportar, padrão do RAG) e ações de compra/aluguel
   com modais. Depende de admin.js (AdminAPI) e de biblioteca.js.
   ============================================================ */
(function () {
  const A = window.AdminAPI;
  if (!A) return;
  const { VIEWS, state, render, modal, confirmAction, toast, kpi, panel, esc, Actions } = A;
  const ic = (nome, cls) => window.icon(nome, cls);
  const B = window.BIBLIOTECA;
  if (!B) return;

  const fmtData = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  /* ---------- Helpers de formação ---------- */
  function selCat(l) {
    const c = (B.categorias || []).find((x) => x.id === l.categoria);
    return c ? esc(c.nome) : esc(l.categoria);
  }

  function infoBox(l) {
    return '<div class="info-box blue"><div>📖</div><div><b>' + esc(l.titulo) + '</b>' +
      '<div class="sub-texto">' + esc(l.autor) + ' · ' + esc(l.ano) + ' · ' + esc(l.paginas + ' páginas') + '</div>' +
      '<div class="sub-texto">Licença: ' + esc(l.licenca) + '</div></div></div>';
  }

  function toolbarHead(titulo, extra) {
    return '<div class="toolbar"><span class="item-meta" style="font-weight:600;color:var(--navy)">' + esc(titulo) + '</span><div class="grow"></div>' + (extra || '') + '</div>';
  }

  function fCampo(rot, html) {
    return '<div class="field"><label>' + esc(rot) + '</label>' + html + '</div>';
  }

  function livrosPorCat() {
    return B.livros.map((l) => ({ l, c: selCat(l) }));
  }

  /* ---------- Modais: Comprar / Alugar ---------- */
  function modalComprar(l) {
    modal({
      title: 'Comprar · ' + esc(l.titulo),
      confirmLabel: 'Solicitar compra',
      wide: true,
      body: infoBox(l) +
        fCampo('Quantidade', '<input id="bib-qtd" type="number" min="1" value="1">') +
        '<p class="sub-texto">A solicitação é registrada e segue para o atendimento administrativo.</p>',
      onSave(root) {
        const qtd = Number(root.querySelector('#bib-qtd').value);
        if (!qtd || qtd < 1) { toast('Informe a quantidade (≥1)', 'err'); return false; }
        const r = B.solicitar(l.id, 'comprar', { quantidade: qtd });
        toast(r.ok ? 'Solicitação de compra registrada' : (r.erros || ['Erro'])[0], r.ok ? 'ok' : 'err');
        render();
      },
    });
  }

  function modalAlugar(l) {
    modal({
      title: 'Alugar · ' + esc(l.titulo),
      confirmLabel: 'Solicitar aluguel',
      wide: true,
      body: infoBox(l) +
        fCampo('Dias de aluguel', '<select id="bib-dias"><option value="30">30 dias</option><option value="60" selected>60 dias</option><option value="90">90 dias</option></select>') +
        '<p class="sub-texto">A disponibilidade e as condições de devolução serão tratadas no nível administrativo.</p>',
      onSave(root) {
        const dias = Number(root.querySelector('#bib-dias').value);
        const r = B.solicitar(l.id, 'alugar', { dias });
        toast(r.ok ? 'Solicitação de aluguel registrada' : (r.erros || ['Erro'])[0], r.ok ? 'ok' : 'err');
        render();
      },
    });
  }

  /* ---------- Painel de importação/exportação (padrão RAG) ---------- */
  function painelImportacao() {
    const ultimo = (Array.isArray(B.ultimoImport) ? B.ultimoImport : []).slice(-10);
    const lista = ultimo.length ? ultimo.map((r) =>
      '<div class="rag-envio-item ' + (r.ok ? 'ok' : 'erro') + '">' + ic(r.ok ? 'check-circle' : 'alert-circle', 'icon-sm') +
      '<b>' + esc(r.nome) + '</b><span>' + esc(r.msg) + '</span></div>').join('') :
      '<p class="sub-texto">Use o botão Exportar para gerar o arquivo do acervo.</p>';
    return '<div class="rag-upload">' +
      '<div id="bib-drop" class="rag-drop">' + ic('upload', 'icon-lg') +
        '<b>Arraste arquivos .json do acervo aqui</b>' +
        '<span>ou escolha no computador</span>' +
        '<label class="btn btn-primary btn-sm">' + ic('plus', 'icon-sm') + 'Escolher arquivos' +
          '<input id="bib-arquivo" type="file" multiple accept=".json" style="display:none"></label>' +
        '<small>Arquivos exportados pelo botão “Exportar acervo” podem ser importados aqui.</small>' +
      '</div>' +
      '<div class="row-actions" style="margin-top:12px">' +
        '<button class="btn btn-outline btn-sm" data-action="bib-exportar">' + ic('download', 'icon-sm') + ' Exportar acervo (.json)</button>' +
        '<button class="btn btn-danger btn-sm" data-action="bib-limpar-pedidos">' + ic('trash-2', 'icon-sm') + ' Limpar pedidos abertos</button>' +
      '</div>' +
      '<div class="rag-envio">' + lista + '</div>' +
      '</div>';
  }

  async function processarArquivo(f) {
    const res = { nome: f.name, ok: true, msg: '' };
    try {
      const r = B.importar(await f.text());
      res.ok = r.ok;
      res.msg = r.ok ? (r.mensagem || 'Acervo importado') : (r.erros || ['erro desconhecido']).join(' ');
      if (r.ok) toast(r.mensagem || 'Acervo importado', 'ok');
    } catch (e) {
      res.ok = false;
      res.msg = 'Erro ao ler o arquivo: ' + (e.message || 'falha');
    }
    (B.ultimoImport = B.ultimoImport || []).push(res);
    while (B.ultimoImport.length > 10) B.ultimoImport.shift();
    render();
  }

  /* ---------- View do acervo ---------- */
  function linhaLivro(l, i) {
    return '<tr><td><div class="cell-user"><span class="avatar" style="background:#fff;color:' + (l.gradiente ? 'var(--navy)' : 'var(--navy)') + ';font-size:1.2rem">' +
      ic('book-open', 'icon-sm') + '</span>' +
      '<div><b>' + esc(l.titulo) + '</b><div class="sub-texto">' + esc(l.autor) + ' · ' + esc(l.ano) + ' · ' + esc(l.paginas + ' páginas') +
      ' · ' + esc(l.licenca) + '</div></div></div></td>' +
      '<td><span class="tag tag-blue">' + selCat(l) + '</span></td>' +
      '<td style="text-align:center">' + esc(l.paginas) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn btn-outline btn-sm" data-action="bib-comprar" data-id="' + esc(l.id) + '">' + ic('card', 'icon-sm') + 'Comprar</button>' +
        '<button class="btn btn-outline btn-sm" data-action="bib-alugar" data-id="' + esc(l.id) + '">' + ic('clock', 'icon-sm') + 'Alugar</button>' +
      '</div></td></tr>';
  }

  function linhasAcervo() {
    return B.livros.map(linhaLivro).join('') ||
      '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:26px">Nenhum livro no acervo ainda.</td></tr>';
  }

  function linhasPedidos() {
    const pedidos = B.solicitacoes || [];
    if (!pedidos.length) return '';
    return pedidos.map((e) =>
      '<tr><td><div><b>' + esc(e.titulo) + '</b><div class="sub-texto">' + (e.tipo === 'comprar' ? 'Comprar · ' : 'Alugar · ') +
        'quantidade ' + esc(e.meta && e.meta.quantidade ? e.meta.quantidade : (e.meta && e.meta.dias ? e.meta.dias + ' dias' : '—')) +
        ' · livro ' + esc(e.livroId) + ' · ' + fmtData(e.data) + '</div></div></td>' +
        '<td><span class="tag tag-amber">' + esc(e.tipo === 'comprar' ? 'Comprar' : 'Alugar') + '</span></td>' +
        '<td><span class="tag ' + (e.fechado ? 'tag-gray' : 'tag-lime') + '">' + esc(e.fechado ? 'Fechado' : 'Aberto') + '</span></td>' +
        '<td><div class="row-actions"><button class="btn btn-outline btn-sm" data-action="bib-pedido-fechar" data-id="' + esc(e.id) + '">' +
          (e.fechado ? ic('check') + 'Reabrir' : ic('x') + 'Fechar') + '</button></div></td></tr>').join('');
  }

  function notaVaziaPedidos() {
    return B.solicitacoes && B.solicitacoes.length ? '' : '<p class="sub-texto" style="padding:12px 0">Nenhuma compra ou aluguel solicitado.</p>';
  }

  VIEWS.biblioteca = function () {
    const abreris = B.solicitacoes.filter((s) => !s.fechado);
    const abrerisComprar = abreris.filter((s) => s.tipo === 'comprar').length;
    const abrerisAlugar = abreris.filter((s) => s.tipo === 'alugar').length;
    const registradosComprar = B.solicitacoes.filter((s) => s.tipo === 'comprar').length;
    const registradosAlugar = B.solicitacoes.filter((s) => s.tipo === 'alugar').length;

    return '<div class="kpi-grid">' +
      kpi('Obras no acervo', B.livros.length, 'Acervo Digital · domínio público', 'book-open', 'b-navy') +
      kpi('Pedidos abertos', abreris.length, abrerisComprar + ' compras · ' + abrerisAlugar + ' alugueis', 'card', 'b-amber') +
      kpi('Pedidos registrados', B.solicitacoes.length, registradosComprar + ' compras · ' + registradosAlugar + ' alugueis', 'history', 'b-lime') +
      '</div>' +

      panel('Acervo da Biblioteca Digital',
        toolbarHead('Livros ' + B.livros.length + ' · ' + B.categorias.length + ' categorias', '') +
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Livro</th><th>Categoria</th><th style="text-align:center">Páginas</th><th></th>' +
        '</tr></thead><tbody>' + linhasAcervo() + '</tbody></table></div>',
        { flush: true, sub: 'Cada obra pode ser solicitada para compra ou aluguel' }) +

      panel('Comprar e alugar os livros do acervo',
        '<button class="btn btn-primary btn-sm" data-action="bib-comprar-alugar" type="button">' + ic('card', 'icon-sm') + ' Comprar e alugar</button>',
        { sub: 'Detalhes da obra, visualização do conteúdo e formas de pagamento — em modais (docs/biblioteca-comprar-alugar.html)' }) +

      panel('Importar e exportar acervo', painelImportacao(),
        { sub: 'Formato: JSON. O exportado contém as categorias e os livros do acervo atual.' }) +

      panel('Solicitações (compras e alugueis)',
        toolbarHead('Registro de ações', '') +
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Livro</th><th>Tipo</th><th>Status</th><th></th>' +
        '</tr></thead><tbody>' + linhasPedidos() + '</tbody></table></div>' +
        notaVaziaPedidos(),
        { flush: true, sub: 'Os pedidos seguem para o nível administrativo' });
  };

  /* ---------- Ações ---------- */
  Actions['bib-comprar'] = function (el) {
    const l = B.livros.find((x) => x.id === el.dataset.id);
    if (l) modalComprar(l);
  };

  Actions['bib-alugar'] = function (el) {
    const l = B.livros.find((x) => x.id === el.dataset.id);
    if (l) modalAlugar(l);
  };

  Actions['bib-pedido-fechar'] = function (el) {
    const e = (B.solicitacoes || []).find((s) => s.id === el.dataset.id);
    if (!e) return;
    confirmAction('Alterar status do pedido',
      e.fechado
        ? 'Abrir novamente o pedido de <b>' + esc(e.titulo) + '</b>?'
        : 'Fechar pedido de <b>' + esc(e.titulo) + '</b> (' + esc(e.tipo) + ')?',
      () => {
        e.fechado = !e.fechado;
        toast(e.fechado ? 'Pedido fechado' : 'Pedido reaberto', 'ok');
        render();
      });
  };

  Actions['bib-exportar'] = function () {
    const texto = B.exportar();
    window.adminDownload(texto, 'pastorhub-biblioteca-' + new Date().toISOString().slice(0, 10) + '.json', 'application/json');
    toast('Acervo exportado: ' + B.livros.length + ' livros', 'ok');
  };

  Actions['bib-importar'] = function (el) {
    const f = el && el.files && el.files[0];
    if (f) processarArquivo(f);
  };

  Actions['bib-limpar-pedidos'] = function () {
    confirmAction('Limpar pedidos abertos', 'Remover <b>todos</b> os pedidos de compra e aluguel registrados?', () => {
      B.solicitacoes = [];
      toast('Pedidos abertos limpos', 'ok');
      render();
    });
  };

  Actions['bib-comprar-alugar'] = function () {
    window.open('docs/biblioteca-comprar-alugar.html', '_blank', 'noopener,noreferrer');
  };

  /* ---------- Delegação: importar por arrastar e soltar (padrão RAG) ---------- */
  document.addEventListener('change', (e) => {
    if (e.target.id === 'bib-arquivo') {
      Array.from(e.target.files || []).forEach(processarArquivo);
      e.target.value = '';
    }
  });

  document.addEventListener('dragover', (e) => {
    const zona = e.target.closest && e.target.closest('#bib-drop');
    if (zona) { e.preventDefault(); zona.classList.add('arrastando'); }
  });

  document.addEventListener('dragleave', (e) => {
    const zona = e.target.closest && e.target.closest('#bib-drop');
    if (zona) zona.classList.remove('arrastando');
  });

  document.addEventListener('drop', (e) => {
    const zona = e.target.closest && e.target.closest('#bib-drop');
    if (!zona) return;
    e.preventDefault();
    zona.classList.remove('arrastando');
    Array.from(e.dataTransfer.files || []).forEach(processarArquivo);
  });
})();
