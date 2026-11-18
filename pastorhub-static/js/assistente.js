/* ============================================================
   Assistente de estudo do app (RAG) — chat com os agentes do projeto
   Funciona em mobile, tablet e desktop. Depende de ai.js (PastorAI).
   ============================================================ */
(function () {
  const Actions = (window.Actions = window.Actions || {});
  const P = window.PastorAI;
  if (!P) return;

  const sessao = { agente: 'homiletica', historico: [] };

  function opcoesAgentes(atual) {
    return P.listarAgentes().map((a) =>
      '<option value="' + a.id + '"' + (a.id === atual ? ' selected' : '') + '>' + escapeHtml(a.nome) + '</option>').join('');
  }

  function modoAgente(agenteId) {
    const a = P.obterAgente(agenteId);
    const p = a.provedor ? P.provedor(a.provedor) : null;
    if (p && P.integracaoPronta(p)) {
      const cfg = (P.obterIntegracao(p.id) || {}).campos || {};
      return { ok: true, texto: 'LLM · ' + p.nome + ' · ' + (a.modelo || cfg.modelo || p.modeloPadrao) };
    }
    return { ok: false, texto: 'Modo extrativo · sem LLM configurado' };
  }

  function atualizarModo() {
    const el = document.getElementById('as-modo');
    if (!el) return;
    const m = modoAgente(sessao.agente);
    el.className = 'chat-modo ' + (m.ok ? 'ok' : 'aviso');
    el.textContent = m.texto;
  }

  function fontesHTML(fontes) {
    if (!fontes || !fontes.length) return '';
    return '<div class="chat-fontes">' + fontes.map((f) =>
      '<div class="chat-fonte"><span>' + f.n + '</span><div><b>' + escapeHtml(f.doc) + '</b>' +
      (f.secao ? '<small> · ' + escapeHtml(f.secao) + '</small>' : '') + '</div></div>').join('') + '</div>';
  }

  function bolhaBot(r) {
    const rotulo = { llm: 'Resposta do LLM', extrativo: 'Trechos encontrados', 'sem-contexto': 'Sem resultado', 'erro-llm': 'Resultado extrativo' }[r.modo] || '';
    return '<div class="chat-msg bot">' +
      (rotulo ? '<small class="chat-rotulo">' + rotulo + ' · ' + escapeHtml(r.agente || '') + '</small>' : '') +
      '<div class="chat-texto">' + escapeHtml(r.texto) + '</div>' + fontesHTML(r.fontes) + '</div>';
  }

  function rolar() {
    const msgs = document.getElementById('as-msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  async function enviar(e) {
    e.preventDefault();
    const input = document.getElementById('as-pergunta');
    const pergunta = (input && input.value.trim()) || '';
    if (!pergunta) return;
    const msgs = document.getElementById('as-msgs');
    const botao = document.getElementById('as-enviar');
    msgs.insertAdjacentHTML('beforeend', '<div class="chat-msg user">' + escapeHtml(pergunta) + '</div>');
    input.value = '';
    const aguarde = document.createElement('div');
    aguarde.className = 'chat-msg bot pensando';
    aguarde.textContent = 'Consultando a base de conhecimento…';
    msgs.appendChild(aguarde);
    rolar();
    if (botao) botao.disabled = true;

    let r;
    try {
      r = await P.responder(sessao.agente, pergunta, { historico: sessao.historico.slice(-6) });
    } catch (err) {
      r = { texto: 'Erro: ' + (err.message || 'falha inesperada'), fontes: [], modo: 'erro-llm', agente: '' };
    }
    aguarde.remove();
    if (botao) botao.disabled = false;
    if (r.modo === 'llm') sessao.historico.push({ role: 'user', content: pergunta }, { role: 'assistant', content: r.texto });
    msgs.insertAdjacentHTML('beforeend', bolhaBot(r));
    rolar();
  }

  Actions['abrir-assistente'] = function (el) {
    if (el && el.dataset && el.dataset.agente) sessao.agente = el.dataset.agente;
    const docs = P.listarDocumentos();
    const trechos = docs.reduce((s, d) => s + d.chunks.length, 0);
    openSheet({
      title: 'Assistente de estudo',
      desc: docs.length + ' documento(s) · ' + trechos + ' trechos na base',
      icon: 'sparkles',
      body:
        '<div class="chat-top">' +
          '<select id="as-agente" aria-label="Agente">' + opcoesAgentes(sessao.agente) + '</select>' +
          '<div id="as-modo" class="chat-modo"></div>' +
        '</div>' +
        '<div id="as-msgs" class="chat-msgs">' +
          (docs.length
            ? '<div class="chat-msg bot">Olá! Pergunte sobre os documentos que o administrador enviou. Eu mostro as fontes usadas em cada resposta.</div>'
            : '<div class="chat-msg bot">A base ainda está vazia. Peça ao administrador para enviar arquivos .md ou .pdf pelo painel (Base de conhecimento).</div>') +
        '</div>' +
        '<form id="as-form" class="chat-form">' +
          '<input id="as-pergunta" type="text" placeholder="Digite sua pergunta…" autocomplete="off">' +
          '<button id="as-enviar" class="btn primary" type="submit">' + icon('sparkles', 'icon-sm') + 'Perguntar</button>' +
        '</form>',
      footer: '<button class="btn outline" data-action="close-sheet" type="button">Fechar</button>',
    });
    atualizarModo();
    document.getElementById('as-agente').addEventListener('change', (ev) => {
      sessao.agente = ev.target.value;
      sessao.historico = [];
      atualizarModo();
    });
    document.getElementById('as-form').addEventListener('submit', enviar);
    setTimeout(() => { const i = document.getElementById('as-pergunta'); if (i) i.focus(); }, 80);
  };
})();
