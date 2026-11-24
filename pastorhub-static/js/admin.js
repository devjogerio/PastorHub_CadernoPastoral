/* ============================================================
   Painel administrativo PastorHub
   Gestão de todos os módulos do projeto
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);
  const ic = (name, cls) => window.icon(name, cls);
  // Registro de ações (data-action="nome")
  const Actions = (window.Actions = window.Actions || {});

  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const initials = (n) => String(n || 'P').split(' ').filter(Boolean).map((x) => x[0]).join('').toUpperCase().slice(0, 2);

  /* ================= DADOS ================= */
  const DB = {
    kpis: {
      usuarios: 1248, usuariosDelta: '+8,4%',
      sermoes: 38412, sermoesDelta: '+12,1%',
      atendimentos: 9317, atendimentosDelta: '+5,2%',
      receita: 28460, receitaDelta: '+9,8%',
      retention: 87, retentionDelta: '+1,4 p.p.',
    },
    ativosMensais: [
      { m: 'Dez', v: 640 }, { m: 'Jan', v: 720 }, { m: 'Fev', v: 705 }, { m: 'Mar', v: 810 },
      { m: 'Abr', v: 865 }, { m: 'Mai', v: 900 }, { m: 'Jun', v: 958 }, { m: 'Jul', v: 1010 },
      { m: 'Ago', v: 1075 }, { m: 'Set', v: 1120 }, { m: 'Out', v: 1180 }, { m: 'Nov', v: 1248 },
    ],
    sermoesPorTipo: [
      { label: 'Expositivo', v: 38, cor: '#002645' },
      { label: 'Temático', v: 27, cor: '#3261AB' },
      { label: 'Textual', v: 16, cor: '#95C121' },
      { label: 'Narrativo', v: 11, cor: '#a855f7' },
      { label: 'Evangelístico', v: 8, cor: '#f97316' },
    ],
    dispositivos: [
      { label: 'Android (APK)', v: 62, cor: '#95C121' },
      { label: 'Web', v: 26, cor: '#3261AB' },
      { label: 'Tablet', v: 8, cor: '#a855f7' },
      { label: 'Desktop', v: 4, cor: '#002645' },
    ],
    modulosUso: [
      { label: 'Caderno do Pastor', v: 92 },
      { label: 'Agenda', v: 78 },
      { label: 'Atendimentos', v: 64 },
      { label: 'Recursos pastorais', v: 47 },
      { label: 'Alertas', v: 41 },
      { label: 'Busca global', v: 33 },
    ],
    topTemas: [
      { label: 'Fé', v: 1820 },
      { label: 'Familiar', v: 1540 },
      { label: 'Oração', v: 1290 },
      { label: 'Juventude', v: 1180 },
      { label: 'Propósito', v: 960 },
      { label: 'Gratidão', v: 740 },
    ],
    usuarios: [
      { nome: 'Marcos Vieira', email: 'marcos@evangelhoquadrado.com', igreja: 'Igreja do Evangelho Quadrado', cidade: 'Uberlândia · MG', plano: 'Premium', sermoes: 42, atendimentos: 18, status: 'Ativo', acesso: 'Hoje, 09:14', cor: '#002645' },
      { nome: 'Ana Beatriz Rocha', email: 'ana.b.rocha@email.com', igreja: 'Comunidade Betel', cidade: 'Campinas · SP', plano: 'Igreja', sermoes: 87, atendimentos: 34, status: 'Ativo', acesso: 'Hoje, 08:02', cor: '#3261AB' },
      { nome: 'Jonas Lima', email: 'jonas@centralpr.com', igreja: 'Igreja Central', cidade: 'Curitiba · PR', plano: 'Premium', sermoes: 63, atendimentos: 25, status: 'Ativo', acesso: 'Ontem, 21:47', cor: '#95C121' },
      { nome: 'Rafael Monteiro', email: 'rafael@monteiro.org', igreja: 'Assembleia Deus é Amor', cidade: 'Belém · PA', plano: 'Offline', sermoes: 12, atendimentos: 6, status: 'Ativo', acesso: 'Ontem, 19:30', cor: '#a855f7' },
      { nome: 'Patrícia Nogueira', email: 'patricia@nog.net.br', igreja: 'Igreja do Nazareno', cidade: 'Goiânia · GO', plano: 'Igreja', sermoes: 104, atendimentos: 41, status: 'Ativo', acesso: '12 Nov, 15:12', cor: '#f97316' },
      { nome: 'Samuel Aguiar', email: 'samuel@aguiar.app', igreja: 'Igreja Batista Central', cidade: 'Salvador · BA', plano: 'Premium', sermoes: 55, atendimentos: 29, status: 'Suspenso', acesso: '08 Nov, 10:00', cor: '#ef4444' },
      { nome: 'Elaine Souza', email: 'elaine.souza@fb.com', igreja: 'Ministério Fonte Viva', cidade: 'Recife · PE', plano: 'Offline', sermoes: 9, atendimentos: 14, status: 'Ativo', acesso: '07 Nov, 17:22', cor: '#0ea5e9' },
      { nome: 'Tiago Ferreira', email: 'tiago@ferreira.app', igreja: 'Catedral da Paz', cidade: 'Porto Alegre · RS', plano: 'Premium', sermoes: 71, atendimentos: 33, status: 'Em análise', acesso: '05 Nov, 11:40', cor: '#8b5cf6' },
      { nome: 'Camila Duarte', email: 'camila@duarte.app', igreja: 'Igreja do Bom Pastor', cidade: 'Fortaleza · CE', plano: 'Igreja', sermoes: 96, atendimentos: 52, status: 'Ativo', acesso: '03 Nov, 09:05', cor: '#14b8a6' },
      { nome: 'Joel Barbosa', email: 'joel@barbosa.app', igreja: 'Igreja Pentecostal Deus é Amor', cidade: 'Manaus · AM', plano: 'Offline', sermoes: 18, atendimentos: 11, status: 'Inativo', acesso: '28 Out, 16:55', cor: '#64748b' },
    ],
    conteudo: [
      { titulo: 'A Fé Que Transforma Montanhas', autor: 'Marcos Vieira', tema: 'Fé', tipo: 'Expositivo', publico: 'Geral', status: 'Publicado', ia: true, views: 1284, data: '12 Nov 2026' },
      { titulo: 'Quando Deus Cala', autor: 'Ana Beatriz Rocha', tema: 'Silêncio de Deus', tipo: 'Temático', publico: 'Adultos', status: 'Publicado', ia: true, views: 962, data: '11 Nov 2026' },
      { titulo: 'Casa que Constroi', autor: 'Jonas Lima', tema: 'Família', tipo: 'Expositivo', publico: 'Adultos', status: 'Em revisão', ia: false, views: 741, data: '11 Nov 2026' },
      { titulo: 'Propósito em Tempos de Espera', autor: 'Patrícia Nogueira', tema: 'Propósito', tipo: 'Narrativo', publico: 'Jovens', status: 'Publicado', ia: true, views: 688, data: '10 Nov 2026' },
      { titulo: 'Gratidão em Tempos de Loss', autor: 'Rafael Monteiro', tema: 'Gratidão', tipo: 'Textual', publico: 'Geral', status: 'Oculto', ia: false, views: 402, data: '09 Nov 2026' },
      { titulo: 'O Poder do Silêncio', autor: 'Samuel Aguiar', tema: 'Oração', tipo: 'Temático', publico: 'Geral', status: 'Publicado', ia: true, views: 1190, data: '08 Nov 2026' },
      { titulo: 'Levanta-te e Vem', autor: 'Tiago Ferreira', tema: 'Coragem', tipo: 'Evangelístico', publico: 'Não Crentes', status: 'Em revisão', ia: true, views: 530, data: '08 Nov 2026' },
      { titulo: 'Raízes Profundas', autor: 'Camila Duarte', tema: 'Identidade', tipo: 'Expositivo', publico: 'Jovens', status: 'Publicado', ia: false, views: 860, data: '07 Nov 2026' },
    ],
    eventos: [
      { titulo: 'Aconselhamento · Maria Silva', pastor: 'Marcos Vieira', quando: 'Hoje, 14:00', tipo: 'Atendimento', local: 'Presencial', status: 'Confirmado' },
      { titulo: 'Visitação · João Santos', pastor: 'Marcos Vieira', quando: 'Hoje, 16:00', tipo: 'Visitação', local: 'Casa', status: 'Confirmado' },
      { titulo: 'Oração · Ana Costa', pastor: 'Marcos Vieira', quando: 'Hoje, 18:00', tipo: 'Oração', local: 'Online', status: 'Pendente' },
      { titulo: 'Palestra Juventude', pastor: 'Jonas Lima', quando: 'Amanhã, 10:00', tipo: 'Palestra', local: 'Igreja', status: 'Confirmado' },
      { titulo: 'Culto Principal', pastor: 'Patrícia Nogueira', quando: 'Amanhã, 19:00', tipo: 'Culto', local: 'Igreja', status: 'Confirmado' },
      { titulo: 'Reunião de líderes', pastor: 'Ana Beatriz Rocha', quando: 'Sex, 20:00', tipo: 'Reunião', local: 'Online', status: 'Pendente' },
    ],
    atendimentos: [
      { nome: 'Maria Silva', pastor: 'Marcos Vieira', tipo: 'Aconselhamento', modalidade: 'Presencial', status: 'Agendado', data: 'Hoje, 14:00' },
      { nome: 'João Santos', pastor: 'Marcos Vieira', tipo: 'Visitação', modalidade: 'Visitação', status: 'Agendado', data: 'Hoje, 16:00' },
      { nome: 'Ana Costa', pastor: 'Marcos Vieira', tipo: 'Oração', modalidade: 'Online', status: 'Agendado', data: 'Amanhã, 10:00' },
      { nome: 'Pedro Oliveira', pastor: 'Jonas Lima', tipo: 'Aconselhamento', modalidade: 'Telefone', status: 'Concluído', data: 'Ontem' },
      { nome: 'Carla Mendes', pastor: 'Patrícia Nogueira', tipo: 'Aconselhamento', modalidade: 'Presencial', status: 'Agendado', data: '31 Out' },
      { nome: 'Paulo Ferreira', pastor: 'Camila Duarte', tipo: 'Discipulado', modalidade: 'Presencial', status: 'Concluído', data: '30 Out' },
    ],
    palestras: [
      { titulo: 'Fé em Tempos Difíceis', publico: 'Adultos', duracao: '30 min', autor: 'Equipe PastorHub', status: 'Publicado' },
      { titulo: 'O Poder da Oração', publico: 'Geral', duracao: '45 min', autor: 'Equipe PastorHub', status: 'Publicado' },
      { titulo: 'Juventude e Propósito', publico: 'Jovens', duracao: '40 min', autor: 'Equipe PastorHub', status: 'Rascunho' },
      { titulo: 'Lidere com Graça', publico: 'Adultos', duracao: '60 min', autor: 'Equipe PastorHub', status: 'Rascunho' },
    ],
    videos: [
      { titulo: 'Como Lidar com a Ansiedade', categoria: 'Aconselhamento', views: 1250, duracao: '18 min', status: 'Publicado' },
      { titulo: 'Casamento e Família', categoria: 'Família', views: 890, duracao: '24 min', status: 'Publicado' },
      { titulo: 'Juventude com Propósito', categoria: 'Jovens', views: 2100, duracao: '31 min', status: 'Publicado' },
      { titulo: 'Entendendo a Ansiedade', categoria: 'Aconselhamento', views: 640, duracao: '16 min', status: 'Oculto' },
    ],
    templates: [
      { nome: 'Atendimento próximo', canal: 'Push', ativo: true, usos: 8420 },
      { nome: 'Novo agendamento', canal: 'Push + E-mail', ativo: true, usos: 5210 },
      { nome: 'Palestra agendada', canal: 'Push', ativo: true, usos: 1180 },
      { nome: 'Resumo diário', canal: 'E-mail', ativo: false, usos: 960 },
      { nome: 'Sincronização concluída', canal: 'Push', ativo: true, usos: 3120 },
      { nome: 'Pedido de acesso', canal: 'E-mail (admin)', ativo: true, usos: 214 },
    ],
    integracoes: [
      { nome: 'Supabase', desc: 'Autenticação, banco e RLS', status: 'Conectado', icone: 'database', cor: '#95C121' },
      { nome: 'OpenAI', desc: 'Geração de sermões e palestras', status: 'Conectado', icone: 'zap', cor: '#95C121' },
      { nome: 'Google Calendar', desc: 'Sincronização de agenda', status: 'Conectado', icone: 'calendar', cor: '#95C121' },
      { nome: 'Microsoft Outlook', desc: 'Calendário corporativo', status: 'Desconectado', icone: 'mail', cor: '#cbd5e1' },
      { nome: 'Apple Calendar', desc: 'Agenda iOS/macOS', status: 'Desconectado', icone: 'calendar', cor: '#cbd5e1' },
      { nome: 'Capacitor / APK', desc: 'Build Android', status: 'Ativo', icone: 'box', cor: '#95C121' },
      { nome: 'Sentry', desc: 'Monitoramento de erros', status: 'Desconectado', icone: 'activity', cor: '#cbd5e1' },
      { nome: 'Webhooks', desc: 'Eventos para sistemas externos', status: 'Conectado', icone: 'zap', cor: '#95C121' },
    ],
    edgeFunctions: [
      { nome: 'generate-sermon', desc: 'Gera sermão estruturado via IA', status: 'Ativa', latencia: '1,9s', exec: 12840 },
      { nome: 'generate-palestra', desc: 'Gera palestra pastoral', status: 'Ativa', latencia: '2,4s', exec: 3120 },
      { nome: 'sync-sermons', desc: 'Sincroniza fila offline → nuvem', status: 'Ativa', latencia: '740ms', exec: 8940 },
      { nome: 'send-notification', desc: 'Dispara notificações push/e-mail', status: 'Inativa', latencia: '—', exec: 0 },
    ],
    logs: [
      { hora: 'Hoje, 11:42', usuario: 'admin@pastorhub.app', acao: 'Publicou conteúdo', alvo: 'A Fé Que Transforma Montanhas', tipo: 'ok' },
      { hora: 'Hoje, 11:18', usuario: 'ana.b.rocha@email.com', acao: 'Alterou o plano', alvo: 'Premium → Igreja', tipo: 'ok' },
      { hora: 'Hoje, 10:55', usuario: 'system', acao: 'Falha na Edge Function', alvo: 'send-notification (timeout)', tipo: 'erro' },
      { hora: 'Hoje, 10:20', usuario: 'samuel@aguiar.app', acao: 'Conta suspensa', alvo: 'Violação de uso', tipo: 'erro' },
      { hora: 'Ontem, 18:07', usuario: 'admin@pastorhub.app', acao: 'Atualizou feature flag', alvo: 'ai_enabled = false', tipo: 'aviso' },
      { hora: 'Ontem, 17:33', usuario: 'rafael@monteiro.org', acao: 'Exportou dados', alvo: '12 sermões (.txt)', tipo: 'ok' },
      { hora: 'Ontem, 16:12', usuario: 'tiago@ferreira.app', acao: 'Solicitou acesso', alvo: 'Igreja Central', tipo: 'aviso' },
    ],
    flags: [
      { chave: 'ai_enabled', desc: 'Gerador de sermões e palestras com IA', on: true },
      { chave: 'google_calendar', desc: 'Integração com Google Calendar', on: true },
      { chave: 'apple_calendar', desc: 'Integração com Apple Calendar', on: false },
      { chave: 'outlook_calendar', desc: 'Integração com Outlook', on: false },
      { chave: 'pdf_export', desc: 'Exportação de sermões em PDF', on: true },
      { chave: 'txt_export', desc: 'Exportação de sermões em TXT', on: true },
      { chave: 'push_notifications', desc: 'Notificações push', on: true },
      { chave: 'email_notifications', desc: 'Notificações por e-mail', on: true },
      { chave: 'offline_mode', desc: 'Modo offline-first com fila de sincronização', on: true },
      { chave: 'pwa_install', desc: 'Instalação como app (PWA)', on: true },
      { chave: 'beta_ai_templates', desc: 'Novos templates de prompt (beta)', on: false },
      { chave: 'dark_mode', desc: 'Tema escuro (em desenvolvimento)', on: false },
    ],
    limites: [
      { label: 'Armazenamento (sermões)', usado: 68, total: 100, unidade: 'GB' },
      { label: 'Requisições Edge Functions', usado: 42, total: 100, unidade: '%' },
      { label: 'Push notifications (mês)', usado: 74, total: 100, unidade: '%' },
      { label: 'Bandwidth de API', usado: 31, total: 100, unidade: '%' },
    ],
  };

  /* ================= CONTAS DO PAINEL ================= */
  const CONTAS = [
    { email: 'admin@pastorhub.app', nome: 'Administrador', papel: 'admin', desde: '2025-01-15' },
    { email: 'ana.b.rocha@email.com', nome: 'Ana Beatriz Rocha', papel: 'usuario', desde: '2025-06-03' },
    /* conta vinculada ao Google (demonstração do login social) */
    { email: 'pastorhub.oficial@gmail.com', senha: null, nome: 'PastorHub Oficial', papel: 'admin', origem: 'google', desde: '2025-09-21' },
  ];
  /* seções restritas a quem não é administrador */
  const SECOES_ADMIN = ['investimento', 'planos', 'usuarios', 'integracoes', 'configuracoes'];
  const sessao = { conta: null, perfil: null };

  /* true quando há Supabase configurado (js/config.js): auth real; senão, modo demo */
  function authReal() {
    return !!(window.PastorAuth && PastorAuth.configurado());
  }

  /* Monta a "conta" do painel a partir da sessão real do Supabase (user_metadata) */
  function contaDaSessao(session) {
    const u = session && session.user;
    if (!u) return null;
    const meta = u.user_metadata || {};
    return {
      email: u.email,
      nome: meta.nome || meta.full_name || (u.email ? u.email.split('@')[0] : 'Usuário'),
      papel: meta.papel || 'usuario',
      origem: 'supabase',
      desde: (u.created_at || '').slice(0, 10),
    };
  }

  /* Login real no painel: exige sessão Supabase com papel 'admin' nos metadados */
  async function loginRealPainel(email, senha) {
    const r = await PastorAuth.entrar(email, senha);
    if (!r.ok) { toast(r.erro, 'err'); return; }
    const conta = contaDaSessao(r.session);
    if (!conta || conta.papel !== 'admin') {
      await PastorAuth.sair();
      toast('Esta conta não tem permissão de administrador.', 'err');
      return;
    }
    realizarLogin(conta);
  }

  const ehAdmin = () => !sessao.conta || sessao.conta.papel === 'admin';
  function secoesPermitidas() {
    if (ehAdmin()) return SECTIONS;
    return SECTIONS.filter((s) => s.group || s.action || SECOES_ADMIN.indexOf(s.id) === -1);
  }

  /* ================= PERFIL DO USUÁRIO LOGADO ================= */
  const PERFIS_KEY = 'pastorhub_admin_perfis';
  const PERFIL_PADRAO = {
    telefone: '', igreja: '', cargo: '', cidade: '', bio: '', avatar: '',
    notifEmail: true, notifResumo: true, notifPush: false,
  };

  // Avatares por padrão por tipo de conta (para quando não hava foto personalizada)
  const AVATARS_PADRAO = {
    admin: 'https://ui-avatars.com/api/?name=Admin+PastorHub&color=fff&background=002645',
    comum: 'https://ui-avatars.com/api/?name=Usuario&color=fff&background=3261AB',
    google: 'https://ui-avatars.com/api/?name=Google&color=fff&background=4285F4',
  };

  function perfisSalvos() {
    try {
      const mapa = JSON.parse(localStorage.getItem(PERFIS_KEY));
      return mapa && typeof mapa === 'object' ? mapa : {};
    } catch (e) {
      return {};
    }
  }

  function perfilDe(conta) {
    const salvo = perfisSalvos()[conta.email] || {};
    const avatarDefault = AVATARS_PADRAO[conta.papel] || AVATARS_PADRAO.comum;
    return Object.assign({}, PERFIL_PADRAO, salvo, {
      nome: salvo.nome || conta.nome,
      email: conta.email,
      papel: conta.papel,
      origem: conta.origem || 'email',
      desde: conta.desde || null,
      // Usa avatar padrão pelo papel se não houver um personalizado salvo
      avatar: salvo.avatar || (conta.avatar || avatarDefault),
    });
  }

  function salvarPerfil(dados) {
    if (!sessao.conta) return false;
    const mapa = perfisSalvos();
    mapa[sessao.conta.email] = Object.assign({}, mapa[sessao.conta.email] || {}, dados);
    try {
      localStorage.setItem(PERFIS_KEY, JSON.stringify(mapa));
    } catch (e) {
      toast('Armazenamento local cheio — o perfil não foi salvo', 'err');
      return false;
    }
    sessao.perfil = perfilDe(sessao.conta);
    aplicarSessao(sessao.conta);
    return true;
  }

  function aplicarSessao(conta, perfil) {
    const foot = document.querySelector('.aside-foot');
    if (!foot) return;
    const p = perfil || sessao.perfil || perfilDe(conta);
    const info = foot.querySelector('.aside-foot-info');
    const av = foot.querySelector('.avatar');
    if (av) {
      av.innerHTML = p.avatar
        ? '<img src="' + esc(p.avatar) + '" alt="Foto de perfil">'
        : esc(initials(p.nome));
    }
    if (!info) return;
    const b = info.querySelector('b');
    const sp = info.querySelector('span');
    if (b) b.textContent = p.nome;
    if (sp) sp.textContent = conta.origem === 'google' ? 'Conta Google · ' + conta.email : conta.email;
  }

  function dataBr(iso) {
    if (!iso) return '—';
    const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  /* ================= ESTADO ================= */
  const USUARIOS_KEY = 'pastorhub_admin_usuarios';

  function carregarUsuarios() {
    try {
      const salvos = JSON.parse(localStorage.getItem(USUARIOS_KEY));
      if (Array.isArray(salvos)) return salvos;
    } catch (e) {}
    return DB.usuarios.map((u) => ({ ...u }));
  }

  function salvarUsuarios(lista) {
    try {
      localStorage.setItem(USUARIOS_KEY, JSON.stringify(lista));
    } catch (e) {
      toast('Não foi possível salvar: armazenamento local cheio', 'err');
    }
  }
  const state = {
    section: 'overview',
    userQuery: '',
    userFilter: 'todos',
    contentQuery: '',
    contentFilter: 'todos',
    eventFilter: 'todos',
    flags: DB.flags.map((f) => ({ ...f })),
    users: carregarUsuarios(),
    eventos: carregarLista('pastorhub_admin_eventos', DB.eventos),
    atendimentos: carregarLista('pastorhub_admin_atendimentos', DB.atendimentos),
    palestras: carregarLista('pastorhub_admin_palestras', DB.palestras),
    videos: carregarLista('pastorhub_admin_videos', DB.videos),
    categorias: carregarLista('pastorhub_admin_categorias', ['Aconselhamento', 'Família', 'Jovens', 'Espiritualidade', 'Liderança', 'Oração']),
    content: DB.conteudo.map((c) => ({ ...c })),
    integrations: DB.integracoes.map((i) => ({ ...i })),
    templates: DB.templates.map((t) => ({ ...t })),
  };

  const SECTIONS = [
    { id: 'overview', label: 'Visão geral', icon: 'chart' },
    { id: 'investimento', label: 'Investimento & Financeiro', icon: 'card' },
    { id: 'usuarios', label: 'Usuários', icon: 'users', count: () => state.users.length },
    { id: 'planos', label: 'Planos & Assinaturas', icon: 'card' },
    { id: 'conteudo', label: 'Conteúdo (Sermões)', icon: 'book-open', count: () => state.content.length },
    { id: 'meetai', label: 'Conselho (Meet AI)', icon: 'video' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'message' },
    { id: 'agenda', label: 'Agenda & Atendimentos', icon: 'calendar' },
    { id: 'recursos', label: 'Recursos pastorais', icon: 'library' },
    { id: 'biblioteca', label: 'Biblioteca Digital', icon: 'library' },
    { id: 'notificacoes', label: 'Notificações', icon: 'bell' },
    { id: 'integracoes', label: 'Integrações', icon: 'zap' },
    { id: 'rag', label: 'Base de conhecimento (RAG)', icon: 'database' },
    { id: 'versiculos', label: 'Versículos diários', icon: 'book' },
    { id: 'configuracoes', label: 'Configurações', icon: 'settings' },
    { group: 'Minha conta' },
    { id: 'perfil', label: 'Meu perfil', icon: 'user' },
    { id: 'perfil-config', label: 'Configurações do perfil', icon: 'settings' },
    { id: 'sair', label: 'Sair do painel', icon: 'log-out', action: 'sair' },
  ];

  const TITLES = {
    overview: 'Visão geral',
    investimento: 'Investimento, unit economics e previsão',
    usuarios: 'Gestão de usuários',
    planos: 'Planos, assinaturas e faturamento',
    conteudo: 'Gestão de conteúdo',
    meetai: 'Conselho — Aconselhamento com IA',
    whatsapp: 'Lembretes e integração WhatsApp',
    agenda: 'Agenda e atendimentos',
    recursos: 'Recursos pastorais',
    biblioteca: 'Biblioteca Digital · Acervo, importar/exportar e compras/aluguel',
    notificacoes: 'Central de notificações',
    integracoes: 'Integrações e chaves de API',
    rag: 'Base de conhecimento e agentes (RAG)',
    versiculos: 'Versículos diários',
    configuracoes: 'Configurações da plataforma',
    perfil: 'Meu perfil',
    'perfil-config': 'Configurações do perfil',
  };

  /* ================= UI HELPERS ================= */
  function toast(msg, type) {
    const el = document.createElement('div');
    el.className = 'toast-admin' + (type ? ' ' + type : '');
    el.textContent = msg;
    $('#admin-toasts').appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  /* ---------- Download de arquivos ---------- */
  function adminDownload(conteudo, nomeArquivo, mime) {
    try {
      const blob = new Blob([conteudo], { type: (mime || 'text/plain') + ';charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      return true;
    } catch (e) {
      toast('Erro ao gerar o arquivo', 'err');
      return false;
    }
  }
  window.adminDownload = adminDownload;

  function modal({ title, body, confirmLabel, onSave, wide }) {    const root = $('#admin-modal-root');
    root.innerHTML =
      '<div class="modal-backdrop" data-close="1">' +
        '<div class="modal"' + (wide ? ' style="width:min(820px,100%)"' : '') + '>' +
          '<div class="modal-head"><h3>' + esc(title) + '</h3>' +
            '<button class="icon-btn" data-close="1" aria-label="Fechar">' + ic('x') + '</button></div>' +
          '<div class="modal-body">' + body + '</div>' +
          '<div class="modal-foot">' +
            '<button class="btn btn-outline" data-close="1">Cancelar</button>' +
            '<button class="btn btn-primary" id="modal-save">' + esc(confirmLabel || 'Salvar') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    root.querySelectorAll('[data-close]').forEach((b) =>
      b.addEventListener('click', (e) => {
        // o backdrop só fecha quando o clique é nele mesmo; botões de fechar/cancelar fecham sempre
        if (!b.classList.contains('modal-backdrop') || e.target === b) root.innerHTML = '';
      })
    );
    $('#modal-save').addEventListener('click', () => {
      if (onSave && onSave(root) === false) return;
      root.innerHTML = '';
    });
    return root;
  }

  function confirmAction(title, message, onConfirm) {
    const root = modal({
      title,
      body: '<p style="color:var(--muted)">' + message + '</p>',
      confirmLabel: 'Confirmar',
    });
    root.querySelector('#modal-save').classList.replace('btn-primary', 'btn-danger');
    root.querySelector('#modal-save').addEventListener('click', () => {
      onConfirm();
      root.innerHTML = '';
    });
  }

  function kpi(label, value, delta, iconName, colorClass, good) {
    return '<div class="kpi">' +
      '<div class="kpi-top"><span class="kpi-label">' + esc(label) + '</span>' +
        '<span class="kpi-icon ' + colorClass + '">' + ic(iconName) + '</span></div>' +
      '<div class="kpi-value">' + value + '</div>' +
      '<div class="kpi-delta ' + (good === false ? 'down' : good === 'flat' ? 'flat' : 'up') + '">' + delta + '</div>' +
    '</div>';
  }

  function panel(title, body, opts) {
    opts = opts || {};
    return '<section class="panel' + (opts.class ? ' ' + opts.class : '') + '">' +
      (title
        ? '<div class="panel-head"><div><h3>' + esc(title) + '</h3>' +
          (opts.sub ? '<div class="sub">' + esc(opts.sub) + '</div>' : '') + '</div>' +
          (opts.action || '') + '</div>'
        : '') +
      '<div class="panel-body' + (opts.flush ? ' flush' : '') + '">' + body + '</div>' +
    '</section>';
  }

  /* ---------- Gráficos SVG ---------- */
  function areaChart(data) {
    const w = 720, h = 230, pad = { l: 44, r: 12, t: 16, b: 30 };
    const max = Math.max.apply(null, data.map((d) => d.v)) * 1.12;
    const min = Math.min.apply(null, data.map((d) => d.v)) * 0.82;
    const x = (i) => pad.l + (i * (w - pad.l - pad.r)) / (data.length - 1);
    const y = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - min) / (max - min));
    const line = data.map((d, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(d.v).toFixed(1)).join(' ');
    const area = line + ' L' + x(data.length - 1).toFixed(1) + ' ' + (h - pad.b) + ' L' + x(0).toFixed(1) + ' ' + (h - pad.b) + ' Z';
    const grid = [0, 0.25, 0.5, 0.75, 1].map((p) => {
      const yy = pad.t + (h - pad.t - pad.b) * p;
      const val = Math.round(max - (max - min) * p);
      return '<line x1="' + pad.l + '" y1="' + yy + '" x2="' + (w - pad.r) + '" y2="' + yy + '" stroke="#eef2f7" stroke-width="1"/>' +
        '<text x="' + (pad.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="11" fill="#94a3b8">' + val + '</text>';
    }).join('');
    const pts = data.map((d, i) =>
      '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(d.v).toFixed(1) + '" r="3.5" fill="#fff" stroke="#95C121" stroke-width="2"/>').join('');
    const labels = data.map((d, i) =>
      '<text x="' + x(i).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle" font-size="11" fill="#94a3b8">' + d.m + '</text>').join('');
    return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#95C121" stop-opacity=".38"/><stop offset="100%" stop-color="#95C121" stop-opacity="0"/>' +
      '</linearGradient></defs>' + grid +
      '<path d="' + area + '" fill="url(#ag)"/>' +
      '<path d="' + line + '" fill="none" stroke="#95C121" stroke-width="2.5" stroke-linejoin="round"/>' +
      pts + labels + '</svg>';
  }

  function donutChart(segments, centerLabel, centerValue) {
    const size = 190, r = 70, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
    let offset = 0;
    const parts = segments.map((s) => {
      const len = (s.v / 100) * circ;
      const el = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + s.cor + '" stroke-width="26" ' +
        'stroke-dasharray="' + len.toFixed(2) + ' ' + (circ - len).toFixed(2) + '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
      offset += len;
      return el;
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + size + ' ' + size + '" style="max-width:200px">' +
      parts +
      '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-size="26" font-weight="700" fill="#002645">' + centerValue + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" font-size="11" fill="#64748b">' + esc(centerLabel) + '</text>' +
      '</svg>';
  }

  function barChart(items) {
    const w = 460, h = 200, pad = { l: 96, r: 16, t: 12, b: 24 };
    const max = Math.max.apply(null, items.map((i) => i.v));
    const bw = (w - pad.l - pad.r) / items.length;
    return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '">' +
      items.map((it, i) => {
        const bh = ((h - pad.t - pad.b) * it.v) / max;
        const x = pad.l + i * bw + bw * 0.18;
        const y = h - pad.b - bh;
        return '<text x="' + (pad.l - 10) + '" y="' + (y + bh / 2 + 4) + '" text-anchor="end" font-size="11" fill="#475569">' + esc(it.label) + '</text>' +
          '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="5" fill="' + it.cor + '"/>' +
          '<text x="' + (x + bw * 0.32).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle" font-size="11" fill="#475569">' + it.v + '%</text>';
      }).join('') +
      '<line x1="' + pad.l + '" y1="' + (h - pad.b) + '" x2="' + (w - pad.r) + '" y2="' + (h - pad.b) + '" stroke="#e5eaf0"/>' +
      '</svg>';
  }

  function barList(items, cor) {
    const max = Math.max.apply(null, items.map((i) => i.v));
    return '<div class="bar-list">' + items.map((i) =>
      '<div class="bar-item"><div class="bar-top"><b>' + esc(i.label) + '</b><span>' + i.v + (i.suffix || '') + '</span></div>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' + ((i.v / max) * 100).toFixed(1) + '%;background:' + (i.cor || cor || '#95C121') + '"></div></div></div>'
    ).join('') + '</div>';
  }

  function statusTag(status) {
    const map = {
      'Ativo': 'tag-green', 'Publicado': 'tag-green', 'Confirmado': 'tag-green', 'Conectado': 'tag-green', 'Ativa': 'tag-green', 'Enviada': 'tag-green',
      'Suspenso': 'tag-red', 'Oculto': 'tag-red', 'Falha': 'tag-red', 'Erro': 'tag-red', 'Inativa': 'tag-red', 'Bloqueado': 'tag-red', 'Bloqueada': 'tag-red',
      'Em análise': 'tag-amber', 'Em revisão': 'tag-amber', 'Pendente': 'tag-amber', 'Rascunho': 'tag-amber', 'Desconectado': 'tag-gray', 'Inativo': 'tag-gray', 'Inativa ': 'tag-gray', 'Aberta': 'tag-amber',
      'Premium': 'tag-lime', 'Igreja': 'tag-purple', 'Offline': 'tag-gray',
    };
    return '<span class="tag ' + (map[status] || 'tag-gray') + '">' + esc(status) + '</span>';
  }

  function switchBox(on, name) {
    return '<label class="switch"><input type="checkbox" data-flag="' + esc(name || '') + '"' + (on ? ' checked' : '') + '><span class="track"></span><span class="thumb"></span></label>';
  }

  /* ================= SEÇÕES ================= */
  const VIEWS = {};

  /* ---------- Visão geral ---------- */
  VIEWS.overview = function () {
    const k = DB.kpis;
    const feed = DB.logs.slice(0, 6).map((l) => {
      const cor = l.tipo === 'erro' ? 'b-red' : l.tipo === 'aviso' ? 'b-amber' : 'b-lime';
      const ico = l.tipo === 'erro' ? 'alert-circle' : l.tipo === 'aviso' ? 'alert-circle' : 'check-circle';
      return '<div class="feed-item"><span class="feed-dot ' + cor + '">' + ic(ico) + '</span>' +
        '<div><div class="feed-text"><b>' + esc(l.usuario) + '</b> — ' + esc(l.acao) + '</div>' +
        '<div class="feed-time">' + esc(l.alvo) + ' · ' + esc(l.hora) + '</div></div></div>';
    }).join('');

    return '<div class="kpi-grid">' +
      kpi('Usuários ativos', k.usuarios.toLocaleString('pt-BR'), k.usuariosDelta + ' este mês', 'users', 'b-navy') +
      kpi('Sermões criados', k.sermoes.toLocaleString('pt-BR'), k.sermoesDelta + ' este mês', 'book-open', 'b-lime') +
      kpi('Atendimentos', k.atendimentos.toLocaleString('pt-BR'), k.atendimentosDelta + ' este mês', 'message', 'b-blue') +
      kpi('Receita recorrente', 'R$ ' + k.receita.toLocaleString('pt-BR'), k.receitaDelta + ' vs. mês anterior', 'card', 'b-amber') +
      kpi('Retenção 30 dias', k.retention + '%', k.retentionDelta, 'activity', 'b-purple') +
      '</div>' +

      '<div class="grid-2">' +
        panel('Usuários ativos (últimos 12 meses)', areaChart(DB.ativosMensais), {
          sub: 'Total de contas com atividade no período',
          action: '<span class="tag tag-green">+12,1% no ano</span>',
        }) +
        panel('Distribuição por plataforma', donutChart(DB.dispositivos, 'acessos', '100%') +
          '<div class="chart-legend">' + DB.dispositivos.map((d) =>
            '<span><i class="legend-dot" style="background:' + d.cor + '"></i>' + esc(d.label) + ' · ' + d.v + '%</span>').join('') + '</div>',
          { sub: 'Base de usuários por plataforma' }) +
      '</div>' +

      '<div class="grid-2-even">' +
        panel('Sermões por tipo', barChart(DB.sermoesPorTipo), { sub: 'Distribuição dos 38 mil sermões criados' }) +
        panel('Módulos mais utilizados', barList(DB.modulosUso, '#3261AB'), { sub: '% de usuários ativos por módulo' }) +
      '</div>' +

      '<div class="grid-2">' +
        panel('Atividade recente', '<div class="feed">' + feed + '</div>', { flush: true, sub: 'Auditoria das últimas ações' }) +
        panel('Status dos serviços', [
          { n: 'API REST (Supabase)', s: 'Operacional', d: '99,98% uptime · 82ms' },
          { n: 'Banco de dados', s: 'Operacional', d: 'PostgreSQL 15 · RLS ativo' },
          { n: 'Edge Functions (IA)', s: 'Parcial', d: '1 função inativa: send-notification' },
          { n: 'PWA / Service Worker', s: 'Operacional', d: 'Cache estratégico ativo' },
          { n: 'Armazenamento local', s: 'Operacional', d: 'Sincronização offline-first' },
        ].map((x) =>
          '<div class="setting-row"><div><b>' + esc(x.n) + '</b><span>' + esc(x.d) + '</span></div>' +
          '<span class="tag ' + (x.s === 'Operacional' ? 'tag-green' : 'tag-amber') + '">' + x.s + '</span></div>').join(''),
          { sub: 'Saúde dos componentes do projeto' }) +
      '</div>';
  };

  /* ---------- Usuários ---------- */
  VIEWS.usuarios = function () {
    const q = state.userQuery.toLowerCase();
    let lista = state.users.filter((u) =>
      (u.nome + ' ' + u.email + ' ' + u.igreja).toLowerCase().includes(q));
    if (state.userFilter !== 'todos') lista = lista.filter((u) => u.status === state.userFilter);

    const rows = lista.map((u) =>
      '<tr>' +
        '<td><div class="cell-user">' +
          (u.avatar
            ? '<span class="avatar avatar-img"><img src="' + u.avatar + '" alt="Foto de ' + esc(u.nome) + '"></span>'
            : '<span class="avatar" style="background:' + u.cor + '">' + initials(u.nome) + '</span>') +
          '<div><b>' + esc(u.nome) + '</b><span>' + esc(u.email) + '</span></div></div></td>' +
        '<td>' + esc(u.igreja) + '<div style="font-size:.76rem;color:var(--muted)">' + esc(u.cidade) + '</div></td>' +
        '<td>' + statusTag(u.plano) + '</td>' +
        '<td style="text-align:center">' + u.sermoes + '</td>' +
        '<td style="text-align:center">' + u.atendimentos + '</td>' +
        '<td>' + statusTag(u.status) + '</td>' +
        '<td style="font-size:.8rem;color:var(--muted)">' + esc(u.acesso) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="btn btn-outline btn-sm" data-action="edit-user" data-id="' + esc(u.email) + '">' + ic('edit') + 'Editar</button>' +
          '<button class="icon-btn" data-action="toggle-user" data-id="' + esc(u.email) + '" title="Suspender/reativar">' + ic('lock') + '</button>' +
          '<button class="icon-btn danger" data-action="del-user" data-id="' + esc(u.email) + '" title="Excluir">' + ic('trash-2') + '</button>' +
        '</div></td>' +
      '</tr>').join('');

    return '<div class="kpi-grid">' +
      kpi('Total de usuários', state.users.length, '+18 no mês', 'users', 'b-navy') +
      kpi('Ativos', state.users.filter((u) => u.status === 'Ativo').length, '92% da base', 'user-check', 'b-lime') +
      kpi('Plano Premium', state.users.filter((u) => u.plano === 'Premium').length, 'conversão 41%', 'card', 'b-amber') +
      kpi('Plano Igreja', state.users.filter((u) => u.plano === 'Igreja').length, 'multi-usuário', 'layers', 'b-purple') +
      '</div>' +

      panel(null,
        '<div class="toolbar">' +
          '<div class="filter-input">' + ic('search') + '<input id="user-q" placeholder="Buscar por nome, e-mail ou igreja..." value="' + esc(state.userQuery) + '"></div>' +
          '<div class="segmented">' +
            ['todos', 'Ativo', 'Em análise', 'Suspenso', 'Bloqueado', 'Inativo'].map((f) =>
              '<button class="' + (state.userFilter === f ? 'active' : '') + '" data-action="user-filter" data-filter="' + f + '">' + f + '</button>').join('') +
          '</div>' +
          '<div class="grow"></div>' +
          '<button class="btn btn-outline btn-sm" data-action="export-users">' + ic('download') + 'Exportar CSV</button>' +
          '<button class="btn btn-primary btn-sm" data-action="new-user">' + ic('plus') + 'Novo usuário</button>' +
        '</div>' +
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Usuário</th><th>Igreja</th><th>Plano</th><th style="text-align:center">Sermões</th>' +
          '<th style="text-align:center">Atend.</th><th>Status</th><th>Último acesso</th><th></th>' +
        '</tr></thead><tbody>' + (lista.length ? rows :
          '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:30px">Nenhum usuário encontrado</td></tr>') +
        '</tbody></table></div>',
        { flush: true });
  };

  /* ---------- Conteúdo ---------- */
  VIEWS.conteudo = function () {
    const q = state.contentQuery.toLowerCase();
    let lista = state.content.filter((c) => (c.titulo + ' ' + c.autor + ' ' + c.tema).toLowerCase().includes(q));
    if (state.contentFilter !== 'todos') lista = lista.filter((c) => c.status === state.contentFilter);

    const rows = lista.map((c) =>
      '<tr>' +
        '<td><b style="color:var(--navy)">' + esc(c.titulo) + '</b>' +
          '<div style="font-size:.76rem;color:var(--muted)">' + esc(c.tema) + ' · ' + esc(c.publico) + '</div></td>' +
        '<td>' + esc(c.autor) + '</td>' +
        '<td>' + esc(c.tipo) + '</td>' +
        '<td>' + (c.ia ? '<span class="tag tag-purple">IA</span>' : '<span class="tag tag-gray">manual</span>') + '</td>' +
        '<td style="text-align:center">' + c.views.toLocaleString('pt-BR') + '</td>' +
        '<td>' + statusTag(c.status) + '</td>' +
        '<td style="font-size:.8rem;color:var(--muted)">' + esc(c.data) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="icon-btn" data-action="toggle-content" data-id="' + esc(c.titulo) + '" title="Publicar/ocultar">' + ic('eye') + '</button>' +
          '<button class="icon-btn" data-action="edit-content" data-id="' + esc(c.titulo) + '" title="Editar">' + ic('edit') + '</button>' +
          '<button class="icon-btn danger" data-action="del-content" data-id="' + esc(c.titulo) + '" title="Excluir">' + ic('trash-2') + '</button>' +
        '</div></td>' +
      '</tr>').join('');

    return '<div class="kpi-grid">' +
      kpi('Sermões na plataforma', DB.kpis.sermoes.toLocaleString('pt-BR'), '+12,1% este mês', 'book-open', 'b-navy') +
      kpi('Gerados com IA', Math.round(DB.kpis.sermoes * 0.68).toLocaleString('pt-BR'), '68% do total', 'sparkles', 'b-purple') +
      kpi('Publicados', state.content.filter((c) => c.status === 'Publicado').length, 'de ' + state.content.length + ' no painel', 'check-circle', 'b-lime') +
      kpi('Aguardando revisão', state.content.filter((c) => c.status === 'Em revisão').length, 'fila de moderação', 'history', 'b-amber') +
      '</div>' +

      '<div class="grid-2-even">' +
        panel('Temas mais buscados', barList(DB.topTemas, '#002645'), { sub: 'Ranking de temas no Caderno do Pastor' }) +
        panel('Distribuição por tipo de sermão', donutChart(DB.sermoesPorTipo, 'sermões', '100%') +
          '<div class="chart-legend">' + DB.sermoesPorTipo.map((d) =>
            '<span><i class="legend-dot" style="background:' + d.cor + '"></i>' + esc(d.label) + ' · ' + d.v + '%</span>').join('') + '</div>',
          { sub: 'Preferências de formato dos pastureiros' }) +
      '</div>' +

      panel(null,
        '<div class="toolbar">' +
          '<div class="filter-input">' + ic('search') + '<input id="content-q" placeholder="Buscar sermão, autor ou tema..." value="' + esc(state.contentQuery) + '"></div>' +
          '<div class="segmented">' +
            ['todos', 'Publicado', 'Em revisão', 'Oculto'].map((f) =>
              '<button class="' + (state.contentFilter === f ? 'active' : '') + '" data-action="content-filter" data-filter="' + f + '">' + f + '</button>').join('') +
          '</div>' +
          '<div class="grow"></div>' +
          '<button class="btn btn-outline btn-sm" data-action="export-content">' + ic('download') + 'Exportar</button>' +
          '<button class="btn btn-primary btn-sm" data-action="new-content">' + ic('plus') + 'Novo sermão</button>' +
        '</div>' +
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Sermão</th><th>Autor</th><th>Tipo</th><th>Origem</th><th style="text-align:center">Views</th>' +
          '<th>Status</th><th>Data</th><th></th>' +
        '</tr></thead><tbody>' + (lista.length ? rows :
          '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:30px">Nenhum sermão encontrado</td></tr>') +
        '</tbody></table></div>',
        { flush: true });
  };

  /* ---------- Listas editáveis (persistidas em localStorage) ---------- */
  function carregarLista(chave, semente) {
    try {
      const salva = JSON.parse(localStorage.getItem(chave));
      if (Array.isArray(salva)) return salva;
    } catch (e) {}
    return JSON.parse(JSON.stringify(semente));
  }

  function salvarListaLocal(chave, lista) {
    try {
      localStorage.setItem(chave, JSON.stringify(lista));
    } catch (e) {
      toast('Armazenamento local cheio — alteração não salva', 'err');
    }
  }

  function persistirEstado() {
    salvarUsuarios(state.users);
    salvarListaLocal('pastorhub_admin_eventos', state.eventos);
    salvarListaLocal('pastorhub_admin_atendimentos', state.atendimentos);
    salvarListaLocal('pastorhub_admin_palestras', state.palestras);
    salvarListaLocal('pastorhub_admin_videos', state.videos);
    salvarListaLocal('pastorhub_admin_categorias', state.categorias);
  }

  /* ---------- Campos de formulário ---------- */
  function fCampo(rotulo, html) {
    return '<div class="field"><label>' + esc(rotulo) + '</label>' + html + '</div>';
  }

  function fTexto(id, valor, extra) {
    return '<input id="' + id + '" type="text" value="' + esc(valor == null ? '' : valor) + '"' + (extra || '') + '>';
  }

  function fSelect(id, opcoes, atual) {
    return '<select id="' + id + '">' + opcoes.map((o) =>
      '<option' + (o === atual ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>';
  }

  function fLinha() {
    return '<div class="field-row">' + Array.prototype.slice.call(arguments).join('') + '</div>';
  }

  function semLinhas(colunas, msg) {
    return '<tr><td colspan="' + colunas + '" style="text-align:center;color:var(--muted);padding:26px">' + esc(msg) + '</td></tr>';
  }

  function toolbarPanel(titulo, extra) {
    return '<div class="toolbar"><span class="item-meta" style="font-weight:600;color:var(--navy)">' + esc(titulo) + '</span>' +
      '<div class="grow"></div>' + (extra || '') + '</div>';
  }

  /* ---------- Exportação: CSV e PDF ---------- */
  function exportarCSV(nomeBase, cab, linhas) {
    const csv = [cab].concat(linhas).map((l) =>
      l.map((c) => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(';')).join('\n');
    adminDownload('\uFEFF' + csv, nomeBase + '.csv', 'text/csv');
  }

  function tabelaHTML(cab, linhas) {
    return '<table><thead><tr>' + cab.map((c) => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' +
      linhas.map((l) => '<tr>' + l.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  }

  function abrirPDF(titulo, subtitulo, corpoHtml) {
    const win = window.open('', '_blank');
    if (!win) {
      toast('Permita pop-ups deste site para exportar em PDF', 'err');
      return false;
    }
    const css = 'body{font-family:"Segoe UI",Arial,sans-serif;color:#1a2433;margin:0;padding:24px;font-size:11pt}' +
      '.head{border-bottom:3px solid #95C121;padding-bottom:10px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-end;gap:12px}' +
      '.brand{color:#002645;font-weight:700;font-size:12pt}' +
      'h1{color:#002645;font-size:18pt;margin:2px 0 0}' +
      '.sub{color:#5b6775;font-size:9.5pt}' +
      'table{width:100%;border-collapse:collapse;font-size:9.5pt;margin-top:8px}' +
      'th{background:#002645;color:#fff;text-align:left;padding:7px 9px;font-size:8.5pt;text-transform:uppercase;letter-spacing:.04em}' +
      'td{padding:7px 9px;border-bottom:1px solid #e2e8f0;vertical-align:top}' +
      'tr:nth-child(even) td{background:#f5f8fb}' +
      '.bloco{margin:14px 0}.bloco h2{color:#3261AB;font-size:12pt;margin:0 0 6px}' +
      'p{line-height:1.55;margin:4px 0;text-align:justify}' +
      'footer{margin-top:24px;border-top:1px solid #e2e8f0;padding-top:8px;font-size:8.5pt;color:#5b6775;text-align:center}' +
      '@page{size:A4;margin:14mm}';
    win.document.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>' + esc(titulo) +
      '</title><style>' + css + '</style></head><body>' +
      '<div class="head"><div><div class="brand">PastorHub · Painel administrativo</div><h1>' + esc(titulo) +
      '</h1><div class="sub">' + esc(subtitulo) + '</div></div><div class="sub">Emitido em ' +
      new Date().toLocaleDateString('pt-BR') + '</div></div>' + corpoHtml +
      '<footer>Documento gerado pelo PastorHub · uso restrito à administração</footer>' +
      '<script>window.onload=function(){window.print();};<\/script></body></html>');
    win.document.close();
    return true;
  }

  /* =========================================================
     AGENDA · Eventos
     ========================================================= */
  function eventoForm(e) {
    return fCampo('Título do evento', fTexto('ev-titulo', e ? e.titulo : '', ' placeholder="Ex: Aconselhamento · Maria Silva"')) +
      fLinha(
        fCampo('Pastor responsável', fTexto('ev-pastor', e ? e.pastor : '')),
        fCampo('Quando', fTexto('ev-quando', e ? e.quando : '', ' placeholder="Ex: Hoje, 14:00"'))) +
      fLinha(
        fCampo('Tipo', fSelect('ev-tipo', ['Atendimento', 'Visitação', 'Palestra', 'Culto', 'Reunião', 'Oração'], e ? e.tipo : 'Atendimento')),
        fCampo('Local', fSelect('ev-local', ['Presencial', 'Online', 'Casa', 'Igreja', 'Telefone'], e ? e.local : 'Presencial'))) +
      fCampo('Status', fSelect('ev-status', ['Confirmado', 'Pendente', 'Cancelado'], e ? e.status : 'Confirmado'));
  }

  function eventoLer(root) {
    const v = (id) => root.querySelector('#' + id).value.trim();
    return { titulo: v('ev-titulo'), pastor: v('ev-pastor'), quando: v('ev-quando'),
      tipo: v('ev-tipo'), local: v('ev-local'), status: v('ev-status') };
  }

  Actions['evento-novo'] = function () {
    modal({
      title: 'Novo evento', confirmLabel: 'Criar evento', body: eventoForm(null),
      onSave(root) {
        const d = eventoLer(root);
        if (!d.titulo || !d.quando) { toast('Informe o título e a data/hora', 'err'); return false; }
        state.eventos.unshift(d);
        toast('Evento criado na agenda', 'ok');
        render();
      },
    });
  };

  Actions['evento-editar'] = function (el) {
    const i = Number(el.dataset.idx);
    const e = state.eventos[i];
    if (!e) return;
    modal({
      title: 'Editar evento', confirmLabel: 'Salvar alterações', body: eventoForm(e),
      onSave(root) {
        const d = eventoLer(root);
        if (!d.titulo || !d.quando) { toast('Informe o título e a data/hora', 'err'); return false; }
        Object.assign(state.eventos[i], d);
        toast('Evento atualizado', 'ok');
        render();
      },
    });
  };

  Actions['evento-excluir'] = function (el) {
    const i = Number(el.dataset.idx);
    const e = state.eventos[i];
    if (!e) return;
    confirmAction('Excluir evento', 'Remover <b>' + esc(e.titulo) + '</b> da agenda?', () => {
      state.eventos.splice(i, 1);
      toast('Evento excluído', 'ok');
      render();
    });
  };

  /* =========================================================
     AGENDA · Atendimentos pastorais
     ========================================================= */
  function atendimentoForm(a) {
    return fLinha(
        fCampo('Nome da pessoa', fTexto('at-nome', a ? a.nome : '', ' placeholder="Ex: Maria Silva"')),
        fCampo('Pastor responsável', fTexto('at-pastor', a ? a.pastor : ''))) +
      fLinha(
        fCampo('Tipo', fSelect('at-tipo', ['Aconselhamento', 'Visitação', 'Oração', 'Discipulado'], a ? a.tipo : 'Aconselhamento')),
        fCampo('Modalidade', fSelect('at-modalidade', ['Presencial', 'Online', 'Telefone', 'Visitação'], a ? a.modalidade : 'Presencial'))) +
      fLinha(
        fCampo('Data e hora', fTexto('at-data', a ? a.data : '', ' placeholder="Ex: Hoje, 14:00"')),
        fCampo('Status', fSelect('at-status', ['Agendado', 'Concluído'], a ? a.status : 'Agendado')));
  }

  function atendimentoLer(root) {
    const v = (id) => root.querySelector('#' + id).value.trim();
    return { nome: v('at-nome'), pastor: v('at-pastor'), tipo: v('at-tipo'),
      modalidade: v('at-modalidade'), data: v('at-data'), status: v('at-status') };
  }

  Actions['at-novo'] = function () {
    modal({
      title: 'Novo atendimento', confirmLabel: 'Registrar atendimento', body: atendimentoForm(null),
      onSave(root) {
        const d = atendimentoLer(root);
        if (!d.nome || !d.data) { toast('Informe o nome e a data/hora', 'err'); return false; }
        state.atendimentos.unshift(d);
        toast('Atendimento registrado', 'ok');
        render();
      },
    });
  };

  Actions['at-editar'] = function (el) {
    const i = Number(el.dataset.idx);
    const a = state.atendimentos[i];
    if (!a) return;
    modal({
      title: 'Editar atendimento', confirmLabel: 'Salvar alterações', body: atendimentoForm(a),
      onSave(root) {
        const d = atendimentoLer(root);
        if (!d.nome || !d.data) { toast('Informe o nome e a data/hora', 'err'); return false; }
        Object.assign(state.atendimentos[i], d);
        toast('Atendimento atualizado', 'ok');
        render();
      },
    });
  };

  Actions['at-excluir'] = function (el) {
    const i = Number(el.dataset.idx);
    const a = state.atendimentos[i];
    if (!a) return;
    confirmAction('Excluir atendimento', 'Remover o atendimento de <b>' + esc(a.nome) + '</b>?', () => {
      state.atendimentos.splice(i, 1);
      toast('Atendimento excluído', 'ok');
      render();
    });
  };

  Actions['at-exportar'] = function () {
    modal({
      title: 'Exportar atendimentos',
      confirmLabel: 'Exportar',
      body:
        '<p style="font-size:.86rem;color:var(--muted);margin-bottom:14px">Serão exportados os ' + state.atendimentos.length + ' atendimentos da lista.</p>' +
        '<div class="formato-opcoes">' +
          '<label class="formato"><input type="radio" name="fmt" value="csv" checked><span><b>Planilha (CSV)</b><small>Para Excel e Google Planilhas</small></span></label>' +
          '<label class="formato"><input type="radio" name="fmt" value="pdf"><span><b>Documento (PDF)</b><small>Relatório pronto para impressão</small></span></label>' +
        '</div>',
      onSave(root) {
        const fmt = root.querySelector('input[name="fmt"]:checked').value;
        const cab = ['Pessoa', 'Pastor', 'Tipo', 'Modalidade', 'Data', 'Status'];
        const linhas = state.atendimentos.map((a) => [a.nome, a.pastor, a.tipo, a.modalidade, a.data, a.status]);
        if (fmt === 'csv') {
          exportarCSV('atendimentos-pastorhub', cab, linhas);
          toast('Planilha exportada', 'ok');
          return;
        }
        if (!abrirPDF('Atendimentos pastorais', linhas.length + ' registros', tabelaHTML(cab, linhas))) return false;
        toast('Abrindo PDF dos atendimentos', 'ok');
      },
    });
  };

  /* =========================================================
     RECURSOS · Palestras
     ========================================================= */
  function palestraForm(p) {
    return fCampo('Título da palestra', fTexto('pa-titulo', p ? p.titulo : '', ' placeholder="Ex: Fé em tempos difíceis"')) +
      fLinha(
        fCampo('Público', fSelect('pa-publico', ['Geral', 'Jovens', 'Adultos', 'Idosos', 'Famílias'], p ? p.publico : 'Geral')),
        fCampo('Duração', fTexto('pa-duracao', p ? p.duracao : '', ' placeholder="Ex: 45 min"'))) +
      fLinha(
        fCampo('Autor', fTexto('pa-autor', p ? p.autor : 'Equipe PastorHub')),
        fCampo('Status', fSelect('pa-status', ['Publicado', 'Rascunho'], p ? p.status : 'Rascunho')));
  }

  function palestraLer(root) {
    const v = (id) => root.querySelector('#' + id).value.trim();
    return { titulo: v('pa-titulo'), publico: v('pa-publico'), duracao: v('pa-duracao'),
      autor: v('pa-autor'), status: v('pa-status') };
  }

  Actions['pal-novo'] = function () {
    modal({
      title: 'Nova palestra', confirmLabel: 'Adicionar palestra', body: palestraForm(null),
      onSave(root) {
        const d = palestraLer(root);
        if (!d.titulo) { toast('Informe o título da palestra', 'err'); return false; }
        state.palestras.unshift(d);
        toast('Palestra adicionada', 'ok');
        render();
      },
    });
  };

  Actions['pal-editar'] = function (el) {
    const i = Number(el.dataset.idx);
    const p = state.palestras[i];
    if (!p) return;
    modal({
      title: 'Editar palestra', confirmLabel: 'Salvar alterações', body: palestraForm(p),
      onSave(root) {
        const d = palestraLer(root);
        if (!d.titulo) { toast('Informe o título da palestra', 'err'); return false; }
        Object.assign(state.palestras[i], d);
        toast('Palestra atualizada', 'ok');
        render();
      },
    });
  };

  Actions['pal-excluir'] = function (el) {
    const i = Number(el.dataset.idx);
    const p = state.palestras[i];
    if (!p) return;
    confirmAction('Excluir palestra', 'Remover <b>' + esc(p.titulo) + '</b> da biblioteca?', () => {
      state.palestras.splice(i, 1);
      toast('Palestra removida', 'ok');
      render();
    });
  };

  /* =========================================================
     RECURSOS · Vídeos e categorias
     ========================================================= */
  function videoForm(v) {
    const cats = state.categorias;
    return fCampo('Título do vídeo', fTexto('vd-titulo', v ? v.titulo : '', ' placeholder="Ex: Como lidar com a ansiedade"')) +
      fLinha(
        fCampo('Categoria', cats.length
          ? fSelect('vd-categoria', cats, v ? v.categoria : cats[0])
          : '<p style="font-size:.84rem;color:var(--muted)">Cadastre uma categoria antes de adicionar vídeos.</p>'),
        fCampo('Duração', fTexto('vd-duracao', v ? v.duracao : '', ' placeholder="Ex: 18 min"'))) +
      fLinha(
        fCampo('Visualizações', fTexto('vd-views', v ? v.views : 0, ' inputmode="numeric"')),
        fCampo('Status', fSelect('vd-status', ['Publicado', 'Oculto'], v ? v.status : 'Publicado')));
  }

  function videoLer(root) {
    const v = (id) => root.querySelector('#' + id).value.trim();
    return { titulo: v('vd-titulo'), categoria: v('vd-categoria'), duracao: v('vd-duracao'),
      views: parseInt(v('vd-views'), 10) || 0, status: v('vd-status') };
  }

  Actions['vid-novo'] = function () {
    if (!state.categorias.length) { toast('Cadastre uma categoria antes de adicionar vídeos', 'err'); return; }
    modal({
      title: 'Novo vídeo', confirmLabel: 'Adicionar vídeo', body: videoForm(null),
      onSave(root) {
        const d = videoLer(root);
        if (!d.titulo || !d.categoria) { toast('Informe o título e a categoria', 'err'); return false; }
        state.videos.unshift(d);
        toast('Vídeo adicionado à biblioteca', 'ok');
        render();
      },
    });
  };

  Actions['vid-editar'] = function (el) {
    const i = Number(el.dataset.idx);
    const v = state.videos[i];
    if (!v) return;
    modal({
      title: 'Editar vídeo', confirmLabel: 'Salvar alterações', body: videoForm(v),
      onSave(root) {
        const d = videoLer(root);
        if (!d.titulo || !d.categoria) { toast('Informe o título e a categoria', 'err'); return false; }
        Object.assign(state.videos[i], d);
        toast('Vídeo atualizado', 'ok');
        render();
      },
    });
  };

  Actions['vid-excluir'] = function (el) {
    const i = Number(el.dataset.idx);
    const v = state.videos[i];
    if (!v) return;
    confirmAction('Excluir vídeo', 'Remover <b>' + esc(v.titulo) + '</b> da biblioteca?', () => {
      state.videos.splice(i, 1);
      toast('Vídeo removido', 'ok');
      render();
    });
  };

  Actions['cat-novo'] = function () {
    modal({
      title: 'Nova categoria', confirmLabel: 'Criar categoria',
      body: fCampo('Nome da categoria', fTexto('ct-nome', '', ' placeholder="Ex: Casais"')),
      onSave(root) {
        const nome = root.querySelector('#ct-nome').value.trim();
        if (!nome) { toast('Informe o nome da categoria', 'err'); return false; }
        if (state.categorias.some((c) => c.toLowerCase() === nome.toLowerCase())) {
          toast('Esta categoria já existe', 'err');
          return false;
        }
        state.categorias.push(nome);
        toast('Categoria "' + nome + '" criada', 'ok');
        render();
      },
    });
  };

  Actions['cat-excluir'] = function (el) {
    const i = Number(el.dataset.idx);
    const nome = state.categorias[i];
    if (!nome) return;
    const emUso = state.videos.filter((v) => v.categoria === nome).length;
    if (emUso) {
      toast('Não é possível excluir: ' + emUso + ' vídeo(s) usam esta categoria', 'err');
      return;
    }
    confirmAction('Excluir categoria', 'Remover a categoria <b>' + esc(nome) + '</b>?', () => {
      state.categorias.splice(i, 1);
      toast('Categoria removida', 'ok');
      render();
    });
  };

  /* =========================================================
     Views
     ========================================================= */
  VIEWS.agenda = function () {
    const hoje = state.eventos.filter((e) => /^hoje/i.test(e.quando)).length;
    const agendados = state.atendimentos.filter((a) => a.status === 'Agendado').length;
    const concluidos = state.atendimentos.filter((a) => a.status === 'Concluído').length;

    const eventos = state.eventos.map((e, i) =>
      '<tr><td><div class="cell-user"><span class="avatar" style="background:var(--navy)">' + ic('calendar', 'icon-sm') + '</span>' +
        '<div><b>' + esc(e.titulo) + '</b><span>' + esc(e.pastor) + '</span></div></div></td>' +
      '<td>' + esc(e.quando) + '</td>' +
      '<td><span class="tag tag-gray">' + esc(e.tipo) + '</span></td>' +
      '<td><span class="item-meta">' + ic(e.local === 'Online' ? 'video' : 'map-pin', 'icon-sm') + ' ' + esc(e.local) + '</span></td>' +
      '<td>' + statusTag(e.status) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn btn-outline btn-sm" data-action="evento-editar" data-idx="' + i + '">' + ic('edit') + 'Editar</button>' +
        '<button class="icon-btn danger" data-action="evento-excluir" data-idx="' + i + '" title="Excluir">' + ic('trash-2') + '</button>' +
      '</div></td></tr>').join('') || semLinhas(6, 'Nenhum evento cadastrado');

    const atend = state.atendimentos.map((a, i) => {
      const modIcon = a.modalidade === 'Online' ? 'video' : a.modalidade === 'Telefone' ? 'phone' : 'map-pin';
      const modCor = a.modalidade === 'Online' ? '#7c3aed' : a.modalidade === 'Telefone' ? '#2563eb' : '#16a34a';
      return '<tr><td><div class="cell-user"><span class="avatar">' + esc(initials(a.nome)) + '</span>' +
        '<div><b>' + esc(a.nome) + '</b><span>' + esc(a.pastor) + '</span></div></div></td>' +
        '<td><span class="tag tag-gray">' + esc(a.tipo) + '</span></td>' +
        '<td><span class="item-meta" style="gap:5px"><span style="color:' + modCor + ';display:inline-flex">' + ic(modIcon, 'icon-sm') + '</span>' + esc(a.modalidade) + '</span></td>' +
        '<td style="white-space:nowrap">' + esc(a.data) + '</td>' +
        '<td>' + statusTag(a.status) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="btn btn-outline btn-sm" data-action="at-editar" data-idx="' + i + '">' + ic('edit') + 'Editar</button>' +
          '<button class="icon-btn danger" data-action="at-excluir" data-idx="' + i + '" title="Excluir">' + ic('trash-2') + '</button>' +
        '</div></td></tr>';
    }).join('') || semLinhas(6, 'Nenhum atendimento registrado');

    return '<div class="kpi-grid">' +
      kpi('Eventos hoje', hoje, state.eventos.length + ' na agenda', 'calendar', 'b-navy') +
      kpi('Eventos cadastrados', state.eventos.length, 'compromissos', 'clock', 'b-blue') +
      kpi('Atendimentos agendados', agendados, 'aguardando o encontro', 'users', 'b-lime') +
      kpi('Atendimentos concluídos', concluidos, 'registrados', 'check-circle', 'b-amber') +
      '</div>' +

      panel('Próximos eventos',
        toolbarPanel('Compromissos da agenda pastoral',
          '<button class="btn btn-primary btn-sm" data-action="evento-novo">' + ic('plus', 'icon-sm') + ' Evento</button>') +
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Evento</th><th>Quando</th><th>Tipo</th><th>Local</th><th>Status</th><th></th>' +
        '</tr></thead><tbody>' + eventos + '</tbody></table></div>',
        { flush: true, sub: 'Agenda compartilhada entre a equipe pastoral' }) +

      panel('Atendimentos pastorais',
        toolbarPanel('Fichas de acompanhamento pastoral',
          '<button class="btn btn-outline btn-sm" data-action="at-exportar">' + ic('download', 'icon-sm') + ' Exportar</button>' +
          '<button class="btn btn-primary btn-sm" data-action="at-novo">' + ic('plus', 'icon-sm') + ' Atendimento</button>') +
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Pessoa</th><th>Tipo</th><th>Modalidade</th><th>Data</th><th>Status</th><th></th>' +
        '</tr></thead><tbody>' + atend + '</tbody></table></div>',
        { flush: true, sub: 'Aconselhamento, visitação, oração e discipulado' }) +

      panel('Ocupação da semana', barList([
        { label: 'Segunda', v: 68 }, { label: 'Terça', v: 52 }, { label: 'Quarta', v: 74 },
        { label: 'Quinta', v: 61 }, { label: 'Sexta', v: 88 }, { label: 'Sábado', v: 95 }, { label: 'Domingo', v: 100 },
      ], '#95C121'), { sub: '% de agenda ocupada por dia' });
  };

  VIEWS.recursos = function () {
    const pal = state.palestras.map((p, i) =>
      '<tr><td><div class="cell-user"><span class="avatar" style="background:#a855f7">' + ic('sparkles', 'icon-sm') + '</span>' +
        '<div><b>' + esc(p.titulo) + '</b><span>' + esc(p.autor) + '</span></div></div></td>' +
      '<td><span class="tag tag-gray">' + esc(p.publico) + '</span></td>' +
      '<td><span class="item-meta">' + ic('clock', 'icon-sm') + ' ' + esc(p.duracao) + '</span></td>' +
      '<td>' + statusTag(p.status) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn btn-outline btn-sm" data-action="pal-editar" data-idx="' + i + '">' + ic('edit') + 'Editar</button>' +
        '<button class="icon-btn danger" data-action="pal-excluir" data-idx="' + i + '" title="Excluir">' + ic('trash-2') + '</button>' +
      '</div></td></tr>').join('') || semLinhas(5, 'Nenhuma palestra cadastrada');

    const vids = state.videos.map((v, i) =>
      '<tr><td><div class="cell-user">' +
        '<span class="avatar" style="background:rgba(50,97,171,.12);color:var(--blue)">' + ic('video', 'icon-sm') + '</span>' +
        '<div><b>' + esc(v.titulo) + '</b><span>' + esc(v.duracao) + '</span></div></div></td>' +
      '<td><span class="tag tag-blue">' + esc(v.categoria) + '</span></td>' +
      '<td style="text-align:center">' + Number(v.views || 0).toLocaleString('pt-BR') + '</td>' +
      '<td>' + statusTag(v.status) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn btn-outline btn-sm" data-action="vid-editar" data-idx="' + i + '">' + ic('edit') + 'Editar</button>' +
        '<button class="icon-btn danger" data-action="vid-excluir" data-idx="' + i + '" title="Excluir">' + ic('trash-2') + '</button>' +
      '</div></td></tr>').join('') || semLinhas(5, 'Nenhum vídeo cadastrado');

    const cats = state.categorias.map((c, i) =>
      '<span class="tag tag-blue cat-chip">' + esc(c) +
        '<button class="cat-del" data-action="cat-excluir" data-idx="' + i + '" title="Excluir categoria" type="button">×</button></span>').join('') ||
      '<span style="font-size:.84rem;color:var(--muted)">Nenhuma categoria cadastrada</span>';

    const publicados = state.palestras.filter((p) => p.status === 'Publicado').length;

    return '<div class="kpi-grid">' +
      kpi('Palestras', state.palestras.length, publicados + ' publicadas', 'sparkles', 'b-navy') +
      kpi('Vídeos', state.videos.length, state.videos.filter((v) => v.status === 'Publicado').length + ' publicados', 'video', 'b-blue') +
      kpi('Visualizações', state.videos.reduce((s, v) => s + (Number(v.views) || 0), 0).toLocaleString('pt-BR'), 'total da biblioteca', 'activity', 'b-purple') +
      kpi('Categorias', state.categorias.length, 'organizando a biblioteca', 'tag', 'b-lime') +
      '</div>' +

      panel('Categorias da biblioteca',
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' + cats +
          '<button class="btn btn-outline btn-sm" data-action="cat-novo">' + ic('plus', 'icon-sm') + ' Categoria</button></div>',
        { sub: 'Clique no × para excluir uma categoria sem vídeos vinculados' }) +

      panel('Palestras',
        toolbarPanel('Palestras geradas e revisadas',
          '<button class="btn btn-primary btn-sm" data-action="pal-novo">' + ic('plus', 'icon-sm') + ' Palestra</button>') +
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Palestra</th><th>Público</th><th>Duração</th><th>Status</th><th></th>' +
        '</tr></thead><tbody>' + pal + '</tbody></table></div>',
        { flush: true, sub: 'Conteúdo gerado por IA e revisado pelo pastor' }) +

      panel('Biblioteca de vídeos',
        toolbarPanel('Vídeos disponíveis para a equipe',
          '<button class="btn btn-primary btn-sm" data-action="vid-novo">' + ic('plus', 'icon-sm') + ' Vídeo</button>') +
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Vídeo</th><th>Categoria</th><th style="text-align:center">Views</th><th>Status</th><th></th>' +
        '</tr></thead><tbody>' + vids + '</tbody></table></div>',
        { flush: true, sub: 'Materiais de apoio para aconselhamento, família e juventude' });
  };

  /* ---------- Notificações ---------- */
  VIEWS.notificacoes = function () {
    const tpl = state.templates.map((t) =>
      '<tr><td><b style="color:var(--navy)">' + esc(t.nome) + '</b></td><td>' + esc(t.canal) + '</td>' +
      '<td style="text-align:center">' + t.usos.toLocaleString('pt-BR') + '</td>' +
      '<td style="text-align:center">' + switchBox(t.ativo, 'tpl-' + t.nome) + '</td>' +
      '<td><div class="row-actions"><button class="icon-btn" data-action="edit-template" data-id="' + esc(t.nome) + '" title="Editar">' + ic('edit') + '</button></div></td></tr>').join('');

    const automacoes = [
      { n: 'Atendimento próximo', d: 'Dispara 30 min antes do atendimento', on: true },
      { n: 'Novo agendamento', d: 'Notificação instantânea ao criar evento', on: true },
      { n: 'Palestra agendada', d: 'Avisa 1 dia antes', on: true },
      { n: 'Sincronização', d: 'Relatório diário de sincronização', on: false },
      { n: 'Resumo diário', d: 'Resumo enviado às 8h', on: true },
      { n: 'Horário silencioso', d: 'Silencia entre 22h e 7h', on: false },
    ];

    return '<div class="kpi-grid">' +
      kpi('Notificações (mês)', 18420, '+14% vs. outubro', 'bell', 'b-navy') +
      kpi('Taxa de abertura', '68%', '+3,2 p.p.', 'activity', 'b-lime') +
      kpi('Falhas de entrega', 96, '0,5% do total', 'alert-circle', 'b-red') +
      kpi('Templates ativos', state.templates.filter((t) => t.ativo).length, 'de ' + state.templates.length, 'file-text', 'b-blue') +
      '</div>' +

      '<div class="grid-2">' +
        panel('Templates de notificação', '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Template</th><th>Canal</th><th style="text-align:center">Envios</th><th style="text-align:center">Ativo</th><th></th>' +
          '</tr></thead><tbody>' + tpl + '</tbody></table></div>', { flush: true }) +
        panel('Automações', automacoes.map((a) =>
          '<div class="setting-row"><div><b>' + esc(a.n) + '</b><span>' + esc(a.d) + '</span></div>' +
          switchBox(a.on, 'auto-' + a.n) + '</div>').join(''), { sub: 'Regras automáticas do sistema' }) +
      '</div>' +

      panel('Campanhas recentes', '<div class="grid-3" style="margin:0">' +
        [
          { n: 'Semana de Advento', s: 'Enviada', d: '12 a 19 de dez', r: '12.400 envios' },
          { n: 'Novembro — Gratidão', s: 'Enviada', d: '01 a 30 de nov', r: '28.900 envios' },
          { n: 'Lançamento app 2.0', s: 'Agendada', d: '05 de dez', r: '9.800 contatos' },
        ].map((c) =>
          '<div style="border:1px solid var(--line);border-radius:12px;padding:16px">' +
            '<b style="color:var(--navy)">' + esc(c.n) + '</b>' +
            '<div style="font-size:.8rem;color:var(--muted);margin:4px 0 10px">' + esc(c.d) + '</div>' +
            '<div style="display:flex;align-items:center;justify-content:space-between">' +
              statusTag(c.s) + '<span style="font-size:.78rem;color:var(--muted)">' + esc(c.r) + '</span></div>' +
          '</div>').join('') + '</div>');
  };

  /* ---------- Investimento & Financeiro ---------- */
  const INV = window.INVESTIDOR;
  const MRR_MESES = [
    { m: 'Dez', v: 9800 }, { m: 'Jan', v: 12400 }, { m: 'Fev', v: 15100 }, { m: 'Mar', v: 18200 },
    { m: 'Abr', v: 21400 }, { m: 'Mai', v: 24600 }, { m: 'Jun', v: 27300 }, { m: 'Jul', v: 29800 },
    { m: 'Ago', v: 32100 }, { m: 'Set', v: 34900 }, { m: 'Out', v: 37200 }, { m: 'Nov', v: 39900 },
  ];
  const FUNIL = [
    { label: 'Visitantes no site', v: 42000, pct: '100%' },
    { label: 'Cadastros (conta criada)', v: 8000, pct: '19%' },
    { label: 'Ativação (1º sermão)', v: 5400, pct: '67%' },
    { label: 'Uso semanal (MAU)', v: 3100, pct: '57%' },
    { label: 'Conversão para Pro', v: 600, pct: '19%' },
  ];

  VIEWS.investimento = function () {
    const fin = INV.financeiro;
    const tabelaFin = '<div class="table-wrap"><table class="data"><thead><tr><th>Indicador</th><th>Ano 1</th><th>Ano 2</th><th>Ano 3</th></tr></thead><tbody>' +
      fin.linhas.map((l) => '<tr><td><b style="color:var(--navy)">' + esc(l.indicador) + '</b></td><td>' + esc(l.ano1) + '</td><td>' + esc(l.ano2) + '</td><td>' + esc(l.ano3) + '</td></tr>').join('') +
      '</tbody></table></div>';

    const usoTranches = fin.uso.map((t) =>
      '<div style="border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px">' +
          '<b style="color:var(--navy)">' + esc(t.fase) + '</b>' +
          '<span class="tag tag-lime">' + esc(t.valor) + '</span></div>' +
        t.itens.map((i) =>
          '<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-top:1px solid var(--line);font-size:.85rem">' +
            '<div><b style="color:var(--navy)">' + esc(i.nome) + '</b><div style="color:var(--muted);font-size:.78rem">' + esc(i.obj) + '</div></div>' +
            '<b style="white-space:nowrap">' + esc(i.v) + '</b></div>').join('') +
      '</div>').join('');

    return '<div class="kpi-grid">' +
      kpi('MRR', 'R$ 39,9 mil', '+7,3% m/m', 'card', 'b-lime') +
      kpi('ARR projetado', 'R$ 478 mil', 'run-rate atual', 'chart', 'b-navy') +
      kpi('CAC', 'R$ 74', 'meta: R$ 60–90', 'activity', 'b-amber') +
      kpi('LTV', 'R$ 1.412', 'ticket R$ 240 × 5,9 anos', 'users', 'b-blue') +
      kpi('LTV / CAC', '19,8×', 'acima de 3× saudável', 'zap', 'b-purple') +
      kpi('Churn anual', '15,8%', 'baixo pelo lock-in', 'history', 'b-red') +
      '</div>' +

      '<div class="grid-2">' +
        panel('Crescimento do MRR (12 meses)', areaChart(MRR_MESES), {
          sub: 'Receita recorrente mensal · crescimento orgânico + tráfego pago',
          action: '<span class="tag tag-green">+307% no período</span>',
        }) +
        panel('Funil de conversão', '<div class="bar-list">' + FUNIL.map((f, i) =>
          '<div class="bar-item"><div class="bar-top"><b>' + esc(f.label) + '</b><span>' + f.v.toLocaleString('pt-BR') + ' · ' + f.pct + '</span></div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + ((f.v / FUNIL[0].v) * 100).toFixed(1) + '%;background:' + ['#002645', '#3261AB', '#95C121', '#a855f7', '#f97316'][i] + '"></div></div></div>').join('') +
          '</div>', { sub: 'Do visitante ao assinante pagante' }) +
      '</div>' +

      '<div class="grid-2-even">' +
        panel('Projeção financeira (3 anos)', tabelaFin, { flush: true, sub: 'Cenário base da rodada semente' }) +
        panel('Unit economics', INV.unitEconomics.map((u) =>
          '<div class="setting-row"><div><b>' + esc(u.item) + '</b></div><b style="color:var(--lime-dark)">' + esc(u.valor) + '</b></div>').join(''),
          { sub: 'Margem bruta projetada acima de 85%' }) +
      '</div>' +

      '<div class="grid-2">' +
        panel('Uso do investimento · R$ 50.000', usoTranches, { sub: 'Tranche 1 (R$ 15.000) destrava os gargalos técnicos; Tranche 2 (R$ 35.000) financia o motor de vendas' }) +
        panel('Condições da captação', fin.condicoes.map((c) =>
          '<div class="setting-row"><div><b>' + esc(c.cond) + '</b><span>' + esc(c.termo) + '</span></div></div>').join(''),
          { sub: 'Instrumento, conversão, liberação e governança' }) +
      '</div>' +

      panel('Premissas do modelo', '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px">' +
        fin.premissas.map((p) => '<div style="display:flex;gap:8px;align-items:flex-start;font-size:.86rem"><span style="color:var(--lime-dark);font-weight:700">▸</span><span>' + esc(p) + '</span></div>').join('') +
        '</div>', { sub: 'Conversão, churn, ticket blended e custo de IA' });
  };

  /* ---------- Meet AI ---------- */
  const SENTIMENTOS = [
    { label: 'Confiança', v: 38, cor: '#22c55e' },
    { label: 'Equilíbrio', v: 27, cor: '#3261AB' },
    { label: 'Ansiedade', v: 24, cor: '#f59e0b' },
    { label: 'Sofrimento', v: 11, cor: '#ef4444' },
  ];
  const SESSOES_MEET = [
    { nome: 'Maria Silva', pastor: 'Marcos Vieira', data: 'Hoje, 14:00', duracao: '32 min', sentimento: 'Ansiedade', score: 42, status: 'Agendada', linhas: [
      ['Pastor', 'Maria, obrigado por estar aqui hoje. Como você está se sentindo?'],
      ['Membro', 'Pastor, tem sido um tempo difícil. Sinto muita ansiedade com o trabalho e estou com medo de falhar com a minha família.'],
      ['Membro', 'A solidão. Sinto solidão dentro de casa, mesmo com a família por perto. Acordo cansado e com dor no peito.'],
      ['Pastor', 'Solidão dentro de casa é um peso real. Vamos lembrar que a Escritura diz que Deus não deixa o seu coração só.'],
      ['Membro', 'É verdade, pastor. A minha fé me dá esperança, e quando rezo eu sinto paz e força para recomeçar.'],
    ] },
    { nome: 'João Santos', pastor: 'Marcos Vieira', data: 'Ontem, 16:00', duracao: '41 min', sentimento: 'Confiança', score: 78, status: 'Relatório gerado', linhas: [
      ['Pastor', 'João, como você tem visto a recuperação depois da cirurgia?'],
      ['Membro', 'Melhor, pastor. A família está mais forte e eu voltei a trabalhar com alegria.'],
      ['Pastor', 'Que bom ouvir isso. Vamos manter o acompanhamento semanal.'],
    ] },
    { nome: 'Ana Costa', pastor: 'Patrícia Nogueira', data: '12 Nov, 18:00', duracao: '27 min', sentimento: 'Equilíbrio', score: 61, status: 'Relatório gerado', linhas: [
      ['Pastor', 'Ana, como está a sua vida de oração?'],
      ['Membro', 'Consistente. Tenho paz para decidir sobre a mudança de cidade.'],
    ] },
    { nome: 'Pedro Oliveira', pastor: 'Jonas Lima', data: '10 Nov, 15:30', duracao: '35 min', sentimento: 'Sofrimento', score: 31, status: 'Relatório gerado', linhas: [
      ['Pastor', 'Pedro, como você está lidando com a culpa?'],
      ['Membro', 'Ainda pesando. Sinto desespero e tristeza toda noite.'],
      ['Membro', 'Preciso de ajuda para sair dessa dor.'],
    ] },
    { nome: 'Carla Mendes', pastor: 'Camila Duarte', data: '09 Nov, 09:00', duracao: '29 min', sentimento: 'Confiança', score: 81, status: 'Relatório gerado', linhas: [
      ['Pastor', 'Carla, como vocês estão cuidando do casamento?'],
      ['Membro', 'Melhor do que nunca. Voltamos a orar juntos e a gratidão virou nossa palavra.'],
    ] },
  ];

  const PICO_POR_SESSAO = {
    'Maria Silva': ['ansiedade', 'medo', 'solidão', 'dor'],
    'João Santos': ['esperança', 'gratidão'],
    'Ana Costa': ['paz', 'esperança'],
    'Pedro Oliveira': ['culpa', 'desespero', 'tristeza'],
    'Carla Mendes': ['gratidão', 'amor'],
  };

  VIEWS.meetai = function () {
    const rows = SESSOES_MEET.map((s) =>
      '<tr><td><div class="cell-user"><span class="avatar">' + initials(s.nome) + '</span><div><b>' + esc(s.nome) + '</b><span>' + esc(s.pastor) + '</span></div></div></td>' +
      '<td>' + esc(s.data) + '</td><td>' + esc(s.duracao) + '</td>' +
      '<td><span class="tag ' + (s.score >= 70 ? 'tag-green' : s.score >= 55 ? 'tag-blue' : s.score >= 40 ? 'tag-amber' : 'tag-red') + '">' + esc(s.sentimento) + ' · ' + s.score + '%</span></td>' +
      '<td>' + statusTag(s.status) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="icon-btn" data-action="meet-transcript" data-id="' + esc(s.nome) + '" title="Ver transcrição">' + ic('file-text') + '</button>' +
        '<button class="icon-btn" data-action="meet-report" data-id="' + esc(s.nome) + '" title="Abrir relatório">' + ic('eye') + '</button>' +
        '<button class="icon-btn" data-action="meet-pdf" data-id="' + esc(s.nome) + '" title="Exportar em PDF">' + ic('file-text') + '</button>' +
        '<button class="icon-btn" data-action="meet-download" data-id="' + esc(s.nome) + '" title="Baixar relatório (.md)">' + ic('download') + '</button>' +
      '</div></td></tr>').join('');

    const relatorios = SESSOES_MEET.filter((s) => s.status === 'Relatório gerado');

    return '<div class="kpi-grid">' +
      kpi('Sessões (mês)', 412, '+18% vs. outubro', 'video', 'b-navy') +
      kpi('Horas de aconselhamento', 186, 'transcritas', 'clock', 'b-blue') +
      kpi('Relatórios gerados', 388, '92% das sessões', 'file-text', 'b-lime') +
      kpi('Custo por sessão', 'R$ 0,31', 'transcrição + análise', 'card', 'b-amber') +
      '</div>' +

      '<div class="grid-2-even">' +
        panel('Distribuição de sentiment', donutChart(SENTIMENTOS, 'sessões', '100%') +
          '<div class="chart-legend">' + SENTIMENTOS.map((s) => '<span><i class="legend-dot" style="background:' + s.cor + '"></i>' + esc(s.label) + ' · ' + s.v + '%</span>').join('') + '</div>',
          { sub: 'Leitura emocional do aconselhamento (IA)' }) +
        panel('Picos emocionais mais frequentes', barList([
          { label: 'Ansiedade', v: 184, cor: '#f59e0b' },
          { label: 'Solidão', v: 141, cor: '#a855f7' },
          { label: 'Culpa', v: 118, cor: '#ef4444' },
          { label: 'Medo do futuro', v: 96, cor: '#3261AB' },
          { label: 'Cansaço', v: 74, cor: '#94a3b8' },
        ], '#a855f7'), { sub: 'Temas que exigem acompanhamento contínuo' }) +
      '</div>' +

      panel('Sessões de aconselhamento', '<div class="table-wrap"><table class="data"><thead><tr>' +
        '<th>Membro</th><th>Quando</th><th>Duração</th><th>Sentimento</th><th>Status</th><th></th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>',
        { flush: true, sub: 'Use os botões para abrir a transcrição, revisar o relatório ou baixá-lo' }) +

      panel('Relatórios confidenciais gerados', '<div class="module-grid">' +
        relatorios.map((s) =>
          '<div class="module-card"><div class="m-top">' +
            '<span class="m-icon">' + ic('file-text') + '</span>' +
            '<div><b>' + esc(s.nome) + '</b><span>' + esc(s.data) + ' · ' + esc(s.duracao) + '</span></div></div>' +
            '<div class="m-foot"><span class="tag ' + (s.score >= 70 ? 'tag-green' : s.score >= 40 ? 'tag-amber' : 'tag-red') + '">' + esc(s.sentimento) + ' · ' + s.score + '%</span>' +
            '<span style="display:flex;gap:5px">' +
              '<button class="icon-btn" data-action="meet-report" data-id="' + esc(s.nome) + '" title="Ver relatório">' + ic('eye') + '</button>' +
              '<button class="icon-btn" data-action="meet-pdf" data-id="' + esc(s.nome) + '" title="Exportar em PDF">' + ic('file-text') + '</button>' +
              '<button class="icon-btn" data-action="meet-download" data-id="' + esc(s.nome) + '" title="Baixar (.md)">' + ic('download') + '</button>' +
            '</span></div></div>').join('') +
        '</div>', { sub: 'Documentos cifrados — acesso restrito ao pastor titular' }) +

      panel('Privacidade e LGPD (Meet AI)', [
        { n: 'Relatórios cifrados', v: 'AES-256 em repouso na nuvem' },
        { n: 'Anonimização', v: 'Relatórios identificados apenas pelo pastor titular' },
        { n: 'Consentimento', v: 'Registro de aceite antes de iniciar a sessão' },
        { n: 'Portabilidade', v: 'Exportação e exclusão a qualquer momento pelo app' },
        { n: 'Retenção', v: 'Exclusão automática em 90 dias sem atividade' },
      ].map((r) => '<div class="setting-row"><div><b>' + esc(r.n) + '</b><span>' + esc(r.v) + '</span></div><span class="tag tag-green">Ativo</span></div>').join(''),
        { sub: 'Dado de saúde/crença tratado com o maior cuidado' });
  };

  /* ---------- Ações do Meet AI ---------- */
  function meetSessao(nome) {
    return SESSOES_MEET.find((s) => s.nome === nome);
  }

  function meetRelatorioTexto(s) {
    const picos = PICO_POR_SESSAO[s.nome] || [];
    return [
      '# Relatório confidencial — ' + s.nome,
      '',
      '- **Pastor:** ' + s.pastor,
      '- **Data:** ' + s.data,
      '- **Duração:** ' + s.duracao,
      '- **Sentimento geral:** ' + s.sentimento + ' (' + s.score + '% de confiança)',
      '- **Angústias detectadas:** ' + (picos.join(', ') || '—'),
      '',
      '## 1. Transcrição integral',
      '',
      s.linhas.map((l) => '**' + l[0] + ':** ' + l[1]).join('\n\n'),
      '',
      '## 2. Picos emocionais',
      '',
      picos.length ? picos.map((p) => '- ' + p).join('\n') : '- Nenhum pico relevante.',
      '',
      '## 3. Orientações pastorais sugeridas',
      '',
      '- Manter contato semanal entre os encontros',
      '- Trabalhar o versículo combinado durante a semana',
      '- Incluir a família no plano de cuidado',
      '- Registrar a evolução na próxima sessão',
      '',
      '---',
      'PastorHub · Conselho (Meet AI) · documento privado do pastor · LGPD',
    ].join('\n');
  }

  Actions['meet-transcript'] = function (el) {
    const s = meetSessao(el.dataset.id);
    if (!s) return;
    modal({
      title: 'Transcrição · ' + s.nome,
      confirmLabel: 'Fechar',
      body:
        '<div class="info-box blue" style="margin:0 0 14px"><div>🎙️</div><div><strong>' + esc(s.data) + ' · ' + esc(s.duracao) + '</strong> Transcrição automática do Google Meet, com identificação de turnos.</div></div>' +
        '<div style="max-height:340px;overflow:auto">' +
          s.linhas.map((l) =>
            '<div style="padding:9px 12px;border-radius:8px;margin-bottom:7px;background:' + (l[0] === 'Pastor' ? '#eef4ff' : '#f0fdf4') + '">' +
              '<b style="font-size:.78rem;color:' + (l[0] === 'Pastor' ? 'var(--blue)' : '#15803d') + '">' + esc(l[0]) + '</b>' +
              '<p style="font-size:.87rem;color:#33404f;margin-top:3px">' + esc(l[1]) + '</p></div>').join('') +
        '</div>',
    });
  };

  Actions['meet-report'] = function (el) {
    const s = meetSessao(el.dataset.id);
    if (!s) return;
    const picos = PICO_POR_SESSAO[s.nome] || [];
    modal({
      title: 'Relatório · ' + s.nome,
      confirmLabel: 'Baixar (.md)',
      body:
        '<span class="tag tag-red">Documento confidencial</span>' +
        '<h4 style="margin:10px 0 4px;font-size:1.1rem;color:var(--navy)">' + esc(s.nome) + '</h4>' +
        '<p style="font-size:.82rem;color:var(--muted);margin-bottom:14px">' + esc(s.data) + ' · ' + esc(s.duracao) + ' · ' + esc(s.pastor) + '</p>' +
        '<div class="setting-row" style="border:none;padding:6px 0"><div><b>Sentimento geral</b></div>' +
          '<span class="tag ' + (s.score >= 70 ? 'tag-green' : s.score >= 55 ? 'tag-blue' : s.score >= 40 ? 'tag-amber' : 'tag-red') + '">' + esc(s.sentimento) + ' · ' + s.score + '%</span></div>' +
        '<div class="setting-row" style="border:none;padding:6px 0"><div><b>Angústias detectadas</b></div><span>' + esc(picos.join(', ') || '—') + '</span></div>' +
        '<hr class="sep" style="margin:12px 0">' +
        '<h4 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:var(--navy);margin-bottom:8px">Transcrição</h4>' +
        '<div style="max-height:180px;overflow:auto;margin-bottom:14px">' +
          s.linhas.map((l) => '<p style="font-size:.85rem;margin-bottom:6px"><b style="color:' + (l[0] === 'Pastor' ? 'var(--blue)' : '#15803d') + '">' + esc(l[0]) + ':</b> ' + esc(l[1]) + '</p>').join('') +
        '</div>' +
        '<h4 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:var(--navy);margin-bottom:8px">Orientações pastorais</h4>' +
        '<ul style="font-size:.85rem;color:#33404f;padding-left:1.1rem">' +
          '<li>Manter contato semanal entre os encontros</li>' +
          '<li>Trabalhar o versículo combinado durante a semana</li>' +
          '<li>Incluir a família no plano de cuidado</li>' +
          '<li>Registrar a evolução na próxima sessão</li>' +
        '</ul>',
      onSave() {
        adminDownload(meetRelatorioTexto(s), 'relatorio-conselho-' + s.nome.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.md', 'text/markdown');
        toast('Relatório baixado', 'ok');
      },
    });
    const root = $('#admin-modal-root');
    const foot = root.querySelector('.modal-foot');
    if (foot) {
      const extra = document.createElement('button');
      extra.className = 'btn btn-outline';
      extra.textContent = 'Baixar (.txt)';
      extra.addEventListener('click', () => {
        adminDownload(meetRelatorioTexto(s).replace(/[#*]/g, ''), 'relatorio-conselho-' + s.nome.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.txt', 'text/plain');
        toast('Relatório baixado em TXT', 'ok');
      });
      foot.insertBefore(extra, foot.lastElementChild);
      const pdf = document.createElement('button');
      pdf.className = 'btn btn-primary';
      pdf.innerHTML = ic('file-text', 'icon-sm') + 'Exportar PDF';
      pdf.addEventListener('click', () => {
        if (abrirPdfRelatorio(s)) toast('Abrindo PDF do relatório de ' + s.nome, 'ok');
      });
      foot.insertBefore(pdf, foot.lastElementChild);
    }
  };

  function abrirPdfRelatorio(s) {
    const picos = PICO_POR_SESSAO[s.nome] || [];
    const corpo =
      '<div class="bloco"><table><tbody>' +
        '<tr><th style="width:30%">Membro</th><td>' + esc(s.nome) + '</td></tr>' +
        '<tr><th>Pastor responsável</th><td>' + esc(s.pastor) + '</td></tr>' +
        '<tr><th>Data e duração</th><td>' + esc(s.data) + ' · ' + esc(s.duracao) + '</td></tr>' +
        '<tr><th>Sentimento geral</th><td>' + esc(s.sentimento) + ' (' + s.score + '% de confiança)</td></tr>' +
        '<tr><th>Angústias detectadas</th><td>' + esc(picos.join(', ') || '—') + '</td></tr>' +
      '</tbody></table></div>' +
      '<div class="bloco"><h2>1. Transcrição integral</h2>' +
        s.linhas.map((l) => '<p><b>' + esc(l[0]) + ':</b> ' + esc(l[1]) + '</p>').join('') + '</div>' +
      '<div class="bloco"><h2>2. Picos emocionais</h2><ul>' +
        (picos.length ? picos.map((p) => '<li>' + esc(p) + '</li>').join('') : '<li>Nenhum pico relevante.</li>') +
      '</ul></div>' +
      '<div class="bloco"><h2>3. Orientações pastorais sugeridas</h2><ul>' +
        '<li>Manter contato semanal entre os encontros</li>' +
        '<li>Trabalhar o versículo combinado durante a semana</li>' +
        '<li>Incluir a família no plano de cuidado</li>' +
        '<li>Registrar a evolução na próxima sessão</li>' +
      '</ul></div>';
    return abrirPDF('Relatório confidencial · ' + s.nome, 'Conselho (Meet AI) · documento privado do pastor · LGPD', corpo);
  }

  Actions['meet-pdf'] = function (el) {
    const s = meetSessao(el.dataset.id);
    if (!s) return;
    if (abrirPdfRelatorio(s)) toast('Abrindo PDF do relatório de ' + s.nome, 'ok');
  };

  Actions['meet-download'] = function (el) {
    const s = meetSessao(el.dataset.id);
    if (!s) return;
    adminDownload(meetRelatorioTexto(s), 'relatorio-conselho-' + s.nome.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.md', 'text/markdown');
    toast('Relatório de ' + s.nome + ' baixado', 'ok');
  };

  /* ---------- WhatsApp ---------- */
  VIEWS.whatsapp = function () {
    const rows = [
      { nome: 'Maria Silva', tipo: 'Aconselhamento', quando: 'Hoje, 14:00', status: 'Confirmado', res: '1', hora: '13:05' },
      { nome: 'João Santos', tipo: 'Visitação', quando: 'Hoje, 16:00', status: 'Enviado', res: '—', hora: '12:10' },
      { nome: 'Ana Costa', tipo: 'Oração', quando: 'Amanhã, 10:00', status: 'Enviado', res: '—', hora: 'Ontem, 18:22' },
      { nome: 'Carla Mendes', tipo: 'Aconselhamento', quando: '31 Out, 09:00', status: 'Confirmado', res: '1', hora: '30 Out, 17:40' },
      { nome: 'Pedro Oliveira', tipo: 'Aconselhamento', quando: '29 Out, 15:30', status: 'Falhou', res: '—', hora: '29 Out, 13:00' },
    ].map((l) =>
      '<tr><td><div class="cell-user"><span class="avatar" style="background:#22c55e">' + initials(l.nome) + '</span><div><b>' + esc(l.nome) + '</b><span>' + esc(l.tipo) + '</span></div></div></td>' +
      '<td>' + esc(l.quando) + '</td>' +
      '<td>' + statusTag(l.status) + '</td><td style="text-align:center">' + esc(l.res) + '</td>' +
      '<td style="font-size:.8rem;color:var(--muted)">' + esc(l.hora) + '</td>' +
      '<td><div class="row-actions"><button class="icon-btn" data-action="toast" data-msg="Lembrete reenviado">' + ic('refresh-cw') + '</button>' +
      '<button class="icon-btn" data-action="toast" data-msg="Conversa aberta no WhatsApp">' + ic('message') + '</button></div></td></tr>').join('');

    const templates = [
      { nome: 'Lembrete de atendimento', canal: 'Template aprovado', envios: 2140, ativo: true },
      { nome: 'Confirmação de presença', canal: 'Template aprovado', envios: 1860, ativo: true },
      { nome: 'Visitação pastoral', canal: 'Template aprovado', envios: 940, ativo: true },
      { nome: 'Oração e palavra', canal: 'Não aprovado', envios: 0, ativo: false },
    ];

    return '<div class="kpi-grid">' +
      kpi('Mensagens (mês)', 3240, '+22% vs. outubro', 'message', 'b-lime') +
      kpi('Taxa de entrega', '96,8%', '3.240 enviadas', 'activity', 'b-navy') +
      kpi('Confirmadas', 91, '71% de resposta', 'check-circle', 'b-blue') +
      kpi('Faltas reduzidas', '38%', 'antes x. depois do bot', 'users', 'b-amber') +
      '</div>' +

      '<div class="grid-2">' +
        panel('Remetentes e respostas', '<div style="display:flex;flex-direction:column;gap:12px">' +
          '<div><div class="bar-top" style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:5px"><b>Enviados</b><span>3.240</span></div><div class="bar-track"><div class="bar-fill" style="width:100%;background:#3261AB"></div></div></div>' +
          '<div><div class="bar-top" style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:5px"><b>Entregues</b><span>3.136 · 96,8%</span></div><div class="bar-track"><div class="bar-fill" style="width:96.8%;background:#95C121"></div></div></div>' +
          '<div><div class="bar-top" style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:5px"><b>Confirmados</b><span>2.304 · 71%</span></div><div class="bar-track"><div class="bar-fill" style="width:71%;background:#22c55e"></div></div></div>' +
          '<div><div class="bar-top" style="display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:5px"><b>Falhas</b><span>104 · 3,2%</span></div><div class="bar-track"><div class="bar-fill" style="width:3.2%;background:#ef4444"></div></div></div>' +
          '</div>', { sub: 'Funil de lembretes no mês' }) +
        panel('Modelo de mensagem', '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px;font-size:.86rem;line-height:1.6">' +
          '<div style="display:flex;gap:8px;margin-bottom:10px"><span class="avatar" style="background:#22c55e;width:26px;height:26px;font-size:.62rem">PH</span>' +
          '<span style="font-weight:600;color:var(--navy)">PastorHub · Pastor</span></div>' +
          'Olá {{nome}}! Passando para lembrar do seu atendimento pastoral hoje às {{hora}} no {{local}}. Responda 1 para confirmar. Deus abençoe!' +
          '<div style="margin-top:12px;display:flex;justify-content:flex-end"><span style="background:#fff;border:1px solid #bbf7d0;border-radius:10px;padding:6px 10px;font-size:.82rem">1</span></div>' +
          '</div>' +
          '<div style="font-size:.8rem;color:var(--muted);margin-top:10px">Resposta "1" atualiza automaticamente o status do atendimento para <b>Confirmado</b> no app.</div>',
          { sub: 'Template principal aprovado pela Meta' }) +
      '</div>' +

      panel('Lembretes enviados', '<div class="table-wrap"><table class="data"><thead><tr>' +
        '<th>Membro</th><th>Quando</th><th>Status</th><th style="text-align:center">Resposta</th><th>Envio</th><th></th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>', { flush: true }) +

      panel('Templates do bot', '<div class="table-wrap"><table class="data"><thead><tr>' +
        '<th>Template</th><th>Canal</th><th style="text-align:center">Envios</th><th style="text-align:center">Ativo</th>' +
        '</tr></thead><tbody>' + templates.map((t) =>
        '<tr><td><b style="color:var(--navy)">' + esc(t.nome) + '</b></td><td>' + esc(t.canal) + '</td>' +
        '<td style="text-align:center">' + t.envios.toLocaleString('pt-BR') + '</td>' +
        '<td style="text-align:center">' + switchBox(t.ativo, 'wa-' + t.nome) + '</td></tr>').join('') +
        '</tbody></table></div>', { flush: true, sub: 'Templates exigem aprovação prévia da Meta Business' });
  };

  /* ---------- Configurações ---------- */
  const CFG_KEY = 'pastorhub_config_admin';

  function carregarConfig() {
    const padrao = {
      nome: 'PastorHub · Caderno do Pastor',
      cores: '#002645 · #3261AB · #95C121',
      email: 'contato@pastorhub.app',
      dominio: 'pastorhub.app',
      link: 'pastorhub.app/app',
    };
    try {
      const s = JSON.parse(localStorage.getItem(CFG_KEY));
      return s ? Object.assign({}, padrao, s) : padrao;
    } catch (e) { return padrao; }
  }

  function salvarConfig(cfg) {
    try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) {}
  }

  VIEWS.configuracoes = function () {
    const cfg = carregarConfig();
    return '<div class="grid-2">' +
      panel('Aparência do painel', [
        { n: 'Tema escuro', v: 'Alterna a interface do painel administrativo' },
        { n: 'Densidade da interface', v: 'Confortável (padrão)' },
        { n: 'Idioma', v: 'Português (BR)' },
      ].map((r, i) =>
        '<div class="setting-row"><div><b>' + esc(r.n) + '</b><span>' + esc(r.v) + '</span></div>' +
        (i === 0
          ? '<span class="switch"><input type="checkbox" data-admin-tema' + (document.body.classList.contains('theme-dark') ? ' checked' : '') + '><span class="track"></span><span class="thumb"></span></span>'
          : '<span class="tag tag-gray">' + (i === 1 ? 'Confortável' : 'PT-BR') + '</span>') +
        '</div>').join(''),
        { sub: 'Preferências visuais do painel' }) +

      panel('Identidade da plataforma', [
        { chave: 'nome', n: 'Nome do produto', v: cfg.nome },
        { chave: 'cores', n: 'Cores da marca', v: cfg.cores },
        { chave: 'email', n: 'E-mail de suporte', v: cfg.email },
        { chave: 'dominio', n: 'Domínio do site', v: cfg.dominio },
        { chave: 'link', n: 'Link do aplicativo', v: cfg.link },
      ].map((r) =>
        '<div class="setting-row"><div><b>' + esc(r.n) + '</b><span>' + esc(r.v) + '</span></div>' +
        '<button class="btn btn-outline btn-sm" data-action="edit-config" data-key="' + r.chave + '" data-label="' + esc(r.n) + '" type="button">' + ic('edit') + ' Editar</button></div>').join(''),
        { sub: 'Dados exibidos no app e no site' }) +
      panel('Segurança', [
        { n: 'Exigir verificação de e-mail', v: 'Ativo para novos cadastros' },
        { n: 'Autenticação em duas etapas', v: 'Disponível para administradores' },
        { n: 'Sessões simultâneas', v: '3 dispositivos por conta' },
        { n: 'Exclusão de conta', v: 'Automatizada em 30 dias' },
        { n: 'Registros de acesso', v: 'Retenção de 180 dias' },
      ].map((r) =>
        '<div class="setting-row"><div><b>' + esc(r.n) + '</b><span>' + esc(r.v) + '</span></div>' +
        '<span class="tag tag-green">Ativo</span></div>').join(''),
        { sub: 'Controles de acesso e privacidade' }) +
      '</div>' +

      panel('Feature flags', state.flags.map((f) =>
        '<div class="setting-row"><div><b>' + esc(f.chave) + '</b><span>' + esc(f.desc) + '</span></div>' +
        switchBox(f.on, 'flag-' + f.chave) + '</div>').join(''),
        { sub: 'Ative ou desative módulos para toda a plataforma' }) +

      panel('Backup e dados', '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn-primary btn-sm" data-action="backup">' + ic('download') + 'Exportar backup completo</button>' +
        '<button class="btn btn-outline btn-sm" data-action="toast" data-msg="Importação de backup iniciada">' + ic('upload') + 'Importar backup</button>' +
        '<button class="btn btn-outline btn-sm" data-action="toast" data-msg="Logs limpos com sucesso">' + ic('trash-2') + 'Limpar logs antigos</button>' +
        '<button class="btn btn-danger btn-sm" data-action="toast" data-msg="Cache global limpo">' + ic('refresh-cw') + 'Limpar cache</button>' +
        '</div>', { sub: 'Rotinas de manutenção da plataforma' });
  };

  Actions['edit-config'] = function (el) {
    const cfg = carregarConfig();
    const key = el.dataset.key;
    const label = el.dataset.label;
    const tipo = key === 'cores' ? 'text' : 'text';
    modal({
      title: 'Editar · ' + label,
      confirmLabel: 'Salvar alteração',
      body:
        '<div class="field"><label>' + esc(label) + '</label>' +
          '<input id="cfg-valor" type="' + tipo + '" value="' + esc(cfg[key]) + '"></div>' +
        (key === 'cores'
          ? '<div class="info-box blue" style="margin:0"><div>🎨</div><div>Informe as três cores separadas por “·”. Exemplo: <code>#002645 · #3261AB · #95C121</code></div></div>'
          : '') +
        '<div class="field" style="margin-bottom:0"><label>Pré-visualização</label>' +
          '<div id="cfg-preview" style="padding:12px 14px;border:1px solid var(--line);border-radius:9px;background:var(--soft);font-size:.87rem">' +
            esc(cfg[key]) + '</div></div>',
      onSave(root) {
        const valor = root.querySelector('#cfg-valor').value.trim();
        if (!valor) { toast('Informe um valor', 'err'); return false; }
        cfg[key] = valor;
        salvarConfig(cfg);
        toast(label + ' atualizado', 'ok');
        render();
      },
    });
    // pré-visualização ao digitar
    const input = document.getElementById('cfg-valor');
    const prev = document.getElementById('cfg-preview');
    if (input && prev) {
      input.addEventListener('input', () => { prev.textContent = input.value; });
      setTimeout(() => input.focus(), 60);
    }
  };


  /* ================= MINHA CONTA ================= */
  function avatarPerfil(p, extra) {
    return '<span class="perfil-avatar' + (extra ? ' ' + extra : '') + (p.avatar ? ' avatar-img' : '') + '">' +
      (p.avatar
        ? '<img src="' + esc(p.avatar) + '" alt="Foto de ' + esc(p.nome) + '">'
        : esc(initials(p.nome))) +
    '</span>';
  }

  function dadoPerfil(icone, rotulo, valor) {
    const vazio = !valor;
    return '<div class="perfil-dado">' + ic(icone) +
      '<div><b>' + esc(rotulo) + '</b>' +
      '<span' + (vazio ? ' class="perfil-vazio"' : '') + '>' + esc(vazio ? 'Não informado' : valor) + '</span></div>' +
    '</div>';
  }

  function switchPerfil(id, ativo) {
    return '<span class="switch"><input type="checkbox" id="' + id + '"' + (ativo ? ' checked' : '') + '>' +
      '<span class="track"></span><span class="thumb"></span></span>';
  }

  VIEWS.perfil = function () {
    const p = sessao.perfil || perfilDe(sessao.conta);
    const papel = p.papel === 'admin' ? 'Administrador' : 'Usuário comum';
    const origem = p.origem === 'google' ? 'Conta Google' : 'E-mail e senha';

    return '<div class="perfil-hero">' +
        avatarPerfil(p, 'perfil-avatar-lg') +
        '<div class="perfil-hero-info">' +
          '<h2>' + esc(p.nome) + '</h2>' +
          '<p>' + esc(p.email) + '</p>' +
          '<div class="perfil-badges">' +
            '<span class="tag ' + (p.papel === 'admin' ? 'tag-green' : 'tag-gray') + '">' + ic('shield') + ' ' + esc(papel) + '</span>' +
            '<span class="tag tag-gray">' + esc(origem) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="perfil-hero-acoes">' +
          '<button class="btn btn-primary btn-sm" data-section="perfil-config" type="button">' + ic('edit') + 'Editar perfil</button>' +
          '<button class="btn btn-danger btn-sm" data-action="sair" type="button">' + ic('log-out') + 'Sair do painel</button>' +
        '</div>' +
      '</div>' +

      '<div class="grid-2-even">' +
        panel('Dados do perfil', '<div class="perfil-dados">' +
          dadoPerfil('mail', 'E-mail de acesso', p.email) +
          dadoPerfil('phone', 'Telefone / WhatsApp', p.telefone) +
          dadoPerfil('home', 'Igreja', p.igreja) +
          dadoPerfil('user', 'Cargo na igreja', p.cargo) +
          dadoPerfil('map-pin', 'Cidade', p.cidade) +
          dadoPerfil('calendar', 'Membro desde', dataBr(p.desde)) +
        '</div>', { sub: 'Informações exibidas para a equipe da plataforma' }) +

        panel('Sobre esta sessão',
          '<div class="setting-row"><div><b>Papel na plataforma</b><span>' + esc(papel) + '</span></div>' +
            '<span class="tag ' + (p.papel === 'admin' ? 'tag-green' : 'tag-gray') + '">' + (p.papel === 'admin' ? 'Admin' : 'Usuário') + '</span></div>' +
          '<div class="setting-row"><div><b>Forma de acesso</b><span>' + esc(origem) + '</span></div>' +
            '<span class="tag tag-gray">' + (p.origem === 'google' ? 'Google' : 'E-mail') + '</span></div>' +
          '<div class="setting-row"><div><b>Último acesso</b><span>Sessão atual neste dispositivo</span></div>' +
            '<span class="tag tag-green">Agora</span></div>',
          { sub: 'Conta autenticada neste dispositivo' }) +
      '</div>' +

      panel('Sobre mim', '<p class="perfil-bio">' +
        esc(p.bio || 'Conte um pouco sobre o seu ministério. Essa descrição aparece no seu perfil e pode ser editada a qualquer momento.') +
        '</p>', { sub: 'Biografia do perfil' }) +

      panel('Segurança e encerramento', '<div class="perfil-acoes-form" style="margin-top:0">' +
        '<button class="btn btn-outline" data-section="perfil-config" type="button">' + ic('settings') + 'Configurações do perfil</button>' +
        '<button class="btn btn-danger" data-action="sair" type="button">' + ic('log-out') + 'Sair do painel</button>' +
      '</div>', { sub: 'Encerrar a sessão volta para a tela de login' });
  };

  VIEWS['perfil-config'] = function () {
    const p = sessao.perfil || perfilDe(sessao.conta);
    return '<div class="grid-2">' +
        panel('Dados pessoais',
          '<div class="field-row">' +
            '<div class="field"><label for="perfil-nome">Nome completo</label>' +
              '<input id="perfil-nome" type="text" value="' + esc(p.nome) + '" placeholder="Seu nome"></div>' +
            '<div class="field"><label for="perfil-email">E-mail de acesso</label>' +
              '<input id="perfil-email" type="email" value="' + esc(p.email) + '" disabled></div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field"><label for="perfil-tel">Telefone / WhatsApp</label>' +
              '<input id="perfil-tel" type="tel" value="' + esc(p.telefone) + '" placeholder="(00) 00000-0000"></div>' +
            '<div class="field"><label for="perfil-cidade">Cidade</label>' +
              '<input id="perfil-cidade" type="text" value="' + esc(p.cidade) + '" placeholder="Cidade / UF"></div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field"><label for="perfil-igreja">Igreja</label>' +
              '<input id="perfil-igreja" type="text" value="' + esc(p.igreja) + '" placeholder="Nome da igreja"></div>' +
            '<div class="field"><label for="perfil-cargo">Cargo na igreja</label>' +
              '<input id="perfil-cargo" type="text" value="' + esc(p.cargo) + '" placeholder="Pastor titular, auxiliar..."></div>' +
          '</div>' +
          '<div class="field"><label for="perfil-bio">Sobre mim</label>' +
            '<textarea id="perfil-bio" rows="4" placeholder="Conte um pouco sobre o seu ministério...">' + esc(p.bio) + '</textarea></div>' +
          '<div class="perfil-acoes-form">' +
            '<button class="btn btn-primary" data-action="salvar-perfil-admin" type="button">' + ic('save') + 'Salvar alterações</button>' +
            '<button class="btn btn-outline" data-section="perfil" type="button">Cancelar</button>' +
          '</div>',
          { sub: 'O e-mail de acesso é gerenciado pela plataforma' }) +

        panel('Foto de perfil',
          '<div class="perfil-foto-box">' +
            '<span id="perfil-foto-preview">' + avatarPerfil(p, 'perfil-avatar-lg') + '</span>' +
            '<div class="field" style="width:100%"><label for="perfil-foto">Selecionar imagem</label>' +
              '<input id="perfil-foto" type="file" accept="image/png,image/jpeg,image/webp"></div>' +
            '<p class="perfil-dica">JPG, PNG ou WEBP. A imagem é recortada em formato quadrado e salva apenas neste dispositivo.</p>' +
            (p.avatar
              ? '<button class="btn btn-outline btn-sm" data-action="remover-foto-admin" type="button">' + ic('trash-2') + 'Remover foto</button>'
              : '') +
          '</div>',
          { sub: 'Sua foto aparece no menu lateral' }) +
      '</div>' +

      panel('Preferências de notificação', [
        { id: 'perfil-notif-email', n: 'Alertas por e-mail', v: 'Novos usuários, pagamentos e avisos da plataforma', on: p.notifEmail },
        { id: 'perfil-notif-resumo', n: 'Resumo semanal', v: 'Um e-mail por semana com os principais indicadores', on: p.notifResumo },
        { id: 'perfil-notif-push', n: 'Notificações no navegador', v: 'Avisos em tempo real neste dispositivo', on: p.notifPush },
      ].map((r) =>
        '<div class="setting-row"><div><b>' + esc(r.n) + '</b><span>' + esc(r.v) + '</span></div>' +
        switchPerfil(r.id, r.on) + '</div>').join(''),
        { sub: 'Escolha como deseja ser avisado' }) +

      panel('Segurança da conta',
        '<div class="setting-row"><div><b>Forma de acesso</b><span>' +
          (p.origem === 'google' ? 'Conta Google vinculada' : 'E-mail e senha cadastrados') +
        '</span></div><span class="tag tag-green">Ativa</span></div>' +
        '<div class="setting-row"><div><b>Encerrar sessão</b><span>Saia do painel e volte para a tela de login</span></div>' +
          '<button class="btn btn-danger btn-sm" data-action="sair" type="button">' + ic('log-out') + 'Sair do painel</button></div>',
        { sub: 'Proteja o acesso ao painel' });
  };

  /* ---------- Ações do perfil ---------- */
  function redimensionarImagem(file, lado) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => {
        const img = new Image();
        img.onload = () => {
          const menor = Math.min(img.width, img.height);
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = lado;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, (img.width - menor) / 2, (img.height - menor) / 2, menor, menor, 0, 0, lado, lado);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('imagem inválida'));
        img.src = leitor.result;
      };
      leitor.onerror = () => reject(new Error('falha ao ler o arquivo'));
      leitor.readAsDataURL(file);
    });
  }

  function ligarFormPerfil() {
    const input = document.getElementById('perfil-foto');
    if (!input) return;
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      redimensionarImagem(file, 320).then((url) => {
        if (!salvarPerfil({ avatar: url })) return;
        toast('Foto de perfil atualizada', 'ok');
        render();
      }).catch(() => toast('Não foi possível carregar a imagem', 'err'));
    });
  }

  Actions['salvar-perfil-admin'] = function () {
    const valor = (id, vazio) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : (vazio || '');
    };
    const nome = valor('perfil-nome');
    if (!nome) { toast('Informe o seu nome completo', 'err'); return; }
    const ok = salvarPerfil({
      nome,
      telefone: valor('perfil-tel'),
      igreja: valor('perfil-igreja'),
      cargo: valor('perfil-cargo'),
      cidade: valor('perfil-cidade'),
      bio: valor('perfil-bio'),
      notifEmail: document.getElementById('perfil-notif-email').checked,
      notifResumo: document.getElementById('perfil-notif-resumo').checked,
      notifPush: document.getElementById('perfil-notif-push').checked,
    });
    if (!ok) return;
    toast('Perfil atualizado com sucesso', 'ok');
    render();
  };

  Actions['remover-foto-admin'] = function () {
    if (!salvarPerfil({ avatar: '' })) return;
    toast('Foto removida — voltando às iniciais', 'ok');
    render();
  };

  async function sairDoPainel() {
    if (authReal()) await PastorAuth.sair();
    sessao.conta = null;
    sessao.perfil = null;
    state.section = 'overview';
    $('#admin-app').hidden = true;
    $('#admin-login').hidden = false;
    document.body.classList.remove('painel-ativo');
    const form = document.getElementById('login-form');
    if (form) form.reset();
    aplicarSessao(CONTAS[0], Object.assign({}, PERFIL_PADRAO, { nome: CONTAS[0].nome }));
    const av = document.querySelector('.aside-foot .avatar');
    if (av) av.textContent = 'AD';
    toast('Sessão encerrada com segurança', 'ok');
    window.scrollTo(0, 0);
  }

  Actions['sair'] = function () {
    if (!sessao.conta) return;
    const p = sessao.perfil || perfilDe(sessao.conta);
    confirmAction('Sair do painel', 'Encerrar a sessão de <b>' + esc(p.nome) + '</b>? Você voltará para a tela de login.', sairDoPainel);
  };

  /* ================= RENDER ================= */
  function renderNav() {
    const html = secoesPermitidas().map((s) => {
      if (s.group) return '<div class="nav-label">' + esc(s.group) + '</div>';
      if (s.action) {
        return '<button class="nav-danger" data-action="' + esc(s.action) + '" type="button">' +
          ic(s.icon) + '<span>' + esc(s.label) + '</span></button>';
      }
      return '<button class="' + (state.section === s.id ? 'active' : '') + '" data-section="' + s.id + '">' +
        ic(s.icon) + '<span>' + esc(s.label) + '</span>' +
        (s.count ? '<span class="count">' + s.count() + '</span>' : '') + '</button>';
    }).join('');
    $('#admin-nav').innerHTML = html;

    /* barra inferior do painel no celular */
    const mnav = document.getElementById('mobile-nav');
    if (mnav) {
      const rapidas = ['overview', 'usuarios', 'planos', 'rag', 'versiculos'];
      mnav.innerHTML = secoesPermitidas().filter((s) => s.id && rapidas.includes(s.id)).map((s) =>
        '<button class="' + (state.section === s.id ? 'active' : '') + '" data-section="' + s.id + '" type="button">' +
          ic(s.icon) + '<span>' + esc(s.label.split(' ')[0].replace('&', '')) + '</span></button>').join('');
    }
  }

  function render() {
    persistirEstado();
    // Seção removida do menu ou sem permissão volta para a visão geral.
    if (!secoesPermitidas().some((s) => s.id === state.section)) state.section = 'overview';
    renderNav();
    const view = VIEWS[state.section] || VIEWS.overview;
    $('#page-title').textContent = TITLES[state.section] || 'Painel';
    $('#admin-content').innerHTML = view();
    if (state.section === 'perfil-config') ligarFormPerfil();
    $('#admin-aside').classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  /* ================= EVENTOS ================= */
  document.addEventListener('click', (e) => {
    const secBtn = e.target.closest('[data-section]');
    if (secBtn) {
      state.section = secBtn.dataset.section;
      render();
      return;
    }

    const action = e.target.closest('[data-action]');
    if (!action) return;
    const a = action.dataset.action;

    /* --- usuários --- */
    if (a === 'user-filter') { state.userFilter = action.dataset.filter; render(); return; }
    if (a === 'toggle-user') {
      const u = state.users.find((x) => x.email === action.dataset.id);
      if (u) { u.status = u.status === 'Ativo' ? 'Suspenso' : 'Ativo'; toast(u.status === 'Ativo' ? 'Usuário reativado' : 'Usuário suspenso', u.status === 'Ativo' ? 'ok' : ''); render(); }
      return;
    }
    if (a === 'del-user') {
      const u = state.users.find((x) => x.email === action.dataset.id);
      confirmAction('Excluir usuário', 'Remover <b>' + esc(u.nome) + '</b> e todos os dados vinculados?', () => {
        state.users = state.users.filter((x) => x.email !== action.dataset.id);
        toast('Usuário excluído', 'ok'); render();
      });
      return;
    }
    if (a === 'edit-user' || a === 'new-user') {
      const u = a === 'edit-user' ? state.users.find((x) => x.email === action.dataset.id) : null;
      modal({
        title: u ? 'Editar usuário' : 'Novo usuário',
        confirmLabel: u ? 'Salvar alterações' : 'Criar usuário',
        body:
          '<div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:18px">' +
            '<span class="avatar" id="user-avatar-preview" style="width:72px;height:72px;font-size:1.3rem;flex-shrink:0;' + (u ? 'background:' + u.cor : 'background:var(--navy)') + '">' +
              (u && u.avatar ? '<img src="' + u.avatar + '" alt="Foto">' : esc(u ? initials(u.nome) : 'NP')) + '</span>' +
            '<div style="flex:1">' +
              '<div class="field" style="margin-bottom:8px"><label>Foto de perfil</label>' +
                '<input id="user-foto" type="file" accept="image/*"></div>' +
              '<button class="btn btn-outline btn-sm" type="button" id="btn-remover-foto">' + ic('trash-2', 'icon-sm') + 'Remover foto</button>' +
            '</div>' +
          '</div>' +
          '<div class="field"><label>Nome completo</label><input id="f-nome" value="' + esc(u ? u.nome : '') + '" placeholder="Ex: Pastor Marcos Vieira"></div>' +
          '<div class="field-row">' +
            '<div class="field"><label>E-mail</label><input id="f-email" type="email" value="' + esc(u ? u.email : '') + '" placeholder="pastor@igreja.com"></div>' +
            '<div class="field"><label>Telefone / WhatsApp</label><input id="f-tel" value="' + esc(u ? u.telefone || '' : '') + '" placeholder="(00) 00000-0000"></div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field"><label>Igreja</label><input id="f-igreja" value="' + esc(u ? u.igreja : '') + '"></div>' +
            '<div class="field"><label>Cidade</label><input id="f-cidade" value="' + esc(u ? u.cidade : '') + '"></div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field"><label>Plano</label><select id="f-plano">' +
              ['Offline', 'Premium', 'Igreja'].map((p) => '<option' + (u && u.plano === p ? ' selected' : '') + '>' + p + '</option>').join('') + '</select></div>' +
            '<div class="field"><label>Status</label><select id="f-status">' +
              ['Ativo', 'Em análise', 'Suspenso', 'Inativo'].map((p) => '<option' + (u && u.status === p ? ' selected' : '') + '>' + p + '</option>').join('') + '</select></div>' +
          '</div>' +
          '<div class="field"><label>Uso da conta</label><input id="f-metricas" value="' + esc(u ? u.sermoes + ' sermões · ' + u.atendimentos + ' atendimentos' : '0 sermões · 0 atendimentos') + '" disabled></div>' +
          '<div class="field"><label>Observações internas</label><textarea id="f-notas" rows="3" placeholder="Anotações da equipe pastoral...">' + esc(u ? (u.notas || '') : '') + '</textarea></div>',
        onSave(root) {
          const nome = root.querySelector('#f-nome').value.trim();
          const email = root.querySelector('#f-email').value.trim();
          if (!nome || !email) { toast('Preencha nome e e-mail', 'err'); return false; }
          const previewImg = root.querySelector('#user-avatar-preview img');
          const dados = {
            nome, email,
            igreja: root.querySelector('#f-igreja').value,
            cidade: root.querySelector('#f-cidade').value,
            plano: root.querySelector('#f-plano').value,
            status: root.querySelector('#f-status').value,
            telefone: root.querySelector('#f-tel').value,
            notas: root.querySelector('#f-notas').value,
            avatar: previewImg ? previewImg.src : (u && u.avatar ? u.avatar : ''),
          };
          if (u) {
            Object.assign(u, dados);
            toast('Usuário atualizado', 'ok');
          } else {
            state.users.unshift({
              ...dados, sermoes: 0, atendimentos: 0, acesso: 'Nunca', cor: '#3261AB',
            });
            toast('Usuário criado', 'ok');
          }
          render();
        },
      });

      // upload da foto com pré-visualização
      const input = document.getElementById('user-foto');
      const preview = document.getElementById('user-avatar-preview');
      if (input && preview) {
        input.addEventListener('change', () => {
          const file = input.files && input.files[0];
          if (!file) return;
          lerImagemRedimensionada(file).then((url) => {
            preview.classList.add('avatar-img');
            preview.innerHTML = '<img src="' + url + '" alt="Foto">';
            toast('Foto carregada — salve para confirmar', 'ok');
          }).catch((err) => toast(err.message || 'Erro ao carregar a foto', 'err'));
        });
        const remover = document.getElementById('btn-remover-foto');
        if (remover) remover.addEventListener('click', () => {
          preview.classList.remove('avatar-img');
          preview.innerHTML = esc(u ? initials(u.nome) : 'NP');
          preview.style.background = u ? u.cor : 'var(--navy)';
          input.value = '';
          toast('Foto removida — salve para confirmar');
        });
      }
      return;
    }
    if (a === 'export-users') {
      const cab = ['Nome', 'E-mail', 'Igreja', 'Cidade', 'Plano', 'Sermões', 'Atendimentos', 'Status', 'Último acesso'];
      const linhas = state.users.map((u) => [u.nome, u.email, u.igreja, u.cidade, u.plano, u.sermoes, u.atendimentos, u.status, u.acesso]);
      const csv = [cab].concat(linhas)
        .map((l) => l.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\n');
      adminDownload('﻿' + csv, 'usuarios-pastorhub.csv', 'text/csv');
      toast('CSV exportado com ' + linhas.length + ' usuários', 'ok');
      return;
    }

    /* --- conteúdo --- */
    if (a === 'content-filter') { state.contentFilter = action.dataset.filter; render(); return; }
    if (a === 'toggle-content') {
      const c = state.content.find((x) => x.titulo === action.dataset.id);
      if (c) { c.status = c.status === 'Publicado' ? 'Oculto' : 'Publicado'; toast('Status de "' + c.titulo + '" → ' + c.status, 'ok'); render(); }
      return;
    }
    if (a === 'del-content') {
      const c = state.content.find((x) => x.titulo === action.dataset.id);
      confirmAction('Excluir sermão', 'Remover <b>' + esc(c.titulo) + '</b> da plataforma?', () => {
        state.content = state.content.filter((x) => x.titulo !== action.dataset.id);
        toast('Sermão excluído', 'ok'); render();
      });
      return;
    }
    if (a === 'new-content' || a === 'edit-content') {
      const c = a === 'edit-content' ? state.content.find((x) => x.titulo === action.dataset.id) : null;
      modal({
        title: c ? 'Editar sermão' : 'Novo sermão',
        confirmLabel: c ? 'Salvar alterações' : 'Criar e enviar para revisão',
        body:
          '<div class="info-box blue" style="margin:0 0 16px"><div>📝</div><div><strong>Preencha a estrutura do sermão</strong> ' +
            'O painel monta automaticamente o documento formatado (introdução, exposição, aplicação e conclusão) usado na impressão em PDF.</div></div>' +
          '<div class="field"><label>Título da mensagem</label><input id="c-titulo" value="' + esc(c ? c.titulo : '') + '" placeholder="Ex: A fé que transforma montanhas"></div>' +
          '<div class="field-row">' +
            '<div class="field"><label>Referência bíblica</label><input id="c-ref" value="' + esc(c ? c.ref : '') + '" placeholder="Ex: Mateus 17:20"></div>' +
            '<div class="field"><label>Tema central</label><input id="c-tema" value="' + esc(c ? c.tema : '') + '" placeholder="Ex: Fé"></div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field"><label>Tipo de mensagem</label><select id="c-tipo">' +
              ['Expositivo', 'Temático', 'Textual', 'Narrativo', 'Evangelístico'].map((t) => '<option' + (c && c.tipo === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
            '<div class="field"><label>Público-alvo</label><select id="c-publico">' +
              ['Geral', 'Igreja Local', 'Jovens', 'Adultos', 'Idosos', 'Crianças', 'Não Crentes'].map((t) => '<option' + (c && c.publico === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
          '</div>' +
          '<div class="field"><label>Autor / pastor</label><input id="c-autor" value="' + esc(c ? c.autor : '') + '" placeholder="Ex: Pr. Marcos Vieira"></div>' +
          '<hr class="sep" style="margin:6px 0 16px">' +
          '<h4 style="font-size:.82rem;text-transform:uppercase;letter-spacing:.06em;color:var(--navy);margin-bottom:10px">Estrutura do sermão</h4>' +
          '<div class="field"><label>1 · Introdução — contexto e hook</label><textarea id="c-intro" rows="2" placeholder="Como abrir a mensagem e conectar com o público...">' + esc(c ? (c.secoes || {}).intro || '' : '') + '</textarea></div>' +
          '<div class="field"><label>2 · Primeiro ponto — exposição bíblica</label><textarea id="c-p1" rows="2" placeholder="Ideia principal, texto de apoio e aplicação...">' + esc(c ? (c.secoes || {}).p1 || '' : '') + '</textarea></div>' +
          '<div class="field"><label>3 · Segundo ponto — aplicação prática</label><textarea id="c-p2" rows="2" placeholder="Como o texto se aplica à vida da igreja e da família...">' + esc(c ? (c.secoes || {}).p2 || '' : '') + '</textarea></div>' +
          '<div class="field"><label>4 · Terceiro ponto — chamado e exhortação</label><textarea id="c-p3" rows="2" placeholder="Convocação final e exhortação pastoral...">' + esc(c ? (c.secoes || {}).p3 || '' : '') + '</textarea></div>' +
          '<div class="field"><label>5 · Conclusão e oração</label><textarea id="c-fim" rows="2" placeholder="Fechamento e oração final...">' + esc(c ? (c.secoes || {}).fim || '' : '') + '</textarea></div>' +
          '<div class="field"><label>Referências cruzadas</label><input id="c-refs" value="' + esc(c ? (c.secoes || {}).refs || 'Hebreus 11:1 · Romanos 10:17 · Tiago 1:6' : 'Hebreus 11:1 · Romanos 10:17 · Tiago 1:6') + '"></div>' +
          '<div class="field-row">' +
            '<div class="field"><label>Origem</label><select id="c-origem">' +
              '<option value="ia">Gerado com IA</option><option value="manual"' + (c && !c.ia ? ' selected' : '') + '>Digitado pelo autor</option></select></div>' +
            '<div class="field"><label>Publicação</label><select id="c-status">' +
              ['Publicado', 'Em revisão', 'Oculto'].map((t) => '<option' + (c && c.status === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
          '</div>',
        onSave(root) {
          const titulo = root.querySelector('#c-titulo').value.trim();
          const ref = root.querySelector('#c-ref').value.trim();
          if (!titulo || !ref) { toast('Informe título e referência bíblica', 'err'); return false; }
          const secoes = {
            intro: root.querySelector('#c-intro').value.trim(),
            p1: root.querySelector('#c-p1').value.trim(),
            p2: root.querySelector('#c-p2').value.trim(),
            p3: root.querySelector('#c-p3').value.trim(),
            fim: root.querySelector('#c-fim').value.trim(),
            refs: root.querySelector('#c-refs').value.trim(),
          };
          const corpo = '<h2>' + esc(titulo) + '</h2>' +
            (secoes.intro ? '<h3>Introdução</h3><p>' + esc(secoes.intro) + '</p>' : '') +
            (secoes.p1 ? '<h3>Primeiro ponto</h3><p>' + esc(secoes.p1) + '</p>' : '') +
            (secoes.p2 ? '<h3>Segundo ponto</h3><p>' + esc(secoes.p2) + '</p>' : '') +
            (secoes.p3 ? '<h3>Terceiro ponto</h3><p>' + esc(secoes.p3) + '</p>' : '') +
            (secoes.fim ? '<h3>Conclusão</h3><p>' + esc(secoes.fim) + '</p>' : '') +
            (secoes.refs ? '<h3>Referências cruzadas</h3><ul>' + secoes.refs.split(/\s*·\s*/).map((r) => '<li>' + esc(r) + '</li>').join('') + '</ul>' : '');

          if (c) {
            c.titulo = titulo; c.ref = ref; c.tema = root.querySelector('#c-tema').value;
            c.tipo = root.querySelector('#c-tipo').value;
            c.publico = root.querySelector('#c-publico').value;
            c.autor = root.querySelector('#c-autor').value;
            c.status = root.querySelector('#c-status').value;
            c.ia = root.querySelector('#c-origem').value === 'ia';
            c.secoes = secoes; c.conteudo = corpo;
            toast('Sermão atualizado', 'ok');
          } else {
            state.content.unshift({
              titulo, ref, tema: root.querySelector('#c-tema').value,
              tipo: root.querySelector('#c-tipo').value,
              publico: root.querySelector('#c-publico').value,
              autor: root.querySelector('#c-autor').value || 'Admin',
              status: root.querySelector('#c-status').value,
              ia: root.querySelector('#c-origem').value === 'ia',
              views: 0, data: 'Hoje', secoes, conteudo: corpo,
            });
            toast('Sermão criado e enviado para revisão', 'ok');
          }
          render();
        },
      });
      return;
    }
    if (a === 'export-content') { toast('Conteúdo exportado', 'ok'); return; }

    /* --- feature flags e switches (tratados no listener de 'change') --- */

    if (a === 'backup') { toast('Backup completo gerado', 'ok'); return; }
    if (a === 'toast') { toast(action.dataset.msg || 'Ação executada', 'ok'); return; }

    // ações registradas em Actions[...]
    const fn = Actions[a];
    if (fn) fn(action);
  });

  /* busca em tempo real */
  document.addEventListener('input', (e) => {
    if (e.target.id === 'user-q') { state.userQuery = e.target.value; renderContentOnly(); }
    if (e.target.id === 'content-q') { state.contentQuery = e.target.value; renderContentOnly(); }
  });

  /* ---------- Switches (tema, feature flags, templates) ---------- */
  document.addEventListener('change', (e) => {
    const el = e.target;

    if (el.dataset && el.dataset.adminTema !== undefined) {
      const novo = el.checked ? 'escuro' : 'claro';
      localStorage.setItem(TEMA_ADMIN, novo);
      aplicarTemaAdmin(novo);
      toast('Tema ' + novo + ' ativado no painel', 'ok');
      render();
      return;
    }

    if (el.dataset && el.dataset.flag) {
      const chave = el.dataset.flag;
      const flag = state.flags.find((f) => 'flag-' + f.chave === chave);
      if (flag) {
        flag.on = el.checked;
        toast('Flag "' + flag.chave + '" = ' + (flag.on ? 'ativa' : 'inativa'), 'ok');
      } else if (chave.startsWith('tpl-')) {
        const nome = chave.slice(4);
        const t = state.templates.find((x) => x.nome === nome);
        if (t) { t.ativo = el.checked; toast('Template "' + nome + '" ' + (t.ativo ? 'ativado' : 'desativado'), 'ok'); }
      }
      return;
    }

    if (el.dataset && el.dataset.waTpl) {
      const t = state.templates.find((x) => x.nome === el.dataset.waTpl);
      if (t) { t.ativo = el.checked; toast('Template "' + t.nome + '" ' + (t.ativo ? 'ativado' : 'desativado'), 'ok'); }
    }
  });

  function renderContentOnly() {
    const scrollY = window.scrollY;
    $('#admin-content').innerHTML = (VIEWS[state.section] || VIEWS.overview)();
    window.scrollTo(0, scrollY);
  }

  /* login */
  function realizarLogin(conta, origem) {
    sessao.conta = conta;
    sessao.perfil = perfilDe(conta);
    aplicarSessao(conta);
    $('#admin-login').hidden = true;
    $('#admin-app').hidden = false;
    document.body.classList.add('painel-ativo');
    render();
    if (origem === 'google') {
      toast('Conectado com Google · ' + sessao.perfil.nome, 'ok');
    } else if (conta.papel === 'admin') {
      toast('Bem-vindo ao painel administrativo', 'ok');
    } else {
      toast('Bem-vinda, ' + sessao.perfil.nome + ' · acesso de usuário comum', 'ok');
    }
  }

  $('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#adm-email').value.trim().toLowerCase().replace(/\s+/g, '');
    if (!email) {
      toast('Informe o e-mail.', 'err');
      return;
    }
    /* com Supabase configurado, autentica de verdade e exige papel admin */
    if (authReal()) {
      loginRealPainel(email, $('#adm-senha').value);
      return;
    }
    /* login demo: não há senhas reais no painel estático — só o e-mail identifica a conta */
    const conta = CONTAS.find((c) => c.email === email);
    if (!conta) {
      toast('E-mail não encontrado (modo demo).', 'err');
      return;
    }
    if (conta.origem === 'google') {
      toast('Esta conta entra com Google. Use "Continuar com Google".', 'err');
      return;
    }
    /* qualquer senha (ou nenhuma) é aceita neste modo de demonstração */
    realizarLogin(conta);
  });

  /* login social: com Supabase configurado é OAuth real; sem config, fluxo demo */
  const btnGoogle = document.getElementById('btn-google');
  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      if (authReal()) {
        PastorAuth.entrarGoogle().then((r) => { if (!r.ok) toast(r.erro, 'err'); });
        return;
      }
      const conta = CONTAS.find((c) => c.origem === 'google');
      if (!conta) return;
      btnGoogle.disabled = true;
      btnGoogle.classList.add('loading');
      /* simula a janela de consentimento do Google */
      setTimeout(() => {
        btnGoogle.disabled = false;
        btnGoogle.classList.remove('loading');
        realizarLogin(conta, 'google');
      }, 700);
    });
  }

  /* preenchimento rápido das contas de demonstração (evita erro de digitação) */
  document.querySelectorAll('[data-login-rapido]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const conta = CONTAS.find((c) => !c.origem &&
        (btn.dataset.loginRapido === 'admin' ? c.papel === 'admin' : c.papel !== 'admin'));
      if (!conta) return;
      realizarLogin(conta);
    });
  });

  /* Com auth real: esconde o login rápido demo e restaura sessão existente (exige admin) */
  function restaurarSessaoReal() {
    if (!authReal()) return;
    const quick = document.querySelector('.login-quick');
    if (quick) quick.hidden = true;
    PastorAuth.onAuthStateChange((_e, session) => {
      if (!session) sairDoPainel();
    });
    PastorAuth.sessaoAtual().then((session) => {
      const conta = contaDaSessao(session);
      if (!conta) return;
      if (conta.papel !== 'admin') {
        PastorAuth.sair();
        toast('Esta conta não tem permissão de administrador.', 'err');
        return;
      }
      realizarLogin(conta);
    });
  }
  restaurarSessaoReal();

  $('#refresh-btn').addEventListener('click', () => { render(); toast('Dados atualizados', 'ok'); });
  $('#menu-btn').addEventListener('click', () => {
    const aberto = $('#admin-aside').classList.toggle('open');
    document.body.classList.toggle('nav-open', aberto);
  });
  const backdrop = document.getElementById('aside-backdrop');
  if (backdrop) backdrop.addEventListener('click', () => {
    $('#admin-aside').classList.remove('open');
    document.body.classList.remove('nav-open');
  });

  /* ---------- Tema claro/escuro do painel ---------- */
  const TEMA_ADMIN = 'pastorhub_tema_admin';

  function aplicarTemaAdmin(tema) {
    document.body.classList.toggle('theme-dark', tema === 'escuro');
    document.documentElement.style.colorScheme = tema === 'escuro' ? 'dark' : 'light';
    const ic = document.getElementById('theme-icon');
    if (ic) {
      ic.innerHTML = tema === 'escuro'
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
    const btn = document.getElementById('theme-btn');
    if (btn) btn.title = tema === 'escuro' ? 'Mudar para tema claro' : 'Mudar para tema escuro';
  }

  aplicarTemaAdmin(localStorage.getItem(TEMA_ADMIN) || 'claro');
  $('#theme-btn').addEventListener('click', () => {
    const novo = document.body.classList.contains('theme-dark') ? 'claro' : 'escuro';
    localStorage.setItem(TEMA_ADMIN, novo);
    aplicarTemaAdmin(novo);
    toast(novo === 'escuro' ? 'Tema escuro ativado no painel' : 'Tema claro ativado no painel', 'ok');
  });

  /* ---------- Busca global ao vivo ---------- */
  const buscaInput = $('#global-search');
  const buscaPop = $('#search-pop');

  function buscarNoPainel(q) {
    const termo = q.trim().toLowerCase();
    if (termo.length < 2) return [];

    const res = [];
    state.users.forEach((u) => {
      if ((u.nome + ' ' + u.email + ' ' + u.igreja).toLowerCase().includes(termo)) {
        if (ehAdmin()) res.push({ grupo: 'Usuários', icone: 'users', titulo: u.nome, sub: u.email, ir: () => { state.section = 'usuarios'; state.userQuery = u.nome; render(); } });
      }
    });
    state.content.forEach((c) => {
      if ((c.titulo + ' ' + c.autor + ' ' + c.tema).toLowerCase().includes(termo)) {
        res.push({ grupo: 'Conteúdo', icone: 'book-open', titulo: c.titulo, sub: c.autor + ' · ' + c.tipo, ir: () => { state.section = 'conteudo'; state.contentQuery = c.titulo; render(); } });
      }
    });
    SESSOES_MEET.forEach((s) => {
      if ((s.nome + ' ' + s.pastor).toLowerCase().includes(termo)) {
        res.push({ grupo: 'Conselho (Meet AI)', icone: 'video', titulo: s.nome, sub: s.data + ' · ' + s.sentimento, ir: () => { state.section = 'meetai'; render(); } });
      }
    });
    DB.integracoes.forEach((i) => {
      if (i.nome.toLowerCase().includes(termo)) {
        if (ehAdmin()) res.push({ grupo: 'Integrações', icone: 'zap', titulo: i.nome, sub: i.desc, ir: () => { state.section = 'integracoes'; render(); } });
      }
    });
    return res.slice(0, 10);
  }

  function renderBusca(q) {
    const res = buscarNoPainel(q);
    if (q.trim().length < 2) { buscaPop.hidden = true; buscaPop.innerHTML = ''; return; }
    buscaPop.hidden = false;
    if (!res.length) {
      buscaPop.innerHTML = '<div class="sp-empty">Nenhum resultado para “' + esc(q) + '”</div>';
      return;
    }
    let html = '';
    let grupoAtual = '';
    res.forEach((r, i) => {
      if (r.grupo !== grupoAtual) { grupoAtual = r.grupo; html += '<div class="sp-group">' + esc(grupoAtual) + '</div>'; }
      html += '<button class="sp-item" data-sp="' + i + '">' +
        '<span class="sp-icon">' + ic(r.icone) + '</span>' +
        '<span style="flex:1;min-width:0"><b>' + esc(r.titulo) + '</b><br><span>' + esc(r.sub) + '</span></span></button>';
    });
    buscaPop.innerHTML = html;
    buscaPop.querySelectorAll('[data-sp]').forEach((b) => {
      b.addEventListener('click', () => {
        res[Number(b.dataset.sp)].ir();
        buscaInput.value = '';
        buscaPop.hidden = true;
      });
    });
  }

  buscaInput.addEventListener('input', (e) => renderBusca(e.target.value));
  buscaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { buscaInput.value = ''; buscaPop.hidden = true; }
    if (e.key === 'Enter') {
      const res = buscarNoPainel(e.target.value);
      if (res.length) { res[0].ir(); buscaInput.value = ''; buscaPop.hidden = true; }
      else toast('Nenhum resultado encontrado', 'err');
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.admin-search')) buscaPop.hidden = true;
  });
  /* Internos expostos para os módulos admin-ai.js (Integrações e Base de conhecimento) */
  window.AdminAPI = { VIEWS, state, render, modal, confirmAction, toast, kpi, panel, esc, initials, statusTag, switchBox, Actions };
})();
