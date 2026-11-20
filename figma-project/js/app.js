/* ============================================================
   Find Local Church — interações estáticas (sem backend)
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const screens = $$('.screen');
  const labels = {
    signin: 'Sign in', home: 'Home', find: 'Find church', churches: 'Igrejas',
    church: 'Detalhe', recordings: 'Recordings', sermons: 'Sermons',
    songs: 'Songs', messages: 'Messages', events: 'Events', needs: 'Pastor needs',
    testimony: 'Testemunho', alt: 'Tema claro/escuro',
  };

  /* ---------- Dados derivados dos frames do Figma ---------- */
  const features = [
    { label: 'Find the church', asset: 'assets/asset-04.svg' },
    { label: 'Attend online Service', icon: '▣' },
    { label: 'Attend offline Service', asset: 'assets/asset-14.svg' },
    { label: 'Service Recordings', icon: '▤' },
    { label: 'Kids Corner', icon: '♟' },
    { label: 'Testimony Corner', icon: '☀' },
  ];

  const churches = [
    { name: 'Good Shepherd Evangelical Church', place: 'Serilingampalle HYD, 500019', photo: 'photo-a', rating: '3.7', target: 'church' },
    { name: 'Christ Gospel Church', place: 'Gulmohar Park HYD, 500041', photo: 'photo-b', rating: '3.7', target: 'church' },
    { name: 'Good Shepherd Evangelical Church', place: 'Serilingampalle HYD, 500019', photo: 'photo-c', rating: '3.7', target: 'church' },
  ];

  const compact = [
    { name: 'Annie Hall', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', photo: 'photo-d', badge: null },
    { name: 'Annie Hall', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', photo: 'photo-b', badge: null },
    { name: 'Annie Hall', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', photo: 'photo-c', badge: null },
  ];

  const recordings = [
    { title: 'Cleansing all who want', church: 'BY Christ Gospel Church', duration: '22 MIN', photo: 'thumb-a' },
    { title: 'Voice Of God', church: 'Good Shepherd Evangelical Church', duration: '34 MIN', photo: 'thumb-b' },
    { title: 'How to recognize when God Speaks', church: 'Good Shepherd Evangelical Church', duration: '32 MIN', photo: 'thumb-c' },
    { title: 'Who do you say this is?', church: 'Good Shepherd Evangelical Church', duration: '34 MIN', photo: 'thumb-d' },
    { title: 'There Is Power In The Name of Jesus', church: 'BY Christ Gospel Church', duration: '22 MIN', photo: 'thumb-e' },
    { title: 'The Passion', church: 'Good Shepherd Evangelical Church', duration: '34 MIN', photo: 'thumb-f' },
  ];

  const songs = [
    'Above all powers', 'All Creatures of Our God', 'All to Jesus',
    'Amazing Grace', 'Angels we have heard', 'As the Deer Panteth',
  ];

  const posts = [
    { name: 'Joel Raj', time: '4 mins ago', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque libero eros, efficitur eu convallis eu, sollicitudin eu ipsum. Donec blandit facilisis eros, sed consectetur nunc ullamcorper et.' },
    { name: 'Lara Croft', time: '32 mins ago', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque libero eros, efficitur eu convallis eu, sollicitudin eu ipsum. Donec blandit facilisis eros, sed consectetur nunc ullamcorper et.' },
  ];

  const eventGroups = [
    { date: '17 September', periods: [
      { period: 'Morning', rows: [['09:30', '10:00', 'Event name'], ['10:00', '10:30', 'Event name'], ['11:00', '11:40', 'Event name']] },
    ] },
    { date: '21 September', periods: [
      { period: 'Morning', rows: [['09:30', '10:00', 'Event name'], ['10:00', '10:30', 'Event name'], ['11:00', '11:40', 'Event name']] },
    ] },
  ];

  const needs = [
    { name: 'Good Shepherd Evangelical Church', place: 'Serilingampalle HYD, 500019', status: 'Need Hand', photo: 'photo-a' },
    { name: 'Christ Gospel Church', place: 'Gulmohar Park HYD, 500041', status: 'Done', photo: 'photo-b' },
    { name: 'Good Shepherd Evangelical Church', place: 'Serilingampalle HYD, 500019', status: null, photo: 'photo-c' },
  ];

  /* ---------- Renderizadores ---------- */
  function renderFeatures() {
    $('#feature-grid').innerHTML = features.map((f) =>
      '<button class="feature-card" type="button" data-go="' +
      (f.label === 'Find the church' ? 'find' : f.label === 'Attend online Service' ? 'churches' :
       f.label === 'Attend offline Service' ? 'churches' : f.label === 'Service Recordings' ? 'recordings' :
       f.label === 'Kids Corner' ? 'sermons' : 'testimony') + '">' +
      '<span class="icon-circle">' + (f.asset ? '<img src="' + f.asset + '" alt="">' : '<span aria-hidden="true">' + f.icon + '</span>') + '</span>' +
      '<span>' + esc(f.label) + '</span></button>').join('');
  }

  function churchCard(c) {
    return '<article class="church-card" data-go="' + c.target + '">' +
      '<div class="photo ' + c.photo + '"><button class="bookmark" type="button" aria-label="Salvar">🔖</button>' +
      '<span class="rating">⭐ ' + esc(c.rating) + '</span></div>' +
      '<div class="info"><span class="name">' + esc(c.name) + '</span>' +
      '<span class="place">📍 ' + esc(c.place) + '</span></div></article>';
  }

  function renderChurches() {
    $('#church-cards').innerHTML = churches.map(churchCard).join('');
    $('#compact-cards').innerHTML = compact.map((c) =>
      '<article class="compact-card"><div class="thumb ' + c.photo + '"></div>' +
      '<div class="copy"><h3>' + esc(c.name) + '</h3><p>' + esc(c.text) + '</p>' +
      (c.badge ? '<span class="badge">' + esc(c.badge) + '</span>' : '') + '</div></article>').join('');
    $('#need-cards').innerHTML = needs.map((c) =>
      '<article class="compact-card" data-go="church"><div class="thumb ' + c.photo + '"></div>' +
      '<div class="copy"><h3>' + esc(c.name) + '</h3><p>📍 ' + esc(c.place) + '</p>' +
      (c.status ? '<span class="badge">' + esc(c.status) + '</span>' : '') + '</div></article>').join('');
  }

  function recordCard(r, label) {
    return '<article class="record-card"><div class="thumb ' + r.photo + '">' +
      '<button class="play" type="button" aria-label="Reproduzir ' + esc(label) + '">▶</button>' +
      '<span class="duration">' + esc(r.duration || 'open') + '</span></div>' +
      '<div class="meta"><h3>' + esc(r.title) + '</h3><small>' + esc(r.church) + '</small></div></article>';
  }

  function renderRecordings() {
    $('#record-grid').innerHTML = recordings.map((r) => recordCard(r, 'gravação')).join('');
    $('#sermon-grid').innerHTML = recordings.map((r) =>
      recordCard(Object.assign({}, r, { duration: 'open' }), 'sermão')).join('');
    $('#song-list').innerHTML = songs.map((title, i) =>
      '<article class="song"><div class="cover thumb-' + (i % 6 + 1) + '"></div>' +
      '<div><h3>' + esc(title) + '</h3><span class="duration">22 MIN</span></div>' +
      '<button class="play" type="button" aria-label="Reproduzir ' + esc(title) + '">▶</button></article>').join('');
  }

  function renderPosts() {
    $('#posts').innerHTML = posts.map((p) =>
      '<article class="post"><div class="post-head"><span class="avatar-mini"><img src="assets/asset-02.svg" alt=""></span>' +
      '<div><b>' + esc(p.name) + '</b><time>' + esc(p.time) + '</time></div><span class="more">⋯</span></div>' +
      '<p>' + esc(p.text) + '</p><div class="post-actions"><button class="like" type="button">♥ 25 Likes</button>' +
      '<span class="comments">💬 13 Comments</span></div></article>').join('');
  }

  function renderEvents() {
    $('#events').innerHTML = eventGroups.map((g) =>
      '<h2 class="event-date">' + esc(g.date) + '</h2>' + g.periods.map((p) =>
        '<h3 class="event-period">' + esc(p.period) + '</h3>' + p.rows.map((r) =>
          '<div class="event-row"><span class="time">' + esc(r[0]) + ' - ' + esc(r[1]) + '</span>' +
          '<span class="name">' + esc(r[2]) + '</span><button class="open" type="button">Open</button></div>').join('')).join('')).join('');
  }

  function renderAlt() {
    $('#alt-chips').innerHTML = ['Find the Church', 'Attend online Service', 'Attend offline Service', 'Service Recordings']
      .map((c, i) => '<button type="button" class="' + (i === 0 ? 'active' : '') + '">' + esc(c) + '</button>').join('');
    $('#alt-churches').innerHTML = [
      ['Good Shepherd Evanlical Church', 'photo-a'],
      ['Jesus Christ Gospel Church', 'photo-b'],
      ['Christ Gospel Church', 'photo-c'],
    ].map((c) => '<article class="alt-church"><div class="img ' + c[1] + '"></div><p>' + esc(c[0]) + '</p></article>').join('');
  }

  function buildNav() {
    $('#demo-nav').innerHTML = screens.map((s) => {
      const id = s.dataset.screen;
      return '<a href="#' + id + '" data-nav="' + id + '">' + esc(labels[id] || id) + '</a>';
    }).join('');
  }

  /* ---------- Navegação + interações ---------- */
  function show(id) {
    if (!screens.some((s) => s.dataset.screen === id)) id = 'home';
    screens.forEach((s) => s.classList.toggle('is-active', s.dataset.screen === id));
    $$('#demo-nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === id));
    if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
    const active = $('.screen.is-active');
    if (active) active.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); show(nav.dataset.nav); return; }
    const go = e.target.closest('[data-go]');
    if (go) { show(go.dataset.go); return; }
    const tab = e.target.closest('.signin-tabs button');
    if (tab) { $$('.signin-tabs button').forEach((b) => b.classList.toggle('active', b === tab)); return; }
    const t = e.target.closest('[data-tabs] button');
    if (t) { $$('[data-tabs] button', t.closest('[data-tabs]')).forEach((b) => b.classList.toggle('active', b === t)); return; }
    const chip = e.target.closest('.chips button');
    if (chip) { $$('.chips button').forEach((b) => b.classList.toggle('active', b === chip)); return; }
    const bm = e.target.closest('.bookmark');
    if (bm) { bm.textContent = bm.textContent === '🔖' ? '🔖✓' : '🔖'; }
  });

  $('#theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('alt-dark');
    show('alt');
  });

  $('#signup-form').addEventListener('submit', (e) => { e.preventDefault(); show('home'); });
  $('#testimony-form').addEventListener('submit', (e) => { e.preventDefault(); show('home'); });

  /* Busca local (filtra os cards da tela ativa) */
  document.addEventListener('input', (e) => {
    if (!e.target.matches('.search input')) return;
    const q = e.target.value.trim().toLowerCase();
    const screen = e.target.closest('.screen');
    const containers = $$('.church-cards, .compact-cards, .record-grid, .song-list, .posts', screen);
    containers.forEach((c) => $$('article', c).forEach((a) => {
      a.style.display = !q || a.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
    }));
  });

  window.addEventListener('hashchange', () => show(location.hash.slice(1)));

  renderFeatures();
  renderChurches();
  renderRecordings();
  renderPosts();
  renderEvents();
  renderAlt();
  buildNav();
  show(location.hash.slice(1) || 'signin');
})();
