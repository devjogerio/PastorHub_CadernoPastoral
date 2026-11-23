/* ============================================================
   PastorHub – Versão Usuário JS
   Interações completas para membros: Home, Bíblia/Biblioteca
   com leitor por capítulos, Sermões com filtros e exportação,
   Comunidade/Chat com pedidos de oração, Agenda com marcação
   de visitas, Notificações, Perfil e Menu Lateral Responsivo.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const escapeHtml = window.escapeHtml || function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  const icon = window.icon || function (name, cls) {
    return '<span class="icon ' + (cls || '') + '" aria-hidden="true">' + (name || '') + '</span>';
  };

  const SHELL = window.APP_SHELL || 'mobile';
  document.body.classList.add('shell-' + SHELL);

  // Remove a tela de carregamento inicial
  function hideSplash() {
    const splash = $('#splash');
    if (splash) {
      splash.hidden = true;
      splash.style.display = 'none';
    }
  }

  // Dados do usuário sincronizados com UsuarioPerfil
  const User = {
    dados: {
      nome: 'Ana Silva',
      email: 'ana.silva@email.com',
      initials: 'AS',
      igreja: 'Igreja Batista Central',
      tipo: 'usuario',
    },
    sincronizar() {
      if (window.UsuarioPerfil && window.UsuarioPerfil.carregar) {
        const d = window.UsuarioPerfil.carregar();
        this.dados.nome = d.nome || this.dados.nome;
        this.dados.email = d.email || this.dados.email;
        this.dados.initials = window.UsuarioPerfil.iniciais(this.dados.nome);
      }
    },
    iniciais() {
      this.sincronizar();
      return this.dados.initials;
    },
  };

  // Pastores e líderes da comunidade
  const PASTORS = [
    { id: 1, nome: 'Pastor João Silva', cargo: 'Pastor Titular', avatar: 'JS', online: true, ultimoMsg: 'Bom dia! Quer conversar sobre o culto de hoje?' },
    { id: 2, nome: 'Pra. Maria Oliveira', cargo: 'Aconselhamento Familiar', avatar: 'MO', online: false, ultimoMsg: 'Confirmado nosso encontro de casais amanhã.' },
    { id: 3, nome: 'Pr. Lucas Ferreira', cargo: 'Líder de Ensino Bíblico', avatar: 'LF', online: true, ultimoMsg: 'O material do estudo bíblico de sábado já está disponível.' },
    { id: 4, nome: 'Pr. Carlos Santos', cargo: 'Ministério de Oração', avatar: 'CS', online: true, ultimoMsg: 'Estamos intercedendo pelo seu pedido de oração!' },
  ];

  const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  // Agenda inicial (persistida em localStorage)
  const AGENDA_PADRAO = [
    { id: 1, tipo: 'Visitação Pastoral', local: 'Igreja Batista Central', data: 'Ter, 14:00', diaIdx: 1, pastor: 'Pastor João Silva', status: 'agendado' },
    { id: 2, tipo: 'Aconselhamento Familiar', local: 'Sala Pastoral 2', data: 'Qui, 10:00', diaIdx: 3, pastor: 'Pra. Maria Oliveira', status: 'pendente' },
    { id: 3, tipo: 'Estudo Bíblico', local: 'Auditório Principal', data: 'Sab, 19:00', diaIdx: 5, pastor: 'Pr. Lucas Ferreira', status: 'agendado' },
    { id: 4, tipo: 'Reunião de Oração', local: 'Capela da Comunidade', data: 'Dom, 18:00', diaIdx: 6, pastor: 'Pr. Carlos Santos', status: 'concluido' },
  ];

  function carregarAgenda() {
    try {
      const salvo = JSON.parse(localStorage.getItem('pastorhub_usuario_agenda') || 'null');
      return Array.isArray(salvo) && salvo.length ? salvo : AGENDA_PADRAO.slice();
    } catch (e) {
      return AGENDA_PADRAO.slice();
    }
  }

  function salvarAgenda() {
    try { localStorage.setItem('pastorhub_usuario_agenda', JSON.stringify(AGENDA)); } catch (e) { /* ignora */ }
  }

  let AGENDA = carregarAgenda();

  // Sermões e estudos bíblicos
  const SERMOES = [
    { id: 1, titulo: 'Fé Que Remove Montanhas', autor: 'Pastor João Silva', tipo: 'Expositivo', texto: 'Existem terrenos que só alcançaremos quando atravessarmos nossas montanhas com fé perseverante. Em Marcos 11:22-24, Jesus nos ensina que a fé verdadeira descansa na fidelidade e no caráter de Deus, sustentando o coração em meio às provações.', data: 'Há 2 dias' },
    { id: 2, titulo: 'Amizade e Comunhão que Inspiram', autor: 'Pr. Carlos Santos', tipo: 'Temático', texto: 'A verdadeira comunhão cristã não nos abandona na tempestade, mas nos fortalece em amor fraternal. Como em Provérbios 17:17 e Eclesiastes 4:9-12, caminhar em comunidade é um meio de graça para permanecer firme na jornada.', data: '5 de Novembro' },
    { id: 3, titulo: 'A Mesa da Graça e Hospitalidade', autor: 'Pr. Lucas Ferreira', tipo: 'Narrativo', texto: 'Ao longo dos Evangelhos, Jesus revelou o Reino ao redor da mesa. Quando abrimos nosso lar e nossa vida para acolher o próximo com generosidade, testemunhamos o evangelho vivo na prática diária da igreja.', data: '3 de Novembro' },
  ];

  // Conversas iniciais
  const CONVERSAS = [
    { id: 1, pastor: PASTORS[0], ultimaMsg: 'Bom dia! Quer conversar sobre o culto de hoje?', data: '10 min', naoLida: 2 },
    { id: 2, pastor: PASTORS[1], ultimaMsg: 'Confirmado nosso encontro de casais amanhã.', data: '2 h', naoLida: 1 },
    { id: 3, pastor: PASTORS[2], ultimaMsg: 'O material do estudo bíblico de sábado já está disponível.', data: '5 h', naoLida: 0 },
    { id: 4, pastor: PASTORS[3], ultimaMsg: 'Estamos intercedendo pelo seu pedido de oração!', data: '1 dia', naoLida: 0 },
  ];

  // Histórico de mensagens por pastor (persistido em localStorage)
  function carregarChats() {
    try {
      return JSON.parse(localStorage.getItem('pastorhub_usuario_chats') || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function salvarChats() {
    try { localStorage.setItem('pastorhub_usuario_chats', JSON.stringify(CHAT_REGISTRY)); } catch (e) { /* ignora */ }
  }

  const CHAT_REGISTRY = carregarChats();

  function obterMensagensPastor(pastor) {
    if (!CHAT_REGISTRY[pastor.id]) {
      CHAT_REGISTRY[pastor.id] = [
        { autor: 'pastor', texto: pastor.ultimoMsg, hora: '14:00' },
        { autor: 'usuario', texto: 'Olá! Gostaria de saber mais detalhes e confirmar minha participação.', hora: '14:02' },
        { autor: 'pastor', texto: 'Que alegria! Nossos encontros acontecem às 9h e às 19h. Conte conosco em oração.', hora: '14:03' },
      ];
    }
    return CHAT_REGISTRY[pastor.id];
  }

  // Notificações com destino de navegação
  const NOTIFICACOES = [
    { id: 1, tipo: 'chat', destino: 'chat', chatId: 1, titulo: 'Nova mensagem de Pastor João Silva', descricao: 'Bom dia! Quer conversar sobre o culto de hoje?', data: 'Há 10 min', lida: false },
    { id: 2, tipo: 'agenda', destino: 'agenda', titulo: 'Lembrete: Visitação Pastoral', descricao: 'Encontro agendado na Igreja Batista Central às 14:00', data: 'Há 2 horas', lida: false },
    { id: 3, tipo: 'sermon', destino: 'sermoes', sermaoId: 1, titulo: 'Novo estudo bíblico publicado', descricao: 'Fé Que Remove Montanhas — Pastor João Silva', data: 'Há 1 dia', lida: false },
    { id: 4, tipo: 'chat', destino: 'chat', chatId: 4, titulo: 'Corrente de Oração da Comunidade', descricao: 'Pr. Carlos Santos registrou seu motivo de oração', data: 'Há 2 dias', lida: true },
  ];

  // Estado central da aplicação
  const state = {
    view: 'home',
    chatId: null,
    agendaStatus: 'all',
    agendaDay: null,
    sermoesCat: 'todos',
    sermoesTermo: '',
    favoritos: JSON.parse(localStorage.getItem('pastorhub_favoritos') || '[]'),
    sermaoId: null,
    livroId: null,
    leitorCap: 0,
    leitorFonte: 16,
    bibFavs: JSON.parse(localStorage.getItem('pastorhub_biblioteca_favs') || '[]'),
  };

  // Conta itens não lidos para exibir badges no menu lateral e na topbar
  function obterContadores() {
    const notif = NOTIFICACOES.filter((n) => !n.lida).length;
    const chat = CONVERSAS.reduce((acc, c) => acc + (c.naoLida || 0), 0);
    return { notif, chat };
  }

  function sincronizarMenus() {
    User.sincronizar();
    if (window.UsuarioMenu) window.UsuarioMenu.atualizar(state.view, obterContadores());
    if (window.UsuarioHome) window.UsuarioHome.montarNav(state.view);
  }

  // ---------- Autenticação ----------
  function authReal() {
    return !!(window.PastorAuth && PastorAuth.configurado());
  }

  function atualizarAuthFoot() {
    const real = authReal();
    $$('[data-auth-foot]').forEach((el) => {
      el.textContent = real
        ? 'PastorHub • Versão Usuário • Autenticação real via Supabase'
        : 'PastorHub • Versão Usuário • Modo demonstração local';
    });
  }

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

  function entrarNoAppDemo(email, nome) {
    localStorage.setItem('usuario_authed', 'true');
    localStorage.setItem('usuario_email', email || '');
    if (nome && window.UsuarioPerfil) {
      const atual = window.UsuarioPerfil.carregar();
      localStorage.setItem('pastorhub_perfil_usuario', JSON.stringify(Object.assign(atual, { nome, email: email || atual.email })));
    }
    toast('Bem-vindo ao PastorHub!');
    $('#app').hidden = false;
    $('#auth').hidden = true;
    initApp();
    renderView('home');
    closeSheet();
  }

  async function loginUsuario(email, senha) {
    const r = await PastorAuth.entrar(email, senha);
    if (!r.ok) { toast(r.erro, 'error'); return; }
    if (r.session) { await entrarNoAppReal(r.session); toast('Autenticado com sucesso!'); }
    else toast('Verifique seu e-mail para confirmar o cadastro.');
  }

  async function signupUsuario(email, senha, nome) {
    const r = await PastorAuth.cadastrar(email, senha, { nome: nome });
    if (!r.ok) { toast(r.erro, 'error'); return; }
    if (r.session) { await entrarNoAppReal(r.session); toast('Conta criada! Bem-vindo!'); }
    else toast('Conta criada! Confirme seu e-mail para entrar.');
  }

  function registrarAuthHandlers() {
    const loginForm = $('#auth-login');
    const signupForm = $('#auth-signup');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = $('#login-email').value.trim();
        if (authReal()) { loginUsuario(email, $('#login-senha').value); return; }
        entrarNoAppDemo(email);
      });
    }
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = $('#cad-email').value.trim();
        const nome = $('#cad-nome').value.trim();
        if (authReal()) { signupUsuario(email, $('#cad-senha').value, nome); return; }
        entrarNoAppDemo(email, nome);
      });
    }
    const googleBtn = $('[data-action="auth-google"]');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        if (authReal()) {
          PastorAuth.entrarGoogle().then((r) => { if (!r.ok) toast(r.erro, 'error'); });
          return;
        }
        entrarNoAppDemo('ana.silva@email.com', 'Ana Silva');
      });
    }
    $$('[data-auth-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('[data-auth-tab]').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const isSignup = tab.dataset.authTab === 'signup';
        if (loginForm) loginForm.hidden = isSignup;
        if (signupForm) signupForm.hidden = !isSignup;
      });
    });
  }

  async function authInit() {
    hideSplash();
    const appEl = $('#app');
    const authEl = $('#auth');
    if (!appEl || !authEl) return;
    atualizarAuthFoot();
    registrarAuthHandlers();

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

    if (localStorage.getItem('usuario_authed') === 'true') {
      authEl.hidden = true;
      appEl.hidden = false;
      initApp();
    } else {
      appEl.hidden = true;
      authEl.hidden = false;
    }
  }

  function initApp() {
    sincronizarMenus();
    renderView('home');
  }

  // ---------- Roteador de Views ----------
  function renderView(viewId) {
    if (viewId === 'dashboard') viewId = 'home';
    state.view = viewId;
    let view = (SHELL === 'desktop' || SHELL === 'tablet') ? ($('#user-content') || $('#view')) : $('#view');
    if (!view) return;

    switch (viewId) {
      case 'home':
        view.innerHTML = window.UsuarioHome.render();
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
        view.innerHTML = renderSermaoDetail(SERMOES.find((s) => s.id === state.sermaoId));
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
        // Referência fixa do contêiner principal, conforme solicitado.
        view = document.querySelector('#view') || view;
        view.innerHTML = window.UsuarioPerfil.render();
        break;
      case 'acervo':
        view.innerHTML = window.BibliotecaComprar.render();
        window.BibliotecaComprar.montar();
        break;
      default:
        state.view = 'home';
        view.innerHTML = window.UsuarioHome.render();
    }
    attachEvents();
    sincronizarMenus();
  }

  // ---------- Comunidade, Conversas e Pedidos de Oração ----------
  function renderChatList() {
    const items = CONVERSAS.map((c) => {
      const msgs = obterMensagensPastor(c.pastor);
      const ultima = msgs.length ? msgs[msgs.length - 1].texto : c.ultimaMsg;
      const badge = c.naoLida > 0 ? `<span class="nav-badge">${c.naoLida}</span>` : '';
      return `
        <button class="chat-item" data-chat="${c.pastor.id}" type="button">
          <div class="chat-profile">${escapeHtml(c.pastor.avatar)}</div>
          <div class="chat-info">
            <b>${escapeHtml(c.pastor.nome)}</b>
            <small>${escapeHtml(c.pastor.cargo)} · ${escapeHtml(ultima)}</small>
          </div>
          <div class="chat-meta">
            <span class="chat-time">${escapeHtml(c.data)}</span>
            ${badge}
          </div>
        </button>
      `;
    }).join('');

    return `
      <div class="user-notifs">
        <div class="user-section-head">
          <div><b>Comunidade & Pastores</b><small>Converse com pastores e envie pedidos de oração</small></div>
          <button class="btn lime sm" data-action="novo-pedido-oracao" type="button">${icon('message-circle', 'icon-sm')} Pedido de Oração</button>
        </div>
        <div class="chat-list">${items}</div>
      </div>
    `;
  }

  function renderChat(chatId) {
    if (!chatId) return renderChatList();
    const pastor = PASTORS.find((p) => p.id === chatId) || PASTORS[0];
    state.chatId = pastor.id;
    const conv = CONVERSAS.find((c) => c.pastor.id === pastor.id);
    if (conv) conv.naoLida = 0;

    const msgs = obterMensagensPastor(pastor);
    const bolhas = msgs.map((m) => `
      <div class="chat-msg ${m.autor === 'usuario' ? 'sent' : 'received'}">
        <div class="chat-bubble">${escapeHtml(m.texto)}</div>
        <time>${escapeHtml(m.hora)}</time>
      </div>
    `).join('');

    return `
      <div class="chat-shell">
        <div class="chat-header">
          <button class="btn-icon" data-action="back-chat" aria-label="Voltar para lista de conversas" type="button">${icon('arrow-left')}</button>
          <div class="chat-profile">${escapeHtml(pastor.avatar)}</div>
          <div class="chat-info">
            <b>${escapeHtml(pastor.nome)}</b>
            <span class="chat-role">${escapeHtml(pastor.cargo)} · ${pastor.online ? 'Online agora' : 'Offline'}</span>
          </div>
          <button class="btn lime sm" data-action="novo-pedido-oracao" type="button">Pedir Oração</button>
        </div>
        <div class="chat-messages" id="chat-messages">${bolhas}</div>
        <div class="chat-input">
          <input type="text" id="chat-input" placeholder="Escreva sua mensagem ou motivo de oração…" autocomplete="off">
          <button class="btn primary" data-action="send-chat" type="button">${icon('send', 'icon-sm')} Enviar</button>
        </div>
      </div>
    `;
  }

  function enviarMensagemChat(textoExplicito) {
    const input = $('#chat-input');
    const texto = String(textoExplicito != null ? textoExplicito : (input ? input.value : '')).trim();
    if (!texto) return;
    const pastor = PASTORS.find((p) => p.id === state.chatId) || PASTORS[0];
    const msgs = obterMensagensPastor(pastor);
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    msgs.push({ autor: 'usuario', texto, hora });
    msgs.push({
      autor: 'pastor',
      texto: 'Recebi sua mensagem! Estarei orando e acompanhando você de perto. Deus abençoe!',
      hora,
    });
    salvarChats();
    if (input) input.value = '';
    renderView('chat');
    const box = $('#chat-messages');
    if (box) box.scrollTop = box.scrollHeight;
    toast('Mensagem enviada para ' + pastor.nome + '!');
  }

  function abrirSheetPedidoOracao() {
    const opcoes = PASTORS.map((p) => `<option value="${p.id}">${escapeHtml(p.nome)} (${escapeHtml(p.cargo)})</option>`).join('');
    const body = `
      <form id="form-pedido-oracao" class="perfil-form" autocomplete="off">
        <div class="field">
          <label for="oracao-pastor">Destinatário na Comunidade</label>
          <select id="oracao-pastor" name="pastorId">${opcoes}</select>
        </div>
        <div class="field">
          <label for="oracao-motivo">Motivo / Área</label>
          <select id="oracao-motivo" name="motivo">
            <option value="Família e Lar">Família e Lar</option>
            <option value="Saúde e Restauração">Saúde e Restauração</option>
            <option value="Gratidão e Testemunho">Gratidão e Testemunho</option>
            <option value="Direção Espiritual">Direção Espiritual</option>
          </select>
        </div>
        <div class="field">
          <label for="oracao-texto">Seu Pedido de Oração</label>
          <textarea id="oracao-texto" name="texto" rows="3" placeholder="Compartilhe seu pedido para intercedermos juntos…" required></textarea>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn outline" data-action="close-sheet" type="button">Cancelar</button>
      <button class="btn lime" data-action="salvar-pedido-oracao" type="button">Enviar Pedido</button>
    `;
    window.openSheet({
      title: 'Novo Pedido de Oração',
      desc: 'Seu pedido será encaminhado diretamente ao pastor ou ministério de intercessão.',
      icon: 'message-circle',
      body,
      footer,
    });
  }

  function salvarPedidoOracao() {
    const pastorEl = $('#oracao-pastor');
    const motivoEl = $('#oracao-motivo');
    const textoEl = $('#oracao-texto');
    const texto = textoEl ? textoEl.value.trim() : '';
    if (!texto) { toast('Escreva o seu pedido de oração antes de enviar.', 'error'); return; }
    const pastorId = pastorEl ? parseInt(pastorEl.value, 10) : 1;
    const motivo = motivoEl ? motivoEl.value : 'Oração';
    state.chatId = pastorId;
    closeSheet();
    enviarMensagemChat('[Pedido de Oração · ' + motivo + '] ' + texto);
  }

  // ---------- Eventos & Agenda ----------
  function renderAgenda() {
    const filters = [
      { id: 'all', label: 'Todos (' + AGENDA.length + ')' },
      { id: 'agendado', label: 'Confirmados' },
      { id: 'pendente', label: 'Pendentes' },
      { id: 'concluido', label: 'Concluídos' },
    ];

    const filtrados = AGENDA.filter((a) => {
      const okStatus = state.agendaStatus === 'all' || a.status === state.agendaStatus;
      const okDia = state.agendaDay === null || a.diaIdx === state.agendaDay;
      return okStatus && okDia;
    });

    const listaHtml = filtrados.length
      ? filtrados.map((a) => renderAgendaItem(a)).join('')
      : `<div class="bib-empty">Nenhum compromisso encontrado para este filtro. <button class="btn-small" data-action="agenda-limpar-filtro" type="button" style="margin-left:8px;">Mostrar todos</button></div>`;

    return `
      <div class="agenda-wrap">
        <div class="user-section-head">
          <div><b>Eventos & Agenda Pastoral</b><small>Participe dos cultos, estudos e agende visitas</small></div>
          <button class="btn lime sm" data-action="agendar-visita" type="button">${icon('plus', 'icon-sm')} Agendar Visita</button>
        </div>
        <div class="agenda-filters" id="agenda-filters">
          ${filters.map((f) => `<button class="agenda-filter-btn ${state.agendaStatus === f.id ? 'active' : ''}" data-filter="${f.id}" type="button">${escapeHtml(f.label)}</button>`).join('')}
        </div>
        <div class="agenda-calendar" id="agenda-calendar">${renderAgendaDays()}</div>
        <div class="agenda-list" id="agenda-list">${listaHtml}</div>
      </div>
    `;
  }

  function renderAgendaDays() {
    return DIAS_SEMANA.map((day, i) => {
      const temEvento = AGENDA.some((a) => a.diaIdx === i);
      const sel = state.agendaDay === i;
      return `
        <button class="agenda-day ${temEvento ? 'has-events' : ''} ${sel ? 'selected' : ''}" data-day="${i}" type="button" aria-pressed="${sel}">
          <span>${day}</span>
          <span class="day-dot"></span>
        </button>
      `;
    }).join('');
  }

  function renderAgendaItem(a) {
    const iconClass = a.local.includes('Igreja') || a.local.includes('Auditório') ? 'igreja' : 'casa';
    const rotuloStatus = { agendado: 'Confirmado', pendente: 'Pendente', concluido: 'Concluído' }[a.status] || a.status;
    return `
      <div class="agenda-item" data-agenda-id="${a.id}" role="button" tabindex="0">
        <div class="ai-icon ${iconClass}">${icon('calendar')}</div>
        <div class="ai-body">
          <b>${escapeHtml(a.tipo)} · ${escapeHtml(a.local)}</b>
          <small>${escapeHtml(a.data)} · ${escapeHtml(a.pastor || 'Equipe Pastoral')}</small>
        </div>
        <span class="agenda-tag ${escapeHtml(a.status)}">${escapeHtml(rotuloStatus)}</span>
      </div>
    `;
  }

  function abrirSheetAgendar() {
    const opcoesPastores = PASTORS.map((p) => `<option value="${escapeHtml(p.nome)}">${escapeHtml(p.nome)}</option>`).join('');
    const opcoesDias = DIAS_SEMANA.map((d, i) => `<option value="${i}">${d}</option>`).join('');
    const body = `
      <form id="form-agendar-visita" class="perfil-form" autocomplete="off">
        <div class="field">
          <label for="ag-tipo">Tipo de Compromisso</label>
          <select id="ag-tipo">
            <option value="Visitação Pastoral">Visitação Pastoral</option>
            <option value="Aconselhamento Pastoral">Aconselhamento Pastoral</option>
            <option value="Estudo Bíblico">Estudo Bíblico</option>
            <option value="Oração em Família">Oração em Família</option>
          </select>
        </div>
        <div class="field">
          <label for="ag-pastor">Pastor ou Líder</label>
          <select id="ag-pastor">${opcoesPastores}</select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div class="field">
            <label for="ag-dia">Dia da Semana</label>
            <select id="ag-dia">${opcoesDias}</select>
          </div>
          <div class="field">
            <label for="ag-hora">Horário</label>
            <input id="ag-hora" type="time" value="15:00" required>
          </div>
        </div>
        <div class="field">
          <label for="ag-local">Local ou Endereço</label>
          <input id="ag-local" type="text" placeholder="Ex.: Igreja Batista Central ou seu endereço" value="Igreja Batista Central" required>
        </div>
      </form>
    `;
    const footer = `
      <button class="btn outline" data-action="close-sheet" type="button">Cancelar</button>
      <button class="btn lime" data-action="agenda-salvar" type="button">Confirmar Agendamento</button>
    `;
    window.openSheet({
      title: 'Agendar Visita ou Evento',
      desc: 'Escolha o tipo de atendimento, horário e pastor responsável.',
      icon: 'calendar',
      body,
      footer,
    });
  }

  function salvarNovoAgendamento() {
    const tipo = ($('#ag-tipo') || {}).value || 'Visitação Pastoral';
    const pastor = ($('#ag-pastor') || {}).value || 'Pastor João Silva';
    const diaIdx = parseInt(($('#ag-dia') || {}).value || '1', 10);
    const hora = (($('#ag-hora') || {}).value || '15:00').trim();
    const local = (($('#ag-local') || {}).value || '').trim();
    if (!local) { toast('Informe o local ou endereço do agendamento.', 'error'); return; }
    const novo = {
      id: Date.now(),
      tipo,
      local,
      pastor,
      diaIdx,
      data: DIAS_SEMANA[diaIdx] + ', ' + hora,
      status: 'agendado',
    };
    AGENDA.unshift(novo);
    salvarAgenda();
    state.agendaStatus = 'all';
    state.agendaDay = null;
    closeSheet();
    renderView('agenda');
    toast('Agendamento confirmado com sucesso!');
  }

  function abrirDetalheAgenda(id) {
    const item = AGENDA.find((a) => a.id === id);
    if (!item) return;
    const body = `
      <div class="bib-box">
        <b>${escapeHtml(item.tipo)}</b>
        <p style="margin-top:6px;font-size:.88rem;color:var(--muted);">
          <b>Local:</b> ${escapeHtml(item.local)}<br>
          <b>Data e horário:</b> ${escapeHtml(item.data)}<br>
          <b>Responsável:</b> ${escapeHtml(item.pastor || 'Equipe Pastoral')}<br>
          <b>Status atual:</b> ${escapeHtml(item.status.toUpperCase())}
        </p>
      </div>
    `;
    const footer = `
      <button class="btn outline" data-action="agenda-excluir" data-id="${item.id}" type="button">Cancelar</button>
      <button class="btn primary" data-action="agenda-concluir" data-id="${item.id}" type="button">${item.status === 'concluido' ? 'Reabrir' : 'Concluir'}</button>
    `;
    window.openSheet({
      title: 'Detalhes do Compromisso',
      desc: 'Gerencie sua participação neste evento ou visita.',
      icon: 'calendar',
      body,
      footer,
    });
  }

  // ---------- Sermões & Estudos ----------
  function renderSermoes() {
    const categorias = [
      { id: 'todos', rotulo: 'Todos' },
      { id: 'expositivo', rotulo: 'Expositivo' },
      { id: 'tematico', rotulo: 'Temático' },
      { id: 'narrativo', rotulo: 'Narrativo' },
    ];
    return `
      <div>
        <div class="user-section-head">
          <div><b>Sermões & Devocionais</b><small>Estudos bíblicos, mensagens pastorais e anotações</small></div>
        </div>
        <div class="sermoes-search">
          <input type="search" id="sermoes-search" placeholder="Buscar por título, pastor ou tema…" value="${escapeHtml(state.sermoesTermo)}" autocomplete="off">
          <div class="sermoes-filters">
            ${categorias.map((c) => `<button class="sermoes-filter ${state.sermoesCat === c.id ? 'active' : ''}" data-filter="${c.id}" type="button">${c.rotulo}</button>`).join('')}
          </div>
        </div>
        <div class="sermoes-list" id="sermoes-list">${renderListaSermoesCards()}</div>
      </div>
    `;
  }

  function renderListaSermoesCards() {
    const termo = (state.sermoesTermo || '').toLowerCase().trim();
    const cat = state.sermoesCat || 'todos';
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const filtrados = SERMOES.filter((s) => {
      const okCat = cat === 'todos' || norm(s.tipo) === norm(cat);
      const okBusca = !termo || norm(s.titulo + ' ' + s.autor + ' ' + s.texto).indexOf(norm(termo)) !== -1;
      return okCat && okBusca;
    });

    if (!filtrados.length) {
      return `<div class="bib-empty">Nenhum sermão encontrado para este filtro.</div>`;
    }

    return filtrados.map((s) => `
      <div class="sermon-card" data-serm-id="${s.id}">
        <div class="sermon-thumb">${icon('video')}</div>
        <div class="sermon-body">
          <b>${escapeHtml(s.titulo)}</b>
          <small>${escapeHtml(s.autor)} · ${escapeHtml(s.data)}</small>
          <span class="sermon-tag">${escapeHtml(s.tipo)}</span>
        </div>
        <button class="sermon-fav ${state.favoritos.includes(s.id) ? 'ativo' : ''}" data-action="serm-fav" data-serm-id="${s.id}" aria-label="Favoritar sermão" type="button">${icon('star', 'icon-sm')}</button>
      </div>
    `).join('');
  }

  function atualizarListaSermoesDom() {
    const lista = $('#sermoes-list');
    if (lista) lista.innerHTML = renderListaSermoesCards();
  }

  function renderSermaoDetail(s) {
    if (!s) { state.sermaoId = null; return renderSermoes(); }
    const favoritado = state.favoritos.includes(s.id);
    return `
      <div>
        <button class="btn-small bib-back" data-action="serm-voltar" type="button">← Voltar para sermões</button>
        <div class="user-section-head">
          <div><b>${escapeHtml(s.titulo)}</b><small>${escapeHtml(s.autor)} • ${escapeHtml(s.tipo)} • ${escapeHtml(s.data)}</small></div>
          <button class="sermon-fav ${favoritado ? 'ativo' : ''}" data-action="serm-fav" data-serm-id="${s.id}" aria-label="Favoritar sermão" type="button">${icon('star', 'icon-sm')}</button>
        </div>
        <div class="bib-box" style="font-size:.94rem;line-height:1.75;color:var(--ink);">
          ${escapeHtml(s.texto)}
        </div>
        <div class="bib-actions">
          <button class="btn primary sm" data-action="serm-compartilhar" data-serm-id="${s.id}" type="button">${icon('share', 'icon-sm')} Compartilhar</button>
          <button class="btn outline sm" data-action="serm-pdf" data-serm-id="${s.id}" type="button">${icon('file-text', 'icon-sm')} Resumo / Imprimir</button>
          <button class="btn outline sm" data-action="serm-copiar" data-serm-id="${s.id}" type="button">${icon('copy', 'icon-sm')} Copiar texto</button>
        </div>
      </div>
    `;
  }

  // ---------- Biblioteca Digital & Leitor por Capítulos ----------
  function renderBibliotecaApp() {
    const B = window.BIBLIOTECA || { categorias: [], livros: [] };
    const catNome = {};
    const catCor = {};
    B.categorias.forEach((c) => { catNome[c.id] = c.nome; catCor[c.id] = c.cor; });

    const filtros = [{ id: 'todos', nome: 'Todos' }].concat(B.categorias);
    const chips = filtros.map((f, i) =>
      `<button class="bib-filter-chip${i === 0 ? ' active' : ''}" data-bib-cat="${escapeHtml(f.id)}" type="button">${escapeHtml(f.nome)}</button>`
    ).join('');

    const cards = B.livros.map((l) => `
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
          <button class="btn outline sm" data-action="bib-comprar-alugar" type="button">Comprar e alugar</button>
        </div>
        <div class="bib-search">
          <span class="icon" aria-hidden="true">${icon('search', 'icon-sm')}</span>
          <input type="search" id="bib-search-input" placeholder="Buscar por título ou autor…" autocomplete="off" aria-label="Buscar na biblioteca">
        </div>
        <div class="bib-filters">${chips}</div>
        <div class="bib-list" id="bib-list">${cards}</div>
        <p class="bib-empty" id="bib-empty" hidden>Nenhuma obra encontrada para essa busca.</p>
        <p class="bib-licenca-note">Acervo com ${B.livros.length} obras em domínio público e leitor integrado por capítulos.</p>
      </div>
    `;
  }

  function renderLivro(livroId) {
    const B = window.BIBLIOTECA || { categorias: [], livros: [] };
    const l = B.livros.find((x) => x.id === livroId);
    if (!l) { state.livroId = null; return renderBibliotecaApp(); }
    const cat = B.categorias.find((c) => c.id === l.categoria) || { nome: l.categoria, cor: '#3261AB' };
    const fav = state.bibFavs.indexOf(l.id) !== -1;
    return `
      <div class="bib-view">
        <button class="btn-small bib-back" data-action="bib-voltar" type="button">← Voltar para Biblioteca</button>
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
          <b>Destaques da Obra</b>
          <ul>${l.destaques.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
          <p class="bib-licenca"><b>Licença:</b> ${escapeHtml(l.licenca)}</p>
        </div>
        <div class="bib-actions">
          <button class="btn lime" data-action="bib-ler" data-livro="${escapeHtml(l.id)}" type="button">${icon('book-open', 'icon-sm')} Ler agora</button>
          <button class="btn outline" data-action="bib-fav" data-livro="${escapeHtml(l.id)}" type="button">${fav ? 'Remover dos favoritos' : 'Favoritar'}</button>
        </div>
      </div>
    `;
  }

  function abrirLeitorLivro(livroId, capIdx) {
    const B = window.BIBLIOTECA || { livros: [] };
    const l = B.livros.find((x) => x.id === livroId) || B.livros[0];
    if (!l) return;
    state.livroId = l.id;
    state.leitorCap = typeof capIdx === 'number' ? capIdx : 0;

    const capitulos = [
      { titulo: 'Capítulo 1 · Introdução e Contexto', texto: l.descricao + ' Escrita por ' + l.autor + ' (' + l.ano + '), esta obra permanece como referência essencial para a edificação da igreja e o amadurecimento espiritual.' },
      { titulo: 'Capítulo 2 · Ensinamentos Centrais', texto: (l.destaques || []).join('. ') + '. O estudo atento destes princípios fortalece a caminhada cristã diária, unindo doutrina sólida e devoção prática.' },
      { titulo: 'Capítulo 3 · Aplicação Pastoral', texto: 'Ao meditar nesta leitura, reflita em oração sobre como aplicar cada verdade bíblica em sua família e comunidade local. Licença da edição: ' + l.licenca + '.' },
    ];
    const cap = capitulos[state.leitorCap] || capitulos[0];

    const body = `
      <div class="leitor-toolbar">
        <div class="leitor-caps">
          ${capitulos.map((c, i) => `<button class="leitor-cap-btn ${i === state.leitorCap ? 'active' : ''}" data-action="leitor-cap" data-cap="${i}" type="button">Cap. ${i + 1}</button>`).join('')}
        </div>
        <div style="display:flex;gap:4px;">
          <button class="btn-small" data-action="leitor-fonte" data-delta="-1" type="button" aria-label="Diminuir fonte">A-</button>
          <button class="btn-small" data-action="leitor-fonte" data-delta="1" type="button" aria-label="Aumentar fonte">A+</button>
        </div>
      </div>
      <div class="leitor-texto" id="leitor-texto" style="font-size:${state.leitorFonte}px;">
        <h4>${escapeHtml(cap.titulo)}</h4>
        <p>${escapeHtml(cap.texto)}</p>
      </div>
    `;
    const footer = `
      <button class="btn outline" data-action="close-sheet" type="button">Fechar Leitor</button>
      <button class="btn primary" data-action="leitor-copiar" type="button">${icon('copy', 'icon-sm')} Copiar Trecho</button>
    `;
    window.openSheet({
      title: l.titulo,
      desc: l.autor + ' · Leitor Digital',
      icon: 'book-open',
      body,
      footer,
    });
  }

  function filterBibList() {
    const list = $('#bib-list');
    if (!list) return;
    const input = $('#bib-search-input');
    const termo = ((input && input.value) || '').toLowerCase().trim();
    const ativo = document.querySelector('.bib-filter-chip.active');
    const cat = ativo ? ativo.dataset.bibCat : 'todos';
    let visiveis = 0;
    list.querySelectorAll('.bib-item').forEach((item) => {
      const okCat = cat === 'todos' || item.dataset.cat === cat;
      const okBusca = !termo || item.dataset.busca.indexOf(termo) !== -1;
      const ok = okCat && okBusca;
      item.style.display = ok ? '' : 'none';
      if (ok) visiveis++;
    });
    const vazio = $('#bib-empty');
    if (vazio) vazio.hidden = visiveis > 0;
  }

  // ---------- Notificações ----------
  function renderNotificacoes() {
    const naoLidas = NOTIFICACOES.filter((n) => !n.lida).length;
    const items = NOTIFICACOES.map((n) => `
      <div class="notif-item ${n.lida ? '' : 'unread'}" data-notif-id="${n.id}" role="button" tabindex="0">
        <div class="notif-icon ${n.tipo}">${icon(getNotifIcon(n.tipo))}</div>
        <div class="notif-body">
          <b>${escapeHtml(n.titulo)}</b>
          <small>${escapeHtml(n.descricao)}</small>
          <time>${escapeHtml(n.data)}</time>
        </div>
        ${n.lida ? '' : '<span class="notif-unread" title="Não lida"></span>'}
      </div>
    `).join('');

    return `
      <div class="user-notifs">
        <div class="user-section-head">
          <div><b>Notificações</b><small>${naoLidas > 0 ? naoLidas + ' não lida(s)' : 'Todas as notificações estão em dia'}</small></div>
          ${naoLidas > 0 ? `<button class="btn-small" data-action="notif-ler-todas" type="button">Marcar todas como lidas</button>` : ''}
        </div>
        ${items}
      </div>
    `;
  }

  function getNotifIcon(tipo) {
    return { chat: 'message-circle', agenda: 'calendar', fatura: 'dollar-sign', sermon: 'video' }[tipo] || 'bell';
  }

  // ---------- Eventos Globais ----------
  let eventsAttached = false;
  function attachEvents() {
    if (eventsAttached) return;
    eventsAttached = true;

    document.addEventListener('click', (e) => {
      // Menu lateral (abrir e fechar)
      if (e.target.closest('#btn-menu')) {
        if (window.UsuarioMenu) window.UsuarioMenu.alternarDrawer();
        return;
      }
      if (e.target.closest('[data-action="close-drawer"]')) {
        if (window.UsuarioMenu) window.UsuarioMenu.fecharDrawer();
        return;
      }

      // Sair da conta
      if (e.target.closest('[data-action="sair"]')) {
        localStorage.removeItem('usuario_authed');
        localStorage.removeItem('usuario_email');
        try { localStorage.removeItem('pastorhub_modo_offline'); } catch (err) { /* ignora */ }
        if (authReal()) { PastorAuth.sair().finally(() => location.reload()); return; }
        location.reload();
        return;
      }

      // Avatar do cabeçalho: abre o card "Meu perfil" em modal
      if (e.target.closest('.topbar-avatar')) {
        navigateTo('perfil');
        window.UsuarioPerfil.abrirModal();
        return;
      }

      // Navegação por [data-nav], [data-hnav], [data-home-ir] ou [data-nav-id]
      const navTrigger = e.target.closest('[data-nav], [data-hnav], [data-home-ir], [data-nav-id]');
      if (navTrigger) {
        const destino = navTrigger.dataset.nav || navTrigger.dataset.hnav || navTrigger.dataset.homeIr || navTrigger.dataset.navId;
        if (destino) {
          if (destino !== 'chat') state.chatId = null;
          navigateTo(destino);
          return;
        }
      }

      // Home: oração do dia e versículo
      if (e.target.closest('[data-action="home-oracao"]')) {
        window.UsuarioHome.abrirOracao();
        return;
      }
      if (e.target.closest('[data-action="home-amen"]')) {
        closeSheet();
        toast('Amém! Vamos orar juntos.');
        return;
      }
      if (e.target.closest('[data-action="home-versiculo"]')) {
        window.UsuarioHome.compartilharVersiculo().then((msg) => { if (msg) toast(msg); });
        return;
      }

      // Perfil: abrir, editar, salvar e compartilhar
      if (e.target.closest('[data-action="meu-perfil"]')) {
        navigateTo('perfil');
        return;
      }
      if (e.target.closest('[data-action="perfil-editar"]')) {
        window.UsuarioPerfil.abrirEdicao();
        return;
      }
      if (e.target.closest('[data-action="perfil-salvar"]')) {
        const r = window.UsuarioPerfil.salvarFormulario();
        if (r.erro) { toast(r.erro, 'error'); return; }
        closeSheet();
        renderView('perfil');
        toast('Perfil atualizado!');
        return;
      }
      if (e.target.closest('[data-action="perfil-compartilhar"]')) {
        window.UsuarioPerfil.compartilhar().then((msg) => { if (msg) toast(msg); });
        return;
      }

      // Perfil: foto do perfil — exibição, seleção, ampliação e remoção
      if (e.target.closest('[data-action="perfil-foto-alterar"]')) {
        window.UsuarioPerfil.abrirGaleria();
        return;
      }
      if (e.target.closest('[data-action="perfil-foto-galeria"]')) {
        window.UsuarioPerfil.abrirGaleria();
        return;
      }
      if (e.target.closest('[data-action="perfil-foto-camera"]')) {
        window.UsuarioPerfil.abrirCamera();
        return;
      }
      if (e.target.closest('[data-action="perfil-foto-zoom"]')) {
        window.UsuarioPerfil.abrirZoom();
        return;
      }
      if (e.target.closest('[data-action="perfil-foto-fechar"]')) {
        window.UsuarioPerfil.fecharZoom();
        return;
      }
      if (e.target.closest('[data-action="perfil-foto-confirmar"]')) {
        window.UsuarioPerfil.confirmarFoto();
        return;
      }
      if (e.target.closest('[data-action="perfil-foto-remover"]')) {
        window.UsuarioPerfil.removerFoto();
        return;
      }

      // Perfil: modal do card "Meu perfil" (abrir/fechar)
      if (e.target.closest('[data-action="perfil-modal-abrir"]')) {
        window.UsuarioPerfil.abrirModal();
        return;
      }
      if (e.target.closest('[data-action="perfil-modal-fechar"]')) {
        window.UsuarioPerfil.fecharModal();
        return;
      }

      // Pedidos de oração e Chat
      if (e.target.closest('[data-action="novo-pedido-oracao"]')) {
        if (window.UsuarioMenu) window.UsuarioMenu.fecharDrawer();
        abrirSheetPedidoOracao();
        return;
      }
      if (e.target.closest('[data-action="salvar-pedido-oracao"]')) {
        salvarPedidoOracao();
        return;
      }
      const chatItem = e.target.closest('.chat-item');
      if (chatItem) {
        state.chatId = parseInt(chatItem.dataset.chat, 10) || 1;
        renderView('chat');
        return;
      }
      if (e.target.closest('[data-action="back-chat"]')) {
        state.chatId = null;
        renderView('chat');
        return;
      }
      if (e.target.closest('[data-action="send-chat"]')) {
        enviarMensagemChat();
        return;
      }

      // Agenda: filtros, dias, agendamento e detalhe
      const agendaFilter = e.target.closest('.agenda-filter-btn');
      if (agendaFilter) {
        state.agendaStatus = agendaFilter.dataset.filter || 'all';
        renderView('agenda');
        return;
      }
      const agendaDay = e.target.closest('.agenda-day');
      if (agendaDay) {
        const idx = parseInt(agendaDay.dataset.day, 10);
        state.agendaDay = state.agendaDay === idx ? null : idx;
        renderView('agenda');
        return;
      }
      if (e.target.closest('[data-action="agenda-limpar-filtro"]')) {
        state.agendaStatus = 'all';
        state.agendaDay = null;
        renderView('agenda');
        return;
      }
      if (e.target.closest('#fab-agendar, [data-action="agendar-visita"]')) {
        if (window.UsuarioMenu) window.UsuarioMenu.fecharDrawer();
        abrirSheetAgendar();
        return;
      }
      if (e.target.closest('[data-action="agenda-salvar"]')) {
        salvarNovoAgendamento();
        return;
      }
      const agendaItem = e.target.closest('[data-agenda-id]');
      if (agendaItem) {
        abrirDetalheAgenda(parseInt(agendaItem.dataset.agendaId, 10));
        return;
      }
      const btnConcluir = e.target.closest('[data-action="agenda-concluir"]');
      if (btnConcluir) {
        const id = parseInt(btnConcluir.dataset.id, 10);
        const item = AGENDA.find((a) => a.id === id);
        if (item) {
          item.status = item.status === 'concluido' ? 'agendado' : 'concluido';
          salvarAgenda();
          closeSheet();
          renderView('agenda');
          toast('Status do compromisso atualizado!');
        }
        return;
      }
      const btnExcluir = e.target.closest('[data-action="agenda-excluir"]');
      if (btnExcluir) {
        const id = parseInt(btnExcluir.dataset.id, 10);
        AGENDA = AGENDA.filter((a) => a.id !== id);
        salvarAgenda();
        closeSheet();
        renderView('agenda');
        toast('Compromisso cancelado.');
        return;
      }

      // Sermões: filtros, favoritos, detalhe e ações
      const sermonFilter = e.target.closest('.sermoes-filter');
      if (sermonFilter) {
        state.sermoesCat = sermonFilter.dataset.filter || 'todos';
        $$('.sermoes-filter').forEach((f) => f.classList.toggle('active', f === sermonFilter));
        atualizarListaSermoesDom();
        return;
      }
      const sermFav = e.target.closest('[data-action="serm-fav"]');
      if (sermFav) {
        e.stopPropagation();
        const id = parseInt(sermFav.dataset.sermId, 10);
        state.favoritos = state.favoritos.includes(id)
          ? state.favoritos.filter((x) => x !== id)
          : state.favoritos.concat(id);
        localStorage.setItem('pastorhub_favoritos', JSON.stringify(state.favoritos));
        toast(state.favoritos.includes(id) ? 'Sermão salvo nos favoritos!' : 'Sermão removido dos favoritos.');
        renderView(state.view);
        return;
      }
      const sermCard = e.target.closest('[data-serm-id]');
      if (sermCard && !e.target.closest('button')) {
        state.sermaoId = parseInt(sermCard.dataset.sermId, 10) || null;
        navigateTo('sermao');
        return;
      }
      if (e.target.closest('[data-action="serm-voltar"]')) {
        navigateTo('sermoes');
        return;
      }
      if (e.target.closest('[data-action="serm-copiar"]')) {
        const s = SERMOES.find((x) => x.id === state.sermaoId) || SERMOES[0];
        navigator.clipboard?.writeText(s.titulo + ' — ' + s.autor + '\n\n' + s.texto);
        toast('Texto do sermão copiado!');
        return;
      }
      if (e.target.closest('[data-action="serm-compartilhar"]')) {
        const s = SERMOES.find((x) => x.id === state.sermaoId) || SERMOES[0];
        if (navigator.share) {
          navigator.share({ title: s.titulo, text: s.titulo + ' (' + s.autor + '): ' + s.texto }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(s.titulo + ' (' + s.autor + '): ' + s.texto);
          toast('Resumo do sermão copiado para compartilhar!');
        }
        return;
      }
      if (e.target.closest('[data-action="serm-pdf"]')) {
        const s = SERMOES.find((x) => x.id === state.sermaoId) || SERMOES[0];
        window.openSheet({
          title: 'Folha de Estudo · ' + s.titulo,
          desc: s.autor + ' • ' + s.tipo,
          icon: 'file-text',
          body: `<div class="leitor-texto"><p>${escapeHtml(s.texto)}</p></div>`,
          footer: `<button class="btn outline" data-action="close-sheet" type="button">Fechar</button><button class="btn primary" data-action="imprimir-estudo" type="button">Imprimir / PDF</button>`,
        });
        return;
      }
      if (e.target.closest('[data-action="imprimir-estudo"]')) {
        closeSheet();
        window.print();
        return;
      }

      // Biblioteca Digital e Leitor por Capítulos
      if (e.target.closest('[data-action="bib-comprar-alugar"]')) {
        navigateTo('acervo');
        return;
      }
      const bibItem = e.target.closest('.bib-item');
      if (bibItem) {
        state.livroId = bibItem.dataset.livro;
        navigateTo('livro');
        return;
      }
      const bibFilter = e.target.closest('.bib-filter-chip');
      if (bibFilter) {
        $$('.bib-filter-chip').forEach((f) => f.classList.remove('active'));
        bibFilter.classList.add('active');
        filterBibList();
        return;
      }
      if (e.target.closest('[data-action="bib-voltar"]')) {
        navigateTo('biblioteca');
        return;
      }
      const bibFav = e.target.closest('[data-action="bib-fav"]');
      if (bibFav) {
        const id = bibFav.dataset.livro;
        state.bibFavs = state.bibFavs.indexOf(id) === -1
          ? state.bibFavs.concat(id)
          : state.bibFavs.filter((x) => x !== id);
        localStorage.setItem('pastorhub_biblioteca_favs', JSON.stringify(state.bibFavs));
        toast(state.bibFavs.indexOf(id) !== -1 ? 'Livro salvo nos favoritos!' : 'Livro removido dos favoritos.');
        renderView('livro');
        return;
      }
      const bibLer = e.target.closest('[data-action="bib-ler"]');
      if (bibLer) {
        abrirLeitorLivro(bibLer.dataset.livro || state.livroId, 0);
        return;
      }
      const capBtn = e.target.closest('[data-action="leitor-cap"]');
      if (capBtn) {
        abrirLeitorLivro(state.livroId, parseInt(capBtn.dataset.cap, 10) || 0);
        return;
      }
      const fonteBtn = e.target.closest('[data-action="leitor-fonte"]');
      if (fonteBtn) {
        const delta = parseInt(fonteBtn.dataset.delta, 10) || 0;
        state.leitorFonte = Math.min(22, Math.max(13, state.leitorFonte + delta));
        const txt = $('#leitor-texto');
        if (txt) txt.style.fontSize = state.leitorFonte + 'px';
        return;
      }
      if (e.target.closest('[data-action="leitor-copiar"]')) {
        const txt = $('#leitor-texto');
        if (txt) navigator.clipboard?.writeText(txt.innerText);
        toast('Trecho do capítulo copiado!');
        return;
      }

      // Notificações
      if (e.target.closest('[data-action="notif-ler-todas"]')) {
        NOTIFICACOES.forEach((n) => { n.lida = true; });
        renderView('notificacoes');
        toast('Todas as notificações foram marcadas como lidas.');
        return;
      }
      const notifItem = e.target.closest('[data-notif-id]');
      if (notifItem) {
        const id = parseInt(notifItem.dataset.notifId, 10);
        const notif = NOTIFICACOES.find((n) => n.id === id);
        if (notif) {
          notif.lida = true;
          if (notif.chatId) state.chatId = notif.chatId;
          if (notif.sermaoId) state.sermaoId = notif.sermaoId;
          navigateTo(notif.destino || 'notificacoes');
        }
        return;
      }

      // Fechar Sheet
      if (e.target.closest('[data-action="close-sheet"]')) {
        closeSheet();
        return;
      }
    });

    // Busca em tempo real (Home, Biblioteca e Sermões)
    document.addEventListener('input', (e) => {
      if (!e.target) return;
      if (e.target.id === 'bib-search-input') filterBibList();
      if (e.target.id === 'home-search' && window.UsuarioHome) window.UsuarioHome.filtrar(e.target.value);
      if (e.target.id === 'sermoes-search') {
        state.sermoesTermo = e.target.value;
        atualizarListaSermoesDom();
      }
    });

    // Teclado: Enter envia chat, Escape fecha menu lateral ou sheet
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target && e.target.id === 'chat-input') {
        e.preventDefault();
        enviarMensagemChat();
      }
      if (e.key === 'Escape') {
        if (window.UsuarioMenu) window.UsuarioMenu.fecharDrawer();
        const sheet = $('#sheet');
        if (sheet && !sheet.hidden) closeSheet();
      }
    });
  }

  function navigateTo(id) {
    if (window.UsuarioMenu) window.UsuarioMenu.fecharDrawer();
    renderView(id);
  }

  function closeSheet() {
    if (window.closeSheet) window.closeSheet();
    else {
      const s = $('#sheet');
      if (s) s.hidden = true;
    }
  }

  function toast(msg, type) {
    if (window.toast) window.toast(msg, type);
    else {
      const toastRoot = $('#toast-root');
      if (toastRoot) {
        const el = document.createElement('div');
        el.className = 'toast' + (type ? ' ' + type : '');
        el.textContent = msg;
        toastRoot.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 250); }, 2200);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => authInit());
  } else {
    authInit();
  }
})();
