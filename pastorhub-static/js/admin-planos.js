/* ============================================================
   Planos & Assinaturas — modelo de negócio
   Planos Offline / Pro / Igreja (valores conforme os
   documentos do projeto: Pro R$ 49,90 · Igreja R$ 149,90),
   faturamento recorrente, gateways de pagamento (Mercado Pago,
   Pagar.me, Stripe, PagSeguro, Asaas e Pix direto), Pix
   recorrente e bloqueio de acesso por pendência financeira.
   ============================================================ */
(function () {
  const api = window.AdminAPI;
  if (!api) return;
  const { VIEWS, state, modal, confirmAction, toast, kpi, panel, esc, statusTag, Actions } = api;
  const ic = (n, c) => window.icon(n, c);

  const K_PLANOS = 'pastorhub_admin_planos';
  const K_ASS = 'pastorhub_admin_assinaturas';
  const K_FAT = 'pastorhub_faturamento';
  const K_GW = 'pastorhub_gateways';
  const K_PIX = 'pastorhub_pix';

  /* ================= PLANOS (valores dos documentos) ================= */
  const PRECOS_DOCS = { premium: { mensal: 49.9, anual: 598.8 }, igreja: { mensal: 149.9, anual: 1499 } };
  const PRECOS_LEGADO = { premium: { mensal: 29.9, anual: 299 }, igreja: { mensal: 199, anual: 1990 } };

  const PLANOS_PADRAO = [
    {
      id: 'offline', nome: 'Offline', precoMensal: 0, precoAnual: 0, cor: '#64748b', destaque: false,
      desc: 'Uso local e gratuito — porta de entrada',
      recursos: ['Dados salvos no dispositivo', 'Caderno do Pastor completo', 'Exportação TXT e PDF', 'Agenda e atendimentos locais'],
      limites: { sermoes: 200, atendimentos: 500, assentos: 1, agentes: 0, storageMB: 50 },
    },
    {
      id: 'premium', nome: 'Premium', precoMensal: PRECOS_DOCS.premium.mensal, precoAnual: PRECOS_DOCS.premium.anual, cor: '#95C121', destaque: true,
      desc: 'Pro — para o pastor individual',
      recursos: ['Tudo do Offline', 'Assistente de estudo (RAG + OCR)', '3 agentes de IA treináveis', 'Conselho (Meet AI) com relatórios', 'Lembretes via WhatsApp', 'Backup na nuvem'],
      limites: { sermoes: 5000, atendimentos: 5000, assentos: 1, agentes: 3, storageMB: 512 },
    },
    {
      id: 'igreja', nome: 'Igreja', precoMensal: PRECOS_DOCS.igreja.mensal, precoAnual: PRECOS_DOCS.igreja.anual, cor: '#3261AB', destaque: false,
      desc: 'Multi-usuário para toda a igreja',
      recursos: ['Tudo do Premium para cada pastor', 'Até 10 assentos de pastor', 'Agentes de IA por ministério', 'Painel administrativo da igreja', 'Suporte prioritário', 'Onboarding assistido'],
      limites: { sermoes: 20000, atendimentos: 20000, assentos: 10, agentes: 10, storageMB: 2048 },
    },
  ];

  function lerPlanos() {
    let lista = null;
    try {
      const v = JSON.parse(localStorage.getItem(K_PLANOS));
      if (Array.isArray(v) && v.length) lista = v;
    } catch (e) {}
    if (!lista) {
      const padrao = JSON.parse(JSON.stringify(PLANOS_PADRAO));
      salvarPlanos(padrao);
      return padrao;
    }
    /* migração: preços antigos do seed → valores documentados */
    Object.keys(PRECOS_LEGADO).forEach((id) => {
      const p = lista.find((x) => x.id === id);
      const leg = PRECOS_LEGADO[id];
      const doc = PRECOS_DOCS[id];
      if (p && p.precoMensal === leg.mensal && p.precoAnual === leg.anual) {
        p.precoMensal = doc.mensal;
        p.precoAnual = doc.anual;
      }
    });
    salvarPlanos(lista);
    return lista;
  }
  function salvarPlanos(p) { try { localStorage.setItem(K_PLANOS, JSON.stringify(p)); } catch (e) {} }

  const planos = () => lerPlanos();
  function planoPorNome(nome) {
    return lerPlanos().find((p) => p.nome === nome) || lerPlanos()[0];
  }
  function formatar(v) {
    return v > 0 ? 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Grátis';
  }

  /* ================= DATAS ================= */
  function dataAddDias(dias) {
    const d = new Date(); d.setDate(d.getDate() + dias);
    return d.toLocaleDateString('pt-BR');
  }
  function parseData(s) {
    const p = String(s || '').split('/');
    if (p.length !== 3) return null;
    const d = new Date(+p[2], +p[1] - 1, +p[0]);
    return isNaN(d) ? null : d;
  }
  function fmtData(d) { return d.toLocaleDateString('pt-BR'); }
  function proximaPorVencimento(dia) {
    const hoje = new Date();
    const dd = Math.min(Math.max(parseInt(dia, 10) || 5, 1), 28);
    let alvo = new Date(hoje.getFullYear(), hoje.getMonth(), dd);
    if (alvo < hoje) alvo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, dd);
    return fmtData(alvo);
  }
  function diasEntre(a, b) { return Math.round((b - a) / 86400000); }

  /* ================= ASSINATURAS ================= */
  function lerAssinaturas() {
    let v = null;
    try {
      const x = JSON.parse(localStorage.getItem(K_ASS));
      if (x && typeof x === 'object') v = x;
    } catch (e) {}
    if (!v) v = {};
    /* migração de status e campos novos */
    let mudou = false;
    Object.keys(v).forEach((email) => {
      const a = v[email];
      if (a.statusCobranca === 'Cancelada') {
        a.statusCobranca = 'Bloqueada';
        a.pendencia = a.pendencia || { valor: a.valor, desde: a.proxima, motivo: 'Cancelamento convertido em bloqueio por pendência' };
        a.bloqueadaEm = a.bloqueadaEm || a.proxima;
        mudou = true;
      }
      if (a.statusCobranca === 'Atrasada') {
        a.statusCobranca = 'Pendente';
        a.pendenteDesde = a.pendenteDesde || a.proxima;
        mudou = true;
      }
      if (a.vencimento == null) { a.vencimento = 5; mudou = true; }
      if (a.recorrente == null) { a.recorrente = true; mudou = true; }
      if (!a.gateway) { a.gateway = 'Mercado Pago'; mudou = true; }
      if (a.metodo === 'Cartão') { a.metodo = 'Cartão recorrente'; mudou = true; }
      if (a.metodo === 'Pix') { a.metodo = 'Pix recorrente'; mudou = true; }
      if (!a.historico) { a.historico = []; mudou = true; }
      /* migração de preços antigos → valores documentados */
      const precos = { 'Premium': [29.9, 49.9, 299, 598.8], 'Igreja': [199, 149.9, 1990, 1499] };
      const pr = precos[a.plano];
      if (pr) {
        if (a.ciclo === 'anual' && a.valor === pr[2]) { a.valor = pr[3]; mudou = true; }
        else if (a.ciclo !== 'anual' && a.valor === pr[0]) { a.valor = pr[1]; mudou = true; }
      }
    });
    if (mudou) salvarAssinaturas(v);
    return v;
  }
  function salvarAssinaturas(a) { try { localStorage.setItem(K_ASS, JSON.stringify(a)); } catch (e) {} }

  function gerarAssinatura(u) {
    const p = planoPorNome(u.plano);
    const pagante = u.plano !== 'Offline';
    const venc = 1 + Math.floor(Math.random() * 27);
    const base = {
      plano: u.plano,
      ciclo: 'mensal',
      valor: pagante ? p.precoMensal : 0,
      statusCobranca: !pagante ? 'Isento' : (u.status === 'Bloqueado' ? 'Bloqueada' : (u.status === 'Suspenso' ? 'Pendente' : 'Em dia')),
      desde: dataAddDias(-60 - Math.floor(Math.random() * 150)),
      vencimento: venc,
      proxima: proximaPorVencimento(venc),
      metodo: u.plano === 'Igreja' ? 'Pix recorrente' : 'Cartão recorrente',
      gateway: 'Mercado Pago',
      recorrente: true,
      historico: [],
    };
    if (base.statusCobranca === 'Pendente') base.pendenteDesde = dataAddDias(-2);
    if (base.statusCobranca === 'Bloqueada') {
      base.bloqueadaEm = dataAddDias(-9);
      base.pendencia = { valor: base.valor, desde: dataAddDias(-9), motivo: 'Pendência financeira', gateway: base.gateway };
    }
    if (base.valor > 0) {
      base.historico = [
        { id: 'f_' + Math.random().toString(36).slice(2, 8), data: dataAddDias(-30), valor: base.valor, status: 'Paga', metodo: base.metodo },
        { id: 'f_' + Math.random().toString(36).slice(2, 8), data: dataAddDias(-60), valor: base.valor, status: 'Paga', metodo: base.metodo },
      ];
    }
    return base;
  }

  /* mantém assinaturas e usuários consistentes */
  function sincronizar() {
    const ass = lerAssinaturas();
    state.users.forEach((u) => {
      if (!ass[u.email]) ass[u.email] = gerarAssinatura(u);
      else if (ass[u.email].plano !== u.plano) {
        const p = planoPorNome(u.plano);
        const a = ass[u.email];
        a.plano = u.plano;
        a.valor = u.plano === 'Offline' ? 0 : (a.ciclo === 'anual' ? p.precoAnual : p.precoMensal);
        if (u.plano === 'Offline') a.statusCobranca = 'Isento';
        else if (a.statusCobranca === 'Isento') a.statusCobranca = u.status === 'Bloqueado' ? 'Bloqueada' : 'Em dia';
      }
    });
    /* remove assinaturas de usuários excluídos */
    Object.keys(ass).forEach((email) => {
      if (!state.users.some((u) => u.email === email)) delete ass[email];
    });
    salvarAssinaturas(ass);
    return ass;
  }

  function valorMensal(a) {
    if (!a || a.plano === 'Offline' || a.statusCobranca !== 'Em dia') return 0;
    if (a.ciclo === 'anual') {
      const p = planoPorNome(a.plano);
      return p.precoAnual / 12;
    }
    return a.valor || 0;
  }

  function tagCobranca(s) {
    const map = { 'Em dia': 'tag-green', 'Pendente': 'tag-amber', 'Bloqueada': 'tag-red', 'Isento': 'tag-gray', 'Atrasada': 'tag-amber', 'Cancelada': 'tag-red' };
    return '<span class="tag ' + (map[s] || 'tag-gray') + '">' + esc(s) + '</span>';
  }

  /* ================= FATURAMENTO RECORRENTE ================= */
  const FAT_PADRAO = {
    ativo: true,
    diaVencimento: 5,
    toleranciaDias: 7,
    lembreteDias: 3,
    lembreteWhats: true,
    lembreteEmail: true,
    autoBloqueio: true,
    gatewayPadrao: 'Mercado Pago',
    pixRecorrente: true,
    ultimaExecucao: '',
    bloqueiosHoje: 0,
  };
  function lerFat() {
    let f = null;
    try { f = JSON.parse(localStorage.getItem(K_FAT)); } catch (e) {}
    return Object.assign({}, FAT_PADRAO, f || {});
  }
  function salvarFat(f) { try { localStorage.setItem(K_FAT, JSON.stringify(f)); } catch (e) {} }

  function processarRecorrencia() {
    const fat = lerFat();
    if (!fat.ativo) return false;
    const ass = lerAssinaturas();
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    let mudou = false, bloqueios = 0;

    state.users.forEach((u) => {
      const a = ass[u.email];
      if (!a || !(a.valor > 0)) return;
      const st = a.statusCobranca;
      if (st === 'Bloqueada' || st === 'Isento') return;
      const venc = parseData(a.proxima);
      if (!venc) return;
      const diasVenc = diasEntre(venc, hoje);

      if (st === 'Em dia' && diasVenc >= 0) {
        /* venceu: abre a fatura recorrente do ciclo */
        a.historico = a.historico || [];
        a.historico.unshift({
          id: 'f_' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
          data: fmtData(hoje), valor: a.valor, status: 'Aberta',
          metodo: a.metodo, recorrente: true, vencimento: a.vencimento, gateway: a.gateway,
        });
        a.statusCobranca = 'Pendente';
        a.pendenteDesde = fmtData(hoje);
        mudou = true;
      } else if (st === 'Pendente') {
        const desde = parseData(a.pendenteDesde) || venc;
        const atraso = diasEntre(desde, hoje);
        if (fat.autoBloqueio && atraso > (fat.toleranciaDias || 7)) {
          a.statusCobranca = 'Bloqueada';
          a.bloqueadaEm = fmtData(hoje);
          a.pendencia = {
            valor: a.valor,
            desde: a.pendenteDesde || a.proxima,
            motivo: 'Pendência financeira após ' + (fat.toleranciaDias || 7) + ' dias de tolerância',
            gateway: a.gateway, metodo: a.metodo,
          };
          u.status = 'Bloqueado';
          bloqueios++;
          mudou = true;
        }
      }
    });

    if (mudou) {
      salvarAssinaturas(ass);
      const f2 = lerFat();
      f2.ultimaExecucao = new Date().toLocaleString('pt-BR');
      f2.bloqueiosHoje = (f2.bloqueiosHoje || 0) + bloqueios;
      salvarFat(f2);
      if (api.state.section === 'planos') api.render();
    }
    return mudou;
  }

  let fatTimer = null;
  function iniciarRecorrencia() {
    try { processarRecorrencia(); } catch (e) {}
    if (fatTimer) return;
    fatTimer = setInterval(() => {
      try { processarRecorrencia(); } catch (e) {}
    }, 5 * 60 * 1000);
  }

  /* ================= GATEWAYS DE PAGAMENTO ================= */
  const GATEWAYS_PADRAO = [
    { id: 'mercadopago', nome: 'Mercado Pago', sigla: 'MP', cor: '#00b1ea', caps: { pix: true, pixRecorrente: true, cartao: true, boleto: true }, ativo: true, modo: 'sandbox', chavePublica: '', chavePrivada: '', webhook: '' },
    { id: 'pagarme', nome: 'Pagar.me', sigla: 'PG', cor: '#00a0df', caps: { pix: true, pixRecorrente: true, cartao: true, boleto: true }, ativo: false, modo: 'sandbox', chavePublica: '', chavePrivada: '', webhook: '' },
    { id: 'stripe', nome: 'Stripe', sigla: 'ST', cor: '#635bff', caps: { pix: true, pixRecorrente: false, cartao: true, boleto: true }, ativo: false, modo: 'sandbox', chavePublica: '', chavePrivada: '', webhook: '' },
    { id: 'pagseguro', nome: 'PagSeguro', sigla: 'PS', cor: '#00a651', caps: { pix: true, pixRecorrente: true, cartao: true, boleto: true }, ativo: false, modo: 'sandbox', chavePublica: '', chavePrivada: '', webhook: '' },
    { id: 'asaas', nome: 'Asaas', sigla: 'AS', cor: '#1a5caa', caps: { pix: true, pixRecorrente: true, cartao: true, boleto: true }, ativo: false, modo: 'sandbox', chavePublica: '', chavePrivada: '', webhook: '' },
    { id: 'banco', nome: 'Banco / Pix direto', sigla: 'PIX', cor: '#002645', caps: { pix: true, pixRecorrente: false, cartao: false, boleto: false }, ativo: false, modo: 'producao', chavePublica: '', chavePrivada: '', webhook: '' },
  ];
  function lerGateways() {
    let g = null;
    try { g = JSON.parse(localStorage.getItem(K_GW)); } catch (e) {}
    if (!Array.isArray(g) || !g.length) return JSON.parse(JSON.stringify(GATEWAYS_PADRAO));
    /* completa campos novos */
    GATEWAYS_PADRAO.forEach((pad) => {
      const existente = g.find((x) => x.id === pad.id);
      if (!existente) g.push(JSON.parse(JSON.stringify(pad)));
      else Object.keys(pad).forEach((k) => { if (existente[k] == null) existente[k] = pad[k]; });
    });
    return g;
  }
  function salvarGateways(g) { try { localStorage.setItem(K_GW, JSON.stringify(g)); } catch (e) {} }
  function gwPronto(g) {
    return g.id === 'banco' ? !!(g.chavePublica) : !!(g.chavePublica && g.chavePrivada);
  }
  function gwStatusTag(g) {
    if (g.ativo && gwPronto(g)) return '<span class="tag tag-green">Ativo</span>';
    if (gwPronto(g)) return '<span class="tag tag-amber">Configurado</span>';
    return '<span class="tag tag-gray">Desconfigurado</span>';
  }
  const METODOS = ['Cartão recorrente', 'Pix recorrente', 'Boleto', 'Pix (chave/QR)'];

  /* ================= PIX RECORRENTE ================= */
  const PIX_PADRAO = { chave: '', nome: 'PastorHub', cidade: 'SAO PAULO', valor: 0, tipo: 'estatica', gateway: 'mercadopago', recorrente: true, cobrancaAuto: true };
  function lerPix() {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(K_PIX)); } catch (e) {}
    return Object.assign({}, PIX_PADRAO, p || {});
  }
  function salvarPix(p) { try { localStorage.setItem(K_PIX, JSON.stringify(p)); } catch (e) {} }

  function emv(id, val) { return id + String(val.length).padStart(2, '0') + val; }
  function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  function pixPayload(p) {
    let s = emv('00', '01') + emv('26', emv('00', 'BR.GOV.BCB.PIX') + emv('01', p.chave));
    if (p.valor > 0) s += emv('52', '0000') + emv('53', '986') + emv('54', Number(p.valor).toFixed(2));
    s += emv('58', 'BR') + emv('59', String(p.nome || 'PASTORHUB').toUpperCase().slice(0, 25)) + emv('60', String(p.cidade || 'SAO PAULO').toUpperCase().slice(0, 15)) + emv('62', emv('05', '***'));
    s += '6304';
    return s + crc16(s);
  }
  let qrCarregado = false;
  function renderQR(canvas, texto, fallbackEl) {
    const falha = () => {
      if (canvas) canvas.style.display = 'none';
      if (fallbackEl) { fallbackEl.hidden = false; fallbackEl.textContent = texto; }
    };
    const aplicar = () => {
      /* API "qrcode" (toCanvas) */
      if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
        try { window.QRCode.toCanvas(canvas, texto, { width: 168, margin: 1 }); return true; } catch (e) {}
      }
      /* API qrcodejs (new QRCode(el, opts)) */
      if (typeof window.QRCode === 'function' && canvas && canvas.parentElement) {
        try {
          canvas.style.display = 'none';
          new window.QRCode(canvas.parentElement, { text: texto, width: 168, height: 168, colorDark: '#000000', colorLight: '#ffffff' });
          return true;
        } catch (e) {}
      }
      return false;
    };
    if (aplicar()) return;
    if (qrCarregado) { setTimeout(() => { aplicar() || falha(); }, 600); return; }
    qrCarregado = true;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = () => { aplicar() || falha(); };
    s.onerror = falha;
    document.head.appendChild(s);
  }

  /* ================= VIEW ================= */
  VIEWS.planos = function () {
    processarRecorrencia();
    const ass = sincronizar();
    const listaPl = planos();
    const fat = lerFat();
    const gws = lerGateways();
    const pix = lerPix();

    const mrr = state.users.reduce((t, u) => t + valorMensal(ass[u.email] || {}), 0);
    const pagantes = state.users.filter((u) => (ass[u.email] || {}).statusCobranca === 'Em dia' && u.plano !== 'Offline').length;
    const igrejas = new Set(state.users.filter((u) => u.plano === 'Igreja').map((u) => u.igreja)).size;
    const bloqueadas = state.users.filter((u) => (ass[u.email] || {}).statusCobranca === 'Bloqueada').length;
    const pendentes = state.users.filter((u) => (ass[u.email] || {}).statusCobranca === 'Pendente').length;

    /* --- cards dos planos --- */
    const cardsPlano = listaPl.map((p) => {
      const nAss = state.users.filter((u) => u.plano === p.nome).length;
      return '<div class="plano-card' + (p.destaque ? ' destaque' : '') + '">' +
        (p.destaque ? '<span class="plano-badge">Mais popular</span>' : '') +
        '<div class="plano-topo"><span class="plano-bolinha" style="background:' + p.cor + '"></span>' +
          '<div><b>' + esc(p.nome) + '</b><small>' + esc(p.desc) + '</small></div></div>' +
        '<div class="plano-preco"><div class="v">' + formatar(p.precoMensal) + '<small>/mês</small></div>' +
          (p.precoAnual > 0 ? '<div class="a">' + formatar(p.precoAnual) + '/ano · 2 meses grátis</div>' : '') + '</div>' +
        '<ul class="plano-recursos">' + p.recursos.map((r) => '<li>' + ic('check', 'icon-sm') + esc(r) + '</li>').join('') + '</ul>' +
        '<div class="plano-limites">' +
          '<span>' + ic('book-open', 'icon-sm') + ' ' + (p.limites.sermoes >= 20000 ? 'Sermões ilimitados' : p.limites.sermoes + ' sermões') + '</span>' +
          '<span>' + ic('users', 'icon-sm') + ' ' + p.limites.assentos + ' assento' + (p.limites.assentos > 1 ? 's' : '') + '</span>' +
          '<span>' + ic('zap', 'icon-sm') + ' ' + (p.limites.agentes || 0) + ' agente' + (p.limites.agentes === 1 ? '' : 's') + ' IA</span>' +
        '</div>' +
        '<div class="plano-foot"><span class="tag tag-gray">' + nAss + ' assinante' + (nAss === 1 ? '' : 's') + '</span>' +
          '<button class="btn btn-outline btn-sm" data-action="plano-editar" data-id="' + esc(p.id) + '">' + ic('edit', 'icon-sm') + 'Editar plano</button></div>' +
      '</div>';
    }).join('');

    /* --- faturamento recorrente: mini-resumo --- */
    const venc7 = state.users.filter((u) => {
      const a = ass[u.email];
      if (!a || !(a.valor > 0) || a.statusCobranca === 'Bloqueada') return false;
      const d = parseData(a.proxima);
      return d && diasEntre(new Date(), d) <= 7;
    }).length;

    const fatCards =
      '<div class="fat-card"><span class="fat-ico ' + (fat.ativo ? 'on' : 'off') + '">' + ic('refresh-cw') + '</span>' +
        '<b>' + (fat.ativo ? 'Motor ativo' : 'Motor pausado') + '</b><small>ciclo automático de cobrança</small></div>' +
      '<div class="fat-card"><span class="fat-ico">' + ic('calendar') + '</span>' +
        '<b>Dia ' + fat.diaVencimento + '</b><small>vencimento padrão do ciclo</small></div>' +
      '<div class="fat-card"><span class="fat-ico">' + ic('clock') + '</span>' +
        '<b>' + fat.toleranciaDias + ' dias</b><small>tolerância antes do bloqueio</small></div>' +
      '<div class="fat-card"><span class="fat-ico">' + ic('alert-circle') + '</span>' +
        '<b>' + venc7 + '</b><small>vencem em até 7 dias</small></div>';

    const fatForm =
      '<div class="fat-form">' +
        '<div class="field-row">' +
          '<div class="field"><label>Dia do vencimento (1–28)</label><input id="fat-dia" type="number" min="1" max="28" value="' + fat.diaVencimento + '"></div>' +
          '<div class="field"><label>Tolerância (dias até bloquear)</label><input id="fat-tol" type="number" min="0" max="60" value="' + fat.toleranciaDias + '"></div>' +
          '<div class="field"><label>Lembrete antes do vencimento (dias)</label><input id="fat-lemb" type="number" min="0" max="30" value="' + fat.lembreteDias + '"></div>' +
        '</div>' +
        '<div class="field"><label>Gateway padrão de cobrança</label><select id="fat-gw">' +
          gws.map((g) => '<option value="' + esc(g.nome) + '"' + (fat.gatewayPadrao === g.nome ? ' selected' : '') + '>' + esc(g.nome) + '</option>').join('') +
        '</select></div>' +
        '<div class="fat-checks">' +
          '<label><input type="checkbox" id="fat-ativo"' + (fat.ativo ? ' checked' : '') + '> Faturamento recorrente ativo</label>' +
          '<label><input type="checkbox" id="fat-auto"' + (fat.autoBloqueio ? ' checked' : '') + '> Bloquear acesso após a tolerância</label>' +
          '<label><input type="checkbox" id="fat-pix"' + (fat.pixRecorrente ? ' checked' : '') + '> Permitir Pix recorrente</label>' +
          '<label><input type="checkbox" id="fat-whats"' + (fat.lembreteWhats ? ' checked' : '') + '> Lembrete via WhatsApp</label>' +
          '<label><input type="checkbox" id="fat-email"' + (fat.lembreteEmail ? ' checked' : '') + '> Lembrete via e-mail</label>' +
        '</div>' +
        '<div class="toolbar" style="margin-top:4px">' +
          '<span style="font-size:.78rem;color:var(--muted)">Última execução: ' + esc(fat.ultimaExecucao || 'nunca') + (fat.bloqueiosHoje ? ' · ' + fat.bloqueiosHoje + ' bloqueio(s)' : '') + '</span>' +
          '<div class="grow"></div>' +
          '<button class="btn btn-outline btn-sm" data-action="fat-executar">' + ic('play', 'icon-sm') + 'Executar agora</button>' +
          '<button class="btn btn-sm" data-action="fat-salvar">' + ic('save', 'icon-sm') + 'Salvar configuração</button>' +
        '</div>' +
      '</div>';

    /* --- gateways --- */
    const cardsGw = gws.map((g) => {
      const chip = (on, txt) => '<span class="gw-chip' + (on ? ' on' : '') + '">' + (on ? '✓ ' : '· ') + txt + '</span>';
      return '<div class="gw-card' + (g.ativo && gwPronto(g) ? ' ativo' : '') + '">' +
        '<div class="gw-topo"><span class="gw-logo" style="background:' + g.cor + '">' + esc(g.sigla) + '</span>' +
          '<div class="gw-nome"><b>' + esc(g.nome) + '</b><small>' + (g.modo === 'producao' ? 'Produção' : 'Sandbox') + '</small></div>' +
          gwStatusTag(g) + '</div>' +
        '<div class="gw-caps">' + chip(g.caps.pix, 'Pix') + chip(g.caps.pixRecorrente, 'Pix recorrente') + chip(g.caps.cartao, 'Cartão') + chip(g.caps.boleto, 'Boleto') + '</div>' +
        '<div class="gw-foot">' +
          '<button class="btn btn-outline btn-sm" data-action="gw-config" data-id="' + esc(g.id) + '">' + ic('settings', 'icon-sm') + 'Configurar</button>' +
          '<div class="gw-acoes">' +
            '<button class="icon-btn" data-action="gw-testar" data-id="' + esc(g.id) + '" title="Testar conexão">' + ic('zap') + '</button>' +
            '<button class="btn btn-sm ' + (g.ativo ? 'btn-outline' : '') + '" data-action="gw-ativo" data-id="' + esc(g.id) + '">' + (g.ativo ? 'Desativar' : 'Ativar') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    /* --- pix recorrente --- */
    const gwPix = gws.find((g) => g.id === pix.gateway) || gws[0];
    const pixPronto = !!(pix.chave && gwPix && gwPix.ativo && gwPix.caps.pixRecorrente);
    const pixBody =
      '<div class="pix-grid">' +
        '<div class="pix-info">' +
          '<div class="pix-linha"><span>Chave Pix</span><b>' + (pix.chave ? esc(pix.chave) : '—') + '</b></div>' +
          '<div class="pix-linha"><span>Tipo</span><b>' + (pix.tipo === 'dinamica' ? 'Dinâmica (valor por cobrança)' : 'Estática (chave fixa)') + '</b></div>' +
          '<div class="pix-linha"><span>Gateway</span><b>' + esc(gwPix ? gwPix.nome : '—') + '</b></div>' +
          '<div class="pix-linha"><span>Recorrência</span><b>' + (pix.cobrancaAuto ? 'Cobrança automática habilitada' : 'Cobrança manual') + '</b></div>' +
          '<div class="toolbar" style="margin-top:10px">' +
            '<button class="btn btn-outline btn-sm" data-action="pix-config">' + ic('settings', 'icon-sm') + 'Configurar Pix</button>' +
            (pix.chave ? '<button class="btn btn-outline btn-sm" data-action="pix-copiar">' + ic('copy', 'icon-sm') + 'Copiar chave</button>' : '') +
            '<div class="grow"></div>' +
            '<span class="tag ' + (pixPronto ? 'tag-green' : 'tag-gray') + '">' + (pixPronto ? 'Pronto para cobrança' : 'Requer configuração') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="pix-qr">' +
          (pix.chave
            ? '<canvas id="pix-canvas" width="168" height="168"></canvas><div class="pix-fallback" hidden></div><small>Leia com o app do seu banco — copia e cola também disponível</small>'
            : '<div class="pix-vazio">' + ic('qr-code') + '<p>Configure sua chave Pix para gerar o QR Code de cobrança recorrente.</p></div>') +
        '</div>' +
      '</div>';

    /* --- tabela de assinaturas --- */
    const linhas = state.users.map((u) => {
      const a = ass[u.email];
      if (!a) return '';
      const bloqueada = a.statusCobranca === 'Bloqueada';
      const pendente = a.statusCobranca === 'Pendente';
      return '<tr>' +
        '<td><div class="cell-user">' +
          (u.avatar ? '<span class="avatar avatar-img"><img src="' + u.avatar + '" alt=""></span>' : '<span class="avatar" style="background:' + u.cor + '">' + api.initials(u.nome) + '</span>') +
          '<div><b>' + esc(u.nome) + '</b><span>' + esc(u.igreja) + '</span></div></div></td>' +
        '<td>' + statusTag(u.plano) + '</td>' +
        '<td style="white-space:nowrap">' + esc(a.ciclo) + (a.recorrente ? '<div style="font-size:.7rem;color:var(--muted)">recorrente · dia ' + (a.vencimento || fat.diaVencimento) + '</div>' : '') + '</td>' +
        '<td style="white-space:nowrap"><b>' + formatar(a.valor) + '</b>' + (a.ciclo === 'anual' ? '<div style="font-size:.72rem;color:var(--muted)">cobrança anual</div>' : '') + '</td>' +
        '<td>' + tagCobranca(a.statusCobranca) +
          '<div style="font-size:.7rem;color:var(--muted);margin-top:3px">' + esc(a.metodo || '—') + (a.gateway ? ' · ' + esc(a.gateway) : '') + '</div>' +
          (bloqueada && a.pendencia ? '<div style="font-size:.7rem;color:var(--red);margin-top:2px">pendência ' + formatar(a.pendencia.valor) + '</div>' : '') +
        '</td>' +
        '<td style="font-size:.8rem;color:var(--muted);white-space:nowrap">' + esc(a.proxima || '—') +
          (pendente ? '<div style="font-size:.7rem;color:var(--amber)">vencida</div>' : '') + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="btn btn-outline btn-sm" data-action="ass-plano" data-id="' + esc(u.email) + '">' + ic('layers', 'icon-sm') + 'Plano</button>' +
          (a.valor > 0 ? '<button class="icon-btn" data-action="ass-faturar" data-id="' + esc(u.email) + '" title="Faturar agora">' + ic('card') + '</button>' : '') +
          '<button class="icon-btn" data-action="ass-faturas" data-id="' + esc(u.email) + '" title="Faturas">' + ic('file-text') + '</button>' +
          (bloqueada || pendente
            ? '<button class="icon-btn ok" data-action="ass-regularizar" data-id="' + esc(u.email) + '" title="Regularizar pagamento">' + ic('check-circle') + '</button>'
            : (a.valor > 0 ? '<button class="icon-btn danger" data-action="ass-bloquear" data-id="' + esc(u.email) + '" title="Bloquear por pendência financeira">' + ic('lock') + '</button>' : '')) +
        '</div></td>' +
      '</tr>';
    }).join('');

    /* --- assentos por igreja --- */
    const limiteAssentos = planoPorNome('Igreja').limites.assentos;
    const porIgreja = {};
    state.users.filter((u) => u.plano === 'Igreja').forEach((u) => {
      (porIgreja[u.igreja] = porIgreja[u.igreja] || []).push(u);
    });
    const linhasAssentos = Object.keys(porIgreja).sort().map((ig) => {
      const usados = porIgreja[ig].length;
      const pct = Math.min(100, (usados / limiteAssentos) * 100);
      const excedeu = usados >= limiteAssentos;
      return '<div class="assento-item">' +
        '<div class="assento-head"><b>' + esc(ig) + '</b>' +
          '<span class="tag ' + (excedeu ? 'tag-red' : usados >= limiteAssentos * 0.8 ? 'tag-amber' : 'tag-green') + '">' + usados + '/' + limiteAssentos + ' assentos</span></div>' +
        '<div class="bar-track" style="margin-top:6px"><div class="bar-fill" style="width:' + pct + '%;background:' + (excedeu ? '#d4183d' : '#3261AB') + '"></div></div>' +
        '<div style="font-size:.76rem;color:var(--muted);margin-top:5px">' +
          (excedeu ? '⚠ Limite atingido — upgrade de plano ou liberação de vaga necessário.' :
            'Pastores: ' + porIgreja[ig].map((u) => esc(u.nome)).join(' · ')) + '</div>' +
      '</div>';
    }).join('') || '<p style="color:var(--muted);font-size:.85rem">Nenhuma igreja no plano Igreja ainda.</p>';

    /* QR do Pix: o canvas só existe depois do insert da view */
    if (pix.chave) {
      setTimeout(() => {
        const c = document.getElementById('pix-canvas');
        if (c) renderQR(c, pixPayload(pix), document.querySelector('.pix-fallback'));
      }, 0);
    }

    return '<div class="kpi-grid">' +
        kpi('MRR (receita mensal)', 'R$ ' + mrr.toFixed(2).replace('.', ','), 'projeção da base atual', 'card', 'b-lime') +
        kpi('Assinantes pagantes', pagantes, state.users.length + ' contas totais', 'users', 'b-navy') +
        kpi('Igrejas no plano Igreja', igrejas, 'multi-usuário', 'layers', 'b-purple') +
        kpi('Bloqueadas / pendentes', bloqueadas + ' / ' + pendentes, bloqueadas ? 'requer regularização' : 'tudo em dia', 'lock', 'b-amber', bloqueadas === 0 && pendentes === 0) +
      '</div>' +

      panel('Planos da plataforma',
        '<div class="grid-3 planos-grid">' + cardsPlano + '</div>' +
        '<button class="btn btn-outline btn-sm" style="margin-top:14px" data-action="planos-restaurar">' + ic('refresh-cw', 'icon-sm') + 'Restaurar planos padrão</button>',
        { sub: 'Preços conforme a proposta · Pro R$ 49,90/mês · Igreja R$ 149,90/mês' }) +

      panel('Faturamento recorrente',
        '<div class="fat-cards">' + fatCards + '</div>' + fatForm +
        '<div class="info-box blue" style="margin-top:14px"><div>🔄</div><div><b>Como funciona:</b> no dia do vencimento o motor abre a fatura do ciclo automaticamente. Se não houver pagamento em ' + fat.toleranciaDias + ' dias, o acesso do usuário é <b>bloqueado</b> no app até a regularização da pendência.</div></div>',
        { sub: 'Ciclo automático de cobrança, lembretes e bloqueio por pendência' }) +

      panel('Gateways de pagamento',
        '<div class="grid-3 gw-grid">' + cardsGw + '</div>',
        { sub: 'Pix, cartão e boleto recorrentes · configure as credenciais de cada provedor' }) +

      panel('Pix recorrente', pixBody,
        { sub: 'Cobrança via Pix com QR Code e recorrência automática' }) +

      panel('Assinaturas',
        '<div class="toolbar">' +
          '<span style="font-size:.84rem;color:var(--muted)">Cada conta do painel Usuários tem uma assinatura vinculada ao seu plano.</span>' +
          '<div class="grow"></div>' +
          '<button class="btn btn-outline btn-sm" data-action="ass-export">' + ic('download') + 'Exportar CSV</button>' +
        '</div>' +
        '<div class="table-wrap"><table class="data data-tight"><thead><tr>' +
          '<th>Usuário</th><th>Plano</th><th>Ciclo</th><th>Valor</th><th>Cobrança</th><th>Próxima</th><th></th>' +
        '</tr></thead><tbody>' + (linhas || '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px">Nenhuma assinatura</td></tr>') +
        '</tbody></table></div>',
        { flush: true }) +

      panel('Assentos por igreja (plano Igreja)', linhasAssentos,
        { sub: 'Cada plano Igreja inclui ' + limiteAssentos + ' assentos de pastor' });
  };

  /* ================= AÇÕES: PLANOS ================= */
  Actions['planos-restaurar'] = function () {
    confirmAction('Restaurar planos', 'Voltar os preços e limites aos valores padrão (Pro R$ 49,90 · Igreja R$ 149,90)? As assinaturas não são afetadas.', () => {
      localStorage.removeItem(K_PLANOS);
      toast('Planos restaurados ao padrão documentado', 'ok');
      api.render();
    });
  };

  Actions['plano-editar'] = function (el) {
    const p = planos().find((x) => x.id === el.dataset.id);
    modal({
      title: 'Editar plano · ' + p.nome,
      confirmLabel: 'Salvar plano',
      body:
        '<div class="field-row">' +
          '<div class="field"><label>Nome exibido</label><input id="p-nome" value="' + esc(p.nome) + '"></div>' +
          '<div class="field"><label>Descrição curta</label><input id="p-desc" value="' + esc(p.desc) + '"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Preço mensal (R$)</label><input id="p-mensal" type="number" step="0.01" min="0" value="' + p.precoMensal + '"></div>' +
          '<div class="field"><label>Preço anual (R$)</label><input id="p-anual" type="number" step="0.01" min="0" value="' + p.precoAnual + '"></div>' +
        '</div>' +
        '<h4 style="font-size:.82rem;text-transform:uppercase;letter-spacing:.06em;color:var(--navy);margin:14px 0 8px">Limites por conta</h4>' +
        '<div class="field-row">' +
          '<div class="field"><label>Assentos de pastor</label><input id="p-assentos" type="number" min="1" value="' + p.limites.assentos + '"></div>' +
          '<div class="field"><label>Agentes de IA</label><input id="p-agentes" type="number" min="0" value="' + p.limites.agentes + '"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Sermões</label><input id="p-sermoes" type="number" min="1" value="' + p.limites.sermoes + '"></div>' +
          '<div class="field"><label>Atendimentos</label><input id="p-atend" type="number" min="1" value="' + p.limites.atendimentos + '"></div>' +
        '</div>' +
        '<div class="field"><label>Armazenamento (MB)</label><input id="p-storage" type="number" min="10" value="' + p.limites.storageMB + '"></div>' +
        '<div class="field"><label>Recursos (um por linha)</label><textarea id="p-recursos" rows="6">' + esc(p.recursos.join('\n')) + '</textarea></div>' +
        '<div class="field" style="flex-direction:row;align-items:center;gap:10px">' +
          '<label style="margin:0">Plano em destaque (mais popular)</label>' +
          '<input type="checkbox" id="p-destaque"' + (p.destaque ? ' checked' : '') + ' style="width:auto">' +
        '</div>',
      onSave(root) {
        const nome = root.querySelector('#p-nome').value.trim();
        if (!nome) { toast('Informe o nome do plano', 'err'); return false; }
        const lista = planos();
        const alvo = lista.find((x) => x.id === p.id);
        const antigo = alvo.nome;
        alvo.nome = nome;
        alvo.desc = root.querySelector('#p-desc').value.trim();
        alvo.precoMensal = parseFloat(root.querySelector('#p-mensal').value) || 0;
        alvo.precoAnual = parseFloat(root.querySelector('#p-anual').value) || 0;
        alvo.limites = {
          sermoes: parseInt(root.querySelector('#p-sermoes').value, 10) || 100,
          atendimentos: parseInt(root.querySelector('#p-atend').value, 10) || 100,
          assentos: parseInt(root.querySelector('#p-assentos').value, 10) || 1,
          agentes: parseInt(root.querySelector('#p-agentes').value, 10) || 0,
          storageMB: parseInt(root.querySelector('#p-storage').value, 10) || 50,
        };
        alvo.recursos = root.querySelector('#p-recursos').value.split('\n').map((s) => s.trim()).filter(Boolean);
        alvo.destaque = root.querySelector('#p-destaque').checked;
        salvarPlanos(lista);
        if (antigo !== nome) {
          state.users.forEach((u) => { if (u.plano === antigo) u.plano = nome; });
          const ass = lerAssinaturas();
          Object.keys(ass).forEach((email) => { if (ass[email].plano === antigo) ass[email].plano = nome; });
          salvarAssinaturas(ass);
        }
        toast('Plano "' + nome + '" atualizado', 'ok');
        api.render();
      },
    });
  };

  /* ================= AÇÕES: FATURAMENTO ================= */
  Actions['fat-salvar'] = function () {
    const f = lerFat();
    f.diaVencimento = Math.min(Math.max(parseInt(document.getElementById('fat-dia').value, 10) || 5, 1), 28);
    f.toleranciaDias = Math.min(Math.max(parseInt(document.getElementById('fat-tol').value, 10) || 0, 0), 60);
    f.lembreteDias = Math.min(Math.max(parseInt(document.getElementById('fat-lemb').value, 10) || 0, 0), 30);
    f.gatewayPadrao = document.getElementById('fat-gw').value;
    f.ativo = document.getElementById('fat-ativo').checked;
    f.autoBloqueio = document.getElementById('fat-auto').checked;
    f.pixRecorrente = document.getElementById('fat-pix').checked;
    f.lembreteWhats = document.getElementById('fat-whats').checked;
    f.lembreteEmail = document.getElementById('fat-email').checked;
    salvarFat(f);
    toast('Faturamento recorrente atualizado', 'ok');
    api.render();
  };

  Actions['fat-executar'] = function () {
    const mudou = processarRecorrencia();
    const f = lerFat();
    f.ultimaExecucao = new Date().toLocaleString('pt-BR');
    salvarFat(f);
    toast(mudou ? 'Ciclo processado — atualizações aplicadas' : 'Ciclo processado — nada a cobrar agora', 'ok');
    api.render();
  };

  /* ================= AÇÕES: GATEWAYS ================= */
  Actions['gw-config'] = function (el) {
    const gws = lerGateways();
    const g = gws.find((x) => x.id === el.dataset.id);
    modal({
      title: 'Configurar gateway · ' + g.nome,
      confirmLabel: 'Salvar gateway',
      body:
        '<div class="field-row">' +
          '<div class="field"><label>Modo</label><select id="gw-modo">' +
            '<option value="sandbox"' + (g.modo === 'sandbox' ? ' selected' : '') + '>Sandbox (testes)</option>' +
            '<option value="producao"' + (g.modo === 'producao' ? ' selected' : '') + '>Produção</option>' +
          '</select></div>' +
          '<div class="field"><label>Webhook (URL de notificações)</label><input id="gw-webhook" placeholder="https://…/webhook/pastorhub" value="' + esc(g.webhook || '') + '"></div>' +
        '</div>' +
        '<div class="field"><label>' + (g.id === 'banco' ? 'Chave Pix' : 'Chave pública (public key)') + '</label><input id="gw-pub" value="' + esc(g.chavePublica || '') + '"></div>' +
        '<div class="field"><label>' + (g.id === 'banco' ? 'Token de acesso (opcional)' : 'Chave privada (secret key)') + '</label><input id="gw-sec" type="password" value="' + esc(g.chavePrivada || '') + '"></div>' +
        '<div class="field" style="flex-direction:row;align-items:center;gap:10px">' +
          '<label style="margin:0">Ativar cobrança por este gateway</label>' +
          '<input type="checkbox" id="gw-ativo"' + (g.ativo ? ' checked' : '') + ' style="width:auto">' +
        '</div>' +
        (g.caps.pixRecorrente
          ? '<div class="field" style="flex-direction:row;align-items:center;gap:10px">' +
              '<label style="margin:0">Habilitar Pix recorrente (cobrança automática)</label>' +
              '<input type="checkbox" id="gw-pixrec"' + (g.pixRecorrente ? ' checked' : '') + ' style="width:auto">' +
            '</div>'
          : '<div class="info-box" style="margin:0"><div>ℹ️</div><div>Este gateway não suporta Pix recorrente. Use cartão ou boleto para a recorrência.</div></div>') +
        '<div class="info-box blue" style="margin:10px 0 0"><div>🔐</div><div>As credenciais ficam salvas apenas neste navegador (localStorage). Em produção, use variáveis de ambiente no backend.</div></div>',
      onSave(root) {
        g.modo = root.querySelector('#gw-modo').value;
        g.webhook = root.querySelector('#gw-webhook').value.trim();
        g.chavePublica = root.querySelector('#gw-pub').value.trim();
        g.chavePrivada = root.querySelector('#gw-sec').value;
        g.ativo = root.querySelector('#gw-ativo').checked;
        if (g.caps.pixRecorrente) g.pixRecorrente = root.querySelector('#gw-pixrec').checked;
        salvarGateways(gws);
        toast('Gateway ' + g.nome + ' salvo', 'ok');
        api.render();
      },
    });
  };

  Actions['gw-testar'] = function (el) {
    const g = lerGateways().find((x) => x.id === el.dataset.id);
    if (!gwPronto(g)) {
      toast(g.nome + ': configure as credenciais antes de testar', 'err');
      return;
    }
    toast(g.nome + ': credenciais válidas — conexão em modo ' + g.modo + ' (simulada)', 'ok');
  };

  Actions['gw-ativo'] = function (el) {
    const gws = lerGateways();
    const g = gws.find((x) => x.id === el.dataset.id);
    if (!g.ativo && !gwPronto(g)) {
      toast('Configure as credenciais de ' + g.nome + ' antes de ativar', 'err');
      return;
    }
    g.ativo = !g.ativo;
    salvarGateways(gws);
    toast(g.nome + (g.ativo ? ' ativado' : ' desativado'), 'ok');
    api.render();
  };

  /* ================= AÇÕES: PIX ================= */
  Actions['pix-config'] = function () {
    const p = lerPix();
    const gws = lerGateways().filter((g) => g.caps.pix);
    modal({
      title: 'Configurar Pix recorrente',
      confirmLabel: 'Salvar Pix',
      body:
        '<div class="field"><label>Chave Pix</label><input id="px-chave" placeholder="CPF, CNPJ, e-mail ou chave aleatória" value="' + esc(p.chave) + '"></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Nome do recebedor</label><input id="px-nome" value="' + esc(p.nome) + '"></div>' +
          '<div class="field"><label>Cidade do recebedor</label><input id="px-cidade" value="' + esc(p.cidade) + '"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Tipo da chave</label><select id="px-tipo">' +
            '<option value="estatica"' + (p.tipo === 'estatica' ? ' selected' : '') + '>Estática (chave fixa)</option>' +
            '<option value="dinamica"' + (p.tipo === 'dinamica' ? ' selected' : '') + '>Dinâmica (valor por cobrança)</option>' +
          '</select></div>' +
          '<div class="field"><label>Valor fixo (R$ — 0 = valor da assinatura)</label><input id="px-valor" type="number" step="0.01" min="0" value="' + p.valor + '"></div>' +
        '</div>' +
        '<div class="field"><label>Gateway para a cobrança recorrente</label><select id="px-gw">' +
          gws.map((g) => '<option value="' + esc(g.id) + '"' + (p.gateway === g.id ? ' selected' : '') + '>' + esc(g.nome) + (g.caps.pixRecorrente ? ' · Pix recorrente' : '') + '</option>').join('') +
        '</select></div>' +
        '<div class="field" style="flex-direction:row;align-items:center;gap:10px">' +
          '<label style="margin:0">Cobrança recorrente automática (assinatura via Pix)</label>' +
          '<input type="checkbox" id="px-auto"' + (p.cobrancaAuto ? ' checked' : '') + ' style="width:auto">' +
        '</div>' +
        '<div class="info-box lime" style="margin:10px 0 0"><div>💡</div><div>Com a cobrança automática ativa, o Pix é gerado a cada ciclo no dia do vencimento e o QR Code é exibido no app do usuário. Sem ela, o usuário paga manualmente e envia o comprovante.</div></div>',
      onSave(root) {
        p.chave = root.querySelector('#px-chave').value.trim();
        p.nome = root.querySelector('#px-nome').value.trim() || 'PastorHub';
        p.cidade = root.querySelector('#px-cidade').value.trim() || 'SAO PAULO';
        p.valor = parseFloat(root.querySelector('#px-valor').value) || 0;
        p.tipo = root.querySelector('#px-tipo').value;
        p.gateway = root.querySelector('#px-gw').value;
        p.cobrancaAuto = root.querySelector('#px-auto').checked;
        salvarPix(p);
        toast('Configuração do Pix salva', 'ok');
        api.render();
      },
    });
  };

  Actions['pix-copiar'] = function () {
    const p = lerPix();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(p.chave).then(() => toast('Chave Pix copiada', 'ok'), () => toast('Não foi possível copiar', 'err'));
    } else {
      toast('Chave: ' + p.chave, 'ok');
    }
  };

  /* ================= AÇÕES: ASSINATURAS ================= */
  Actions['ass-plano'] = function (el) {
    const u = state.users.find((x) => x.email === el.dataset.id);
    const a = lerAssinaturas()[u.email];
    const listaPl = planos();
    const gws = lerGateways();
    modal({
      title: 'Trocar plano · ' + u.nome,
      confirmLabel: 'Aplicar mudança',
      body:
        '<div class="field"><label>Plano</label><select id="s-plano">' +
          listaPl.map((p) => '<option value="' + esc(p.nome) + '"' + (a.plano === p.nome ? ' selected' : '') + '>' +
            esc(p.nome) + ' — ' + formatar(p.precoMensal) + '/mês</option>').join('') + '</select></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Ciclo de cobrança</label><select id="s-ciclo">' +
            ['mensal', 'anual'].map((c) => '<option' + (a.ciclo === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
          '<div class="field"><label>Dia do vencimento (1–28)</label><input id="s-venc" type="number" min="1" max="28" value="' + (a.vencimento || 5) + '"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Método de pagamento</label><select id="s-metodo">' +
            METODOS.map((m) => '<option' + (a.metodo === m ? ' selected' : '') + '>' + m + '</option>').join('') + '</select></div>' +
          '<div class="field"><label>Gateway</label><select id="s-gw">' +
            gws.map((g) => '<option value="' + esc(g.nome) + '"' + (a.gateway === g.nome ? ' selected' : '') + '>' + esc(g.nome) + '</option>').join('') + '</select></div>' +
        '</div>' +
        '<div class="info-box blue" style="margin:0"><div>ℹ️</div><div>A mudança vale a partir do próximo ciclo. Com faturamento recorrente ativo, a cobrança é gerada automaticamente no dia do vencimento.</div></div>',
      onSave(root) {
        const novoNome = root.querySelector('#s-plano').value;
        const p = planoPorNome(novoNome);
        u.plano = novoNome;
        const a2 = lerAssinaturas();
        const ass = a2[u.email];
        ass.plano = novoNome;
        ass.ciclo = root.querySelector('#s-ciclo').value;
        ass.metodo = root.querySelector('#s-metodo').value;
        ass.gateway = root.querySelector('#s-gw').value;
        ass.vencimento = Math.min(Math.max(parseInt(root.querySelector('#s-venc').value, 10) || 5, 1), 28);
        ass.recorrente = true;
        ass.valor = novoNome === 'Offline' ? 0 : (ass.ciclo === 'anual' ? p.precoAnual : p.precoMensal);
        if (novoNome === 'Offline') ass.statusCobranca = 'Isento';
        else if (ass.statusCobranca === 'Isento') ass.statusCobranca = u.status === 'Bloqueado' ? 'Bloqueada' : 'Em dia';
        ass.proxima = proximaPorVencimento(ass.vencimento);
        salvarAssinaturas(a2);
        api.toast('Plano de ' + u.nome + ' → ' + novoNome, 'ok');
        api.render();
      },
    });
  };

  Actions['ass-faturar'] = function (el) {
    const u = state.users.find((x) => x.email === el.dataset.id);
    const a2 = lerAssinaturas();
    const a = a2[u.email];
    confirmAction('Faturar agora',
      'Gerar cobrança de <b>' + formatar(a.valor) + '</b> (' + esc(a.metodo) + ' · ' + esc(a.gateway || '—') + ') para ' + esc(u.nome) + '?', () => {
        a.historico = a.historico || [];
        a.historico.unshift({ id: 'f_' + Date.now().toString(36), data: new Date().toLocaleDateString('pt-BR'), valor: a.valor, status: 'Paga', metodo: a.metodo, gateway: a.gateway });
        a.statusCobranca = 'Em dia';
        a.pendenteDesde = null;
        a.pendencia = null;
        a.bloqueadaEm = null;
        a.proxima = proximaPorVencimento(a.vencimento);
        if (u.status === 'Bloqueado') u.status = 'Ativo';
        salvarAssinaturas(a2);
        toast('Cobrança registrada · próxima em ' + a.proxima, 'ok');
        api.render();
      });
  };

  Actions['ass-faturas'] = function (el) {
    const u = state.users.find((x) => x.email === el.dataset.id);
    const a = lerAssinaturas()[u.email];
    const linhas = (a.historico || []).map((f) =>
      '<tr><td>' + esc(f.data) + '</td><td><b>' + formatar(f.valor) + '</b></td><td>' + esc(f.metodo) + (f.recorrente ? ' <small style="color:var(--muted)">· recorrente</small>' : '') + '</td>' +
      '<td><span class="tag ' + (f.status === 'Paga' ? 'tag-green' : f.status === 'Aberta' ? 'tag-amber' : 'tag-gray') + '">' + esc(f.status) + '</span></td></tr>').join('');
    modal({
      title: 'Faturas · ' + u.nome,
      confirmLabel: 'Fechar',
      body:
        '<div class="info-box lime" style="margin:0 0 14px"><div>📋</div><div>' + esc(a.plano) + ' · ciclo ' + esc(a.ciclo) + ' · recorrente dia ' + (a.vencimento || 5) + ' · ' + esc(a.metodo) + (a.gateway ? ' · ' + esc(a.gateway) : '') + ' · desde ' + esc(a.desde) + '</div></div>' +
        '<div class="table-wrap"><table class="data"><thead><tr><th>Data</th><th>Valor</th><th>Método</th><th>Status</th></tr></thead><tbody>' +
        (linhas || '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:24px">Nenhuma fatura ainda</td></tr>') +
        '</tbody></table></div>',
    });
    setTimeout(() => {
      const btn = document.getElementById('modal-save');
      if (btn) { const novo = btn.cloneNode(true); btn.parentNode.replaceChild(novo, btn); }
    }, 0);
  };

  /* Cancelamento virou bloqueio: o acesso só volta após regularizar */
  Actions['ass-bloquear'] = function (el) {
    const u = state.users.find((x) => x.email === el.dataset.id);
    confirmAction('Bloquear por pendência',
      'Bloquear o acesso de <b>' + esc(u.nome) + '</b>? O usuário fica bloqueado no app até regularizar a pendência financeira do plano ' + esc(u.plano) + ' (' + formatar(lerAssinaturas()[u.email].valor) + ').', () => {
      const a2 = lerAssinaturas();
      const a = a2[u.email];
      a.statusCobranca = 'Bloqueada';
      a.bloqueadaEm = new Date().toLocaleDateString('pt-BR');
      a.pendencia = { valor: a.valor, desde: a.proxima, motivo: 'Bloqueio manual por pendência financeira', gateway: a.gateway, metodo: a.metodo };
      u.status = 'Bloqueado';
      salvarAssinaturas(a2);
      toast('Conta de ' + u.nome + ' bloqueada até regularizar', 'ok');
      api.render();
    });
  };

  Actions['ass-regularizar'] = function (el) {
    const u = state.users.find((x) => x.email === el.dataset.id);
    const a = lerAssinaturas()[u.email];
    const valorPend = (a.pendencia && a.pendencia.valor) || a.valor;
    modal({
      title: 'Regularizar pagamento · ' + u.nome,
      confirmLabel: 'Confirmar regularização',
      body:
        '<div class="info-box ' + (a.statusCobranca === 'Bloqueada' ? 'red' : 'amber') + '" style="margin:0 0 14px"><div>⚠️</div><div>' +
          (a.statusCobranca === 'Bloqueada' ? 'Conta <b>bloqueada</b> desde ' + esc(a.bloqueadaEm || '—') + '.' : 'Fatura em aberto desde ' + esc(a.pendenteDesde || a.proxima) + '.') +
          ' Pendência de <b>' + formatar(valorPend) + '</b>' + (a.pendencia && a.pendencia.motivo ? ' — ' + esc(a.pendencia.motivo) : '') + '.</div></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Valor recebido (R$)</label><input id="r-valor" type="number" step="0.01" min="0" value="' + valorPend + '"></div>' +
          '<div class="field"><label>Forma recebida</label><select id="r-metodo">' +
            METODOS.map((m) => '<option' + (a.metodo === m ? ' selected' : '') + '>' + m + '</option>').join('') + '</select></div>' +
        '</div>' +
        '<div class="field" style="flex-direction:row;align-items:center;gap:10px">' +
          '<label style="margin:0">Avançar próxima cobrança para o dia ' + (a.vencimento || 5) + '</label>' +
          '<input type="checkbox" id="r-avancar" checked style="width:auto">' +
        '</div>' +
        '<div class="info-box lime" style="margin:10px 0 0"><div>✅</div><div>Ao confirmar, as faturas em aberto são marcadas como pagas, o bloqueio é removido e o acesso no app é liberado imediatamente.</div></div>',
      onSave(root) {
        const a2 = lerAssinaturas();
        const a2x = a2[u.email];
        const valor = parseFloat(root.querySelector('#r-valor').value) || a2x.valor;
        a2x.historico = a2x.historico || [];
        let aberta = a2x.historico.find((f) => f.status === 'Aberta');
        if (!aberta) {
          aberta = { id: 'f_' + Date.now().toString(36), data: new Date().toLocaleDateString('pt-BR'), valor: valor, status: 'Aberta', metodo: root.querySelector('#r-metodo').value, recorrente: true };
          a2x.historico.unshift(aberta);
        }
        aberta.status = 'Paga';
        aberta.valor = valor;
        aberta.metodo = root.querySelector('#r-metodo').value;
        a2x.statusCobranca = 'Em dia';
        a2x.pendenteDesde = null;
        a2x.pendencia = null;
        a2x.bloqueadaEm = null;
        a2x.metodo = root.querySelector('#r-metodo').value;
        if (root.querySelector('#r-avancar').checked) a2x.proxima = proximaPorVencimento(a2x.vencimento);
        if (u.status === 'Bloqueado') u.status = 'Ativo';
        salvarAssinaturas(a2);
        toast('Pagamento regularizado — acesso liberado', 'ok');
        api.render();
      },
    });
  };

  Actions['ass-export'] = function () {
    const ass = sincronizar();
    const cab = ['Nome', 'E-mail', 'Igreja', 'Plano', 'Ciclo', 'Vencimento', 'Valor', 'Cobrança', 'Método', 'Gateway', 'Recorrente', 'Assinante desde', 'Próxima cobrança'];
    const linhas = state.users.map((u) => {
      const a = ass[u.email] || {};
      return [u.nome, u.email, u.igreja, a.plano || u.plano, a.ciclo, a.vencimento || '', (a.valor || 0).toFixed(2).replace('.', ','), a.statusCobranca, a.metodo, a.gateway, a.recorrente ? 'Sim' : 'Não', a.desde, a.proxima];
    });
    const csv = [cab].concat(linhas).map((l) => l.map((c) => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(';')).join('\n');
    if (window.adminDownload) window.adminDownload('﻿' + csv, 'assinaturas-pastorhub.csv', 'text/csv');
    toast('CSV exportado com ' + linhas.length + ' assinaturas', 'ok');
  };

  /* inicia o motor de recorrência */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarRecorrencia);
  else iniciarRecorrencia();
  window.PastorFat = { processar: processarRecorrencia };
})();
