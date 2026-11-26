/* ============================================================
   Versículos diários do PastorHub
   Motor compartilhado pelo painel administrativo e pelo app
   (mobile, tablet e desktop). Persistência em localStorage.
   Seleção aleatória com rotação a cada 3 minutos.
   ============================================================ */
(function () {
  if (window.PastorVers) return;

  const K_CONFIG = 'pastorhub_vers_config';
  const K_BANCO = 'pastorhub_vers_banco';
  const K_LOG = 'pastorhub_vers_log';
  const K_ULT = 'pastorhub_vers_ultimo';

  const BANCO_PADRAO = [
    { ref: 'Lamentações 3:22-23', versao: 'ACF', texto: 'As misericórdias do Senhor são a causa de não sermos consumidos; porque as suas misericórdias não têm fim; novas são cada manhã; grande é a tua fidelidade.', ativo: true },
    { ref: 'Salmos 46:1', versao: 'ACF', texto: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.', ativo: true },
    { ref: 'Provérbios 3:5-6', versao: 'ACF', texto: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.', ativo: true },
    { ref: 'Isaías 41:10', versao: 'ACF', texto: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.', ativo: true },
    { ref: 'Filipenses 4:13', versao: 'ACF', texto: 'Posso todas as coisas naquele que me fortalece.', ativo: true },
    { ref: 'Salmos 23:1', versao: 'ACF', texto: 'O Senhor é o meu pastor; nada me faltará.', ativo: true },
    { ref: 'Josué 1:9', versao: 'ACF', texto: 'Sê forte e corajoso; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares.', ativo: true },
    { ref: 'Mateus 11:28', versao: 'ACF', texto: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.', ativo: true },
    { ref: 'Romanos 8:28', versao: 'ACF', texto: 'E sabemos que todas as coisas contribuem conjuntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.', ativo: true },
    { ref: 'Salmos 37:5', versao: 'ACF', texto: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', ativo: true },
    { ref: 'Salmos 119:105', versao: 'ACF', texto: 'Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.', ativo: true },
    { ref: 'Isaías 40:31', versao: 'ACF', texto: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.', ativo: true },
    { ref: 'Mateus 6:33', versao: 'ACF', texto: 'Mas buscai primeiro o Reino de Deus, e a sua justiça, e todas essas coisas vos serão acrescentadas.', ativo: true },
    { ref: 'João 14:27', versao: 'ACF', texto: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.', ativo: true },
    { ref: 'Salmos 91:1', versao: 'ACF', texto: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.', ativo: true },
    { ref: 'Hebreus 11:1', versao: 'ACF', texto: 'Ora, a fé é o firmamento das coisas que se esperam e a prova das coisas que se não veem.', ativo: true },
    { ref: 'Salmos 121:1-2', versao: 'ACF', texto: 'Elevo os meus olhos para os montes: de onde me vem o socorro? O meu socorro vem do Senhor, que fez o céu e a terra.', ativo: true },
    { ref: 'Provérbios 18:10', versao: 'ACF', texto: 'O nome do Senhor é torre forte; o justo corre para ela e está seguro.', ativo: true },
    { ref: 'Colossenses 3:23', versao: 'ACF', texto: 'E tudo quanto fizerdes, fazei-o de coração, como para o Senhor e não para os homens.', ativo: true },
    { ref: 'Salmos 118:24', versao: 'ACF', texto: 'Este é o dia que fez o Senhor; regozijemo-nos e alegremo-nos nele.', ativo: true },
    { ref: 'Gálatas 6:9', versao: 'ACF', texto: 'E não nos cansemos de fazer o bem, porque a seu tempo ceifaremos, se não houvermos desfalecido.', ativo: true },
    { ref: '1 Pedro 5:7', versao: 'ACF', texto: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.', ativo: true },
    { ref: 'Isaías 26:3', versao: 'ACF', texto: 'Tu conservarás em paz aquele que te guarda a mente firme, porque em ti confia.', ativo: true },
    { ref: 'Neemias 8:10', versao: 'ACF', texto: 'A alegria do Senhor é a vossa força.', ativo: true },
    { ref: 'Salmos 62:1', versao: 'ACF', texto: 'A minha alma espera somente em Deus; dele vem a minha salvação.', ativo: true },
    { ref: 'Tiago 1:5', versao: 'ACF', texto: 'E, se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente e não o lança em rosto; e ser-lhe-á dada.', ativo: true },
    { ref: 'Efésios 4:32', versao: 'ACF', texto: 'Antes, sede uns para com os outros benignos, compassivos, perdoando-vos uns aos outros, como também Deus, em Cristo, vos perdoou.', ativo: true },
    { ref: 'Salmos 55:22', versao: 'ACF', texto: 'Lança a tua sobrecarga sobre o Senhor, e ele te susterá; nunca permitirá que o justo seja abalado.', ativo: true },
  ];

  const CONFIG_PADRAO = {
    ativo: true,
    hora: '07:00',
    canais: { app: true, notificacao: true, whatsapp: false },
    versao: 'ACF',
  };

  /* ---------- persistência ---------- */
  function lerJSON(chave, padrao) {
    try {
      const v = JSON.parse(localStorage.getItem(chave));
      if (v != null) return v;
    } catch (e) {}
    return JSON.parse(JSON.stringify(padrao));
  }
  function salvarJSON(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; } catch (e) { return false; }
  }

  const config = () => Object.assign({}, CONFIG_PADRAO, lerJSON(K_CONFIG, {}));
  const salvarConfig = (c) => salvarJSON(K_CONFIG, c);
  const banco = () => {
    const b = lerJSON(K_BANCO, BANCO_PADRAO);
    return Array.isArray(b) && b.length ? b : JSON.parse(JSON.stringify(BANCO_PADRAO));
  };
  const salvarBanco = (b) => salvarJSON(K_BANCO, b);
  const log = () => lerJSON(K_LOG, []);

  /* ---------- seleção: versículo aleatório a cada 3 minutos ---------- */
  const INTERVALO_ROTACAO = 3 * 60 * 1000; // 3 minutos

  function chaveDia(d) {
    const dt = d || new Date();
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }

  /* janela de 3 minutos: o versículo muda quando o slot vira */
  function slotRotacao(ms) {
    return Math.floor((ms == null ? Date.now() : ms) / INTERVALO_ROTACAO);
  }

  /* PRNG semeado pelo slot: sorteia entre janelas e fica estável dentro delas */
  function randDoSlot(slot) {
    let s = (Math.imul(slot, 2654435761) ^ 0x9e3779b9) >>> 0;
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function doDia(data) {
    const ativos = banco().filter((v) => v.ativo !== false);
    if (!ativos.length) return null;
    const slot = slotRotacao(data ? data.getTime() : undefined);
    return ativos[Math.floor(randDoSlot(slot) * ativos.length)];
  }

  /* ---------- envio ---------- */
  function whatsappPronto() {
    try {
      const P = window.PastorAI;
      if (!P) return false;
      const p = P.provedor ? P.provedor('whatsapp') : null;
      return !!(p && P.integracaoPronta && P.integracaoPronta(p));
    } catch (e) { return false; }
  }

  function enviar(origem, forcar) {
    const hoje = chaveDia();
    if (!forcar && localStorage.getItem(K_ULT) === hoje) return null;
    const cfg = config();
    const verso = doDia();
    if (!verso) return null;
    const agora = new Date();
    const waOk = whatsappPronto();
    const reg = {
      id: 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      data: hoje,
      hora: String(agora.getHours()).padStart(2, '0') + ':' + String(agora.getMinutes()).padStart(2, '0'),
      origem: origem || 'automatico',
      ref: verso.ref,
      versao: verso.versao || cfg.versao,
      texto: verso.texto,
      canais: {
        app: cfg.canais.app !== false,
        notificacao: cfg.canais.notificacao !== false,
        whatsapp: cfg.canais.whatsapp ? (waOk ? 'enviado' : 'pendente (integração WhatsApp desligada)') : 'desligado',
      },
    };
    const lista = log();
    lista.unshift(reg);
    salvarJSON(K_LOG, lista.slice(0, 60));
    salvarJSON(K_ULT, hoje);
    document.dispatchEvent(new CustomEvent('pastorhub:versiculo', { detail: reg }));
    return reg;
  }

  function verificar() {
    const cfg = config();
    if (!cfg.ativo) return;
    const [h, m] = String(cfg.hora || '07:00').split(':').map(Number);
    const agora = new Date();
    if (agora.getHours() > h || (agora.getHours() === h && agora.getMinutes() >= (m || 0))) {
      enviar('automatico');
    }
  }

  function iniciar() {
    verificar();
    setInterval(verificar, 60000);
    /* repinta o card quando a janela de 3 minutos vira */
    let slotVisto = slotRotacao();
    setInterval(function () {
      const s = slotRotacao();
      if (s !== slotVisto) {
        slotVisto = s;
        pintar();
      }
    }, 5000);
  }

  /* ---------- card no app ---------- */
  function cardHTML() {
    const v = doDia();
    if (!v) return '';
    return '<div class="vers-card" id="vers-dia-card">' + corpoCard(v) + '</div>';
  }
  function corpoCard(v) {
    return '<div class="vers-topo">' +
        '<span class="vers-icone">' + (window.icon ? icon('book') : '📖') + '</span>' +
        '<div class="vers-tit"><b>Versículo do dia</b><small>' + escapeHtml(v.ref) + ' · ' + escapeHtml(v.versao || 'ACF') + '</small></div>' +
      '</div>' +
      '<p class="vers-texto">“' + escapeHtml(v.texto) + '”</p>' +
      '<div class="vers-acoes">' +
        '<button class="btn ghost sm" data-action="vers-copiar" data-id="' + escapeHtml(v.ref) + '" type="button">' + (window.icon ? icon('copy', 'icon-sm') : '⧉') + 'Copiar</button>' +
        '<button class="btn ghost sm" data-action="vers-whatsapp" type="button">' + (window.icon ? icon('message', 'icon-sm') : '💬') + 'Compartilhar</button>' +
      '</div>';
  }
  function pintar() {
    const el = document.getElementById('vers-dia-card');
    if (el) {
      const v = doDia();
      if (v) el.innerHTML = corpoCard(v);
    }
  }

  /* ---------- ações no app ---------- */
  const Actions = (window.Actions = window.Actions || {});
  Actions['vers-copiar'] = function (el) {
    const v = doDia();
    const txt = '“' + v.texto + '” — ' + v.ref + ' (' + (v.versao || 'ACF') + ') · PastorHub';
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
      .then(() => window.toast && toast('Versículo copiado', 'success'))
      .catch(() => window.toast && toast('Não foi possível copiar', 'error'));
  };
  Actions['vers-whatsapp'] = function () {
    const v = doDia();
    const txt = '📖 *' + v.ref + '* (' + (v.versao || 'ACF') + ')\n“' + v.texto + '”\n\nEnviado pelo PastorHub';
    window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener,noreferrer');
  };

  /* quando o versículo do dia chega (envio automático): atualiza o card e avisa */
  document.addEventListener('pastorhub:versiculo', (e) => {
    pintar();
    if (window.toast) {
      const cfg = config();
      if (cfg.canais.notificacao !== false) toast('📖 Versículo do dia · ' + e.detail.ref, 'success');
    }
  });

  iniciar();

  /* API pública */
  window.PastorVers = {
    config, salvarConfig,
    banco, salvarBanco, bancoPadrao: BANCO_PADRAO,
    log,
    doDia, enviar, whatsappPronto,
    cardHTML, pintar,
  };
})();
