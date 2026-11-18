/* ============================================================
   NOVO · Conselho — Aconselhamento Digital com IA (Google Meet)
   Transcrição ao vivo · Análise de sentimentos · Relatório confidencial
   ============================================================ */
(function () {
  const Actions = (window.Actions = window.Actions || {});
  const KEY = 'pastorhub_conselhos';

  function getRelatorios() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function setRelatorios(l) {
    localStorage.setItem(KEY, JSON.stringify(l));
  }

  /* ---------- Análise de sentiment (léxico) ---------- */
  function analisar(texto, lexiconPos, lexiconNeg) {
    const t = texto.toLowerCase();
    let pos = 0, neg = 0;
    lexiconPos.forEach((w) => { if (t.includes(w)) pos++; });
    lexiconNeg.forEach((w) => { if (t.includes(w)) neg++; });
    const total = pos + neg;
    const score = total === 0 ? 60 : Math.round(((pos + 0.6) / (total + 1.2)) * 100);
    const nivel = score >= 70 ? { rot: 'Confiança', cor: 'tag-green' } :
      score >= 55 ? { rot: 'Equilíbrio', cor: 'tag-blue' } :
      score >= 40 ? { rot: 'Ansiedade', cor: 'tag-amber' } : { rot: 'Sofrimento', cor: 'tag-red' };
    return { score: Math.max(8, Math.min(96, score)), pos, neg, nivel };
  }

  function picosEmocionais(linhas, lexiconNeg) {
    return linhas
      .map((l) => {
        const t = l.text.toLowerCase();
        const hits = lexiconNeg.filter((w) => t.includes(w));
        return { ...l, hits };
      })
      .filter((l) => l.hits.length > 0)
      .sort((a, b) => b.hits.length - a.hits.length)
      .slice(0, 3);
  }

  /* ---------- Tela do módulo ---------- */
  const Conselho = {
    render() {
      const c = MOCK.conselho;
      const relatorios = getRelatorios();

      const sessoes = c.sessoes.map((s) =>
        '<div class="item-card" data-action="detalhe" data-tipo="sessao" data-id="' + escapeHtml(s.nome) + '">' +
          '<span class="item-icon-box" style="background:' + s.cor + ';color:#fff">' + icon('video') + '</span>' +
          '<div class="item-body">' +
            '<div class="item-title">' + escapeHtml(s.nome) + '</div>' +
            '<div class="item-sub">' + escapeHtml(s.tipo) + ' · ' + escapeHtml(s.quando) + '</div>' +
            '<div class="item-badges">' +
              '<span class="badge badge-outline">' + escapeHtml(s.duracao) + '</span>' +
              '<span class="badge ' + (s.status === 'Concluída' ? 'badge-lime' : 'badge-secondary') + '">' + escapeHtml(s.status) + '</span>' +
            '</div>' +
          '</div>' + icon('chevron-right', 'icon-sm') +
        '</div>'
      ).join('');

      const relatoriosHTML = relatorios.length
        ? relatorios.map((r) =>
          '<div class="item-card" data-action="abrir-relatorio" data-id="' + r.id + '">' +
            '<span class="item-icon-box" style="background:var(--navy);color:#fff">' + icon('file-text') + '</span>' +
            '<div class="item-body">' +
              '<div class="item-title">' + escapeHtml(r.nome) + '</div>' +
              '<div class="item-sub">' + escapeHtml(r.data) + ' · ' + r.linhas.length + ' falas transcritas</div>' +
              '<div class="item-badges"><span class="badge badge-soft-lime">Confiança ' + r.analise.score + '%</span>' +
                '<span class="badge badge-outline">Relatório confidencial</span></div>' +
            '</div>' + icon('chevron-right', 'icon-sm') +
          '</div>').join('')
        : '<div class="empty-state">' + icon('file-text') + '<p>Nenhum relatório gerado ainda.<br>Inicie uma sessão de aconselhamento.</p></div>';

      return '<div class="view-header">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem">' +
            '<div><h2>Conselho</h2><p class="subtitle">Aconselhamento digital com IA</p></div>' +
            '<div class="avatar avatar-56" style="background:var(--lime)">' + icon('video') + '</div>' +
          '</div>' +
          '<div class="glass-card"><p class="small">Tele-aconselhamento via Google Meet</p>' +
            '<p class="strong">Transcrição + análise de sentimentos em tempo real</p></div>' +
        '</div>' +
        '<div class="stat-grid">' + c.stats.map(statBtnHTML).join('') + '</div>' +
        '<div style="height:1rem"></div>' +
        '<div class="section"><button class="btn-primary-big" data-action="nova-sessao" type="button">' + icon('video', 'icon-sm') + 'Nova Sessão de Aconselhamento</button>' +
          '<button class="btn-primary-big btn-secundario" data-action="abrir-assistente" data-agente="aconselhamento" type="button">' + icon('sparkles', 'icon-sm') + 'Perguntar ao assistente de aconselhamento</button></div>' +
        '<div class="section">' +
          '<div class="section-head"><h3>Sessões</h3>' +
            '<button class="btn-underline" data-toast="Abrindo agenda de sessões..." type="button">Ver agenda ' + icon('chevron-right', 'icon-sm') + '</button></div>' +
          sessoes +
        '</div>' +
        '<div class="section">' +
          '<div class="section-head"><h3>Relatórios Confidenciais</h3>' +
            '<button class="btn-underline" data-toast="Relatórios criptografados conforme LGPD" type="button">Privacidade ' + icon('shield', 'icon-sm') + '</button></div>' +
          relatoriosHTML +
        '</div>';
    },
  };

  /* ---------- Sheet: nova sessão ---------- */
  Actions['nova-sessao'] = function () {
    openSheet({
      title: 'Nova Sessão de Aconselhamento',
      desc: 'Tele-aconselhamento com IA via Google Meet',
      icon: 'video',
      body:
        '<div class="info-box blue"><div>🩺</div><div><strong>Aconselhamento Digital com IA</strong> Durante a chamada o app transcreve o áudio em tempo real, analisa o tom emocional e gera ao final um <strong>relatório confidencial</strong> exclusivo do pastor — base do histórico de cuidado.</div></div>' +
        '<div class="field"><label>Nome do membro</label><input id="cs-nome" type="text" placeholder="Ex: Maria Silva"></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Data</label><input id="cs-data" type="date" value="' + new Date().toISOString().substring(0, 10) + '"></div>' +
          '<div class="field"><label>Hora</label><input id="cs-hora" type="time" value="14:00"></div>' +
        '</div>' +
        '<div class="field"><label>Tipo de atendimento</label><select id="cs-tipo">' +
          '<option>Aconselhamento</option><option>Visitação</option><option>Oração</option><option>Discipulado</option></select></div>' +
        '<div class="field"><label>Link da sala (Google Meet)</label><input id="cs-meet" type="text" placeholder="meet.google.com/abc-defg-hij"></div>' +
        '<div class="field"><label>Observações (opcional)</label><textarea id="cs-notas" rows="2" placeholder="Contexto prévio do caso..."></textarea></div>' +
        '<div class="switch-row"><div><div class="label">Gravação da análise</div><div class="sub">Processar transcrição, sentimento e relatório</div></div>' +
          '<span class="switch"><input type="checkbox" checked><span class="track"></span><span class="thumb"></span></span></div>',
      footer:
        '<button class="btn outline" data-action="close-sheet" type="button">Cancelar</button>' +
        '<button class="btn lime" data-action="iniciar-sessao" type="button">' + icon('video', 'icon-sm') + 'Iniciar Sessão</button>',
    });
  };

  /* ---------- Sheet: sessão ao vivo ---------- */
  let sessaoTimer = null;

  Actions['iniciar-sessao'] = function () {
    const nome = document.getElementById('cs-nome').value.trim() || 'Membro';
    const data = document.getElementById('cs-data').value;
    const hora = document.getElementById('cs-hora').value;
    const tipo = document.getElementById('cs-tipo').value;
    const meet = document.getElementById('cs-meet').value.trim() || ('meet.google.com/pastorhub-' + nome.toLowerCase().replace(/\s+/g, '-'));

    const sessoes = MOCK.conselho.sessoes.slice();
    sessoes[0] = { nome, quando: 'Hoje, ' + hora, duracao: '—', status: 'Agendada', meet, tipo, cor: '#002645' };
    MOCK.conselho.sessoes = sessoes;

    openSheet({
      title: 'Sessão ao vivo · ' + nome,
      desc: 'Google Meet · ' + meet,
      icon: 'video',
      body:
        '<div class="live-box">' +
          '<div class="live-head"><span class="live-dot"></span><strong>Transcrição em tempo real</strong><span class="live-timer" id="live-timer">00:00</span></div>' +
          '<div class="live-body" id="live-body"><p class="live-empty">Aguardando o início do encontro…</p></div>' +
        '</div>' +
        '<div class="info-box lime" style="margin-top:.8rem"><div>🧠</div><div><strong>Análise de sentimentos (IA)</strong> O app identifica o tom emocional geral, os momentos de maior intensidade e as angústias que exigem acompanhamento contínuo.</div></div>' +
        '<div id="live-analise"></div>',
      footer:
        '<button class="btn outline" data-action="encerrar-sessao" type="button">Encerrar</button>' +
        '<button class="btn primary" data-action="gerar-relatorio" type="button" id="btn-relatorio" disabled>' + icon('file-text', 'icon-sm') + 'Gerar Relatório</button>',
    });

    // Streaming simulado da transcrição
    const linhas = [];
    let i = 0;
    let segundos = 0;
    const body = document.getElementById('live-body');
    const timerEl = document.getElementById('live-timer');
    body.innerHTML = '';

    sessaoTimer = setInterval(() => {
      segundos++;
      const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
      const ss = String(segundos % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = mm + ':' + ss;

      if (i < MOCK.conselho.roteiro.length) {
        const l = MOCK.conselho.roteiro[i++];
        linhas.push(l);
        const p = document.createElement('p');
        p.className = 'live-line ' + (l.speaker === 'Pastor' ? 'pastor' : 'membro');
        p.innerHTML = '<b>' + escapeHtml(l.speaker) + ':</b> ' + escapeHtml(l.text);
        body.appendChild(p);
        body.scrollTop = body.scrollHeight;
      } else {
        clearInterval(sessaoTimer);
        sessaoTimer = null;
        const analise = analisar(linhas.map((l) => l.text).join(' '), MOCK.conselho.lexiconPos, MOCK.conselho.lexiconNeg);
        const picos = picosEmocionais(linhas, MOCK.conselho.lexiconNeg);
        window.__SESSAO = { nome, data, hora, tipo, meet, linhas, analise, picos };
        const btn = document.getElementById('btn-relatorio');
        if (btn) btn.disabled = false;
        const box = document.getElementById('live-analise');
        if (box) box.innerHTML = analiseHTML(analise, picos);
        toast('Transcrição concluída — análise pronta', 'success');
      }
    }, 1100);
  };

  function analiseHTML(analise, picos) {
    const largura = analise.score;
    return '<div class="analise-card">' +
      '<div class="analise-top"><div><span class="analise-label">Sentimento geral</span>' +
        '<strong class="analise-score">' + analise.score + '%</strong>' +
        '<span class="badge ' + analise.nivel.cor + '" style="margin-left:8px">' + analise.nivel.rot + '</span></div>' +
        '<div class="analise-bars">' +
          '<div><span>Positivo</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.min(100, analise.pos * 30) + '%;background:#22c55e"></div></div></div>' +
          '<div><span>Intenso</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.min(100, analise.neg * 30) + '%;background:#ef4444"></div></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="analise-gauge"><div class="gauge-fill" style="width:' + largura + '%"></div></div>' +
      '<h4>Angústias e picos emocionais</h4>' +
      (picos.length
        ? picos.map((p, i) =>
          '<div class="pico-item"><span class="pico-num">' + (i + 1) + '</span>' +
          '<div><b>' + escapeHtml(p.hits.join(', ')) + '</b><p>' + escapeHtml(p.text) + '</p></div></div>').join('')
        : '<p class="item-sub">Nenhum pico emocional relevante detectado.</p>') +
      '</div>';
  }

  Actions['encerrar-sessao'] = function () {
    if (sessaoTimer) { clearInterval(sessaoTimer); sessaoTimer = null; }
    closeSheet();
    toast('Sessão encerrada');
  };

  /* ---------- Geração do relatório confidencial ---------- */
  Actions['gerar-relatorio'] = function () {
    const s = window.__SESSAO;
    if (!s) { toast('Aguarde o fim da transcrição', 'error'); return; }
    const dataBR = new Date().toISOString().substring(0, 10).split('-').reverse().join('/');
    const relatorio = {
      id: uid(),
      nome: s.nome,
      data: dataBR + ' · ' + s.hora,
      tipo: s.tipo,
      meet: s.meet,
      linhas: s.linhas,
      analise: s.analise,
      picos: s.picos,
      geradoEm: new Date().toISOString(),
    };
    const lista = getRelatorios();
    lista.unshift(relatorio);
    setRelatorios(lista);
    closeSheet();
    toast('Relatório confidencial gerado!', 'success');
    App.rerender();
    setTimeout(() => Actions['abrir-relatorio']({ dataset: { id: relatorio.id } }), 350);
  };

  Actions['abrir-relatorio'] = function (el) {
    const r = getRelatorios().find((x) => x.id === el.dataset.id);
    if (!r) return;
    const transcript = r.linhas.map((l) =>
      '<p class="rep-line ' + (l.speaker === 'Pastor' ? 'pastor' : 'membro') + '"><b>' + escapeHtml(l.speaker) + ':</b> ' + escapeHtml(l.text) + '</p>').join('');

    const corpo =
      '<div class="rep-head">' +
        '<span class="rep-badge">Documento confidencial</span>' +
        '<h2>' + escapeHtml(r.nome) + '</h2>' +
        '<p>' + escapeHtml(r.tipo) + ' · ' + escapeHtml(r.data) + ' · Google Meet</p>' +
      '</div>' +
      '<div class="rep-section"><h4>1. Resumo do atendimento</h4>' +
        '<p>A sessão durou ' + r.linhas.length + ' falas transcritas. O tom emocional geral identificado pela IA foi <strong>' + r.analise.nivel.rot.toLowerCase() + '</strong> (' + r.analise.score + '% de confiança). ' +
        'Os temas centrais emergidos foram: ' + escapeHtml((r.picos.length ? r.picos[0].hits : ['fé', 'esperança']).join(', ')) + '.</p></div>' +
      '<div class="rep-section"><h4>2. Transcrição integral</h4><div class="rep-transcript">' + transcript + '</div></div>' +
      '<div class="rep-section"><h4>3. Análise de sentimentos</h4>' + analiseHTML(r.analise, r.picos) + '</div>' +
      '<div class="rep-section"><h4>4. Angústias e picos emocionais</h4>' +
        (r.picos.length
          ? r.picos.map((p, i) => '<div class="pico-item"><span class="pico-num">' + (i + 1) + '</span><div><b>' + escapeHtml(p.hits.join(', ')) + '</b><p>' + escapeHtml(p.text) + '</p></div></div>').join('')
          : '<p class="item-sub">Nenhum pico emocional relevante detectado.</p>') + '</div>' +
      '<div class="rep-section"><h4>5. Orientações pastorais sugeridas</h4>' +
        '<ul><li>Manter contato semanal — reduzir o intervalo entre encontros</li>' +
        '<li>Trabalhar o versículo combinado durante a semana (acompanhamento por WhatsApp)</li>' +
        '<li>Atenção à solidão relatada: incluir a família no plano de cuidado</li>' +
        '<li>Registrar a evolução na próxima sessão para comparar a curva emocional</li></ul></div>' +
      '<div class="rep-section"><h4>6. Histórico de cuidado</h4>' +
        '<p>Este relatório é um documento privado do pastor. Os dados são minimizados, armazenados de forma encriptada e só podem ser portados ou excluídos pelo titular, em conformidade com a LGPD.</p></div>' +
      '<div class="rep-foot">Gerado por PastorHub · Conselho (Meet AI) · ' + escapeHtml(r.data) + ' · uso exclusivo do pastor</div>';

    openSheet({
      title: 'Relatório Confidencial',
      desc: r.nome + ' · ' + r.data,
      icon: 'file-text',
      body: corpo,
      footer:
        '<button class="btn outline" data-action="export-relatorio-pdf" data-id="' + r.id + '" type="button">' + icon('download', 'icon-sm') + 'PDF</button>' +
        '<button class="btn outline" data-action="export-relatorio-txt" data-id="' + r.id + '" type="button">' + icon('download', 'icon-sm') + 'TXT</button>' +
        '<button class="btn lime" data-action="close-sheet" type="button">Fechar</button>',
    });
  };

  Actions['export-relatorio-pdf'] = function (el) {
    const r = getRelatorios().find((x) => x.id === el.dataset.id);
    if (!r) return;
    const win = window.open('', '_blank');
    if (!win) { toast('Não foi possível abrir a janela de impressão', 'error'); return; }
    const linhas = r.linhas.map((l) =>
      '<p class="' + (l.speaker === 'Pastor' ? 'pastor' : 'membro') + '"><b>' + escapeHtml(l.speaker) + ':</b> ' + escapeHtml(l.text) + '</p>').join('');
    const picos = r.picos.map((p, i) =>
      '<li><b>' + escapeHtml(p.hits.join(', ')) + '</b> — ' + escapeHtml(p.text) + '</li>').join('');
    win.document.write(
      '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório · ' + escapeHtml(r.nome) + '</title><style>' +
      '@page{size:A4;margin:2cm}body{font-family:Georgia,serif;font-size:11.5pt;color:#222;line-height:1.6}' +
      '.conf{font-size:8.5pt;letter-spacing:.16em;text-transform:uppercase;color:#d4183d;border:1px solid #d4183d;border-radius:999px;padding:3px 10px;display:inline-block}' +
      'h1{color:#002645;font-size:20pt;margin:14px 0 2px}h2{color:#3261AB;font-size:13pt;margin:20px 0 6px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}' +
      'p{text-align:justify}.pastor{color:#002645}.membro{color:#334155}.meta{color:#64748b;font-size:10pt}' +
      '.score{color:#95C121;font-weight:bold;font-size:14pt}footer{margin-top:2rem;border-top:1px solid #e2e8f0;padding-top:.6rem;font-size:8.5pt;color:#64748b;text-align:center}' +
      '</style></head><body>' +
      '<span class="conf">Documento confidencial</span>' +
      '<h1>' + escapeHtml(r.nome) + '</h1>' +
      '<p class="meta">' + escapeHtml(r.tipo) + ' · ' + escapeHtml(r.data) + ' · Google Meet (' + escapeHtml(r.meet) + ')</p>' +
      '<h2>1. Resumo do atendimento</h2><p>Tom emocional geral identificado pela IA: <b>' + escapeHtml(r.analise.nivel.rot.toLowerCase()) + '</b> (<span class="score">' + r.analise.score + '%</span> de confiança).</p>' +
      '<h2>2. Transcrição integral</h2>' + linhas +
      '<h2>3. Angústias e picos emocionais</h2><ul>' + (picos || '<li>Nenhum pico relevante.</li>') + '</ul>' +
      '<h2>4. Orientações pastorais sugeridas</h2><ul><li>Manter contato semanal entre os encontros</li><li>Trabalhar o versículo combinado durante a semana</li><li>Incluir a família no plano de cuidado</li><li>Registrar a evolução na próxima sessão</li></ul>' +
      '<h2>5. Privacidade</h2><p>Documento privado do pastor. Dados minimizados, encriptados e portáveis conforme a LGPD.</p>' +
      '<footer>Gerado por PastorHub · Conselho (Meet AI) · uso exclusivo do pastor</footer>' +
      '<script>window.onload=function(){window.print()};<\/script></body></html>');
    win.document.close();
    toast('Abrindo visualização de PDF...', 'success');
  };

  Actions['export-relatorio-txt'] = function (el) {
    const r = getRelatorios().find((x) => x.id === el.dataset.id);
    if (!r) return;
    const linha = '═'.repeat(39);
    const txt =
      linha + '\n   RELATÓRIO CONFIDENCIAL — PASTORHUB · CONSELHO (MEET AI)\n' + linha + '\n' +
      'Membro: ' + r.nome + '\nTipo: ' + r.tipo + '\nData: ' + r.data + '\nSala: ' + r.meet + '\n\n' +
      'SENTIMENTO GERAL: ' + r.analise.nivel.rot + ' (' + r.analise.score + '% de confiança)\n\n' +
      'TRANSCRIÇÃO INTEGRAL\n' + '─'.repeat(39) + '\n' +
      r.linhas.map((l) => l.speaker + ': ' + l.text).join('\n') + '\n' +
      '─'.repeat(39) + '\n\n' +
      'ANGÚSTIAS E PICOS EMOCIONAIS\n' +
      (r.picos.length ? r.picos.map((p, i) => (i + 1) + '. [' + p.hits.join(', ') + '] ' + p.text).join('\n') : 'Nenhum pico relevante.') + '\n\n' +
      'ORIENTAÇÕES PASTORAIS SUGERIDAS\n' +
      '• Manter contato semanal entre os encontros\n• Trabalhar o versículo combinado durante a semana\n• Incluir a família no plano de cuidado\n• Registrar a evolução na próxima sessão\n\n' +
      linha + '\nDocumento privado do pastor · LGPD · uso exclusivo\n' + linha + '\n';
    try {
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'relatorio-conselho-' + r.nome.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.txt';
      a.click();
      URL.revokeObjectURL(a.href);
      toast('Relatório baixado!', 'success');
    } catch (e) {
      toast('Erro ao baixar arquivo', 'error');
    }
  };

  /* ============================================================
     NOVO · WhatsApp — aba dentro da Agenda
     ============================================================ */
  Actions['whatsapp-enviar'] = function (el) {
    const nome = el.dataset.nome;
    const lembretes = MOCK.whatsapp.lembretes;
    const l = lembretes.find((x) => x.nome === nome);
    if (l && l.status === 'Enviado') {
      l.status = 'Confirmado';
      l.resposta = '1';
      l.hora = 'agora';
      toast('Confirmação recebida de ' + nome, 'success');
    } else {
      toast('Lembrete reenviado para ' + nome, 'success');
    }
    App.rerender();
  };

  Actions['whatsapp-template'] = function (el) {
    const t = MOCK.whatsapp.templates.find((x) => x.nome === el.dataset.nome);
    if (!t) return;
    t.ativo = !t.ativo;
    toast('Template "' + t.nome + '" ' + (t.ativo ? 'ativado' : 'desativado'), 'success');
    App.rerender();
  };

  window.Views.conselho = Conselho;
})();
