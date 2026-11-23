/* ============================================================
   PastorHub – Versão Usuário JS
   Interactions for believers to interact with pastor/leader content
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  // Fallbacks locais: o app continua funcionando mesmo se um script compartilhado falhar
  const escapeHtml = window.escapeHtml || function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  const icon = window.icon || function (name, cls) {
    return '<span class="icon ' + (cls || '') + '" aria-hidden="true">' + (name || '') + '</span>';
  };

  // Shell
  const SHELL = window.APP_SHELL || 'mobile';
  document.body.classList.add('shell-' + SHELL);

  // Remove a tela de carregamento (causa do "loop infinito" relatado)
  function hideSplash() {
    const splash = $('#splash');
    if (splash) {
      splash.hidden = true;
      splash.style.display = 'none';
    }
  }

  // User data (mock)
  const User = {
    dados: {
      nome: 'Maria Souza',
      email: 'maria.souza@email.com',
      initials: 'MS',
      igreja: 'Igreja São João',
      tipo: 'usuario',
      origem: 'local'
    },
    iniciais() {
      return this.dados.initials || this.dados.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    isAuthed() {
      return localStorage.getItem('usuario_authed') === 'true';
    }
  };

  // Usuários de pastor/líder (mock)
  const PASTORS = [
    { id: 1, nome: 'Pastor João Silva', cargo: 'Pastor de Culto', avatar: 'JV', online: true, ultimoMsg: 'Bom dia! Quer saber sobre o culto de hoje?' },
    { id: 2, nome: 'Pra. Maria Oliveira', cargo: 'Aconselhadora', avatar: 'MO', online: false, ultimoMsg: 'Teve uma reunião sobre casamentos amanhã' },
    { id: 3, nome: 'Líder de Configuracoes', cargo: 'Líder da Comunidade', avatar: 'LC', online: true, ultimoMsg: 'Agende sua visita geral' },
    { id: 4, nome: 'Pr. Carlos Santos', cargo: 'Pastor Principal', avatar: 'CS', online: true, ultimoMsg: 'Nova palestra disponível!' },
  ];

  // Agenda mock
  const AGENDA = [
    { id: 1, tipo: 'Visitação', local: 'Igreja São João', data: 'Hoje, 14:00', status: 'agendado' },
    { id: 2, tipo: 'Visitação', local: 'Casa 34, Seara Street', data: 'Amanhã, 10:00', status: 'pendente' },
    { id: 3, tipo: 'Visitação', local: 'Casa 15, Oliveira Street', data: 'Sábado, 15:00', status: 'pendente' },
  ];

  // Sermões mock
  const SERMOES = [
    { id: 1, titulo: 'Fé Que Remove Montanhas', autor: 'Pastor João Silva', tipo: 'Expositivo', texto: 'Existem terrenos que só teremos acesso quando atravessarmos certas montanhas. Nossa fé precisa ser forte nessas escaladas.', data: 'Há 2 dias' },
    { id: 2, titulo: 'Amizade que Inspira', autor: 'Pr. Carlos Santos', tipo: 'Temático', texto: 'A verdadeira amizade não te espanta ao sobre inferno, ela te faz ficar de pé na tempestade.', data: '5 de Novembro' },
    { id: 3, titulo: 'Comida e Hospitalidade', autor: 'Líder', tipo: 'Narrativo', texto: 'A família local organizou um café preto para receber as famílias de doentes da cidade, e lá surgiu uma conversa de milagres.', data: '3 de Novembro' },
  ];

  // Conversas mock
  const CONVERSAS = [
    { id: 1, pastor: PASTORS[0], ultimaMsg: 'Bom dia! Tudo bem? Tenho algumas perguntas sobre o culto hoje.', data: '10 min ago', naoLida: 2 },
    { id: 2, pastor: PASTORS[1], ultimaMsg: 'Teve uma reunião sobre casamentos amanhã. Você quer participar?', data: '2 h ago', naoLida: 1 },
    { id: 3, pastor: PASTORS[2], ultimaMsg: 'Agende sua visita geral conosco! Temos disponibilidade esta semana.', data: '5 h ago', naoLida: 0 },
  ];

  // Notificações mock
  const NOTIFICACOES = [
    { id: 1, tipo: 'chat', titulo: 'Nova mensagem de Pastor João', descricao: 'Mensagem recdaldehyde', data: '10 min ago', lida: false, entidade: PASTORS[0].nome },
    { id: 2, tipo: 'agenda', titulo: 'Visitação amanhã', descricao: 'Visita no casal 34 comendo', data: '2 h ago', lida: false, entidade: 'Igreja São João' },
    { id: 3, tipo: 'fatura', titulo: 'Pagamento pendente', descricao: 'Água e luz serão liberados em breve', data: '3 h ago', lida: false, entidade: 'Igreja São João' },
    { id: 4, tipo: 'sermon', titulo: 'Novo sermão disponível', descricao: 'Pr. Carlos Santos lançou uma nova palestra', data: '1 dia atrás', lida: true, entidade: 'Pr. Carlos Santos' },
  ];

  // Registro para chat (mock, pra implementação simples)
  const CHAT_REGISTRY = {};

  // ---------- Estado do App ----------
  const state = {
    view: 'home',
    chatId: null,
    notifLidas: false,
    favoritos: JSON.parse(localStorage.getItem('pastorhub_favoritos') || '[]'),
    sermaoId: null,
    livroId: null,
    bibFavs: JSON.parse(localStorage.getItem('pastorhub_biblioteca_favs') || '[]'),
  };

  // ---------- Auth ----------
  // true quando há Supabase configurado (js/config.js): auth real; senão, modo demonstração
  function authReal() {
    return !!(window.PastorAuth && PastorAuth.configurado());
  }

  // Rodapé honesto da tela de auth: não promete privacidade no modo demo
  function atualizarAuthFoot() {
    const real = authReal();
    $$('[data-auth-foot]').forEach((el) => {
      el.textContent = real
        ? 'PastorHub • Versão Usuário • Autenticação real via Supabase'
        : 'PastorHub • Versão Usuário • Modo demonstração — nada é enviado';
    });
  }

  // Entra no app aplicando a sessão real do Supabase ao gate local
  async function entrarNoAppReal(session) {
    const u = session && session.user;
    if (!u) return;
    localStorage.setItem('usuario_authed', 'true');
    localStorage.setItem('usuario_email', u.email || '');
    $('#app').hidden = false;
    $('#auth').hidden = true;
    initApp();
    renderView('home');
    closeSheet();
  }

  // Entra no app no modo demonstração (gate local; nada é enviado a servidor)
  function entrarNoAppDemo(email) {
    localStorage.setItem('usuario_authed', 'true');
    localStorage.setItem('usuario_email', email || '');
    toast('Modo demonstração: nenhum dado foi enviado (auth não configurada).', 'error');
    $('#app').hidden = false;
    $('#auth').hidden = true;
    initApp();
    renderView('home');
    closeSheet();
  }

  // Login real via Supabase Auth
  async function loginUsuario(email, senha) {
    const r = await PastorAuth.entrar(email, senha);
    if (!r.ok) { toast(r.erro, 'error'); return; }
    if (r.session) { await entrarNoAppReal(r.session); toast('Autenticado com sucesso!'); }
    else toast('Verifique seu e-mail para confirmar o cadastro.');
  }

  // Cadastro real via Supabase Auth
  async function signupUsuario(email, senha, nome) {
    const r = await PastorAuth.cadastrar(email, senha, { nome: nome });
    if (!r.ok) { toast(r.erro, 'error'); return; }
    if (r.session) { await entrarNoAppReal(r.session); toast('Conta criada! Bem-vindo!'); }
    else toast('Conta criada! Confirme seu e-mail para entrar.');
  }

  // Registra os handlers dos formulários de login/cadastro/Google/abas
  function registrarAuthHandlers() {
    $('#auth-login').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#login-email').value.trim();
      if (authReal()) { loginUsuario(email, $('#login-senha').value); return; }
      entrarNoAppDemo(email);
    });

    $('#auth-signup').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#cad-email').value.trim();
      if (authReal()) { signupUsuario(email, $('#cad-senha').value, $('#cad-nome').value.trim()); return; }
      entrarNoAppDemo(email);
    });

    const googleBtn = $('[data-action="auth-google"]');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        if (authReal()) {
          PastorAuth.entrarGoogle().then((r) => { if (!r.ok) toast(r.erro, 'error'); });
          return;
        }
        toast('Login com Google indisponível: configure o Supabase em js/config.js.', 'error');
      });
    }

    // Alternar entre as abas Entrar / Cadastrar
    $$('[data-auth-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('[data-auth-tab]').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const isSignup = tab.dataset.authTab === 'signup';
        const loginForm = $('#auth-login');
        const signupForm = $('#auth-signup');
        if (loginForm) loginForm.hidden = isSignup;
        if (signupForm) signupForm.hidden = !isSignup;
      });
    });
  }

  async function authInit() {
    // A tela de carregamento deve sair em qualquer situação
    hideSplash();
    const appEl = $('#app');
    const authEl = $('#auth');
    if (!appEl || !authEl) return;
    atualizarAuthFoot();
    registrarAuthHandlers();

    // Com auth real, a sessão do Supabase decide o gate
    if (authReal()) {
      PastorAuth.onAuthStateChange((_e, session) => {
        if (session) entrarNoAppReal(session);
        else { appEl.hidden = true; authEl.hidden = false; }
      });
      const session = await PastorAuth.sessaoAtual();
      if (session) { await entrarNoAppReal(session); return; }
      appEl.hidden = true;
      authEl.hidden = false;
      return;
    }

    // Sem auth configurada, mantém o gate local (modo demonstração)
    if (localStorage.getItem('usuario_authed') === 'true') {
      authEl.hidden = true;
      appEl.hidden = false;
      initApp();
    } else {
      appEl.hidden = true;
      authEl.hidden = false;
    }
  }

  // ---------- Inicialização do App ----------
  function initApp() {
    // Mobile: renderizar home initial
    if (SHELL === 'mobile') {
      renderView('home');
    } else if (SHELL === 'tablet') {
      // Tablet: mostrar sidebar default
      showSidebar();
      renderView('home');
    } else if (SHELL === 'desktop') {
      // Desktop: mostrar sidebar default
      showSidebar();
      renderView('home');
    }
  }

  function showSidebar() {
    const sidebar = $('#user-sidebar');
    if (!sidebar) return;

    if (SHELL === 'desktop') {
      sidebar.hidden = false;
    } else if (SHELL === 'tablet') {
      sidebar.hidden = false;
      $('#user-content').innerHTML = '';
      if ($('#user-right')) $('#user-right').innerHTML = '';
    }
  }

  // ---------- Renderização de Views ----------
  function renderView(viewId) {
    state.view = viewId;
    const view = SHELL === 'desktop' ? $('#user-content') : SHELL === 'tablet' ? $('#user-content') : $('#view');
    if (!view) return;

    switch (viewId) {
      case 'home':
        view.innerHTML = renderHome();
        break;
      case 'chat':
        view.innerHTML = renderChat(state.chatId);
        break;
      case 'agenda':
        view.innerHTML = renderAgenda();
        break;
      case 'sermoes':
        view.innerHTML = renderSermoes();
        break;
      case 'sermao':
        view.innerHTML = renderSermaoDetail(state.sermaoId);
        break;
      case 'biblioteca':
        view.innerHTML = renderBibliotecaApp();
        break;
      case 'livro':
        view.innerHTML = renderLivro(state.livroId);
        break;
      case 'notificacoes':
        view.innerHTML = renderNotificacoes();
        break;
      case 'perfil':
        view.innerHTML = window.UsuarioPerfil.render();
        break;
      default:
        view.innerHTML = renderHome();
    }
    attachEvents(view);
  }

  function renderHome() {
    const stats = [
      { icon: 'users', label: 'Usuários', value: 28, color: '#1d4ed8' },
      { icon: 'users', label: 'Atividades', value: 156, color: '#15803d' },
      { icon: 'message', label: 'Mensagens', value: 12, color: '#db2777' },
      { icon: 'heart', label: 'Compatibilidade', value: 94, color: '#f59e0b' },
    ];
    const quickLinks = [
      { icon: 'video', title: 'Ver Sermões', id: 'sermoes', color: '#15803d', desc: 'Curso de preparação ao predico' },
      { icon: 'book-open', title: 'Biblioteca Digital', id: 'biblioteca', color: '#7c3aed', desc: 'Livros teológicos clássicos' },
      { icon: 'message', title: 'Conversas com Pastor', id: 'chat', color: '#1d4ed8', desc: 'Mensagem pronta e responderá' },
      { icon: 'calendar', title: 'Visitar MIN', id: 'agenda', color: '#db2777', desc: 'Agende conversas e visitas' },
      { icon: 'notification', title: 'Notificações', id: 'notificacoes', color: '#f59e0b', desc: 'Alertas recentes e pendentes' },
    ];

    return `
      <div class="user-home">
        <div class="user-hero">
          <h1>Olá, ${escapeHtml(User.iniciais())}!</h1>
          <p>Bem-vindo à sua versão Usuário</p>
        </div>
        <div class="user-stats">
          ${stats.map(s => `
            <div class="user-stat-card">
              <span class="icon" style="color: ${s.color};">${icon(s.icon, 'icon-lg')}</span>
              <b>${s.value}</b>
              <small>${s.label}</small>
            </div>
          `).join('')}
        </div>
        <div class="user-section">
          <div class="user-section-head">
            <div><b>Explore</b><small>Uma caminhada do serviço com os pastor</small></div>
            <button class="btn-small">Ver todos</button>
          </div>
          <div class="user-grid">
            ${quickLinks.map(l => `
              <a class="user-card" href="#" data-nav-id="${l.id}">
                <div class="user-card-icon ${l.id}">${icon(l.icon, 'icon-lg')}</div>
                <div class="user-card-body">
                  <b>${escapeHtml(l.title)}</b>
                  <small>${escapeHtml(l.desc)}</small>
                </div>
                <span class="user-card-right">${icon('chevron-right', 'icon-sm')}</span>
              </a>
            `).join('')}
          </div>
        </div>
        <div class="user-section">
          <div class="user-section-head"><div><b>Conexões</b><small>De vídeos e relatórios</small></div></div>
          <div class="user-grid">
            ${renderConections()}
          </div>
        </div>
      </div>
    `;
  }

  function renderConections() {
    return [
      { icon: 'calendar', title: 'Agenda Community', desc: 'Próximas visitation e eventos', id: 'agenda', color: '#f59e0b' },
      { icon: 'message', title: 'Mensagens Recentes', desc: 'Conversas', id: 'chat', color: '#1d4ed8' },
      { icon: 'star', title: 'Favoritos', desc: 'Sermões salvo', id: 'sermoes', color: '#f59e0b' },
      { icon: 'users', title: 'Membros', desc: 'Compatibilidade', id: 'home', color: '#15803d' },
    ].map(c => `
      <a class="user-card" href="#" data-nav-id="${c.id}">
        <div class="user-card-icon">${icon(c.icon, 'icon-lg')}</div>
        <div class="user-card-body"><b>${c.title}</b><small>${c.desc}</small></div>
        <span class="user-card-right">${icon('chevron-right', 'icon-sm')}</span>
      </a>
    `).join('');
  }

  function renderChatList() {
    const items = CONVERSAS.map(c => `
      <div class="chat-item" data-chat="${c.pastor.id}">
        <div class="chat-profile">${escapeHtml(c.pastor.avatar)}</div>
        <div class="chat-info">
          <b>${escapeHtml(c.pastor.nome)}</b>
          <small>${escapeHtml(c.pastor.ultimoMsg)}</small>
        </div>
        <span class="chat-time">${escapeHtml(c.data)}</span>
      </div>
    `).join('');

    return `
      <div class="user-notifs" style="padding: 16px;">
        <div class="user-section-head">
          <div><b>Conversas</b><small>Com pastores e líderes</small></div>
        </div>
        <div style="height: 12px;"></div>
        <div class="chat-list">${items}</div>
      </div>
    `;
  }

  function renderChat(chatId) {
    // Lista de conversas quando não há id informado
    if (!chatId) return renderChatList();

    const pastor = PASTORS.find(p => p.id === chatId) || PASTORS[0];
    if (!pastor) {
      state.chatId = null;
      return renderChat(PASTORS[0].id);
    }
    state.chatId = pastor.id;
    const offlineMsg = !pastor.online ? '<p class="chat-offline">Pastor está offline - mensagens enviadas</p>' : '';

    return `
      <div class="chat-shell">
        <div class="chat-header">
          <div class="chat-profile">${escapeHtml(pastor.avatar)}</div>
          <div class="chat-info">
            <b>${escapeHtml(pastor.nome)}</b>
            <span class="chat-role">${escapeHtml(pastor.cargo)}</span>
          </div>
          <div class="chat-actions">
            <button class="btn-icon" onclick="return false" data-action="back-chat"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
          </div>
        </div>
        <div class="chat-messages">
          <div class="chat-msg received">
            <div class="chat-bubble">Bom dia ${escapeHtml(User.iniciais())}! Quer saber sobre o culto de hoje?</div>
            <time>14:00</time>
          </div>
          <div class="chat-msg sent">
            <div class="chat-bubble">Bom dia! Sim, quero saber sobre os horários.</div>
            <time>14:02</time>
          </div>
          <div class="chat-msg received">
            <div class="chat-bubble">Os serviços começam às 9:00 e às 19:00. Quer participar?</div>
            <time>14:03</time>
          </div>
          ${pastor.online ? '<div class="chat-msg received"><div class="chat-bubble">Estou ao vivo agora! Responda com vontade.</div><time>Online</time></div>' : ''}
          ${offlineMsg}
        </div>
        <div class="chat-input">
          <input type="text" id="chat-input" placeholder="Digite sua mensagem..." autocomplete="off">
          <button class="btn" onclick="return false" data-action="send-chat"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg></button>
        </div>
      </div>
    `;
  }

  function renderAgenda() {
    const filters = [
      { id: 'all', label: 'Agenda' },
      { id: 'pendente', label: 'Pendentes' },
      { id: 'agendado', label: 'Agendados' },
      { id: 'concluido', label: 'Concluidos' },
    ];

    return `
      <div class="agenda-filters" id="agenda-filters">
        ${filters.map(f => `<button class="agenda-filter-btn ${state.view === 'agenda' && !AGENDA.some(a => a.status === f.id) ? 'active' : ''}" data-filter="${f.id}">${f.label}</button>`).join('')}
      </div>
      <div class="agenda-calendar" id="agenda-calendar">
        ${renderAgendaDays()}
      </div>
      <div class="agenda-list" id="agenda-list">
        ${AGENDA.filter(a => !state.view || state.view === 'agenda' || a.status === state.view).map(a => renderAgendaItem(a)).join('')}
      </div>
      <div class="agenda-action-bar">
        <button class="btn lime" data-action="agendar-visita"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10 10.3 10.3 0 0 1-.8 6.2 2 2 0 0 1-1.4 1.58 2 2 0 0 1-.98.09H8.56a2 2 0 0 1-1.94-1.58L7 11Z"/></svg>Agendar visita</button>
      </div>
    `;
  }

  function renderAgendaDays() {
    return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day, i) => `
      <div class="agenda-day ${i === 1 || i === 3 ? 'has-events' : ''}" data-day="${i}">${day}</div>
    `).join('');
  }

  function renderAgendaItem(a) {
    const iconClass = a.local.includes('Igreja') ? 'igreja' : 'casa';
    const statusBadge = a.status === 'agendado' ? '<span class="agenda-tag presencial">Agendado</span>' :
                        a.status === 'pendente' ? '<span class="agenda-tag presencial">Pendente</span>' : '';
    return `
      <div class="agenda-item">
        <div class="ai-icon ${iconClass}">${icon('map-pin', 'icon-lg')}</div>
        <div class="ai-body">
          <b>${escapeHtml(a.tipo)} - ${escapeHtml(a.local)}</b>
          <small>${escapeHtml(a.data)}</small>
        </div>
        ${statusBadge}
      </div>
    `;
  }

  function renderSermoes() {
    const sermoes = SERMOES;
    const searchBar = `
      <div class="sermoes-search">
        <input type="text" id="sermoes-search" placeholder="Buscar nobre..." autocomplete="off">
        <div class="sermoes-filters">
          <button class="sermoes-filter active" data-filter="todos">Todos</button>
          <button class="sermoes-filter" data-filter="expositivo">Expositivo</button>
          <button class="sermoes-filter" data-filter="tematico">Temático</button>
          <button class="sermoes-filter" data-filter="narrativo">Narrativo</button>
        </div>
      </div>
    `;
    const sermonsList = sermoes.map(s => `
      <div class="sermon-card" data-serm-id="${s.id}">
        <div class="sermon-thumb" style="background: ${s.autor.includes('João') ? 'linear-gradient(135deg, var(--navy), #002947)' : s.autor.includes('Carlos') ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #047857)'}">${icon('video', 'icon-lg')}</div>
        <div class="sermon-body">
          <b>${escapeHtml(s.titulo)}</b>
          <small>${escapeHtml(s.autor)}</small>
          <span class="sermon-tag">${escapeHtml(s.tipo)}</span>
        </div>
        <button class="sermon-fav ${state.favoritos.includes(s.id) ? 'ativo' : ''}" data-action="serm-fav" data-serm-id="${s.id}" aria-label="Favoritar sermão" type="button">${icon('star', 'icon-sm')}</button>
      </div>
    `).join('');

    return `<div style="padding: 16px;">
      ${searchBar}
      <div class="sermoes-list">
        ${sermonsList}
      </div>
    </div>`;
  }

  function renderSermaoDetail(s) {
    if (!s) { state.sermaoId = null; return renderSermoes(); }
    const favoritado = state.favoritos.includes(s.id);
    return `
      <div class="user-notifs" style="padding: 16px;">
        <div class="user-section-head">
          <div><b>${escapeHtml(s.titulo)}</b><small>${escapeHtml(s.autor)} • ${escapeHtml(s.tipo)}</small></div>
        </div>
        <div class="sermon-card" data-serm-id="${s.id}">
          <div class="sermon-thumb" style="background: linear-gradient(135deg, var(--navy), #002947);">${icon('video', 'icon-lg')}</div>
          <div class="sermon-body">
            <b>${escapeHtml(s.titulo)}</b>
            <small>${escapeHtml(s.autor)}</small>
            <span class="sermon-tag">${escapeHtml(s.tipo)}</span>
          </div>
          <button class="sermon-fav ${favoritado ? 'ativo' : ''}" data-action="serm-fav" data-serm-id="${s.id}" aria-label="Favoritar sermão" type="button">${icon('star', 'icon-sm')}</button>
        </div>
        <div style="margin-top: 16px; padding: 18px; background: #fff; border: 1px solid var(--line); border-radius: 12px; color: var(--ink); font-size: .92rem; line-height: 1.7;">
          ${escapeHtml(s.texto)}
        </div>
        <div style="margin-top: 16px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn outline" data-action="serm-acoes" data-serm-id="${s.id}" type="button">Compartilhar</button>
          <button class="btn outline" data-action="serm-acoes" data-serm-id="${s.id}" type="button">Exportar PDF</button>
          <button class="btn outline" data-action="serm-acoes" data-serm-id="${s.id}" type="button">Copiar texto</button>
        </div>
      </div>
    `;
  }

  // ---------- Biblioteca Digital ----------
  function renderBibliotecaApp() {
    const B = window.BIBLIOTECA || { categorias: [], livros: [] };
    const catNome = {};
    const catCor = {};
    B.categorias.forEach(c => { catNome[c.id] = c.nome; catCor[c.id] = c.cor; });

    const filtros = [{ id: 'todos', nome: 'Todos' }].concat(B.categorias);
    const chips = filtros.map((f, i) =>
      `<button class="bib-filter-chip${i === 0 ? ' active' : ''}" data-bib-cat="${escapeHtml(f.id)}" type="button">${escapeHtml(f.nome)}</button>`
    ).join('');

    const cards = B.livros.map(l => `
      <div class="bib-item" data-livro="${escapeHtml(l.id)}" data-cat="${escapeHtml(l.categoria)}" data-busca="${escapeHtml((l.titulo + ' ' + l.autor + ' ' + l.descricao).toLowerCase())}">
        <div class="bib-cover" style="background:${l.gradiente}"><span>${l.emoji}</span></div>
        <div class="bib-info">
          <b>${escapeHtml(l.titulo)}</b>
          <small>${escapeHtml(l.autor)} · ${escapeHtml(String(l.ano))}</small>
          <span class="bib-tag" style="background:${catCor[l.categoria]}22;color:${catCor[l.categoria]}">${escapeHtml(catNome[l.categoria] || l.categoria)}</span>
        </div>
        <span class="user-card-right">${icon('chevron-right', 'icon-sm')}</span>
      </div>
    `).join('');

    return `
      <div class="bib-view">
        <div class="user-section-head">
          <div><b>Biblioteca Digital</b><small>Livros teológicos clássicos em domínio público</small></div>
          <button class="btn btn-outline btn-sm" data-action="bib-comprar-alugar" type="button">Comprar e alugar</button>
        </div>
        <div class="bib-search">
          <span class="icon" aria-hidden="true">${icon('search', 'icon-sm')}</span>
          <input type="search" id="bib-search-input" placeholder="Buscar por título ou autor…" autocomplete="off" aria-label="Buscar na biblioteca">
        </div>
        <div class="bib-filters">${chips}</div>
        <div class="bib-list" id="bib-list">${cards}</div>
        <p class="bib-empty" id="bib-empty" hidden>Nenhuma obra encontrada para essa busca.</p>
        <p class="bib-licenca-note">Acervo inicial com ${B.livros.length} obras em domínio público. Leitura por capítulos na fase 2.</p>
      </div>
    `;
  }

  function renderLivro(livroId) {
    const B = window.BIBLIOTECA || { categorias: [], livros: [] };
    const l = B.livros.find(x => x.id === livroId);
    if (!l) { state.livroId = null; return renderBibliotecaApp(); }
    const cat = B.categorias.find(c => c.id === l.categoria) || { nome: l.categoria, cor: '#3261AB' };
    const fav = state.bibFavs.indexOf(l.id) !== -1;
    return `
      <div class="bib-view">
        <button class="btn-small bib-back" data-action="bib-voltar" type="button">← Voltar</button>
        <div class="bib-detail-head">
          <div class="bib-cover lg" style="background:${l.gradiente}"><span>${l.emoji}</span></div>
          <div>
            <span class="bib-tag" style="background:${cat.cor}22;color:${cat.cor}">${escapeHtml(cat.nome)}</span>
            <h1 class="bib-title">${escapeHtml(l.titulo)}</h1>
            <p class="bib-meta">${escapeHtml(l.autor)} · ${escapeHtml(String(l.ano))} · ${escapeHtml(String(l.paginas))} páginas</p>
          </div>
        </div>
        <p class="bib-desc">${escapeHtml(l.descricao)}</p>
        <div class="bib-box">
          <b>Destaques</b>
          <ul>${l.destaques.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
          <p class="bib-licenca"><b>Licença:</b> ${escapeHtml(l.licenca)}</p>
        </div>
        <div class="bib-actions">
          <button class="btn lime" data-action="bib-ler" data-livro="${escapeHtml(l.id)}" type="button">Ler agora</button>
          <button class="btn outline" data-action="bib-fav" data-livro="${escapeHtml(l.id)}" type="button">${fav ? 'Remover dos favoritos' : 'Favoritar'}</button>
        </div>
      </div>
    `;
  }

  function filterBibList() {
    const list = $('#bib-list');
    if (!list) return;
    const input = $('#bib-search-input');
    const termo = ((input && input.value) || '').toLowerCase().trim();
    const ativo = document.querySelector('.bib-filter-chip.active');
    const cat = ativo ? ativo.dataset.bibCat : 'todos';
    let visiveis = 0;
    list.querySelectorAll('.bib-item').forEach(item => {
      const okCat = cat === 'todos' || item.dataset.cat === cat;
      const okBusca = !termo || item.dataset.busca.indexOf(termo) !== -1;
      const ok = okCat && okBusca;
      item.style.display = ok ? '' : 'none';
      if (ok) visiveis++;
    });
    const vazio = $('#bib-empty');
    if (vazio) vazio.hidden = visiveis > 0;
  }

  function renderNotificacoes() {
    const items = NOTIFICACOES.map(n => `
      <div class="notif-item">
        <div class="notif-icon ${n.tipo}">${icon(getNotifIcon(n.tipo), 'icon-lg')}</div>
        <div class="notif-body">
          <b>${escapeHtml(n.titulo)}</b>
          <small>${escapeHtml(n.descricao)}</small>
          <time>${escapeHtml(n.data)}</time>
        </div>
        ${n.lida ? '' : '<span class="notif-unread"></span>'}
      </div>
    `).join('');
    return `
      <div class="user-notifs" style="padding: 16px;">
        <div class="user-section-head">
          <div><b>Notificações</b><small>Alertas e novidades para você</small></div>
        </div>
        <div style="height: 12px;"></div>
        ${items}
      </div>
    `;
  }

  function getNotifIcon(tipo) {
    return {
      chat: 'message',
      agenda: 'calendar',
      fatura: 'dollar-sign',
      sermon: 'video',
      solitute: 'star',
      relatorios: 'bar-chart',
      notificacoes: 'bell',
    }[tipo] || 'bell';
  }

  // ---------- Renderização de Sidebar ----------
  function renderSidebar() {
    const navItems = [
      { id: 'dashboard', label: 'Início', icon: 'home', active: true },
      { id: 'chat', label: 'Conversas', icon: 'message' },
      { id: 'agenda', label: 'Agenda', icon: 'calendar' },
      { id: 'sermoes', label: 'Sermões', icon: 'video' },
      { id: 'biblioteca', label: 'Biblioteca', icon: 'book-open' },
    ];
    return navItems.map(n => `
      <button class="sidebar-item ${n.active ? 'active' : ''}" data-nav="${n.id}" type="button">
        <span class="icon">${icon(n.icon)}</span>
        <span>${escapeHtml(n.label)}</span>
      </button>
    `).join('');
  }

  // ---------- Event Handlers ----------
  let eventsAttached = false;
  function attachEvents(view) {
    // Registra os handlers globais uma única vez (evita listeners duplicados)
    if (eventsAttached) return;
    eventsAttached = true;

    document.addEventListener('click', (e) => {
      // Abrir menu (mobile)
      const btnMenu = e.target.closest('#btn-menu');
      if (btnMenu) {
        openDrawer();
        return;
      }

      // Sair
      const sair = e.target.closest('[data-action="sair"]');
      if (sair) {
        localStorage.removeItem('usuario_authed');
        localStorage.removeItem('usuario_email');
        try { localStorage.removeItem('pastorhub_modo_offline'); } catch (err) { /* ignora */ }
        if (authReal()) { PastorAuth.sair().finally(() => location.reload()); return; }
        location.reload();
        return;
      }

      // Meu perfil (menu lateral, drawer e cartão do desktop)
      const perfil = e.target.closest('[data-action="meu-perfil"]');
      if (perfil) {
        closeDrawer();
        navigateTo('perfil');
        return;
      }

      // Perfil: editar, salvar e compartilhar
      if (e.target.closest('[data-action="perfil-editar"]')) {
        window.UsuarioPerfil.abrirEdicao();
        return;
      }
      if (e.target.closest('[data-action="perfil-salvar"]')) {
        const r = window.UsuarioPerfil.salvarFormulario();
        if (r.erro) { toast(r.erro, 'error'); return; }
        window.closeSheet();
        renderView('perfil');
        toast('Perfil atualizado!');
        return;
      }
      if (e.target.closest('[data-action="perfil-compartilhar"]')) {
        window.UsuarioPerfil.compartilhar().then((msg) => { if (msg) toast(msg); });
        return;
      }

      // Nav sidebar (mobile/tablet)
      const navItem = e.target.closest('.sidebar-item');
      if (navItem) {
        closeSidebar();
        navigateTo(navItem.dataset.nav);
        return;
      }

      // Nav (desktop)
      const navItemDesktop = e.target.closest('.sidebar-item');
      if (navItemDesktop) {
        navigateTo(navItemDesktop.dataset.nav);
        return;
      }

      // Drawer nav
      const drawerNav = e.target.closest('#drawer > aside > nav button');
      if (drawerNav) {
        closeDrawer();
        navigateTo(drawerNav.dataset.nav);
        return;
      }

      // Home cards
      const homeCard = e.target.closest('[data-nav-id]');
      if (homeCard) {
        navigateTo(homeCard.dataset.navId);
        return;
      }

      // Biblioteca: comprar e alugar (nova página de acervo)
      const bibComprarAlugar = e.target.closest('[data-action="bib-comprar-alugar"]');
      if (bibComprarAlugar) {
        toast('Acessando a página de compras e alugueis do acervo…');
        window.open('docs/biblioteca-comprar-alugar.html', '_blank');
        return;
      }

      // Biblioteca: abrir livro
      const bibItem = e.target.closest('.bib-item');
      if (bibItem) {
        state.livroId = bibItem.dataset.livro;
        navigateTo('livro');
        return;
      }

      // Biblioteca: filtros por categoria
      const bibFilter = e.target.closest('.bib-filter-chip');
      if (bibFilter) {
        $$('.bib-filter-chip').forEach(f => f.classList.remove('active'));
        bibFilter.classList.add('active');
        filterBibList();
        return;
      }

      // Biblioteca: voltar para a estante
      const bibVoltar = e.target.closest('[data-action="bib-voltar"]');
      if (bibVoltar) {
        navigateTo('biblioteca');
        return;
      }

      // Biblioteca: favoritar livro
      const bibFav = e.target.closest('[data-action="bib-fav"]');
      if (bibFav) {
        const id = bibFav.dataset.livro;
        state.bibFavs = state.bibFavs.indexOf(id) === -1
          ? state.bibFavs.concat(id)
          : state.bibFavs.filter(x => x !== id);
        localStorage.setItem('pastorhub_biblioteca_favs', JSON.stringify(state.bibFavs));
        toast(state.bibFavs.indexOf(id) !== -1 ? 'Livro salvo nos favoritos!' : 'Livro removido dos favoritos.');
        renderView('livro');
        return;
      }

      // Biblioteca: leitor (fase 2)
      const bibLer = e.target.closest('[data-action="bib-ler"]');
      if (bibLer) {
        toast('Leitor por capítulos chega na fase 2 da Biblioteca.');
        return;
      }

      // Agenda filter
      const agendaFilter = e.target.closest('.agenda-filter-btn');
      if (agendaFilter) {
        $$('.agenda-filter-btn').forEach(f => f.classList.remove('active'));
        agendaFilter.classList.add('active');
        toast('Filtrando agenda');
        return;
      }

      // Agenda day
      const agendaDay = e.target.closest('.agenda-day');
      if (agendaDay) {
        toast('Filtro de dia ativo');
        return;
      }

      // Sermoes search
      const searchInput = e.target.closest('#sermoes-search');
      if (searchInput) {
        const term = searchInput.value.toLowerCase();
        const sermoes = $('#user-content')?.querySelectorAll('.sermon-card') || $('#view').querySelectorAll('.sermon-card');
        sermoes.forEach(s => {
          const text = (s.textContent || '').toLowerCase();
          s.style.display = text.includes(term) ? 'flex' : 'none';
        });
        return;
      }

      // Sermoes filter
      const sermonFilter = e.target.closest('.sermoes-filter');
      if (sermonFilter) {
        $$('.sermoes-filter').forEach(f => f.classList.remove('active'));
        sermonFilter.classList.add('active');
        return;
      }

      // Chat item (mobile/tablet)
      const chatItem = e.target.closest('.chat-item');
      if (chatItem) {
        state.chatId = parseInt(chatItem.dataset.chat, 10) || null;
        navigateTo('chat');
        return;
      }

      // Notificação: abrir / marcar como lida
      const notifItem = e.target.closest('.notif-item');
      if (notifItem) {
        const idx = Array.from(document.querySelectorAll('.notif-item')).indexOf(notifItem);
        if (Number.isInteger(idx) && NOTIFICACOES[idx]) NOTIFICACOES[idx].lida = true;
        state.notifLidas = true;
        toast('Notificação aberta');
        renderView('notificacoes');
        return;
      }

      // FAB Agendar / acao de agendar visita -> leva para a agenda de visitas
      const fabAgendar = e.target.closest('#fab-agendar');
      if (fabAgendar) {
        navigateTo('agenda');
        return;
      }

      const agendarVisita = e.target.closest('[data-action="agendar-visita"]');
      if (agendarVisita) {
        navigateTo('agenda');
        return;
      }

      // Chat: voltar para o dashboard
      const backChat = e.target.closest('[data-action="back-chat"]');
      if (backChat) {
        navigateTo('home');
        return;
      }

      // Favoritar / desfavoritar sermão
      const sermFav = e.target.closest('[data-action="serm-fav"]');
      if (sermFav) {
        const id = parseInt(sermFav.dataset.sermId, 10);
        state.favoritos = state.favoritos.includes(id)
          ? state.favoritos.filter(x => x !== id)
          : [...state.favoritos, id];
        localStorage.setItem('pastorhub_favoritos', JSON.stringify(state.favoritos));
        toast(state.favoritos.includes(id) ? 'Sermão salvo nos favoritos!' : 'Sermão removido dos favoritos.');
        renderView('sermoes');
        return;
      }

      // Abrir detalhe do sermão
      const sermCard = e.target.closest('[data-serm-id]');
      if (sermCard) {
        state.sermaoId = parseInt(sermCard.dataset.sermId, 10) || null;
        navigateTo('sermao');
        return;
      }

      // Ações do detalhe do sermão (compartilhar/exportar/copiar)
      const sermAcoes = e.target.closest('[data-action="serm-acoes"]');
      if (sermAcoes) {
        toast('Ação do sermão: recurso em preparação');
        return;
      }

      // Chat send
      const sendChat = e.target.closest('[data-action="send-chat"]');
      if (sendChat) {
        const input = $('#chat-input');
        if (input && input.value.trim()) {
          const bubble = document.createElement('div');
          bubble.className = 'chat-msg sent';
          bubble.innerHTML = '<div class="chat-bubble">' + escapeHtml(input.value) + '</div><time>' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + '</time>';
          const msgs = document.querySelector('.chat-messages');
          if (msgs) msgs.appendChild(bubble);
          toast('Mensagem enviada para Pastor!');
          input.value = '';
          return;
        }
      }

      // Close Sheet
      const closeSheet = e.target.closest('[data-action="close-sheet"]');
      if (closeSheet) {
        window.closeSheet ? window.closeSheet() : (document.querySelector('#sheet').hidden = true);
        return;
      }

      // Close Drawer
      const closeDrawerBtn = e.target.closest('[data-action="close-drawer"]');
      if (closeDrawerBtn) {
        closeSidebar();
        return;
      }
    });

    // Busca da Biblioteca Digital
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'bib-search-input') filterBibList();
    });

    // Navegação via sidebar/drawer é tratada pelo listener global acima.
  }

  // ---------- Helpers ----------
  function navigateTo(id) {
    closeSidebar();
    renderView(id);
  }

  function openDrawer() {
    const drawer = $('#drawer');
    if (drawer) {
      drawer.hidden = false;
      drawer.classList.add('open');
    }
  }

  function closeDrawer() {
    const drawer = $('#drawer');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.hidden = true;
    }
  }

  function openSidebar() {
    const sidebar = $('#user-sidebar');
    if (sidebar) {
      sidebar.hidden = false;
      renderSidebar();
    }
  }

  function closeSidebar() {
    const sidebar = $('#user-sidebar');
    // No desktop a sidebar é permanente: nunca escondê-la ao navegar
    if (sidebar && SHELL !== 'desktop') sidebar.hidden = true;
    closeDrawer();
  }

  function toast(msg) {
    if (window.toast) window.toast(msg);
    else {
      const toastRoot = $('#toast-root');
      if (toastRoot) {
        const el = document.createElement('div');
        el.className = 'toast lime';
        el.textContent = msg;
        toastRoot.appendChild(el);
        setTimeout(() => el.style.opacity = '0', 2000);
      }
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => authInit());
  } else {
    authInit();
  }
})();
