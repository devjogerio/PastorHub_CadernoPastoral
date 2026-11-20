/* App: inicialização, navegação, drawer, busca global, toasts globais e auth */
(function () {
  const $ = (sel) => document.querySelector(sel);
  const Actions = window.Actions || (window.Actions = {});

  // Shell: 'mobile' (padrão) | 'tablet' | 'desktop'
  const SHELL = window.APP_SHELL || 'mobile';
  document.body.classList.add('shell-' + SHELL);

  const state = {
    view: 'dashboard',
    online: navigator.onLine,
    user: { name: 'Pastor Silva', email: 'Modo Offline', initials: 'PS' },
  };

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Início', icon: 'home' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar' },
    { id: 'atendimentos', label: 'Atendimento', icon: 'users' },
    { id: 'sermoes', label: 'Sermões', icon: 'book-open' },
    { id: 'conselho', label: 'Conselho', icon: 'video' },
    { id: 'notificacoes', label: 'Alertas', icon: 'bell' },
  ];

  /* ---------- Render ---------- */
  function renderNav() {
    const items = NAV_ITEMS.map((n) =>
      '<button class="nav-item' + (state.view === n.id ? ' active' : '') + '" data-nav="' + n.id + '" aria-label="' + n.label + '" aria-pressed="' + (state.view === n.id) + '" type="button">' +
        icon(n.icon) + '<span>' + n.label + '</span></button>'
    ).join('');

    const nav = $('#bottom-nav');
    if (SHELL === 'desktop') {
      nav.innerHTML =
        '<div class="side-brand">' +
          '<span class="logo-box">' + icon('book-open') + '</span>' +
          '<div><strong>PastorHub</strong><span>Caderno do Pastor</span></div>' +
        '</div>' +
        items +
        '<div class="side-user">' +
          '<button class="side-user-perfil" data-action="meu-perfil" type="button" title="Meu perfil" aria-label="Abrir meu perfil">' +
            '<span class="avatar">' + escapeHtml(Usuario.iniciais()) + '</span>' +
            '<span class="side-user-info">' +
              '<span class="u-name">' + escapeHtml(Usuario.dados.nome) + '</span>' +
              '<span class="u-mail">' + escapeHtml(Usuario.dados.email) + '</span>' +
            '</span>' +
          '</button>' +
          '<button data-action="sair" aria-label="Sair" type="button">' + icon('log-out', 'icon-sm') + '</button>' +
        '</div>';
    } else {
      nav.innerHTML = items;
    }
  }

  function renderView() {
    const view = window.Views[state.view] || window.Views.dashboard;
    const main = $('#view');
    const result = view.render();
    if (typeof result === 'string') {
      main.innerHTML = result;
    } else {
      main.innerHTML = result.html;
      if (result.after) result.after(main);
    }
    main.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  window.App = {
    navigate(view) {
      if (!window.Views[view]) view = 'dashboard';
      state.view = view;
      renderNav();
      renderView();
    },
    rerender() {
      renderNav();
      renderView();
    },
    showAuth() {
      $('#app').hidden = true;
      $('#auth').hidden = false;
    },
    enterApp(user) {
      if (user) state.user = user;
      updateConnectionUI();
      renderDrawerProfile();
      this.rerender();
      $('#auth').hidden = true;
      $('#app').hidden = false;
    },
    state,
  };

  /* ---------- Conexão ---------- */
  function updateConnectionUI() {
    const badge = $('#conn-badge');
    const ind = $('#conn-indicator');
    badge.textContent = state.online ? 'Online' : 'Offline';
    badge.classList.toggle('badge-lime', state.online);
    badge.classList.toggle('badge-orange', !state.online);
    ind.className = state.online ? '' : 'off';
    ind.innerHTML = icon(state.online ? 'wifi' : 'wifi-off', 'icon-sm');
  }

  Storage.addOnlineListener((online) => {
    state.online = online;
    updateConnectionUI();
    renderView(); // atualiza chips de modo offline na tela de sermões
    toast(online ? 'Conexão restaurada!' : 'Você está offline', online ? 'success' : 'error');
  });

  /* ---------- Drawer ---------- */
  function renderDrawerProfile() {
    const u = Usuario.dados;
    state.user = { name: u.nome, email: u.email, initials: Usuario.iniciais() };
    $('#drawer-profile').innerHTML =
      avatarDe(u.nome, 'avatar-48') +
      '<div><p class="name">' + escapeHtml(state.user.name) + '</p><p class="email">' + escapeHtml(state.user.email) + '</p></div>';

    $('#drawer-conn').innerHTML = state.online
      ? '<div class="alert green">' + icon('wifi', 'icon-sm') + '<span>' + (u.email === 'Modo Offline' ? 'Online • Modo Local' : 'Conectado • Sincronizado') + '</span></div>'
      : '<div class="alert orange">' + icon('wifi-off', 'icon-sm') + '<span>Offline • Dados salvos localmente</span></div>';
  }

  function openDrawer() {
    renderDrawerProfile();
    $('#drawer').hidden = false;
  }
  function closeDrawer() {
    $('#drawer').hidden = true;
  }

  $('#btn-menu').addEventListener('click', openDrawer);

  Actions['close-drawer'] = closeDrawer;

  /* ---------- Busca global ---------- */
  const BUSCA = MOCK.busca;

  function abrirBusca() {
    $('#search-overlay').hidden = false;
    const input = $('#search-input');
    input.value = '';
    renderBusca('');
    setTimeout(() => input.focus(), 50);
  }
  function fecharBusca() {
    $('#search-overlay').hidden = true;
  }

  function buscaCardSermao(s) {
    return '<div class="item-card" data-toast="Abrindo sermão: ' + escapeHtml(s.titulo) + '">' +
      '<div class="item-body"><div class="item-title">' + escapeHtml(s.titulo) + '</div><div class="item-sub">' + escapeHtml(s.ref) + ' • ' + escapeHtml(s.data) + '</div></div>' +
      '<span class="badge ' + (s.pregado ? 'badge-lime' : 'badge-orange') + '">' + (s.pregado ? 'Pregado' : 'Aguardando') + '</span></div>';
  }
  function buscaCardAtendimento(a) {
    return '<div class="item-card" data-toast="Detalhes de ' + escapeHtml(a.nome) + '">' +
      avatarHTML(a.nome, 'avatar-40 avatar-navy') +
      '<div class="item-body"><div class="item-title">' + escapeHtml(a.nome) + '</div><div class="item-sub">' + escapeHtml(a.tipo) + '</div></div>' +
      '<span class="item-meta">' + escapeHtml(a.quando) + '</span></div>';
  }
  function buscaCardAgenda(e) {
    return '<div class="item-card" data-toast="Detalhes do evento: ' + escapeHtml(e.titulo) + '">' +
      '<div class="item-body"><div class="item-title">' + escapeHtml(e.titulo) + '</div><div class="item-meta">' + icon('clock', 'icon-sm') + escapeHtml(e.quando) + '</div></div>' +
      '<span class="badge badge-outline">' + escapeHtml(e.tipo) + '</span></div>';
  }

  function renderBusca(termo) {
    const q = termo.trim().toLowerCase();
    const res = $('#search-results');
    const count = $('#search-count');

    if (!q) {
      count.hidden = true;
      res.innerHTML =
        '<div class="search-empty">' +
          '<div class="circle">' + icon('search', 'icon-lg') + '</div>' +
          '<h3>Busca Global</h3><p>Procure por sermões, atendimentos, eventos e muito mais</p>' +
        '</div>';
      return;
    }

    const sermoes = BUSCA.sermoes.filter((s) => (s.titulo + ' ' + s.ref).toLowerCase().includes(q));
    const atends = BUSCA.atendimentos.filter((a) => (a.nome + ' ' + a.tipo).toLowerCase().includes(q));
    const agenda = BUSCA.agenda.filter((e) => (e.titulo + ' ' + e.tipo).toLowerCase().includes(q));
    const total = sermoes.length + atends.length + agenda.length;

    count.hidden = false;
    count.textContent = total + (total === 1 ? ' resultado encontrado' : ' resultados encontrados');

    if (total === 0) {
      res.innerHTML =
        '<div class="search-empty">' +
          '<div class="circle">' + icon('search', 'icon-lg') + '</div>' +
          '<h3>Nenhum resultado</h3><p>Tente usar outras palavras-chave</p>' +
        '</div>';
      return;
    }

    res.innerHTML =
      '<div class="search-section-title">' + icon('book-open', 'icon-sm') + 'Sermões (' + sermoes.length + ')</div>' +
      (sermoes.map(buscaCardSermao).join('') || '<p class="item-sub" style="padding:0 1rem">Nada encontrado</p>') +
      '<div class="search-section-title">' + icon('users', 'icon-sm') + 'Atendimentos (' + atends.length + ')</div>' +
      (atends.map(buscaCardAtendimento).join('') || '<p class="item-sub" style="padding:0 1rem">Nada encontrado</p>') +
      '<div class="search-section-title">' + icon('calendar', 'icon-sm') + 'Agenda (' + agenda.length + ')</div>' +
      (agenda.map(buscaCardAgenda).join('') || '<p class="item-sub" style="padding:0 1rem">Nada encontrado</p>');
  }

  $('#btn-search').addEventListener('click', abrirBusca);
  $('#search-input').addEventListener('input', (e) => renderBusca(e.target.value));
  $('#search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharBusca();
  });

  Actions['close-search'] = fecharBusca;

  /* ---------- Auth ---------- */
  document.querySelectorAll('[data-auth-tab]').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-auth-tab]').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      $('#auth-login').hidden = b.dataset.authTab !== 'login';
      $('#auth-signup').hidden = b.dataset.authTab !== 'signup';
    });
  });

  $('#auth-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    const nome = email ? email.split('@')[0] : 'Pastor';
    // atualiza o perfil logado
    Usuario.dados.email = email || Usuario.dados.email;
    Usuario.dados.nome = Usuario.dados.nome || capitalize(nome);
    Usuario.salvar();
    toast('Login realizado com sucesso!', 'success');
    App.enterApp();
  });

  $('#auth-signup').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#cad-email').value.trim();
    const nome = $('#cad-nome').value.trim();
    Usuario.dados.email = email || Usuario.dados.email;
    Usuario.dados.nome = nome || Usuario.dados.nome;
    Usuario.dados.igreja = $('#cad-igreja').value.trim() || Usuario.dados.igreja;
    Usuario.salvar();
    toast('Cadastro realizado! Verifique seu email para confirmar.', 'success');
    App.enterApp();
  });

  Actions['auth-google'] = function () {
    toast('Conectando com Google...', 'success');
    setTimeout(() => {
      toast('Login realizado com sucesso!', 'success');
      App.enterApp();
    }, 900);
  };

  Actions['usar-offline'] = function () {
    toast('Modo offline ativado. Seus dados serão salvos localmente.');
    App.enterApp();
  };

  Actions['sair'] = function () {
    closeDrawer();
    toast('Sessão encerrada');
    App.showAuth();
  };

  /* Abre o perfil do usuário logado (Configurações · aba Geral) */
  Actions['meu-perfil'] = function () {
    closeDrawer();
    if (window.NOTIF_UI) window.NOTIF_UI.setTab = 'geral';
    App.navigate('settings');
  };

  /* ---------- Formulários dos sheets ---------- */
  Actions['close-sheet'] = closeSheet;

  Actions['novo-evento'] = function () {
    openSheet({
      title: 'Novo Compromisso',
      desc: 'Adicione um evento à sua agenda',
      body:
        '<div class="field"><label>Título</label><input id="ev-titulo" type="text" placeholder="Ex: Aconselhamento..."></div>' +
        '<div class="field"><label>Data</label><input id="ev-data" type="date"></div>' +
        '<div class="field"><label>Hora</label><input id="ev-hora" type="time"></div>' +
        '<div class="field"><label>Tipo</label><select><option value="" disabled selected>Selecione</option><option>Atendimento</option><option>Visitação</option><option>Palestra</option><option>Culto</option></select></div>' +
        '<div class="field"><label>Local</label><select><option value="" disabled selected>Selecione</option><option>Presencial</option><option>Online</option><option>Visitação</option><option>Telefone</option></select></div>' +
        '<div class="field"><label>Observações</label><textarea rows="3" placeholder="Detalhes..."></textarea></div>',
      footer: '<button class="btn lime block" data-action="salvar-evento" type="button">Salvar Compromisso</button>',
    });
  };

  Actions['salvar-evento'] = function () {
    closeSheet();
    toast('Compromisso salvo!', 'success');
  };

  Actions['novo-atendimento'] = function () {
    openSheet({
      title: 'Novo Atendimento',
      desc: 'Registre um atendimento pastoral',
      body:
        '<div class="field"><label>Nome da Pessoa</label><input id="at-nome" type="text" placeholder="Digite o nome..."></div>' +
        '<div class="field"><label>Data</label><input type="date"></div>' +
        '<div class="field"><label>Hora</label><input type="time"></div>' +
        '<div class="field"><label>Tipo</label><select><option value="" disabled selected>Selecione</option><option>Aconselhamento</option><option>Visitação</option><option>Oração</option><option>Discipulado</option></select></div>' +
        '<div class="field"><label>Modalidade</label><select><option value="" disabled selected>Selecione</option><option>Presencial</option><option>Online</option><option>Telefone</option><option>Visitação</option></select></div>' +
        '<div class="field"><label>Motivo</label><input type="text" placeholder="Breve descrição..."></div>' +
        '<div class="field"><label>Observações</label><textarea rows="4" placeholder="Anotações..."></textarea></div>',
      footer: '<button class="btn lime block" data-action="salvar-atendimento" type="button">Salvar Atendimento</button>',
    });
  };

  Actions['salvar-atendimento'] = function () {
    closeSheet();
    toast('Atendimento salvo!', 'success');
  };

  Actions['gerar-palestra'] = function () {
    openSheet({
      title: 'Gerar Palestra com IA',
      desc: 'Crie conteúdo pastoral personalizado',
      body:
        '<div class="field"><label>Tema da Palestra</label><input type="text" placeholder="Ex: Fé em tempos difíceis"></div>' +
        '<div class="field"><label>Duração</label><select><option value="" disabled selected>Selecione</option><option>30 minutos</option><option>45 minutos</option><option>60 minutos</option></select></div>' +
        '<div class="field"><label>Público</label><select><option value="" disabled selected>Selecione</option><option>Geral</option><option>Jovens</option><option>Adultos</option><option>Idosos</option></select></div>' +
        '<div class="field"><label>Observações</label><textarea rows="3" placeholder="Ex: Incluir exemplos práticos..."></textarea></div>' +
        '<div class="info-box lime"><div>💡</div><div><strong>Dicas</strong><ul><li>Seja específico no tema</li><li>Revise e personalize o conteúdo</li><li>Adapte ao seu contexto</li></ul></div></div>',
      footer: '<button class="btn primary block" data-action="salvar-palestra" type="button">' + icon('sparkles', 'icon-sm') + 'Gerar Palestra</button>',
    });
  };

  Actions['salvar-palestra'] = function () {
    closeSheet();
    toast('Palestra gerada com sucesso!', 'success');
  };

  Actions['adicionar-video'] = function () {
    openSheet({
      title: 'Adicionar Vídeo',
      desc: 'Adicione um link de vídeo à biblioteca',
      body:
        '<div class="field"><label>Título</label><input type="text" placeholder="Título do vídeo"></div>' +
        '<div class="field"><label>URL</label><input type="url" placeholder="https://youtube.com/..."></div>' +
        '<div class="field"><label>Categoria</label><select><option value="" disabled selected>Selecione</option><option>Aconselhamento</option><option>Família</option><option>Jovens</option><option>Espiritualidade</option></select></div>' +
        '<div class="field"><label>Tags</label><input type="text" placeholder="Ex: ansiedade, paz"></div>',
      footer: '<button class="btn lime block" data-action="salvar-video" type="button">Adicionar à Biblioteca</button>',
    });
  };

  Actions['salvar-video'] = function () {
    closeSheet();
    toast('Vídeo adicionado à biblioteca!', 'success');
  };

  Actions['marcar-lidas'] = function () {
    NOTIF_UI.notifLidas = true;
    MOCK.notificacoes.lista.forEach((n) => (n.lida = true));
    toast('Todas as notificações marcadas como lidas', 'success');
    App.rerender();
  };

  // abre o gerador de sermão com IA a partir de qualquer tela
  Actions['abrir-gerador-sermao'] = function () {
    App.navigate('sermoes');
    setTimeout(() => {
      if (window.Actions && window.Actions['novo-sermao']) window.Actions['novo-sermao']();
    }, 120);
  };

  /* ---------- Confirmação ---------- */
  Actions['confirm-cancel'] = closeConfirm;
  $('#confirm-ok').addEventListener('click', runConfirm);

  /* ---------- Delegação global de cliques ---------- */
  document.addEventListener('click', (e) => {
    // navegação inferior
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      App.navigate(nav.dataset.nav);
      return;
    }
    // toast simples
    const t = e.target.closest('[data-toast]');
    if (t) {
      toast(t.dataset.toast);
    }

    // drawer menu - fechar e navegar
    const drawerItem = e.target.closest('#drawer > aside > nav button, #drawer > aside > nav a');
    if (drawerItem) {
      closeDrawer();
      // se houver data-nav, navegar; se tiver data-action, chamar ação
      if (drawerItem.dataset.nav) {
        App.navigate(drawerItem.dataset.nav);
      } else if (drawerItem.dataset.action) {
        const fn = Actions[drawerItem.dataset.action];
        if (fn) fn(drawerItem);
      } else if (drawerItem.href) {
        const link = e.target.closest('a[href]');
        if (link && link.dataset.action !== 'close-drawer') {
          window.location.href = link.href;
        }
      }
      return;
    }

    // avatar do dashboard - abrir perfil
    const avatarDash = e.target.closest('#view > div.view-header > div:nth-child(1) > span, #view > div.view-header > div:nth-child(1) > div.avatar');
    if (avatarDash) {
      Actions['meu-perfil']();
      return;
    }
    // modal de informações dos stats
    const stat = e.target.closest('.stat-btn');
    if (stat && StatModal) {
      StatModal(stat);
      return;
    }
    // ações registradas
    const act = e.target.closest('[data-action]');
    if (act) {
      const fn = Actions[act.dataset.action];
      if (fn) fn(act);
    }
  });

  /* ---------- Delegação global de mudanças (switches) ---------- */
  document.addEventListener('change', (e) => {
    const tema = e.target.closest('[data-tema-switch]');
    if (tema) {
      Tema.definir(tema.checked ? 'escuro' : 'claro');
      toast(tema.checked ? 'Modo escuro ativado' : 'Modo claro ativado', 'success');
      return;
    }
    const tpl = e.target.closest('[data-wa-tpl]');
    if (tpl) {
      const t = MOCK.whatsapp.templates.find((x) => x.nome === tpl.dataset.waTpl);
      if (t) {
        t.ativo = tpl.checked;
        toast('Template "' + t.nome + '" ' + (t.ativo ? 'ativado' : 'desativado'), 'success');
      }
    }
  });

  /* ---------- Bloqueio por pendência financeira ---------- */
  function fmtBRL(v) { return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ','); }

  function checarBloqueio() {
    try {
      const Pag = window.PastorPag;
      if (!Pag) return;
      const email = Usuario.dados && Usuario.dados.email;
      if (!email || email === 'Modo Offline') { esconderBloqueio(); return; }
      const a = Pag.assinaturaDe(email);
      if (Pag.bloqueada(a)) mostrarBloqueio(a, 'bloqueio');
      else if (Pag.pendente(a)) mostrarBloqueio(a, 'pendente');
      else esconderBloqueio();
    } catch (e) {}
  }

  function esconderBloqueio() {
    const ov = document.getElementById('bloqueio-overlay');
    if (ov) ov.hidden = true;
    document.body.classList.remove('bloqueio-ativo');
  }

  function mostrarBloqueio(a, modo) {
    let ov = document.getElementById('bloqueio-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'bloqueio-overlay';
      ov.className = 'bloqueio-overlay';
      ov.hidden = true;
      document.body.appendChild(ov);
    }
    const Pag = window.PastorPag;
    const fat = Pag.lerFat();
    const pix = Pag.lerPix();
    const gw = Pag.gatewayAtivo();
    const pend = a.pendencia || {};
    const valor = pend.valor || a.valor || 0;
    const desde = pend.desde || a.pendenteDesde || a.proxima || '—';
    const bloqueio = modo === 'bloqueio';
    const formas = [];
    if (a.metodo) formas.push(a.metodo);
    if (gw) formas.push(gw.nome);
    if (fat.pixRecorrente && pix.chave) formas.push('Pix recorrente');

    ov.innerHTML =
      '<div class="bloqueio-card' + (bloqueio ? '' : ' aviso') + '" role="alertdialog" aria-modal="true" aria-labelledby="bloqueio-tit">' +
        '<span class="bloqueio-ico' + (bloqueio ? '' : ' amber') + '">' + icon(bloqueio ? 'lock' : 'alert-circle') + '</span>' +
        '<h2 id="bloqueio-tit">' + (bloqueio ? 'Conta bloqueada' : 'Fatura em aberto') + '</h2>' +
        '<p>' + (bloqueio
          ? 'Seu acesso ao PastorHub está bloqueado até a regularização da pendência financeira do plano <b>' + escapeHtml(a.plano || '') + '</b>.'
          : 'Há uma fatura em aberto do plano <b>' + escapeHtml(a.plano || '') + '</b>. Regularize para manter o acesso sem interrupção.') + '</p>' +
        '<div class="bloqueio-dados">' +
          '<div><span>Plano</span><b>' + escapeHtml(a.plano || '—') + '</b></div>' +
          '<div><span>' + (bloqueio ? 'Pendência' : 'Valor em aberto') + '</span><b>' + fmtBRL(valor) + '</b></div>' +
          '<div><span>Vencida desde</span><b>' + escapeHtml(desde) + '</b></div>' +
          '<div><span>Forma de pagamento</span><b>' + escapeHtml(formas.join(' · ') || '—') + '</b></div>' +
        '</div>' +
        (pix.chave
          ? '<div class="bloqueio-pix"><b>Pix para regularizar</b><code>' + escapeHtml(pix.chave) + '</code>' +
            '<button class="btn btn-outline btn-sm" data-bloq="copiar" type="button">' + icon('copy') + 'Copiar chave Pix</button></div>'
          : '') +
        '<div class="bloqueio-acoes">' +
          '<button class="btn lime" data-bloq="paguei" type="button">' + icon('check-circle') + 'Já paguei — enviar comprovante</button>' +
          '<a class="btn outline" target="_blank" rel="noopener" href="https://wa.me/?text=' +
            encodeURIComponent('Olá! Quero regularizar minha pendência no PastorHub (plano ' + (a.plano || '') + ', ' + fmtBRL(valor) + ').') +
            '">' + icon('message-circle') + 'Falar com o suporte</a>' +
        '</div>' +
        '<p class="bloqueio-nota">' + (bloqueio
          ? 'O acesso é liberado assim que o pagamento for confirmado. '
          : 'Se não houver pagamento até o vencimento + tolerância, a conta será bloqueada. ') +
          'Lembretes de vencimento são enviados ' + (fat.lembreteWhats ? 'via WhatsApp' : 'por e-mail') + '.</p>' +
        (bloqueio ? '' : '<button class="bloqueio-fechar" data-bloq="fechar" type="button" aria-label="Fechar">' + icon('x') + '</button>') +
      '</div>';
    ov.hidden = false;
    document.body.classList.add('bloqueio-ativo');

    const copiar = ov.querySelector('[data-bloq="copiar"]');
    if (copiar) copiar.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pix.chave).then(
          () => toast('Chave Pix copiada', 'success'),
          () => toast('Não foi possível copiar', 'error'));
      } else toast('Chave: ' + pix.chave);
    });
    const paguei = ov.querySelector('[data-bloq="paguei"]');
    if (paguei) paguei.addEventListener('click', () => {
      paguei.innerHTML = icon('check') + 'Comprovante enviado ✓';
      paguei.disabled = true;
      toast('Comprovante enviado! O acesso será liberado após a confirmação do pagamento.', 'success');
    });
    const fechar = ov.querySelector('[data-bloq="fechar"]');
    if (fechar) fechar.addEventListener('click', esconderBloqueio);
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'pastorhub_admin_assinaturas') checarBloqueio();
  });

  /* ---------- Boot ---------- */
  function boot() {
    // No shell tablet a navegação fica no topo (antes do conteúdo)
    if (SHELL === 'tablet') {
      const nav = $('#bottom-nav');
      $('#view').before(nav);
    }
    // perfil do usuário logado
    state.user = { name: Usuario.dados.nome, email: Usuario.dados.email, initials: Usuario.iniciais() };
    Usuario.onChange = function () {
      state.user = { name: Usuario.dados.nome, email: Usuario.dados.email, initials: Usuario.iniciais() };
      renderDrawerProfile();
      App.rerender();
      checarBloqueio();
    };
    Tema.onChange = function () { App.rerender(); };

    updateConnectionUI();
    App.rerender();
    setTimeout(() => {
      $('#splash').hidden = true;
      $('#app').hidden = false;
      checarBloqueio();
    }, 800);
  }

  boot();
})();
