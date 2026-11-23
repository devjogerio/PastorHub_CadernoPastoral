/* ============================================================
   PastorHub – Versão Usuário: Menu Lateral Responsivo
   Gerencia o drawer deslizante (#drawer), a sidebar fixa
   (#user-sidebar) e o cabeçalho (#topbar / #user-title) com a
   paleta oficial da versão pastoral. Publica window.UsuarioMenu.
   ============================================================ */
(function () {
  'use strict';

  const esc = (s) => (window.escapeHtml || String)(s == null ? '' : s);
  const ico = (nome, cls) => (window.icon ? window.icon(nome, cls || '') : '');

  // Itens canônicos de navegação em todos os menus laterais
  const ITENS_NAV = [
    { id: 'home', rotulo: 'Início', sub: 'Painel e devocional do dia', icone: 'home' },
    { id: 'biblioteca', rotulo: 'Bíblia & Biblioteca', sub: 'Obras teológicas e leitura', icone: 'book-open' },
    { id: 'sermoes', rotulo: 'Sermões & Estudos', sub: 'Mensagens expositivas e temáticas', icone: 'video' },
    { id: 'chat', rotulo: 'Comunidade & Pastores', sub: 'Conversas e pedidos de oração', icone: 'message-circle', badgeKey: 'chat' },
    { id: 'agenda', rotulo: 'Eventos & Agenda', sub: 'Cultos, estudos e visitação', icone: 'calendar' },
    { id: 'notificacoes', rotulo: 'Notificações', sub: 'Avisos da igreja e lembretes', icone: 'bell', badgeKey: 'notif' },
    { id: 'perfil', rotulo: 'Meu Perfil', sub: 'Suas informações e comunidade', icone: 'user' },
  ];

  const MAPA_VIEW = {
    home: 'home', dashboard: 'home',
    biblioteca: 'biblioteca', livro: 'biblioteca',
    sermoes: 'sermoes', sermao: 'sermoes',
    chat: 'chat', agenda: 'agenda',
    notificacoes: 'notificacoes', perfil: 'perfil',
  };

  // Obtém os dados atuais do usuário a partir do módulo UsuarioPerfil
  function obterPerfil() {
    if (window.UsuarioPerfil && window.UsuarioPerfil.carregar) {
      const d = window.UsuarioPerfil.carregar();
      return {
        nome: d.nome || 'Ana Silva',
        apelido: d.apelido || 'Serva de Cristo',
        email: d.email || 'ana.silva@email.com',
        iniciais: window.UsuarioPerfil.iniciais ? window.UsuarioPerfil.iniciais(d.nome) : 'AS',
      };
    }
    return { nome: 'Ana Silva', apelido: 'Serva de Cristo', email: 'ana.silva@email.com', iniciais: 'AS' };
  }

  // Gera o HTML de um botão de navegação para drawer ou sidebar
  function htmlItemNav(item, cls, viewAtiva, contadores) {
    const ativo = item.id === viewAtiva;
    const qtd = item.badgeKey && contadores ? (contadores[item.badgeKey] || 0) : 0;
    const badge = qtd > 0 ? '<span class="nav-badge" aria-label="' + qtd + ' não lidas">' + qtd + '</span>' : '';
    return '<button class="' + cls + (ativo ? ' active' : '') + '" data-nav="' + item.id + '" ' +
      'aria-current="' + (ativo ? 'page' : 'false') + '" type="button">' +
      '<span class="icon">' + ico(item.icone) + '</span>' +
      '<span>' + esc(item.rotulo) + '</span>' + badge +
    '</button>';
  }

  // Garante que #topbar e #drawer existam em qualquer shell (inclusive desktop em tela menor)
  function garantirEstruturaDom() {
    const app = document.querySelector('#app');
    if (!app) return;
    if (!document.querySelector('#topbar')) {
      const top = document.createElement('header');
      top.id = 'topbar';
      app.insertBefore(top, app.firstChild);
    }
    let drawer = document.querySelector('#drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'drawer';
      app.appendChild(drawer);
    }
    // Remove o atributo hidden para permitir animação CSS de entrada e saída
    drawer.removeAttribute('hidden');
  }

  // Renderiza o conteúdo completo da barra superior (#topbar)
  function renderTopbar(viewAtiva, contadores) {
    const top = document.querySelector('#topbar');
    if (!top) return;
    const u = obterPerfil();
    const info = ITENS_NAV.find((i) => i.id === viewAtiva) || ITENS_NAV[0];
    const naoLidas = (contadores && contadores.notif) || 0;
    const badge = naoLidas > 0 ? '<span class="nav-badge">' + naoLidas + '</span>' : '';
    const aberto = document.querySelector('#drawer.open') != null;

    top.innerHTML =
      '<div class="topbar-left">' +
        '<button class="btn-icon" id="btn-menu" aria-label="Abrir menu lateral" aria-expanded="' + aberto + '" type="button">' +
          ico('menu') +
        '</button>' +
        '<div class="topbar-title">' +
          '<h1>PastorHub</h1>' +
          '<span class="topbar-badge">' + esc(info.rotulo) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="topbar-right">' +
        '<button class="btn-icon" data-nav="notificacoes" aria-label="Notificações" type="button">' +
          ico('bell') + badge +
        '</button>' +
        '<button class="topbar-avatar" data-nav="perfil" aria-label="Abrir meu perfil" type="button">' +
          esc(u.iniciais) +
        '</button>' +
      '</div>';
  }

  // Renderiza o menu lateral deslizante (#drawer) com perfil, navegação, atalhos e versões
  function renderDrawer(viewAtiva, contadores) {
    const drawer = document.querySelector('#drawer');
    if (!drawer) return;
    const u = obterPerfil();
    const navHtml = ITENS_NAV.map((item) => htmlItemNav(item, 'drawer-nav-item', viewAtiva, contadores)).join('');

    drawer.innerHTML =
      '<div class="drawer-backdrop" data-action="close-drawer"></div>' +
      '<aside class="drawer-panel" role="dialog" aria-label="Menu Lateral">' +
        '<header class="drawer-head">' +
          '<div class="drawer-brand">' +
            '<span class="drawer-brand-box">' + ico('book-open') + '</span>' +
            '<div><h2>PastorHub</h2><p>Comunidade & Membros</p></div>' +
          '</div>' +
          '<button class="btn-icon dark" data-action="close-drawer" aria-label="Fechar menu" type="button">' +
            ico('x') +
          '</button>' +
        '</header>' +
        '<div class="drawer-profile" id="drawer-profile" data-nav="perfil" role="button" tabindex="0" aria-label="Ir para Meu Perfil">' +
          '<span class="avatar">' + esc(u.iniciais) + '</span>' +
          '<div class="drawer-profile-info">' +
            '<div class="name">' + esc(u.nome) + '</div>' +
            '<div class="email">' + esc(u.email) + '</div>' +
            '<span class="role-tag">' + esc(u.apelido) + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="drawer-label">Navegação</p>' +
        '<nav class="drawer-menu" aria-label="Menu principal">' + navHtml + '</nav>' +
        '<hr class="sep">' +
        '<p class="drawer-label">Ações rápidas</p>' +
        '<div class="drawer-menu">' +
          '<button data-action="novo-pedido-oracao" type="button"><span class="icon">' + ico('message-circle') + '</span><span>Novo Pedido de Oração</span></button>' +
          '<button data-action="agendar-visita" type="button"><span class="icon">' + ico('calendar') + '</span><span>Agendar Visita Pastoral</span></button>' +
        '</div>' +
        '<hr class="sep">' +
        '<p class="drawer-label">Versões</p>' +
        '<div class="drawer-menu">' +
          '<a href="usuario.html"><span class="icon">' + ico('phone') + '</span><span>Usuário Mobile</span></a>' +
          '<a href="usuario-tablet.html"><span class="icon">' + ico('layers') + '</span><span>Usuário Tablet</span></a>' +
          '<a href="usuario-desktop.html"><span class="icon">' + ico('monitor') + '</span><span>Usuário Desktop</span></a>' +
          '<a href="tablet.html"><span class="icon">' + ico('book') + '</span><span>App do Pastor</span></a>' +
          '<a href="site.html"><span class="icon">' + ico('globe') + '</span><span>Site Institucional</span></a>' +
          '<button class="danger" data-action="sair" type="button"><span class="icon">' + ico('log-out') + '</span><span>Sair da Conta</span></button>' +
        '</div>' +
      '</aside>';
  }

  // Renderiza a sidebar lateral fixa para Tablet e Desktop
  function renderSidebar(viewAtiva, contadores) {
    const sidebar = document.querySelector('#user-sidebar, .user-sidebar');
    if (!sidebar) return;
    sidebar.removeAttribute('hidden');
    const u = obterPerfil();
    const navHtml = ITENS_NAV.map((item) => htmlItemNav(item, 'sidebar-item', viewAtiva, contadores)).join('');

    sidebar.innerHTML =
      '<div class="user-sidebar-head">' +
        '<span class="user-sidebar-logo">' + ico('book-open') + '</span>' +
        '<div><h1>PastorHub</h1><p>Comunidade & Membros</p></div>' +
      '</div>' +
      '<nav class="user-nav" aria-label="Navegação lateral">' + navHtml + '</nav>' +
      '<div class="user-sidebar-foot">' +
        '<button class="user-perfil-btn" data-nav="perfil" type="button">' +
          '<span class="avatar">' + esc(u.iniciais) + '</span>' +
          '<div><span>' + esc(u.nome) + '</span><small>' + esc(u.apelido) + '</small></div>' +
        '</button>' +
        '<button class="user-exit-btn" data-action="sair" type="button">' +
          '<span class="icon">' + ico('log-out') + '</span><span>Sair da Conta</span>' +
        '</button>' +
      '</div>';
  }

  // Atualiza título e subtítulo do cabeçalho da área principal no Desktop
  function atualizarCabecalhoDesktop(viewAtiva) {
    const info = ITENS_NAV.find((i) => i.id === viewAtiva) || ITENS_NAV[0];
    const t = document.querySelector('#user-title');
    const s = document.querySelector('#user-subtitle');
    if (t) t.textContent = info.rotulo;
    if (s) s.textContent = info.sub;
  }

  // Sincroniza topbar, drawer, sidebar e cabeçalho desktop
  function atualizar(viewId, contadores) {
    garantirEstruturaDom();
    const viewAtiva = MAPA_VIEW[viewId] || 'home';
    renderTopbar(viewAtiva, contadores);
    renderDrawer(viewAtiva, contadores);
    renderSidebar(viewAtiva, contadores);
    atualizarCabecalhoDesktop(viewAtiva);
  }

  // Abre o menu lateral deslizante com animação
  function abrirDrawer() {
    garantirEstruturaDom();
    const drawer = document.querySelector('#drawer');
    if (!drawer) return;
    drawer.classList.add('open');
    const btn = document.querySelector('#btn-menu');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  // Fecha o menu lateral deslizante com animação
  function fecharDrawer() {
    const drawer = document.querySelector('#drawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    const btn = document.querySelector('#btn-menu');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function alternarDrawer() {
    const drawer = document.querySelector('#drawer');
    if (drawer && drawer.classList.contains('open')) fecharDrawer();
    else abrirDrawer();
  }

  window.UsuarioMenu = { atualizar, abrirDrawer, fecharDrawer, alternarDrawer };
})();
