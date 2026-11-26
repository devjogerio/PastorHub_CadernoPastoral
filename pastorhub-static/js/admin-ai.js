/* ============================================================
   Painel admin · Integrações (chaves de API) e Base de conhecimento RAG
   Depende de: admin.js (window.AdminAPI) e ai.js (window.PastorAI)
   ============================================================ */
(function () {
  const A = window.AdminAPI;
  const P = window.PastorAI;
  if (!A || !P) return;

  const { VIEWS, state, render, modal, confirmAction, toast, kpi, panel, esc, Actions } = A;
  const ic = (nome, cls) => window.icon(nome, cls);

  const STATUS = {
    conectada: ['Conectada', 'tag-green'],
    pausada: ['Pausada', 'tag-amber'],
    incompleta: ['Incompleta', 'tag-red'],
    'nao-configurada': ['Não configurada', 'tag-gray'],
  };

  const RAG_UI = { agente: 'homiletica', resultado: null, carregando: false, filtro: 'todas', ultimoEnvio: null };

  function fmtData(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function mascarar(valor) {
    const v = String(valor || '');
    return v.length <= 6 ? '••••' : '••••••••' + v.slice(-4);
  }

  function barra(titulo, extra) {
    return '<div class="toolbar"><span class="item-meta" style="font-weight:600;color:var(--navy)">' + esc(titulo) + '</span>' +
      '<div class="grow"></div>' + (extra || '') + '</div>';
  }

  function copiarTexto(texto) {
    const fim = () => toast('Copiado para a área de transferência', 'ok');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(fim, () => toast('Não foi possível copiar', 'err'));
      return;
    }
    const area = document.createElement('textarea');
    area.value = texto;
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); fim(); } catch (e) { toast('Não foi possível copiar', 'err'); }
    area.remove();
  }

  /* =========================================================
     INTEGRAÇÕES · ecossistema com chaves de API
     ========================================================= */
  function badgeStatus(p) {
    const st = STATUS[P.statusIntegracao(p)];
    return '<span class="tag ' + st[1] + '">' + st[0] + '</span>';
  }

  function cardIntegracao(p) {
    const r = P.obterIntegracao(p.id) || {};
    const st = P.statusIntegracao(p);
    const configurada = st !== 'nao-configurada';
    const tipo = p.ia ? (p.local ? 'Local · gratuito' : p.gratuito ? 'Gratuito' : 'Pago') : '';
    const teste = r.teste
      ? '<div class="int-teste ' + (r.teste.ok ? 'ok' : 'erro') + '">' + esc(r.teste.msg) + '<small>' + esc(fmtData(r.teste.em)) + '</small></div>'
      : '<div class="int-teste">Ainda não testada</div>';
    return '<div class="module-card int-card">' +
      '<div class="m-top"><span class="m-icon" style="background:' + p.cor + '22;color:' + p.cor + '">' + ic(p.icone) + '</span>' +
        '<div><b>' + esc(p.nome) + '</b><span>' + esc(p.desc) + '</span></div></div>' +
      '<div class="int-tags">' + badgeStatus(p) +
        (tipo ? '<span class="tag ' + (p.gratuito ? 'tag-lime' : 'tag-purple') + '">' + tipo + '</span>' : '') +
        (r.campos && r.campos.modelo ? '<span class="tag tag-blue">' + esc(r.campos.modelo) + '</span>' : '') +
      '</div>' +
      teste +
      '<div class="int-acoes">' +
        '<button class="btn btn-primary btn-sm" data-action="int-configurar" data-id="' + p.id + '">' + ic('edit', 'icon-sm') + (configurada ? 'Editar' : 'Configurar') + '</button>' +
        '<button class="btn btn-outline btn-sm" data-action="int-testar" data-id="' + p.id + '"' + (configurada ? '' : ' disabled') + '>' + ic('zap', 'icon-sm') + 'Testar conexão</button>' +
        (configurada ? '<button class="btn btn-outline btn-sm" data-action="int-toggle" data-id="' + p.id + '">' + ic(r.ativo ? 'x' : 'check', 'icon-sm') + (r.ativo ? 'Pausar' : 'Ativar') + '</button>' : '') +
        (configurada && p.campos.some((f) => f.secreto) ? '<button class="btn btn-outline btn-sm" data-action="int-mostrar" data-id="' + p.id + '">' + ic('eye', 'icon-sm') + 'Ver chave</button>' : '') +
        (configurada && p.campos.some((f) => f.secreto) ? '<button class="btn btn-outline btn-sm" data-action="int-rotacionar" data-id="' + p.id + '">' + ic('refresh-cw', 'icon-sm') + 'Rotacionar</button>' : '') +
        (configurada ? '<button class="btn btn-danger btn-sm" data-action="int-remover" data-id="' + p.id + '">' + ic('trash-2', 'icon-sm') + 'Remover</button>' : '') +
        (p.console ? '<a class="btn btn-outline btn-sm" href="' + p.console + '" target="_blank" rel="noopener">' + ic('chevron-right', 'icon-sm') + 'Console</a>' : '') +
      '</div></div>';
  }

  function camposFormulario(p, limpar) {
    const r = P.obterIntegracao(p.id) || {};
    const c = r.campos || {};
    return p.campos.map((f) => {
      if (limpar && f.secreto) return fCampoSimples(f, '');
      const valor = c[f.k] != null ? c[f.k] : (f.padrao || '');
      return fCampoSimples(f, valor);
    }).join('');
  }

  function fCampoSimples(f, valor) {
    let controle;
      if (f.lista && f.lista.length) {
        controle = '<input id="cf-' + f.k + '" list="dl-' + f.k + '" value="' + esc(valor) + '" placeholder="' + esc(f.ph || '') + '">' +
          '<datalist id="dl-' + f.k + '">' + f.lista.map((x) => '<option value="' + esc(x) + '">').join('') + '</datalist>';
      } else {
        controle = '<div class="input-com-botao"><input id="cf-' + f.k + '" type="' + (f.secreto ? 'password' : 'text') + '" value="' + esc(valor) +
          '" placeholder="' + esc(f.ph || '') + '" autocomplete="off">' +
          (f.secreto ? '<button type="button" class="btn-mostrar" data-mostrar="cf-' + f.k + '" title="Mostrar ou ocultar">' + ic('eye', 'icon-sm') + '</button>' : '') +
          '</div>';
      }
    return '<div class="field"><label>' + esc(f.rotulo) + (f.opcional ? ' <small class="opcional">(opcional)</small>' : '') + '</label>' + controle + '</div>';
  }

  function lerCampos(p) {
    const campos = {};
    p.campos.forEach((f) => {
      const el = document.getElementById('cf-' + f.k);
      campos[f.k] = el ? el.value.trim() : '';
    });
    return campos;
  }

  function faltando(p, campos) {
    return p.campos.filter((f) => !f.opcional && !campos[f.k]).map((f) => f.rotulo);
  }

  async function testarEGuardar(p, campos) {
    const r = await P.testarIntegracao(p, campos);
    P.salvarIntegracao(p.id, { teste: { ok: r.ok, msg: r.msg, em: new Date().toISOString() } });
    toast(p.nome + ': ' + r.msg, r.ok ? 'ok' : 'err');
    render();
    return r;
  }

  function abrirConfig(p, limpar) {
    const notaChave = p.servidor
      ? '<div class="info-box blue"><div>🔑</div><div>Este serviço é chamado pelo <b>servidor</b> (Edge Function <code>ai-proxy</code> via <code>supabase secrets</code>). Nenhuma chave fica neste navegador.</div></div>'
      : (p.console
        ? '<div class="info-box blue"><div>🔑</div><div>Obtenha a chave em <a href="' + p.console + '" target="_blank" rel="noopener">console do provedor</a>. Por segurança, ela fica <b>apenas em memória nesta sessão</b> — não é gravada no navegador. Para uso contínuo, configure o segredo no servidor (Edge Function).</div></div>'
        : '');
    const corpo = notaChave +
      (limpar ? '<div class="info-box yellow"><div>♻️</div><div>Rotação: cole a chave nova. Ao salvar, a chave anterior deixa de ser usada pelo PastorHub.</div></div>' : '') +
      '<div id="cf-corpo">' + camposFormulario(p, limpar) + '</div>' +
      '<div id="cf-resultado"></div>';

    modal({
      title: (P.obterIntegracao(p.id) ? 'Editar · ' : 'Configurar · ') + p.nome,
      confirmLabel: 'Salvar e testar',
      body: corpo,
      onSave() {
        const campos = lerCampos(p);
        const falta = faltando(p, campos);
        if (falta.length) { toast('Preencha: ' + falta.join(', '), 'err'); return false; }
        const atual = P.obterIntegracao(p.id) || {};
        P.salvarIntegracao(p.id, { campos, ativo: true, atualizadoEm: new Date().toISOString(), rotacionadoEm: limpar ? new Date().toISOString() : atual.rotacionadoEm });
        testarEGuardar(p, campos);
      },
    });

    // botão extra: testar sem salvar
    const foot = document.querySelector('#admin-modal-root .modal-foot');
    if (foot) {
      const testar = document.createElement('button');
      testar.className = 'btn btn-outline';
      testar.innerHTML = ic('zap', 'icon-sm') + 'Apenas testar';
      testar.addEventListener('click', async () => {
        const campos = lerCampos(p);
        const falta = faltando(p, campos);
        if (falta.length) { toast('Preencha: ' + falta.join(', '), 'err'); return; }
        testar.disabled = true;
        const r = await P.testarIntegracao(p, campos);
        const box = document.getElementById('cf-resultado');
        if (box) box.innerHTML = '<div class="int-teste ' + (r.ok ? 'ok' : 'erro') + '">' + esc(r.msg) + '</div>';
        testar.disabled = false;
      });
      foot.insertBefore(testar, foot.lastElementChild);
    }
  }

  function janelaChaves(p) {
    const r = P.obterIntegracao(p.id) || {};
    const segredos = p.campos.filter((f) => f.secreto && r.campos && r.campos[f.k]);
    const linhas = (segredos.length ? segredos : p.campos).map((f) => {
      const valor = (r.campos && r.campos[f.k]) || '';
      return '<div class="setting-row"><div><b>' + esc(f.rotulo) + '</b>' +
        '<span><code class="chave-valor">' + esc(f.secreto ? valor : valor) + '</code></span></div>' +
        '<button class="btn btn-outline btn-sm" data-action="int-copiar" data-id="' + p.id + '" data-campo="' + f.k + '">' + ic('copy', 'icon-sm') + 'Copiar</button></div>';
    }).join('');
    modal({
      title: 'Chaves · ' + p.nome,
      confirmLabel: 'Fechar',
      body: '<div class="info-box yellow"><div>⚠️</div><div>Não compartilhe chaves. Quem tiver a chave usa a sua conta no provedor.</div></div>' + linhas,
      onSave() {},
    });
  }

  VIEWS.integracoes = function () {
    const todos = P.CATALOGO;
    const conectadas = todos.filter((p) => P.statusIntegracao(p) === 'conectada').length;
    const comChave = todos.filter((p) => p.campos.some((f) => f.secreto) && P.statusIntegracao(p) !== 'nao-configurada').length;
    const iaProntas = P.provedoresConfigurados().length;
    const iaGratis = todos.filter((p) => p.ia && p.gratuito).length;
    const grupos = [...new Set(todos.map((p) => p.grupo))];
    const hooks = P.listarWebhooks();

    const cards = grupos.map((g) => panel(g,
      '<div class="module-grid">' + todos.filter((p) => p.grupo === g).map(cardIntegracao).join('') + '</div>',
      { sub: g.indexOf('IA') === 0 ? 'Provedores de LLM usados pelos agentes RAG' : 'Integrações do ecossistema' })).join('');

    const chaves = todos.filter((p) => p.campos.some((f) => f.secreto) && P.statusIntegracao(p) !== 'nao-configurada').map((p) => {
      const r = P.obterIntegracao(p.id) || {};
      const c = r.campos || {};
      const segredo = p.campos.find((f) => f.secreto && c[f.k]) || p.campos[0];
      return '<tr><td><b style="color:var(--navy)">' + esc(p.nome) + '</b><div class="sub-texto">' + esc(segredo.rotulo) + '</div></td>' +
        '<td><code class="chave-valor">' + esc(mascarar(c[segredo.k])) + '</code></td>' +
        '<td>' + badgeStatus(p) + '</td>' +
        '<td style="white-space:nowrap">' + esc(fmtData(r.atualizadoEm)) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="btn btn-outline btn-sm" data-action="int-mostrar" data-id="' + p.id + '">' + ic('eye', 'icon-sm') + 'Ver</button>' +
          '<button class="btn btn-outline btn-sm" data-action="int-rotacionar" data-id="' + p.id + '">' + ic('refresh-cw', 'icon-sm') + 'Rotacionar</button>' +
          '<button class="icon-btn danger" data-action="int-remover" data-id="' + p.id + '" title="Remover chave">' + ic('trash-2') + '</button>' +
        '</div></td></tr>';
    }).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px">Nenhuma chave configurada ainda</td></tr>';

    const linhasWh = hooks.map((w, i) =>
      '<tr><td><b style="color:var(--navy)">' + esc(w.nome) + '</b><div class="sub-texto">' + esc(w.url) + '</div></td>' +
      '<td><span class="tag tag-gray">' + esc(w.evento) + '</span></td>' +
      '<td>' + (w.ativo ? '<span class="tag tag-green">Ativo</span>' : '<span class="tag tag-amber">Pausado</span>') + '</td>' +
      '<td>' + (w.ultimoTeste ? '<span class="sub-texto">' + esc(w.ultimoTeste.msg) + '</span>' : '<span class="sub-texto">Não testado</span>') + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn btn-outline btn-sm" data-action="webhook-testar" data-idx="' + i + '">' + ic('zap', 'icon-sm') + 'Testar</button>' +
        '<button class="btn btn-outline btn-sm" data-action="webhook-toggle" data-idx="' + i + '">' + ic(w.ativo ? 'x' : 'check', 'icon-sm') + (w.ativo ? 'Pausar' : 'Ativar') + '</button>' +
        '<button class="btn btn-outline btn-sm" data-action="webhook-editar" data-idx="' + i + '">' + ic('edit', 'icon-sm') + 'Editar</button>' +
        '<button class="icon-btn danger" data-action="webhook-remover" data-idx="' + i + '" title="Remover">' + ic('trash-2') + '</button>' +
      '</div></td></tr>').join('') || '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px">Nenhum webhook cadastrado</td></tr>';

    return '<div class="kpi-grid">' +
      kpi('Integrações conectadas', conectadas, 'de ' + todos.length + ' disponíveis', 'zap', 'b-navy') +
      kpi('Chaves configuradas', comChave, 'guardadas neste navegador', 'key', 'b-amber') +
      kpi('IAs prontas para os agentes', iaProntas, iaGratis + ' provedores gratuitos', 'sparkles', 'b-lime') +
      kpi('Webhooks', hooks.length, hooks.filter((w) => w.ativo).length + ' ativos', 'server', 'b-blue') +
      '</div>' +
      '<div class="int-barra">' +
        '<button class="btn btn-primary btn-sm" data-action="int-testar-tudo">' + ic('zap', 'icon-sm') + 'Testar todas as conexões</button>' +
        '<button class="btn btn-outline btn-sm" data-action="int-exportar">' + ic('download', 'icon-sm') + 'Exportar configuração (sem chaves)</button>' +
      '</div>' +
      cards +
      panel('Chaves de API', '<div class="table-wrap"><table class="data"><thead><tr><th>Integração</th><th>Chave</th><th>Status</th><th>Atualizada</th><th></th></tr></thead><tbody>' + chaves + '</tbody></table></div>',
        { flush: true, sub: 'Valores mascarados. Use "Ver" para exibir ou copiar.' }) +
      panel('Webhooks', barra('Eventos enviados para sistemas externos',
          '<button class="btn btn-primary btn-sm" data-action="webhook-novo">' + ic('plus', 'icon-sm') + 'Webhook</button>') +
        '<div class="table-wrap"><table class="data"><thead><tr><th>Destino</th><th>Evento</th><th>Status</th><th>Último teste</th><th></th></tr></thead><tbody>' + linhasWh + '</tbody></table></div>',
        { flush: true, sub: 'O destino precisa aceitar requisições do navegador (CORS) para confirmar a entrega' });
  };

  /* ---------- Ações de integrações ---------- */
  function provedorDoEl(el) { return P.provedor(el.dataset.id); }

  Actions['int-configurar'] = function (el) { abrirConfig(provedorDoEl(el), false); };

  Actions['int-rotacionar'] = function (el) {
    const p = provedorDoEl(el);
    abrirConfig(p, true);
  };

  Actions['int-testar'] = async function (el) {
    const p = provedorDoEl(el);
    await testarEGuardar(p, null);
  };

  Actions['int-toggle'] = function (el) {
    const p = provedorDoEl(el);
    const r = P.obterIntegracao(p.id) || {};
    P.salvarIntegracao(p.id, { ativo: !r.ativo });
    toast(p.nome + (r.ativo ? ' pausada' : ' ativada'), 'ok');
    render();
  };

  Actions['int-mostrar'] = function (el) { janelaChaves(provedorDoEl(el)); };

  Actions['int-copiar'] = function (el) {
    const p = provedorDoEl(el);
    const r = P.obterIntegracao(p.id) || {};
    copiarTexto((r.campos || {})[el.dataset.campo] || '');
  };

  Actions['int-remover'] = function (el) {
    const p = provedorDoEl(el);
    confirmAction('Remover integração', 'Apagar a configuração e a chave de <b>' + esc(p.nome) + '</b> deste navegador?', () => {
      P.removerIntegracao(p.id);
      toast(p.nome + ' removida', 'ok');
      render();
    });
  };

  Actions['int-testar-tudo'] = async function () {
    const configuradas = P.CATALOGO.filter((p) => P.statusIntegracao(p) !== 'nao-configurada');
    if (!configuradas.length) { toast('Nenhuma integração configurada para testar', 'err'); return; }
    toast('Testando ' + configuradas.length + ' integrações…', 'ok');
    let ok = 0;
    for (const p of configuradas) {
      const r = await P.testarIntegracao(p);
      P.salvarIntegracao(p.id, { teste: { ok: r.ok, msg: r.msg, em: new Date().toISOString() } });
      if (r.ok) ok++;
    }
    toast(ok + ' de ' + configuradas.length + ' conexões confirmadas', ok === configuradas.length ? 'ok' : 'err');
    render();
  };

  Actions['int-exportar'] = function () {
    const dados = P.CATALOGO.map((p) => {
      const r = P.obterIntegracao(p.id) || {};
      const campos = {};
      p.campos.forEach((f) => { campos[f.k] = f.secreto ? (r.campos && r.campos[f.k] ? '<definida>' : '') : ((r.campos && r.campos[f.k]) || ''); });
      return { id: p.id, nome: p.nome, status: P.statusIntegracao(p), ativo: !!r.ativo, campos, ultimoTeste: r.teste || null };
    });
    window.adminDownload(JSON.stringify({ exportadoEm: new Date().toISOString(), integracoes: dados }, null, 2),
      'integracoes-pastorhub.json', 'application/json');
    toast('Configuração exportada (chaves não incluídas)', 'ok');
  };

  /* ---------- Webhooks ---------- */
  function formWebhook(w) {
    const eventos = ['sermon.created', 'attendance.scheduled', 'sync.completed', 'ai.response', 'reminder.confirmed'];
    return '<div class="field"><label>Nome</label><input id="wh-nome" value="' + esc(w ? w.nome : '') + '" placeholder="Ex: CRM da igreja"></div>' +
      '<div class="field"><label>URL de destino (https)</label><input id="wh-url" value="' + esc(w ? w.url : '') + '" placeholder="https://"></div>' +
      '<div class="field-row">' +
        '<div class="field"><label>Evento</label><select id="wh-evento">' +
          eventos.map((e) => '<option' + (w && w.evento === e ? ' selected' : '') + '>' + e + '</option>').join('') + '</select></div>' +
        '<div class="field"><label>Segredo (opcional)</label><input id="wh-segredo" type="password" value="' + esc(w ? w.segredo || '' : '') + '" autocomplete="off"></div>' +
      '</div>';
  }

  function lerWebhook(root) {
    const v = (id) => root.querySelector('#' + id).value.trim();
    return { nome: v('wh-nome'), url: v('wh-url'), evento: v('wh-evento'), segredo: v('wh-segredo') };
  }

  Actions['webhook-novo'] = function () {
    modal({
      title: 'Novo webhook', confirmLabel: 'Criar webhook', body: formWebhook(null),
      onSave(root) {
        const w = lerWebhook(root);
        if (!w.nome || !/^https:\/\//.test(w.url)) { toast('Informe o nome e uma URL https://', 'err'); return false; }
        const lista = P.listarWebhooks();
        lista.unshift(Object.assign({ ativo: true }, w));
        P.salvarWebhooks(lista);
        toast('Webhook criado', 'ok');
        render();
      },
    });
  };

  Actions['webhook-editar'] = function (el) {
    const i = Number(el.dataset.idx);
    const lista = P.listarWebhooks();
    const w = lista[i];
    if (!w) return;
    modal({
      title: 'Editar webhook', confirmLabel: 'Salvar', body: formWebhook(w),
      onSave(root) {
        const d = lerWebhook(root);
        if (!d.nome || !/^https:\/\//.test(d.url)) { toast('Informe o nome e uma URL https://', 'err'); return false; }
        Object.assign(w, d);
        P.salvarWebhooks(lista);
        toast('Webhook atualizado', 'ok');
        render();
      },
    });
  };

  Actions['webhook-testar'] = async function (el) {
    const lista = P.listarWebhooks();
    const w = lista[Number(el.dataset.idx)];
    if (!w) return;
    const r = await P.testarWebhook(w);
    w.ultimoTeste = { ok: r.ok, msg: r.msg, em: new Date().toISOString() };
    P.salvarWebhooks(lista);
    toast(w.nome + ': ' + r.msg, r.ok ? 'ok' : 'err');
    render();
  };

  Actions['webhook-toggle'] = function (el) {
    const lista = P.listarWebhooks();
    const w = lista[Number(el.dataset.idx)];
    if (!w) return;
    w.ativo = !w.ativo;
    P.salvarWebhooks(lista);
    toast(w.nome + (w.ativo ? ' ativado' : ' pausado'), 'ok');
    render();
  };

  Actions['webhook-remover'] = function (el) {
    const i = Number(el.dataset.idx);
    const w = P.listarWebhooks()[i];
    if (!w) return;
    confirmAction('Remover webhook', 'Remover <b>' + esc(w.nome) + '</b>?', () => {
      const lista = P.listarWebhooks();
      lista.splice(i, 1);
      P.salvarWebhooks(lista);
      toast('Webhook removido', 'ok');
      render();
    });
  };

  /* =========================================================
     BASE DE CONHECIMENTO (RAG) · upload, documentos, agentes
     ========================================================= */
  function nomeColecao(id) {
    const c = P.COLECOES.find((x) => x.id === id);
    return c ? c.nome : id;
  }

  function opcoesColecao(atual) {
    return P.COLECOES.map((c) => '<option value="' + c.id + '"' + (c.id === atual ? ' selected' : '') + '>' + esc(c.nome) + '</option>').join('');
  }

  async function processarArquivos(lista) {
    const arquivos = Array.from(lista || []);
    if (!arquivos.length) return;
    const colecao = (document.getElementById('rag-colecao') || {}).value || 'geral';
    const resultados = [];
    const barra = () => document.getElementById('rag-progresso');
    for (let i = 0; i < arquivos.length; i++) {
      const f = arquivos[i];
      const el = barra();
      if (el) {
        el.hidden = false;
        el.innerHTML = '<b>' + esc(f.name) + '</b> — extraindo texto…' +
          '<div class="progress-track"><div class="progress-fill lime" style="width:12%"></div></div>';
      }
      try {
        const d = await P.ingerirArquivo(f, colecao, {
          maxPaginas: 20,
          onProgress(info) {
            const box = barra();
            if (!box) return;
            const pct = Math.round(((i + (info.pct || 0)) / arquivos.length) * 100);
            const rotulo = info.fase === 'ocr' || info.fase === 'ocr-imagem'
              ? 'OCR página ' + info.pagina + '/' + info.total + ' (Tesseract.js, pt-BR)'
              : 'extraindo texto…';
            box.innerHTML = '<b>' + esc(f.name) + '</b> — ' + esc(rotulo) +
              '<div class="progress-track"><div class="progress-fill lime" style="width:' + Math.max(8, pct) + '%"></div></div>';
          },
        });
        const notaOCR = d.ocr ? ' · OCR' + (d.truncado ? ' (' + d.paginasOcr + '/' + d.paginasTotal + ' páginas)' : '') : '';
        resultados.push({ nome: f.name, ok: true, msg: d.chunks.length + ' trechos · ' + d.metodo + (d.paginas ? ' · ' + d.paginas + ' páginas' : '') + notaOCR });
      } catch (e) {
        resultados.push({ nome: f.name, ok: false, msg: e.message || 'erro ao processar' });
      }
    }
    RAG_UI.ultimoEnvio = resultados;
    const sucesso = resultados.filter((r) => r.ok).length;
    toast(sucesso + ' de ' + arquivos.length + ' arquivo(s) indexado(s)', sucesso === arquivos.length ? 'ok' : 'err');
    render();
  }

  function painelUpload() {
    const ultimo = RAG_UI.ultimoEnvio
      ? '<div class="rag-envio">' + RAG_UI.ultimoEnvio.map((r) =>
          '<div class="rag-envio-item ' + (r.ok ? 'ok' : 'erro') + '">' + ic(r.ok ? 'check-circle' : 'alert-circle', 'icon-sm') +
          '<b>' + esc(r.nome) + '</b><span>' + esc(r.msg) + '</span></div>').join('') + '</div>'
      : '';
    return '<div class="rag-upload">' +
      '<div id="rag-drop" class="rag-drop">' +
        ic('upload', 'icon-lg') +
        '<b>Arraste arquivos .md, .pdf ou imagens aqui</b>' +
        '<span>ou escolha no computador</span>' +
        '<label class="btn btn-primary btn-sm rag-escolher">' + ic('plus', 'icon-sm') + 'Escolher arquivos' +
          '<input id="rag-file" type="file" multiple accept=".md,.markdown,.txt,.pdf,.png,.jpg,.jpeg,.webp" style="display:none"></label>' +
        '<small>Processados neste navegador. PDFs com texto usam pdf.js; digitalizados e imagens passam por OCR (Tesseract.js, português), que precisa de internet. Até 20 páginas por PDF.</small>' +
      '</div>' +
      '<div id="rag-progresso" class="rag-progresso" hidden></div>' +
      '<div class="rag-colecao-linha"><label>Coleção de destino</label><select id="rag-colecao">' + opcoesColecao('sermoes') + '</select>' +
        '<span class="sub-texto">Os agentes consultam as coleções que você vincular a eles.</span></div>' +
      ultimo +
    '</div>';
  }

  function linhaDocumento(d) {
    const cor = d.tipo === 'pdf' ? '#d4183d' : '#3261AB';
    return '<tr><td><div class="cell-user"><span class="avatar" style="background:' + cor + ';font-size:.62rem">' + esc(d.tipo.toUpperCase()) + '</span>' +
      '<div><b>' + esc(d.nome) + '</b><span>' + esc(fmtData(d.criadoEm)) + ' · ' + esc(d.metodo) + '</span></div></div></td>' +
      '<td><span class="tag tag-blue">' + esc(nomeColecao(d.colecao)) + '</span></td>' +
      '<td style="text-align:center">' + d.chunks.length + '</td>' +
      '<td style="text-align:center">' + Number(d.palavras || 0).toLocaleString('pt-BR') + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn btn-outline btn-sm" data-action="rag-ver" data-id="' + d.id + '">' + ic('eye', 'icon-sm') + 'Trechos</button>' +
        '<button class="btn btn-outline btn-sm" data-action="rag-colecao" data-id="' + d.id + '">' + ic('edit', 'icon-sm') + 'Coleção</button>' +
        '<button class="icon-btn" data-action="rag-baixar" data-id="' + d.id + '" title="Baixar texto extraído">' + ic('download') + '</button>' +
        '<button class="icon-btn danger" data-action="rag-excluir" data-id="' + d.id + '" title="Excluir">' + ic('trash-2') + '</button>' +
      '</div></td></tr>';
  }

  function cardAgente(a, i) {
    const pronto = a.provedor && P.provedor(a.provedor) && P.integracaoPronta(P.provedor(a.provedor));
    const llm = pronto ? P.provedor(a.provedor).nome + ' · ' + (a.modelo || P.provedor(a.provedor).modeloPadrao) : 'Modo extrativo (sem LLM)';
    return '<div class="module-card rag-agente">' +
      '<div class="m-top"><span class="m-icon">' + ic('sparkles') + '</span><div><b>' + esc(a.nome) + '</b><span>' + esc(a.funcao) + '</span></div></div>' +
      '<div class="int-tags">' + (a.colecoes || []).map((c) => '<span class="tag tag-blue">' + esc(nomeColecao(c)) + '</span>').join('') + '</div>' +
      '<div class="sub-texto"><b>Motor:</b> ' + esc(llm) + '</div>' +
      '<div class="sub-texto"><b>Trechos por resposta:</b> ' + a.topK + ' · <b>Temperatura:</b> ' + a.temperatura + '</div>' +
      '<div class="int-acoes">' +
        '<button class="btn btn-outline btn-sm" data-action="rag-agente-config" data-idx="' + i + '">' + ic('edit', 'icon-sm') + 'Configurar</button>' +
        '<button class="btn btn-primary btn-sm" data-action="rag-agente-usar" data-id="' + a.id + '">' + ic('message', 'icon-sm') + 'Testar agente</button>' +
      '</div></div>';
  }

  function formAgente(a) {
    const provedores = P.CATALOGO.filter((p) => p.ia);
    return fCampoRag('Nome do agente', '<input id="ag-nome" value="' + esc(a.nome) + '">') +
      fCampoRag('Função', '<input id="ag-funcao" value="' + esc(a.funcao) + '">') +
      fCampoRag('Coleções que ele consulta', '<div class="chips-escolha">' + P.COLECOES.map((c) =>
        '<label class="chip-check"><input type="checkbox" name="ag-col" value="' + c.id + '"' + ((a.colecoes || []).includes(c.id) ? ' checked' : '') + '>' + esc(c.nome) + '</label>').join('') + '</div>') +
      '<div class="field-row">' +
        fCampoRag('Motor de linguagem (LLM)', '<select id="ag-provedor"><option value="">Nenhum · modo extrativo (sem chave)</option>' +
          provedores.map((p) => '<option value="' + p.id + '"' + (a.provedor === p.id ? ' selected' : '') + '>' + esc(p.nome) +
            (P.integracaoPronta(p) ? '' : ' — não configurado') + '</option>').join('') + '</select>') +
        fCampoRag('Modelo (opcional)', '<input id="ag-modelo" value="' + esc(a.modelo || '') + '" placeholder="deixe vazio para o padrão do provedor">') +
      '</div>' +
      '<div class="field-row">' +
        fCampoRag('Trechos por resposta', '<input id="ag-topk" type="number" min="1" max="10" value="' + a.topK + '">') +
        fCampoRag('Temperatura (' + a.temperatura + ')', '<input id="ag-temp" type="range" min="0" max="1" step="0.1" value="' + a.temperatura + '" oninput="this.previousElementSibling.textContent=\'Temperatura (\'+this.value+\')\'">') +
      '</div>' +
      fCampoRag('Instruções do agente (system prompt)', '<textarea id="ag-sistema" rows="4">' + esc(a.sistema || '') + '</textarea>');
  }

  function fCampoRag(rotulo, html) {
    return '<div class="field"><label>' + esc(rotulo) + '</label>' + html + '</div>';
  }

  function resultadoConsulta() {
    const r = RAG_UI.resultado;
    if (RAG_UI.carregando) return '<div class="rag-carregando"><span class="spinner"></span>Consultando a base e o agente…</div>';
    if (!r) return '<p class="sub-texto">Escolha um agente, digite uma pergunta e consulte. A resposta mostra as fontes usadas.</p>';
    const modo = { llm: ['LLM · ' + (r.provedor || '') + (r.modelo ? ' · ' + r.modelo : ''), 'tag-green'],
      extrativo: ['Modo extrativo · sem LLM', 'tag-amber'],
      'sem-contexto': ['Sem trechos relevantes', 'tag-gray'],
      'erro-llm': ['Erro no LLM · resultado extrativo', 'tag-red'] }[r.modo];
    return '<div class="int-tags"><span class="tag ' + modo[1] + '">' + esc(modo[0]) + '</span><span class="tag tag-blue">' + esc(r.agente) + '</span></div>' +
      '<div class="rag-resposta">' + esc(r.texto) + '</div>' +
      (r.fontes.length ? '<h4 class="rag-fontes-titulo">Fontes consultadas</h4>' + r.fontes.map((f) =>
        '<div class="rag-fonte"><span class="rag-num">' + f.n + '</span><div><b>' + esc(f.doc) + '</b>' +
        '<span class="sub-texto"> · ' + esc(nomeColecao(f.colecao)) + (f.secao ? ' · ' + esc(f.secao) : '') + ' · relevância ' + f.score.toFixed(2) + '</span>' +
        '<p>' + esc(f.texto.slice(0, 260)) + (f.texto.length > 260 ? '…' : '') + '</p></div></div>').join('') : '');
  }

  function painelPlayground() {
    const agentes = P.listarAgentes();
    return '<div class="rag-play">' +
      '<div class="field-row"><div class="field"><label>Agente</label><select id="rag-agente">' +
        agentes.map((a) => '<option value="' + a.id + '"' + (a.id === RAG_UI.agente ? ' selected' : '') + '>' + esc(a.nome) + '</option>').join('') +
      '</select></div>' +
      '<div class="field"><label>Motor</label><div class="sub-texto" style="padding-top:9px">' +
        (P.provedoresConfigurados().length ? P.provedoresConfigurados().map((p) => esc(p.nome)).join(' · ') : 'Nenhum LLM configurado — respostas extrativas') +
      '</div></div></div>' +
      '<div class="field"><label>Pergunta</label><textarea id="rag-pergunta" rows="2" placeholder="Ex: Como estruturar um sermão expositivo sobre Mateus 17?">' + esc(RAG_UI.pergunta || '') + '</textarea></div>' +
      '<div class="row-actions" style="justify-content:flex-start"><button class="btn btn-primary" data-action="rag-consultar"' + (RAG_UI.carregando ? ' disabled' : '') + '>' +
        ic('sparkles', 'icon-sm') + 'Consultar agente</button></div>' +
      '<div class="rag-resultado">' + resultadoConsulta() + '</div>' +
    '</div>';
  }

  VIEWS.rag = function () {
    const docs = P.listarDocumentos();
    const agentes = P.listarAgentes();
    const trechos = docs.reduce((s, d) => s + d.chunks.length, 0);
    const palavras = docs.reduce((s, d) => s + (d.palavras || 0), 0);
    const llms = P.provedoresConfigurados();
    const filtrados = docs.filter((d) => RAG_UI.filtro === 'todas' || d.colecao === RAG_UI.filtro);

    const linhas = filtrados.map(linhaDocumento).join('') ||
      '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:26px">Nenhum documento nesta coleção. Envie arquivos .md ou .pdf acima.</td></tr>';

    const provedoresChips = P.CATALOGO.filter((p) => p.ia).map((p) => {
      const st = P.statusIntegracao(p);
      return '<button class="rag-prov ' + (st === 'conectada' ? 'ok' : '') + '" data-action="int-configurar" data-id="' + p.id + '">' +
        '<b>' + esc(p.nome) + '</b><span>' + (p.gratuito ? (p.local ? 'local' : 'gratuito') : 'pago') + ' · ' + STATUS[st][0] + '</span></button>';
    }).join('');

    return '<div class="kpi-grid">' +
      kpi('Documentos', docs.length, palavras.toLocaleString('pt-BR') + ' palavras', 'file-text', 'b-navy') +
      kpi('Trechos indexados', trechos, 'chunks para recuperação', 'database', 'b-blue') +
      kpi('Agentes', agentes.length, 'consultam coleções vinculadas', 'sparkles', 'b-lime') +
      kpi('LLMs prontos', llms.length, llms.length ? llms.map((p) => p.nome.split(' ·')[0]).slice(0, 2).join(', ') : 'use o modo extrativo', 'zap', 'b-purple') +
      '</div>' +

      panel('Enviar documentos para treinar os agentes', painelUpload(),
        { sub: 'Formatos: Markdown (.md) e PDF (.pdf). Cada arquivo vira trechos pesquisáveis por BM25.' }) +

      panel('Documentos da base',
        barra('Arquivos indexados', '<select id="rag-filtro" class="filtro-select">' +
          '<option value="todas">Todas as coleções</option>' + P.COLECOES.map((c) =>
            '<option value="' + c.id + '"' + (RAG_UI.filtro === c.id ? ' selected' : '') + '>' + esc(c.nome) + '</option>').join('') + '</select>' +
          (docs.length ? '<button class="btn btn-danger btn-sm" data-action="rag-limpar">' + ic('trash-2', 'icon-sm') + 'Limpar base</button>' : '')) +
        '<div class="table-wrap"><table class="data"><thead><tr><th>Documento</th><th>Coleção</th><th style="text-align:center">Trechos</th><th style="text-align:center">Palavras</th><th></th></tr></thead><tbody>' + linhas + '</tbody></table></div>',
        { flush: true }) +

      panel('Agentes do projeto',
        '<div class="module-grid">' + agentes.map(cardAgente).join('') + '</div>',
        { sub: 'Cada agente usa as coleções vinculadas e o motor escolhido. Sem LLM, ele responde com os trechos encontrados.' }) +

      panel('Testar agente (playground RAG)', painelPlayground(),
        { sub: 'Mesma lógica usada pelo assistente do app em todas as versões' }) +

      panel('Motores de linguagem (LLM)', '<div class="rag-provs">' + provedoresChips + '</div>',
        { sub: 'Clique para configurar a chave. Gratuitos: Llama (Groq, OpenRouter, Hugging Face, Ollama), Gemini e Mistral.' });
  };

  /* ---------- Ações RAG ---------- */
  Actions['rag-ver'] = function (el) {
    const d = P.listarDocumentos().find((x) => x.id === el.dataset.id);
    if (!d) return;
    const mostrados = d.chunks.slice(0, 60);
    modal({
      title: 'Trechos · ' + d.nome,
      confirmLabel: 'Fechar',
      body: '<p class="sub-texto" style="margin-bottom:12px">' + d.chunks.length + ' trechos · mostrando os ' + mostrados.length + ' primeiros</p>' +
        mostrados.map((c) => '<div class="rag-trecho"><span class="tag tag-gray">#' + (c.id + 1) + ' · ' + esc(c.secao) + '</span><p>' + esc(c.texto) + '</p></div>').join(''),
      onSave() {},
    });
  };

  Actions['rag-colecao'] = function (el) {
    const lista = P.listarDocumentos();
    const d = lista.find((x) => x.id === el.dataset.id);
    if (!d) return;
    modal({
      title: 'Mover para coleção', confirmLabel: 'Salvar',
      body: '<div class="field"><label>Coleção de destino</label><select id="rag-nova-colecao">' + opcoesColecao(d.colecao) + '</select></div>' +
        '<p class="sub-texto">Os agentes que consultam essa coleção passam a usar este documento.</p>',
      onSave(root) {
        d.colecao = root.querySelector('#rag-nova-colecao').value;
        P.salvarDocumentos(lista);
        toast('Documento movido para ' + nomeColecao(d.colecao), 'ok');
        render();
      },
    });
  };

  Actions['rag-baixar'] = function (el) {
    const d = P.listarDocumentos().find((x) => x.id === el.dataset.id);
    if (!d) return;
    window.adminDownload(d.texto, d.nome.replace(/\.(pdf|md|markdown|txt)$/i, '') + '-texto-extraido.txt', 'text/plain');
    toast('Texto extraído baixado', 'ok');
  };

  Actions['rag-excluir'] = function (el) {
    const d = P.listarDocumentos().find((x) => x.id === el.dataset.id);
    if (!d) return;
    confirmAction('Excluir documento', 'Remover <b>' + esc(d.nome) + '</b> e seus ' + d.chunks.length + ' trechos da base?', () => {
      P.removerDocumento(d.id);
      toast('Documento removido da base', 'ok');
      render();
    });
  };

  Actions['rag-limpar'] = function () {
    confirmAction('Limpar base de conhecimento', 'Remover <b>todos</b> os documentos e trechos? Os agentes deixam de ter fontes até novos envios.', () => {
      P.limparBaseRAG();
      RAG_UI.resultado = null;
      toast('Base de conhecimento limpa', 'ok');
      render();
    });
  };

  Actions['rag-agente-config'] = function (el) {
    const lista = P.listarAgentes();
    const i = Number(el.dataset.idx);
    const a = lista[i];
    if (!a) return;
    modal({
      title: 'Configurar agente · ' + a.nome, confirmLabel: 'Salvar agente', wide: true,
      body: formAgente(a),
      onSave(root) {
        const colecoes = Array.from(root.querySelectorAll('input[name="ag-col"]:checked')).map((x) => x.value);
        if (!colecoes.length) { toast('Vincule ao menos uma coleção', 'err'); return false; }
        const topK = Math.min(10, Math.max(1, parseInt(root.querySelector('#ag-topk').value, 10) || 4));
        Object.assign(a, {
          nome: root.querySelector('#ag-nome').value.trim() || a.nome,
          funcao: root.querySelector('#ag-funcao').value.trim(),
          colecoes,
          provedor: root.querySelector('#ag-provedor').value,
          modelo: root.querySelector('#ag-modelo').value.trim(),
          topK,
          temperatura: parseFloat(root.querySelector('#ag-temp').value) || 0.3,
          sistema: root.querySelector('#ag-sistema').value.trim(),
        });
        P.salvarAgentes(lista);
        toast('Agente "' + a.nome + '" salvo', 'ok');
        render();
      },
    });
  };

  Actions['rag-agente-usar'] = function (el) {
    RAG_UI.agente = el.dataset.id;
    RAG_UI.resultado = null;
    toast('Agente selecionado no playground abaixo', 'ok');
    render();
    setTimeout(() => {
      const alvo = document.getElementById('rag-pergunta');
      if (alvo) { alvo.scrollIntoView({ behavior: 'smooth', block: 'center' }); alvo.focus(); }
    }, 60);
  };

  Actions['rag-consultar'] = async function () {
    const pergunta = (document.getElementById('rag-pergunta') || {}).value || '';
    const agente = (document.getElementById('rag-agente') || {}).value || RAG_UI.agente;
    RAG_UI.agente = agente;
    RAG_UI.pergunta = pergunta;
    if (!pergunta.trim()) { toast('Digite uma pergunta', 'err'); return; }
    RAG_UI.carregando = true;
    RAG_UI.resultado = null;
    render();
    try {
      RAG_UI.resultado = await P.responder(agente, pergunta);
    } catch (e) {
      RAG_UI.resultado = { texto: 'Erro: ' + (e.message || 'falha inesperada'), fontes: [], modo: 'erro-llm', agente: '' };
    }
    RAG_UI.carregando = false;
    render();
  };

  /* ---------- Delegação: upload por arrastar e soltar, filtros, mostrar senhas ---------- */
  document.addEventListener('change', (e) => {
    if (e.target.id === 'rag-file') {
      processarArquivos(e.target.files);
      e.target.value = '';
    }
    if (e.target.id === 'rag-filtro') {
      RAG_UI.filtro = e.target.value;
      render();
    }
  });

  document.addEventListener('dragover', (e) => {
    const zona = e.target.closest && e.target.closest('#rag-drop');
    if (zona) { e.preventDefault(); zona.classList.add('arrastando'); }
  });

  document.addEventListener('dragleave', (e) => {
    const zona = e.target.closest && e.target.closest('#rag-drop');
    if (zona) zona.classList.remove('arrastando');
  });

  document.addEventListener('drop', (e) => {
    const zona = e.target.closest && e.target.closest('#rag-drop');
    if (!zona) return;
    e.preventDefault();
    zona.classList.remove('arrastando');
    processarArquivos(e.dataTransfer.files);
  });

  document.addEventListener('click', (e) => {
    const botao = e.target.closest && e.target.closest('[data-mostrar]');
    if (!botao) return;
    const campo = document.getElementById(botao.dataset.mostrar);
    if (campo) campo.type = campo.type === 'password' ? 'text' : 'password';
  });
})();
