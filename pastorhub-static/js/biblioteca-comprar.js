/* ============================================================
   Biblioteca Digital · Comprar e Alugar (página de acervo)
   Catálogo com busca e categorias, modal de detalhes com
   pré-visualização, formas de pagamento e solicitação validada.
   Não há backend: os pedidos ficam em localStorage e em
   window.BIBLIOTECA.solicitacoes (sessão atual).
   ============================================================ */
(function () {
  'use strict';

  const CHAVE_PEDIDOS = 'pastorhub_biblioteca_pedidos';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const TIPOS = {
    comprar: { rotulo: 'Compra', acao: 'Confirmar compra', titulo: 'Comprar' },
    alugar: { rotulo: 'Aluguel', acao: 'Confirmar aluguel', titulo: 'Alugar' },
  };
  const PAGAMENTOS = [
    { id: 'pix', nome: 'Pix', desc: 'Pagamento instantâneo. O QR Code é enviado após a confirmação.' },
    { id: 'cartao', nome: 'Cartão de crédito', desc: 'Cobrança na confirmação, conforme a condição da oferta.' },
    { id: 'boleto', nome: 'Boleto bancário', desc: 'Compensação após o pagamento do boleto.' },
  ];

  const estado = { categoria: 'todos', termo: '', enviando: false, gatilho: null };
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  function livros() { return (window.BIBLIOTECA && window.BIBLIOTECA.livros) || []; }
  function categorias() { return (window.BIBLIOTECA && window.BIBLIOTECA.categorias) || []; }
  function corCategoria(id) {
    const c = categorias().find((x) => x.id === id);
    return c ? c.cor : '#3261AB';
  }
  function nomeCategoria(id) {
    const c = categorias().find((x) => x.id === id);
    return c ? c.nome : id;
  }
  function buscarLivro(id) { return livros().find((x) => x.id === id) || null; }

  // ---------- Catálogo ----------
  function livrosFiltrados() {
    const termo = norm(estado.termo);
    return livros().filter((l) => {
      const okCat = estado.categoria === 'todos' || l.categoria === estado.categoria;
      const okTermo = !termo || norm(l.titulo + ' ' + l.autor + ' ' + l.descricao).indexOf(termo) !== -1;
      return okCat && okTermo;
    });
  }

  function cardHtml(l) {
    const cor = corCategoria(l.categoria);
    return '<article class="acq-card">' +
      '<div class="acq-cover" style="background:' + esc(l.gradiente) + '" aria-hidden="true">' + esc(l.emoji) + '</div>' +
      '<div class="acq-info">' +
        '<span class="acq-tag" style="background:' + esc(cor) + '22;color:' + esc(cor) + '">' + esc(nomeCategoria(l.categoria)) + '</span>' +
        '<b>' + esc(l.titulo) + '</b>' +
        '<small>' + esc(l.autor) + ' · ' + esc(l.ano) + ' · ' + esc(l.paginas) + ' pág.</small>' +
        '<p class="acq-desc">' + esc(String(l.descricao).slice(0, 110)) + '…</p>' +
        '<div class="acq-actions">' +
          '<button class="acq-btn" type="button" data-acq-livro="' + esc(l.id) + '" data-acq-tipo="comprar" aria-label="Comprar ' + esc(l.titulo) + '">Comprar</button>' +
          '<button class="acq-btn-outline" type="button" data-acq-livro="' + esc(l.id) + '" data-acq-tipo="alugar" aria-label="Alugar ' + esc(l.titulo) + '">Alugar</button>' +
          '<button class="acq-btn-ghost" type="button" data-acq-livro="' + esc(l.id) + '" data-acq-tipo="amostra" aria-haspopup="dialog" aria-label="Ver amostra de ' + esc(l.titulo) + '">Amostra</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderCatalogo() {
    const grid = $('#acq-grid');
    if (!grid) return;
    const lista = livrosFiltrados();
    grid.innerHTML = lista.map(cardHtml).join('');
    const vazio = $('#acq-vazio');
    if (vazio) vazio.hidden = lista.length > 0;
    const contador = $('#acq-contador');
    if (contador) contador.textContent = lista.length + ' de ' + livros().length + ' obras';
  }

  function renderFiltros() {
    const chips = $('#acq-filtros');
    if (!chips) return;
    const todos = [{ id: 'todos', nome: 'Todos' }].concat(categorias());
    chips.innerHTML = todos.map((c) =>
      '<button class="bib-chip' + (c.id === estado.categoria ? ' active' : '') + '" type="button" data-acq-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === estado.categoria) + '">' + esc(c.nome) + '</button>'
    ).join('');
  }

  // ---------- Modal ----------
  function modalEl() { return $('#acq-modal'); }

  function linhasDetalhe(l) {
    return '<div class="acq-linhas">' +
      '<div><b>Autor:</b> ' + esc(l.autor) + '</div>' +
      '<div><b>Ano:</b> ' + esc(l.ano) + '</div>' +
      '<div><b>Páginas:</b> ' + esc(l.paginas) + '</div>' +
      '<div><b>Categoria:</b> ' + esc(nomeCategoria(l.categoria)) + '</div>' +
      '<div style="grid-column:1/-1"><b>Licença:</b> ' + esc(l.licenca) + '</div>' +
    '</div>';
  }

  function previewHtml(l) {
    const destaques = (l.destaques || []).map((d) => '<li>' + esc(d) + '</li>').join('');
    return '<div class="acq-preview">' +
      '<p>' + esc(l.descricao) + '</p>' +
      (destaques ? '<ul style="margin:8px 0 0 1.1rem">' + destaques + '</ul>' : '') +
      '<small>Pré-visualização do conteúdo. A leitura completa é liberada após a compra ou durante o aluguel.</small>' +
    '</div>';
  }

  function pagamentoHtml() {
    return '<fieldset class="acq-pay"><legend>Forma de pagamento</legend>' +
      PAGAMENTOS.map((p) =>
        '<label><input type="radio" name="pagamento" value="' + p.id + '"> <b>' + esc(p.nome) + '</b>' +
        '<small>' + esc(p.desc) + '</small></label>'
      ).join('') +
    '</fieldset>';
  }

  function abas(tipo) {
    return '<div class="acq-tabs" role="tablist" aria-label="Tipo de operação">' +
      Object.keys(TIPOS).map((k) =>
        '<button class="acq-tab" type="button" role="tab" id="acq-tab-' + k + '" aria-selected="' + (k === tipo) + '" data-acq-tab="' + k + '">' + esc(TIPOS[k].titulo) + '</button>'
      ).join('') +
    '</div>';
  }

  function formularioHtml(tipo) {
    return '<form class="acq-form" id="acq-form" novalidate>' +
      pagamentoHtml() +
      '<div class="acq-campo">' +
        '<label for="acq-email">E-mail para contato</label>' +
        '<input type="email" id="acq-email" name="email" autocomplete="email" placeholder="seu@email.com" required>' +
      '</div>' +
      '<label class="acq-aceite"><input type="checkbox" id="acq-aceite" name="aceite"> Li as condições da oferta e a licença da obra.</label>' +
      '<p class="acq-erro" id="acq-erro" role="alert" hidden></p>' +
      '<div class="acq-modal-foot">' +
        '<button class="acq-btn-outline" type="button" data-acq-fechar>Cancelar</button>' +
        '<button class="acq-btn-lime" type="submit" id="acq-enviar">' + esc(TIPOS[tipo].acao) + '</button>' +
      '</div>' +
    '</form>';
  }

  function cabecalhoModal(l) {
    return '<header class="acq-modal-head">' +
      '<div class="acq-modal-cover" aria-hidden="true">' + esc(l.emoji) + '</div>' +
      '<div><h2 id="acq-modal-titulo">' + esc(l.titulo) + '</h2><p>' + esc(l.autor) + '</p></div>' +
      '<button class="acq-modal-close" type="button" data-acq-fechar aria-label="Fechar">×</button>' +
    '</header>';
  }

  function corpoAquisicao(l, tipo) {
    return '<div class="acq-modal-body" id="acq-modal-corpo" data-livro="' + esc(l.id) + '">' +
      abas(tipo) +
      '<section class="acq-sec"><h3>Detalhes da obra</h3>' + linhasDetalhe(l) + '</section>' +
      '<section class="acq-sec"><h3>Visualização do conteúdo</h3>' + previewHtml(l) + '</section>' +
      '<section class="acq-sec" id="acq-bloco-form">' + formularioHtml(tipo) + '</section>' +
    '</div>';
  }

  /* Amostra: somente leitura, sem formulário de pagamento. Os botões
     Comprar/Alugar abrem o fluxo de aquisição no mesmo modal. */
  function corpoAmostra(l) {
    const acao = (tipo, classe, rotulo) =>
      '<button class="' + classe + '" type="button" data-acq-livro="' + esc(l.id) + '" data-acq-tipo="' + tipo + '">' + rotulo + '</button>';
    return '<div class="acq-modal-body" id="acq-modal-corpo" data-livro="' + esc(l.id) + '">' +
      '<section class="acq-sec"><h3>Detalhes da obra</h3>' + linhasDetalhe(l) + '</section>' +
      '<section class="acq-sec"><h3>Amostra do conteúdo</h3>' + previewHtml(l) + '</section>' +
      '<div class="acq-modal-foot">' +
        '<button class="acq-btn-outline" type="button" data-acq-fechar>Fechar</button>' +
        acao('alugar', 'acq-btn-outline', 'Alugar') +
        acao('comprar', 'acq-btn', 'Comprar') +
      '</div>' +
    '</div>';
  }

  function abrirModal(livroId, tipo, gatilho) {
    const l = buscarLivro(livroId);
    if (!l || (!TIPOS[tipo] && tipo !== 'amostra')) return;
    // Ação disparada de dentro do modal preserva o gatilho original (o card),
    // que recebe o foco ao fechar.
    const dentroDoModal = !!(gatilho && gatilho.closest && gatilho.closest('#acq-modal'));
    if (!dentroDoModal) estado.gatilho = gatilho || null;
    const card = $('#acq-modal-card');
    card.innerHTML = cabecalhoModal(l) +
      (tipo === 'amostra' ? corpoAmostra(l) : corpoAquisicao(l, tipo));
    card.dataset.tipo = tipo;
    card.setAttribute('aria-labelledby', 'acq-modal-titulo');
    const m = modalEl();
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    const primeiro = card.querySelector('.acq-modal-close');
    if (primeiro) primeiro.focus();
  }

  function fecharModal() {
    const m = modalEl();
    if (!m || m.hidden) return;
    m.hidden = true;
    document.body.style.overflow = '';
    estado.enviando = false;
    if (estado.gatilho && estado.gatilho.focus) estado.gatilho.focus();
    estado.gatilho = null;
  }

  function trocarTipo(tipo) {
    const corpo = $('#acq-modal-corpo');
    const card = $('#acq-modal-card');
    if (!corpo || !TIPOS[tipo] || card.dataset.tipo === tipo) return;
    card.dataset.tipo = tipo;
    corpo.querySelectorAll('[data-acq-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.acqTab === tipo)));
    const btn = $('#acq-enviar');
    if (btn) btn.textContent = TIPOS[tipo].acao;
  }

  // ---------- Validação e registro ----------
  function lerFormulario() {
    const pag = document.querySelector('input[name="pagamento"]:checked');
    const email = ($('#acq-email') || {}).value || '';
    const aceite = !!(($('#acq-aceite') || {}).checked);
    return { pagamento: pag ? pag.value : '', email: email.trim(), aceite: aceite };
  }

  function validarPedido(dados) {
    const erros = [];
    if (!dados.pagamento) erros.push({ campo: 'pagamento', msg: 'Escolha uma forma de pagamento.' });
    if (!EMAIL_RE.test(dados.email)) erros.push({ campo: 'email', msg: 'Informe um e-mail válido para contato.' });
    if (!dados.aceite) erros.push({ campo: 'aceite', msg: 'Confirme que leu as condições e a licença da obra.' });
    return erros;
  }

  function mostrarErros(erros) {
    const box = $('#acq-erro');
    const email = $('#acq-email');
    if (email) email.setAttribute('aria-invalid', String(erros.some((e) => e.campo === 'email')));
    if (!box) return;
    box.hidden = erros.length === 0;
    box.textContent = erros.map((e) => e.msg).join(' ');
    const primeiro = erros[0] && erros[0].campo;
    const alvo = primeiro === 'email' ? $('#acq-email')
      : primeiro === 'pagamento' ? document.querySelector('input[name="pagamento"]')
        : $('#acq-aceite');
    if (alvo) alvo.focus();
  }

  function gerarProtocolo() {
    const base = Date.now().toString(36).toUpperCase().slice(-5);
    const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
    return 'PH-' + base + rnd;
  }

  function lerPedidos() {
    try { return JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || '[]') || []; } catch (e) { return []; }
  }

  function salvarPedido(pedido) {
    const lista = lerPedidos();
    lista.push(pedido);
    try { localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(lista)); } catch (e) { return false; }
    return true;
  }

  function registrarSolicitacao(livroId, tipo, dados) {
    const protocolo = gerarProtocolo();
    const pedido = {
      protocolo: protocolo,
      livroId: livroId,
      tipo: tipo,
      pagamento: dados.pagamento,
      email: dados.email,
      data: new Date().toISOString(),
    };
    if (window.BIBLIOTECA && window.BIBLIOTECA.solicitar) {
      window.BIBLIOTECA.solicitar(livroId, tipo, { protocolo: protocolo, pagamento: dados.pagamento, email: dados.email, fonte: 'docs/biblioteca-comprar-alugar.html' });
    }
    salvarPedido(pedido);
    return pedido;
  }

  function mostrarSucesso(pedido) {
    const corpo = $('#acq-modal-corpo');
    if (!corpo) return;
    const l = buscarLivro(pedido.livroId);
    const pag = PAGAMENTOS.find((p) => p.id === pedido.pagamento);
    corpo.innerHTML =
      '<div class="acq-ok" role="status">' +
        '<span class="acq-ok-ico" aria-hidden="true">✓</span>' +
        '<h3>Solicitação registrada</h3>' +
        '<p>' + esc(TIPOS[pedido.tipo].rotulo) + ' de <b>' + esc(l ? l.titulo : '') + '</b> via ' + esc(pag ? pag.nome : '') + '. O valor é confirmado pela equipe antes da cobrança.</p>' +
        '<span class="acq-protocolo">Protocolo ' + esc(pedido.protocolo) + '</span>' +
        '<p>Retorno enviado para <b>' + esc(pedido.email) + '</b>.</p>' +
        '<div class="acq-modal-foot" style="border:0;padding:0;margin-top:6px">' +
          '<button class="acq-btn" type="button" data-acq-fechar>Concluir</button>' +
        '</div>' +
      '</div>';
    const btn = corpo.querySelector('[data-acq-fechar]');
    if (btn) btn.focus();
  }

  function enviarFormulario(ev) {
    ev.preventDefault();
    if (estado.enviando) return;
    const card = $('#acq-modal-card');
    const tipo = card.dataset.tipo;
    const livroId = ($('#acq-modal-corpo') || {}).dataset.livro;
    const dados = lerFormulario();
    const erros = validarPedido(dados);
    if (erros.length) { mostrarErros(erros); return; }
    estado.enviando = true;
    const btn = $('#acq-enviar');
    if (btn) { btn.disabled = true; btn.textContent = 'Registrando…'; }
    const pedido = registrarSolicitacao(livroId, tipo, dados);
    estado.enviando = false;
    mostrarSucesso(pedido);
    acqToast('Solicitação de ' + TIPOS[tipo].rotulo.toLowerCase() + ' registrada · protocolo ' + pedido.protocolo);
  }

  // ---------- Notificações ----------
  function acqToast(msg) {
    const holder = $('#acq-toasts');
    if (!holder) return;
    const t = document.createElement('div');
    t.className = 'acq-toast';
    t.setAttribute('role', 'status');
    t.textContent = msg;
    holder.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 260);
    }, 3800);
  }

  // ---------- Eventos ----------
  function registrarEventos() {
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-acq-cat]');
      if (chip) {
        estado.categoria = chip.dataset.acqCat;
        renderFiltros();
        renderCatalogo();
        return;
      }
      const acao = e.target.closest('[data-acq-livro]');
      if (acao) {
        abrirModal(acao.dataset.acqLivro, acao.dataset.acqTipo, acao);
        return;
      }
      const aba = e.target.closest('[data-acq-tab]');
      if (aba) { trocarTipo(aba.dataset.acqTab); return; }
      if (e.target.closest('[data-acq-fechar]')) { fecharModal(); return; }
      if (e.target.classList.contains('acq-modal-backdrop')) fecharModal();
    });

    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'acq-form') enviarFormulario(e);
    });

    document.addEventListener('keydown', (e) => {
      const m = modalEl();
      if (!m || m.hidden) return;
      if (e.key === 'Escape') { fecharModal(); return; }
      if (e.key === 'Tab') prenderFoco(e, m);
    });

    const busca = $('#acq-busca');
    if (busca) {
      busca.addEventListener('input', () => {
        estado.termo = busca.value;
        renderCatalogo();
      });
    }
  }

  // Mantém o foco dentro do modal enquanto ele estiver aberto
  function prenderFoco(e, m) {
    const focaveis = Array.from(m.querySelectorAll('button:not([disabled]), input:not([disabled]), [href]'))
      .filter((el) => el.offsetParent !== null);
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  }

  function iniciar() {
    if (!window.BIBLIOTECA) {
      const vazio = $('#acq-vazio');
      if (vazio) { vazio.hidden = false; vazio.textContent = 'Não foi possível carregar o acervo.'; }
      return;
    }
    renderFiltros();
    renderCatalogo();
    registrarEventos();
  }

  window.BibliotecaComprar = { livrosFiltrados, validarPedido, abrirModal, fecharModal, lerPedidos };
  iniciar();
})();
