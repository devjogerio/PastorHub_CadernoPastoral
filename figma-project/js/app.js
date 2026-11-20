/* ============================================================
   Encontre Igrejas Locais — interações e pesquisa global (pt-BR)
   Aplicação estática, sem backend.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const normalizar = (s) => String(s == null ? '' : s)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const screens = $$('.screen');
  const labels = {
    signin: 'Entrar', home: 'Início', find: 'Encontrar igreja', churches: 'Lista de igrejas',
    church: 'Detalhes da igreja', recordings: 'Gravações', sermons: 'Sermões',
    songs: 'Músicas', messages: 'Mensagens', events: 'Eventos', needs: 'Pedidos de ajuda',
    testimony: 'Testemunhos', alt: 'Tema claro/escuro',
  };

  /* ---------- Conteúdo derivado do Figma (localizado) ---------- */
  const funcionalidades = [
    { titulo: 'Encontrar igreja', tela: 'find', icone: 'assets/figma/home/feature-icone-a.svg' },
    { titulo: 'Culto online', tela: 'churches', icone: '▣' },
    { titulo: 'Culto presencial', tela: 'churches', icone: 'assets/figma/home/feature-icone-b.svg' },
    { titulo: 'Gravações de cultos', tela: 'recordings', icone: '▤' },
    { titulo: 'Cantinho das crianças', tela: 'sermons', icone: '♟' },
    { titulo: 'Cantinho do testemunho', tela: 'testimony', icone: '☀' },
  ];

  const igrejas = [
    { nome: 'Igreja Evangélica Bom Pastor', local: 'Serilingampalle HYD, 500019', foto: 'photo-a', nota: '3,7', tela: 'church' },
    { nome: 'Igreja do Evangelho de Cristo', local: 'Gulmohar Park HYD, 500041', foto: 'photo-b', nota: '3,7', tela: 'church' },
    { nome: 'Igreja Evangélica Bom Pastor', local: 'Serilingampalle HYD, 500019', foto: 'photo-c', nota: '3,7', tela: 'church' },
  ];

  const resumosIgrejas = [
    { nome: 'Anita Silva', texto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', foto: 'photo-d' },
    { nome: 'Anita Silva', texto: 'Conheça a comunidade e participe dos encontros.', foto: 'photo-b' },
    { nome: 'Anita Silva', texto: 'Acompanhe as novidades da sua igreja.', foto: 'photo-c' },
  ];

  const gravacoes = [
    { titulo: 'Purificação para todos os que desejam', igreja: 'Igreja do Evangelho de Cristo', duracao: '22 MIN', foto: 'thumb-a' },
    { titulo: 'A voz de Deus', igreja: 'Igreja Evangélica Bom Pastor', duracao: '34 MIN', foto: 'thumb-b' },
    { titulo: 'Como reconhecer quando Deus fala', igreja: 'Igreja Evangélica Bom Pastor', duracao: '32 MIN', foto: 'thumb-c' },
    { titulo: 'Quem você diz que eu sou?', igreja: 'Igreja Evangélica Bom Pastor', duracao: '34 MIN', foto: 'thumb-d' },
    { titulo: 'Há poder no nome de Jesus', igreja: 'Igreja do Evangelho de Cristo', duracao: '22 MIN', foto: 'thumb-e' },
    { titulo: 'A paixão de Cristo', igreja: 'Igreja Evangélica Bom Pastor', duracao: '34 MIN', foto: 'thumb-f' },
  ];

  const musicas = [
    'Acima de todo poder', 'Todas as criaturas do nosso Deus', 'Tudo a Jesus',
    'Graça maravilhosa', 'Anjos que ouvimos cantar', 'Como o veado anseia',
  ];

  const mensagens = [
    { nome: 'Joel Rocha', tempo: 'há 4 min', texto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque libero eros, efficitur eu convallis eu, sollicitudin eu ipsum.' },
    { nome: 'Lara Croft', tempo: 'há 32 min', texto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque libero eros, efficitur eu convallis eu, sollicitudin eu ipsum.' },
  ];

  const eventos = [
    { data: '17 de setembro', periodos: [
      { periodo: 'Manhã', linhas: [['09:30', '10:00', 'Evento'], ['10:00', '10:30', 'Evento'], ['11:00', '11:40', 'Evento']] },
    ] },
    { data: '21 de setembro', periodos: [
      { periodo: 'Manhã', linhas: [['09:30', '10:00', 'Evento'], ['10:00', '10:30', 'Evento'], ['11:00', '11:40', 'Evento']] },
    ] },
  ];

  const ajudas = [
    { nome: 'Igreja Evangélica Bom Pastor', local: 'Serilingampalle HYD, 500019', status: 'Precisa de ajuda', foto: 'photo-a' },
    { nome: 'Igreja do Evangelho de Cristo', local: 'Gulmohar Park HYD, 500041', status: 'Concluído', foto: 'photo-b' },
    { nome: 'Igreja Evangélica Bom Pastor', local: 'Serilingampalle HYD, 500019', status: null, foto: 'photo-c' },
  ];

  const arquivos = [
    { nome: 'index.html', descricao: 'Páginas e seções da interface do aplicativo' },
    { nome: 'css/styles.css', descricao: 'Tokens de design, componentes, responsividade e temas' },
    { nome: 'js/app.js', descricao: 'Dados, navegação e pesquisa global' },
    { nome: 'assets/*.svg', descricao: 'Ícones e ilustrações exportadas do Figma' },
    { nome: 'README.md', descricao: 'Instruções de execução local e publicação' },
    { nome: 'tests/validate.mjs', descricao: 'Testes estáticos de validação do projeto' },
  ];

  /* ---------- Renderizadores ---------- */
  function renderizarFuncionalidades() {
    $('#feature-grid').innerHTML = funcionalidades.map((f) =>
      '<button class="feature-card" type="button" data-go="' + f.tela + '">' +
      '<span class="icon-circle">' + (f.icone.indexOf('.svg') !== -1
        ? '<img src="' + f.icone + '" alt="">'
        : '<span aria-hidden="true">' + f.icone + '</span>') + '</span>' +
      '<span>' + esc(f.titulo) + '</span></button>').join('');
  }

  function cardIgreja(c) {
    return '<article class="church-card" data-go="' + c.tela + '">' +
      '<div class="photo ' + c.foto + '"><button class="bookmark" type="button" aria-label="Salvar igreja">🔖</button>' +
      '<span class="rating">⭐ ' + esc(c.nota) + '</span></div>' +
      '<div class="info"><span class="name">' + esc(c.nome) + '</span>' +
      '<span class="place">📍 ' + esc(c.local) + '</span></div></article>';
  }

  function renderizarIgrejas() {
    $('#church-cards').innerHTML = igrejas.map(cardIgreja).join('');
    $('#compact-cards').innerHTML = resumosIgrejas.map((c) =>
      '<article class="compact-card"><div class="thumb ' + c.foto + '"></div>' +
      '<div class="copy"><h3>' + esc(c.nome) + '</h3><p>' + esc(c.texto) + '</p></div></article>').join('');
    $('#need-cards').innerHTML = ajudas.map((c) =>
      '<article class="compact-card" data-go="church"><div class="thumb ' + c.foto + '"></div>' +
      '<div class="copy"><h3>' + esc(c.nome) + '</h3><p>📍 ' + esc(c.local) + '</p>' +
      (c.status ? '<span class="badge">' + esc(c.status) + '</span>' : '') + '</div></article>').join('');
  }

  function cardGravacao(r, acao) {
    return '<article class="record-card"><div class="thumb ' + r.foto + '">' +
      '<button class="play" type="button" aria-label="Reproduzir ' + esc(acao) + '">▶</button>' +
      '<span class="duration">' + esc(r.duracao || 'abrir') + '</span></div>' +
      '<div class="meta"><h3>' + esc(r.titulo) + '</h3><small>' + esc(r.igreja) + '</small></div></article>';
  }

  function renderizarMidia() {
    $('#record-grid').innerHTML = gravacoes.map((r) => cardGravacao(r, 'gravação')).join('');
    $('#sermon-grid').innerHTML = gravacoes.map((r) =>
      cardGravacao(Object.assign({}, r, { duracao: 'abrir' }), 'sermão')).join('');
    $('#song-list').innerHTML = musicas.map((titulo, i) =>
      '<article class="song"><div class="cover thumb-' + (i % 6 + 1) + '"></div>' +
      '<div><h3>' + esc(titulo) + '</h3><span class="duration">22 MIN</span></div>' +
      '<button class="play" type="button" aria-label="Reproduzir ' + esc(titulo) + '">▶</button></article>').join('');
  }

  function renderizarMensagens() {
    $('#posts').innerHTML = mensagens.map((p) =>
      '<article class="post"><div class="post-head"><span class="avatar-mini"><img src="assets/figma/home/priest.svg" alt=""></span>' +
      '<div><b>' + esc(p.nome) + '</b><time>' + esc(p.tempo) + '</time></div><span class="more">⋯</span></div>' +
      '<p>' + esc(p.texto) + '</p><div class="post-actions"><button class="like" type="button">♥ 25 curtidas</button>' +
      '<span class="comments">💬 13 comentários</span></div></article>').join('');
  }

  function renderizarEventos() {
    $('#events').innerHTML = eventos.map((g) =>
      '<h2 class="event-date">' + esc(g.data) + '</h2>' + g.periodos.map((p) =>
        '<h3 class="event-period">' + esc(p.periodo) + '</h3>' + p.linhas.map((l) =>
          '<div class="event-row"><span class="time">' + esc(l[0]) + ' - ' + esc(l[1]) + '</span>' +
          '<span class="name">' + esc(l[2]) + '</span><button class="open" type="button">Abrir</button></div>').join('')).join('')).join('');
  }

  function renderizarTemaAlternativo() {
    $('#alt-chips').innerHTML = ['Encontrar igreja', 'Culto online', 'Culto presencial', 'Gravações']
      .map((c, i) => '<button type="button" class="' + (i === 0 ? 'active' : '') + '">' + esc(c) + '</button>').join('');
    $('#alt-churches').innerHTML = [
      ['Igreja Evangélica Bom Pastor', 'photo-a'],
      ['Igreja Cristo Jesus', 'photo-b'],
      ['Igreja do Evangelho de Cristo', 'photo-c'],
    ].map((c) => '<article class="alt-church"><div class="img ' + c[1] + '"></div><p>' + esc(c[0]) + '</p></article>').join('');
  }

  /* ---------- Navegação ---------- */
  function mostrar(id) {
    if (!screens.some((s) => s.dataset.screen === id)) id = 'home';
    screens.forEach((s) => s.classList.toggle('is-active', s.dataset.screen === id));
    $$('[data-nav]').forEach((a) => a.classList.toggle('ativo', a.dataset.nav === id));
    if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
    const ativa = $('.screen.is-active');
    if (ativa) ativa.scrollTop = 0;
    window.scrollTo(0, 0);
    fecharMenu();
  }

  function fecharMenu() {
    $('#demo-nav').classList.remove('nav-open');
    $('#nav-toggle').setAttribute('aria-expanded', 'false');
    $$('.nav-item').forEach((li) => {
      li.classList.remove('submenu-open');
      const b = $('.nav-link', li);
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); mostrar(nav.dataset.nav); return; }
    const sub = e.target.closest('.has-sub > .nav-link');
    if (sub) {
      const li = sub.parentElement;
      const abrir = !li.classList.contains('submenu-open');
      $$('.nav-item').forEach((x) => {
        x.classList.remove('submenu-open');
        const b = $('.nav-link', x);
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      li.classList.toggle('submenu-open', abrir);
      sub.setAttribute('aria-expanded', String(abrir));
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) { mostrar(go.dataset.go); return; }
    const tab = e.target.closest('.signin-tabs button');
    if (tab) { $$('.signin-tabs button').forEach((b) => b.classList.toggle('active', b === tab)); return; }
    const t = e.target.closest('[data-tabs] button');
    if (t) { $$('[data-tabs] button', t.closest('[data-tabs]')).forEach((b) => b.classList.toggle('active', b === t)); return; }
    const chip = e.target.closest('.chips button');
    if (chip) { $$('.chips button').forEach((b) => b.classList.toggle('active', b === chip)); return; }
    const bm = e.target.closest('.bookmark');
    if (bm) { bm.textContent = bm.textContent === '🔖' ? '🔖✓' : '🔖'; }
  });

  $('#nav-toggle').addEventListener('click', () => {
    const aberto = $('#demo-nav').classList.toggle('nav-open');
    $('#nav-toggle').setAttribute('aria-expanded', String(aberto));
  });

  $('#signup-form').addEventListener('submit', (e) => { e.preventDefault(); mostrar('home'); });
  $('#testimony-form').addEventListener('submit', (e) => { e.preventDefault(); mostrar('home'); });

  /* Busca local por tela */
  document.addEventListener('input', (e) => {
    if (!e.target.matches('.search input')) return;
    const q = normalizar(e.target.value);
    const tela = e.target.closest('.screen');
    $$('.church-cards, .compact-cards, .record-grid, .song-list, .posts', tela).forEach((c) =>
      $$('article', c).forEach((a) => {
        a.style.display = !q || normalizar(a.textContent).indexOf(q) !== -1 ? '' : 'none';
      }));
  });

  /* ---------- Pesquisa global ---------- */
  const indice = [];
  function indexar() {
    Object.keys(labels).forEach((id) => indice.push({
      categoria: 'telas', titulo: labels[id], descricao: 'Tela do aplicativo · ' + id, tela: id,
    }));

    funcionalidades.forEach((f) => indice.push({ categoria: 'registros', titulo: f.titulo, descricao: 'Funcionalidade do início', tela: f.tela }));
    igrejas.forEach((c) => indice.push({ categoria: 'registros', titulo: c.nome, descricao: c.local + ' · nota ' + c.nota, tela: 'find' }));
    gravacoes.forEach((r) => indice.push({ categoria: 'registros', titulo: r.titulo, descricao: r.igreja + ' · ' + r.duracao, tela: 'recordings' }));
    musicas.forEach((m) => indice.push({ categoria: 'registros', titulo: m, descricao: 'Música · 22 MIN', tela: 'songs' }));
    mensagens.forEach((m) => indice.push({ categoria: 'registros', titulo: m.nome, descricao: m.texto, tela: 'messages' }));
    eventos.forEach((g) => g.periodos.forEach((p) => p.linhas.forEach((l) =>
      indice.push({ categoria: 'registros', titulo: l[2], descricao: g.data + ' · ' + p.periodo + ' · ' + l[0] + '–' + l[1], tela: 'events' }))));
    ajudas.forEach((a) => indice.push({ categoria: 'registros', titulo: a.nome, descricao: a.local + (a.status ? ' · ' + a.status : ''), tela: 'needs' }));
    arquivos.forEach((a) => indice.push({ categoria: 'arquivos', titulo: a.nome, descricao: a.descricao, tela: null }));

    const vistos = new Set();
    $$('.screen').forEach((s) => {
      $$('button, h1, h2, h3, label, p, cite, input[placeholder]', s).forEach((el) => {
        const txt = (el.getAttribute('placeholder') || el.textContent || '').trim();
        if (!txt || txt.length > 120 || vistos.has(txt)) return;
        vistos.add(txt);
        indice.push({ categoria: 'interface', titulo: txt, descricao: 'Elemento da interface · ' + (labels[s.dataset.screen] || s.dataset.screen), tela: s.dataset.screen });
      });
    });
  }

  function destacar(texto, termos) {
    const original = String(texto == null ? '' : texto);
    if (!termos.length) return esc(original);
    let norm = '', mapa = [];
    for (let i = 0; i < original.length; i++) {
      const pedaco = normalizar(original[i]);
      for (let j = 0; j < pedaco.length; j++) { norm += pedaco[j]; mapa.push(i); }
    }
    const faixas = [];
    termos.forEach((termo) => {
      let pos = 0;
      while ((pos = norm.indexOf(termo, pos)) !== -1) {
        faixas.push([mapa[pos], mapa[pos + termo.length - 1] + 1]);
        pos += termo.length;
      }
    });
    faixas.sort((a, b) => a[0] - b[0]);
    const unidas = [];
    faixas.forEach((f) => {
      const ultima = unidas[unidas.length - 1];
      if (ultima && f[0] <= ultima[1]) ultima[1] = Math.max(ultima[1], f[1]);
      else unidas.push(f.slice());
    });
    let html = '', cursor = 0;
    unidas.forEach(([ini, fim]) => {
      html += esc(original.slice(cursor, ini)) + '<mark>' + esc(original.slice(ini, fim)) + '</mark>';
      cursor = fim;
    });
    return html + esc(original.slice(cursor));
  }

  let filtroAtual = 'todos';
  function pesquisar() {
    const inicio = performance.now();
    const bruto = $('#search-input').value.trim();
    const termos = normalizar(bruto).split(/\s+/).filter(Boolean);
    const resultados = [];
    indice.forEach((item) => {
      if (filtroAtual !== 'todos' && item.categoria !== filtroAtual) return;
      const alvo = normalizar(item.titulo + ' ' + item.descricao);
      if (!termos.length || termos.every((t) => alvo.indexOf(t) !== -1)) resultados.push(item);
    });
    const lista = termos.length ? resultados : resultados.slice(0, 12);
    $('#search-status').textContent = !termos.length
      ? 'Digite um termo para pesquisar. Sugestões abaixo.'
      : lista.length
        ? lista.length + ' resultado' + (lista.length > 1 ? 's' : '') + ' · ' + Math.round(performance.now() - inicio) + ' ms'
        : 'Nenhum resultado encontrado para “' + bruto + '”. Tente outro termo.';
    $('#search-results').innerHTML = lista.length
      ? lista.map((r) => {
          const cat = { telas: 'Tela', registros: 'Registro', arquivos: 'Arquivo', interface: 'Interface' }[r.categoria];
          return '<button class="resultado" type="button" data-resultado-tela="' + esc(r.tela || '') + '">' +
            '<span class="resultado-cat">' + esc(cat) + '</span>' +
            '<strong>' + destacar(r.titulo, termos) + '</strong>' +
            '<small>' + destacar(r.descricao, termos) + '</small></button>';
        }).join('')
      : '<div class="sem-resultados"><span>🔍</span><p>Nada encontrado. Verifique a grafia ou tente um termo mais amplo.</p></div>';
  }

  function abrirPesquisa() {
    $('#global-search').hidden = false;
    $('#search-input').value = '';
    setTimeout(() => $('#search-input').focus(), 0);
    pesquisar();
  }
  function fecharPesquisa() { $('#global-search').hidden = true; }

  $('#nav-search').addEventListener('click', abrirPesquisa);
  $('#search-close').addEventListener('click', fecharPesquisa);
  $('#global-search').addEventListener('click', (e) => {
    if (e.target === $('#global-search')) fecharPesquisa();
    const r = e.target.closest('[data-resultado-tela]');
    if (r) { if (r.dataset.resultadoTela) mostrar(r.dataset.resultadoTela); fecharPesquisa(); }
  });
  $('#search-input').addEventListener('input', pesquisar);
  $('#search-filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filtroAtual = b.dataset.filter;
    $$('#search-filters button').forEach((x) => x.classList.toggle('active', x === b));
    pesquisar();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#global-search').hidden) fecharPesquisa();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); abrirPesquisa(); }
  });
  window.addEventListener('hashchange', () => mostrar(location.hash.slice(1)));

  renderizarFuncionalidades();
  renderizarIgrejas();
  renderizarMidia();
  renderizarMensagens();
  renderizarEventos();
  renderizarTemaAlternativo();
  indexar();
  mostrar(location.hash.slice(1) || 'signin');
})();
