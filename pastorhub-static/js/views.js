/* Views: Início (dashboard), Agenda, Atendimentos, Recursos, Alertas, Configurações */
(function () {
  // Estado de UI por tela (tabs, buscas)
  const ui = {
    agendaTab: 'eventos',
    atTab: 'todos',
    atQuery: '',
    recTab: 'palestras',
    notTab: 'recentes',
    notifLidas: false,
    setTab: 'geral',
  };

  /* ---------- Blocos reutilizáveis ---------- */

  function headerRow(titulo, subtitulo, rightHTML) {
    return '<div class="view-header row">' +
      '<div><h2>' + escapeHtml(titulo) + '</h2><p class="subtitle">' + escapeHtml(subtitulo) + '</p></div>' +
      (rightHTML || '') + '</div>';
  }

  function novoBtn(action) {
    return '<button class="btn lime sm" data-action="' + action + '" type="button">' + icon('plus', 'icon-sm') + ' Novo</button>';
  }

  function verTodos(toastMsg) {
    return '<button class="btn-underline" data-toast="' + escapeHtml(toastMsg) + '" type="button">Ver todos ' + icon('chevron-right', 'icon-sm') + '</button>';
  }

  function ativarTabs(container, group, rerender) {
    container.querySelectorAll('[data-tab]').forEach((b) => {
      b.addEventListener('click', () => {
        ui[group] = b.dataset.tabId;
        // marca ativo visual
        container.querySelectorAll('[data-tab="' + group + '"]').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        rerender();
      });
    });
  }

  /* =========================================================
     INÍCIO / DASHBOARD
     ========================================================= */
  const Dashboard = {
    render() {
      const d = MOCK.dashboard;
      const fila = Storage.getSyncQueue().length;
      const salvos = Storage.getSermoes().length;
      const lastSync = Storage.getLastSync();

      const html =
        '<div class="view-header">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem">' +
            '<div><p class="welcome">Bem-vindo,</p><h2>' + escapeHtml(Usuario.dados.nome) + '</h2></div>' +
            avatarDe(Usuario.dados.nome, 'avatar-56 avatar-ring') +
          '</div>' +
          '<div class="glass-card"><p class="small">' + escapeHtml(HOJE_LABEL) + '</p><p class="strong">3 atendimentos agendados</p></div>' +
        '</div>' +
        '<div class="stat-grid">' + d.stats.map(statBtnHTML).join('') + '</div>' +
        '<div class="section" style="margin-top:1rem">' +
          '<button class="assistente-card" data-action="abrir-assistente" type="button">' +
            '<span class="ac-icon">' + icon('sparkles') + '</span>' +
            '<span class="ac-texto"><b>Assistente de estudo</b><small>Pergunte à base de conhecimento (sermões, aconselhamento e rotina) — respostas com fontes</small></span>' +
            icon('chevron-right', 'icon-sm') +
          '</button>' +
        '</div>' +
        '<div class="section" style="margin-top:1rem">' + (window.PastorVers ? PastorVers.cardHTML() : '') + '</div>' +
        '<div class="view-grid" style="padding-top:1.25rem">' +
          '<div class="col-main">' +
            '<div class="section">' +
              '<div class="section-head"><h3>Ações Rápidas</h3></div>' +
              '<div class="quick-grid">' +
                d.quick.map((q) =>
                  '<button class="qa-btn" data-action="' + q.action + '" type="button">' + icon(q.icon) + escapeHtml(q.label) + '</button>'
                ).join('') +
              '</div>' +
            '</div>' +
            '<div class="section">' +
              '<div class="section-head"><h3>Próximos Atendimentos</h3>' + verTodos('Abrindo lista de atendimentos...') + '</div>' +
              '<div class="list-grid">' +
                d.atendimentos.map((a) =>
                  '<div class="item-card" data-action="detalhe" data-tipo="atendimento" data-id="' + escapeHtml(a.nome) + '">' +
                    avatarHTML(a.nome, 'avatar-48 avatar-navy') +
                    '<div class="item-body">' +
                      '<div class="item-title">' + escapeHtml(a.nome) + '</div>' +
                      '<div class="item-sub">' + escapeHtml(a.tipo) + '</div>' +
                    '</div>' +
                    '<div class="item-right">' +
                      '<span class="item-time">' + icon('clock', 'icon-sm') + escapeHtml(a.hora) + '</span>' +
                      '<span class="badge badge-soft-lime">' + escapeHtml(a.badge) + '</span>' +
                    '</div>' +
                  '</div>'
                ).join('') +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="col-side">' +
            '<div class="card"><div class="card-head">' + icon('calendar') + 'Agenda de Hoje</div><div class="card-body" style="padding:.4rem .7rem .7rem">' +
              MOCK.agenda.eventos.slice(0, 3).map((e) =>
                '<div class="item-meta" style="justify-content:space-between;padding:.45rem 0;border-bottom:1px solid var(--border);cursor:pointer" data-action="detalhe" data-tipo="evento" data-id="' + escapeHtml(e.titulo) + '">' +
                  '<span style="font-weight:500;color:var(--navy)">' + escapeHtml(e.titulo) + '</span>' +
                  '<span>' + escapeHtml(e.quando) + '</span>' +
                '</div>'
              ).join('') +
              '<button class="btn-underline" style="margin-top:.6rem" data-nav="agenda" type="button">Ver agenda completa ' + icon('chevron-right', 'icon-sm') + '</button>' +
            '</div></div>' +
            '<div class="card"><div class="card-head">' + icon('bell') + 'Alertas Recentes</div><div class="card-body" style="padding:.4rem .7rem .7rem">' +
              MOCK.notificacoes.lista.slice(0, 3).map((n) =>
                '<div style="padding:.45rem 0;border-bottom:1px solid var(--border);cursor:pointer" data-action="detalhe" data-tipo="notificacao" data-id="' + escapeHtml(n.titulo) + '">' +
                  '<div style="font-size:.82rem;font-weight:600;color:var(--navy)">' + escapeHtml(n.titulo) + '</div>' +
                  '<div class="item-sub">' + escapeHtml(n.desc) + '</div>' +
                '</div>'
              ).join('') +
              '<button class="btn-underline" style="margin-top:.6rem" data-nav="notificacoes" type="button">Ver todos os alertas ' + icon('chevron-right', 'icon-sm') + '</button>' +
            '</div></div>' +
            '<div class="card"><div class="card-head">' + icon('cloud') + 'Status do Sistema</div><div class="card-body" style="font-size:.82rem;display:flex;flex-direction:column;gap:.45rem">' +
              '<div style="display:flex;justify-content:space-between"><span class="item-meta">Conexão</span><span class="badge ' + (navigator.onLine ? 'badge-lime' : 'badge-orange') + '">' + (navigator.onLine ? 'Online' : 'Offline') + '</span></div>' +
              '<div style="display:flex;justify-content:space-between"><span class="item-meta">Sermões salvos</span><strong>' + salvos + '</strong></div>' +
              '<div style="display:flex;justify-content:space-between"><span class="item-meta">Fila de sync</span><strong>' + fila + '</strong></div>' +
              '<div style="display:flex;justify-content:space-between"><span class="item-meta">Última sincronização</span><strong>' + (lastSync ? escapeHtml(fmtDateBR(lastSync)) : '—') + '</strong></div>' +
              '<button class="btn outline block sm" style="margin-top:.4rem" data-action="sync" type="button">' + icon('refresh-cw', 'icon-sm') + 'Sincronizar agora</button>' +
            '</div></div>' +
          '</div>' +
        '</div>';
      return html;
    },
  };

  /* =========================================================
     AGENDA
     ========================================================= */
  const Agenda = {
    render() {
      const a = MOCK.agenda;
      let conteudo = '';

      if (ui.agendaTab === 'eventos') {
        conteudo =
          '<div class="section-head" style="padding:0 1rem"><h3>Próximos Eventos</h3>' + verTodos('Abrindo todos os eventos...') + '</div>' +
          '<div class="list-grid">' +
          a.eventos.map((e) =>
            '<div class="item-card ' + e.cor + '" data-action="detalhe" data-tipo="evento" data-id="' + escapeHtml(e.titulo) + '">' +
              '<div class="item-body">' +
                '<div class="item-title">' + escapeHtml(e.titulo) + '</div>' +
                '<div class="item-badges"><span class="badge badge-outline">' + escapeHtml(e.tipo) + '</span></div>' +
                '<div class="item-meta" style="margin-top:.35rem">' + icon('clock', 'icon-sm') + escapeHtml(e.quando) +
                  ' &nbsp;' + icon(e.local === 'Online' ? 'video' : e.local === 'Telefone' ? 'phone' : 'map-pin', 'icon-sm') + escapeHtml(e.local) +
                '</div>' +
              '</div>' + icon('chevron-right', 'icon-sm') +
            '</div>'
          ).join('') + '</div>';
      } else if (ui.agendaTab === 'whatsapp') {
        const w = MOCK.whatsapp;
        conteudo =
          '<div class="card"><div class="card-head">' + icon('message') + 'Conexão WhatsApp</div><div class="card-body">' +
            '<div class="switch-row"><div><div class="label">' + escapeHtml(w.status.numero) + '</div>' +
              '<div class="sub">' + escapeHtml(w.status.provedor) + '</div></div>' +
              '<span class="badge badge-lime">Conectado</span></div>' +
            '<div class="stat-grid" style="padding:.6rem 0 0">' +
              w.metrics.map((m) => '<div class="stat-btn" style="cursor:default"><span class="stat-value">' + m.v + '</span><span class="stat-label">' + escapeHtml(m.label) + '</span></div>').join('') +
            '</div>' +
          '</div></div>' +
          '<div class="section-head" style="padding:0 1rem"><h3>Templates de Mensagem</h3></div>' +
          w.templates.map((t) =>
            '<div class="item-card" style="align-items:flex-start">' +
              '<span class="item-icon-box" style="background:rgba(37,211,102,.14);color:#22c55e">' + icon('message') + '</span>' +
              '<div class="item-body">' +
                '<div class="item-title">' + escapeHtml(t.nome) + '</div>' +
                '<div class="item-sub" style="white-space:normal;line-height:1.5">' + escapeHtml(t.texto) + '</div>' +
              '</div>' +
              '<span class="switch"><input type="checkbox" data-wa-tpl="' + escapeHtml(t.nome) + '"' + (t.ativo ? ' checked' : '') + '><span class="track"></span><span class="thumb"></span></span>' +
            '</div>').join('') +
          '<div class="section-head" style="padding:0 1rem"><h3>Lembretes Enviados</h3>' +
            '<button class="btn-underline" data-toast="Todos os lembretes foram reenviados" type="button">Reenviar todos ' + icon('chevron-right', 'icon-sm') + '</button></div>' +
          w.lembretes.map((l) => {
            const st = l.status === 'Confirmado' ? 'badge-lime' : l.status === 'Falhou' ? 'badge-destructive' : 'badge-secondary';
            return '<div class="item-card" data-toast="Lembrete de ' + escapeHtml(l.nome) + '">' +
              '<span class="item-icon-box" style="background:rgba(37,211,102,.14);color:#22c55e">' + icon('message') + '</span>' +
              '<div class="item-body">' +
                '<div class="item-title">' + escapeHtml(l.nome) + '</div>' +
                '<div class="item-sub">' + escapeHtml(l.tipo) + ' · ' + escapeHtml(l.quando) + '</div>' +
                '<div class="item-badges"><span class="badge ' + st + '">' + escapeHtml(l.status) + '</span>' +
                  (l.resposta ? '<span class="badge badge-outline">Resposta: ' + escapeHtml(l.resposta) + '</span>' : '') +
                  '<span class="item-meta">' + escapeHtml(l.hora) + '</span></div>' +
              '</div>' +
              '<button class="btn outline sm" data-action="whatsapp-enviar" data-nome="' + escapeHtml(l.nome) + '" type="button">' +
                icon('refresh-cw', 'icon-sm') + (l.status === 'Enviado' ? 'Cobrar' : 'Reenviar') + '</button>' +
            '</div>';
          }).join('');
      } else {
        conteudo =
          '<div class="section-head" style="padding:0 1rem"><h3>Suas Integrações</h3></div>' +
          '<div class="list-grid">' +
          a.integracoes.map((i) =>
            '<div class="item-card" data-toast="' + (i.conectado ? escapeHtml(i.nome) + ' já está conectado' : 'Conectando com ' + escapeHtml(i.nome) + '...') + '">' +
              '<span class="item-icon-box" style="background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff;font-size:1.2rem">' + i.emoji + '</span>' +
              '<div class="item-body">' +
                '<div class="item-title">' + escapeHtml(i.nome) + '</div>' +
                '<div class="item-sub">' + escapeHtml(i.status) + '</div>' +
              '</div>' +
              '<button class="btn sm ' + (i.conectado ? 'outline' : 'lime') + '" style="border-color:' + (i.conectado ? 'var(--lime)' : 'transparent') + ';color:' + (i.conectado ? 'var(--lime)' : '#fff') + '" data-toast="' + (i.conectado ? escapeHtml(i.nome) + ' já está conectado' : 'Conectando com ' + escapeHtml(i.nome) + '...') + '" type="button">' +
                (i.conectado ? 'Conectado' : 'Conectar') +
              '</button>' +
            '</div>'
          ).join('') + '</div>';
      }

      const html =
        '<div class="view-header row">' +
          '<div><h2>Agenda</h2><p class="subtitle">Seus compromissos</p></div>' + novoBtn('novo-evento') +
        '</div>' +
        '<div class="view-header" style="padding:.9rem 1.5rem;margin-bottom:1rem"><div class="glass-card" style="margin:0"><p class="small">' + escapeHtml(HOJE_LABEL) + '</p><p class="strong">3 eventos agendados</p></div></div>' +
        '<div class="stat-grid">' + a.stats.map(statBtnHTML).join('') + '</div>' +
        '<div style="height:1rem"></div>' +
        tabsHTML([{ id: 'eventos', label: 'Eventos' }, { id: 'whatsapp', label: 'WhatsApp' }, { id: 'sync', label: 'Integrações' }], 'agendaTab') +
        conteudo;

      const frag = html;
      return { html: frag, after: (el) => ativarTabs(el, 'agendaTab', () => App.rerender()) };
    },
  };

  /* =========================================================
     ATENDIMENTOS
     ========================================================= */
  function atendimentoCard(at) {
    const concluido = at.status === 'Concluído';
    const modIcon = at.modalidade === 'Online' ? 'video' : at.modalidade === 'Telefone' ? 'phone' : 'map-pin';
    const modColor = at.modalidade === 'Online' ? '#a855f7' : at.modalidade === 'Telefone' ? '#3b82f6' : '#22c55e';
    return '<div class="item-card ' + (concluido ? 'gray-border' : '') + '" data-action="detalhe" data-tipo="atendimento" data-id="' + escapeHtml(at.nome) + '">' +
      avatarHTML(at.nome, 'avatar-48' + (concluido ? ' avatar-muted' : ' avatar-navy')) +
      '<div class="item-body" style="' + (concluido ? 'opacity:.7' : '') + '">' +
        '<div class="item-title" style="' + (concluido ? 'color:var(--muted-text)' : '') + '">' + escapeHtml(at.nome) + '</div>' +
        '<div class="item-sub">' + escapeHtml(at.motivo) + '</div>' +
        '<div class="item-badges">' +
          (concluido ? '' : '<span class="badge badge-lime">' + escapeHtml(at.status) + '</span>') +
          '<span class="badge badge-outline">' + escapeHtml(at.tipo) + '</span>' +
          '<span class="item-meta" style="gap:.2rem"><span style="color:' + modColor + '">' + icon(modIcon, 'icon-sm') + '</span>' + escapeHtml(at.modalidade) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="item-right"><span class="item-time" style="font-weight:500">' + escapeHtml(at.quando) + '</span>' + icon('chevron-right', 'icon-sm') + '</div>' +
    '</div>';
  }

  function atendimentoListaHTML() {
    const a = MOCK.atendimentos;
    const q = ui.atQuery.toLowerCase();
    const filtrados = a.lista.filter((at) =>
      at.nome.toLowerCase().includes(q) || at.motivo.toLowerCase().includes(q)
    );

    let titulo, lista;
    if (ui.atTab === 'agendados') {
      titulo = 'Próximos Atendimentos';
      lista = filtrados.filter((at) => at.status === 'Agendado');
    } else if (ui.atTab === 'concluidos') {
      titulo = 'Histórico de Atendimentos';
      lista = filtrados.filter((at) => at.status === 'Concluído');
    } else {
      titulo = 'Todos os Atendimentos';
      lista = filtrados;
    }

    return {
      titulo,
      html: (lista.length
        ? '<div class="list-grid">' + lista.map(atendimentoCard).join('') + '</div>'
        : '<div class="empty-state">' + icon('users') + '<p>Nenhum atendimento encontrado para “' + escapeHtml(ui.atQuery) + '”</p></div>'),
    };
  }

  const Atendimentos = {
    render() {
      const a = MOCK.atendimentos;
      const lista = atendimentoListaHTML();

      const html =
        '<div class="view-header row">' +
          '<div><h2>Atendimentos</h2><p class="subtitle">Gestão pastoral</p></div>' + novoBtn('novo-atendimento') +
        '</div>' +
        '<div class="view-header" style="padding:.9rem 1.5rem;margin-bottom:1rem"><div class="glass-card" style="margin:0"><p class="small">' + escapeHtml(HOJE_LABEL) + '</p><p class="strong">2 atendimentos agendados</p></div></div>' +
        '<div class="stat-grid">' + a.stats.map(statBtnHTML).join('') + '</div>' +
        '<div style="height:1rem"></div>' +
        '<div class="search-box">' + icon('search') + '<input type="text" id="at-busca" placeholder="Buscar atendimentos..." value="' + escapeHtml(ui.atQuery) + '"></div>' +
        tabsHTML([{ id: 'todos', label: 'Todos' }, { id: 'agendados', label: 'Agendados' }, { id: 'concluidos', label: 'Concluídos' }], 'atTab') +
        '<div class="section-head" style="padding:0 1rem"><h3 id="at-titulo">' + escapeHtml(lista.titulo) + '</h3>' +
          '<button class="btn-underline" data-toast="Filtros: em breve" type="button">Filtros ' + icon('chevron-right', 'icon-sm') + '</button></div>' +
        '<div id="at-lista">' + lista.html + '</div>';

      return { html, after: (el) => {
        ativarTabs(el, 'atTab', () => App.rerender());
        const busca = el.querySelector('#at-busca');
        if (busca) busca.addEventListener('input', () => {
          ui.atQuery = busca.value;
          const r = atendimentoListaHTML();
          const alvo = el.querySelector('#at-lista');
          if (alvo) alvo.innerHTML = r.html;
          const titulo = el.querySelector('#at-titulo');
          if (titulo) titulo.textContent = r.titulo;
        });
      } };
    },
  };

  /* =========================================================
     RECURSOS PASTORAIS
     ========================================================= */
  const Recursos = {
    render() {
      const r = MOCK.recursos;
      const total = r.palestras.length + r.videos.length;

      let conteudo;
      if (ui.recTab === 'palestras') {
        conteudo =
          '<div class="section-head" style="padding:0 1rem"><h3>Minhas Palestras</h3>' + verTodos('Abrindo todas as palestras...') + '</div>' +
          '<div class="list-grid">' +
          r.palestras.map((p) =>
            '<div class="item-card purple-border" data-action="detalhe" data-tipo="palestra" data-id="' + escapeHtml(p.titulo) + '">' +
              '<span class="item-icon-box" style="background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff">' + icon('sparkles') + '</span>' +
              '<div class="item-body">' +
                '<div class="item-title">' + escapeHtml(p.titulo) + '</div>' +
                '<div class="item-badges">' +
                  '<span class="badge badge-soft-lime">' + escapeHtml(p.publico) + '</span>' +
                  '<span class="badge badge-outline">' + escapeHtml(p.duracao) + '</span>' +
                '</div>' +
              '</div>' + icon('chevron-right', 'icon-sm') +
            '</div>'
          ).join('') + '</div>';
      } else {
        conteudo =
          '<div class="section-head" style="padding:0 1rem"><h3>Biblioteca de Vídeos</h3>' + verTodos('Abrindo todos os vídeos...') + '</div>' +
          '<div class="list-grid">' +
          r.videos.map((v) =>
            '<div class="item-card blue-border" data-action="detalhe" data-tipo="video" data-id="' + escapeHtml(v.titulo) + '">' +
              '<div class="item-thumb" style="width:88px;height:56px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(50,97,171,.25),rgba(168,85,247,.25));border-radius:.5rem;color:var(--blue)">' + icon('video', 'icon-lg') + '</div>' +
              '<div class="item-body">' +
                '<div class="item-title">' + escapeHtml(v.titulo) + '</div>' +
                '<div class="item-badges">' +
                  '<span class="badge badge-soft-lime">' + escapeHtml(v.categoria) + '</span>' +
                  '<span class="item-meta">' + escapeHtml(v.views) + '</span>' +
                '</div>' +
              '</div>' + icon('chevron-right', 'icon-sm') +
            '</div>'
          ).join('') + '</div>';
      }

      const html =
        '<div class="view-header">' +
          '<div style="display:flex;align-items:center;justify-content:space-between">' +
            '<div><h2>Recursos Pastorais</h2><p class="subtitle">Palestras, vídeos e materiais</p></div>' +
            '<div class="avatar avatar-56" style="background:var(--lime)">' + icon('book-open') + '</div>' +
          '</div>' +
          '<div class="glass-card"><p class="small">Biblioteca Digital</p><p class="strong">' + total + ' recursos disponíveis</p></div>' +
        '</div>' +
        '<div class="stat-grid">' + r.stats.map(statBtnHTML).join('') + '</div>' +
        '<div style="height:1rem"></div>' +
        '<div class="section">' +
          '<div class="section-head"><h3>Ações Rápidas</h3></div>' +
          '<div class="quick-grid">' +
            '<button class="qa-btn" data-action="gerar-palestra" type="button">' + icon('sparkles') + 'Gerar Palestra IA</button>' +
            '<button class="qa-btn" data-action="adicionar-video" type="button">' + icon('video') + 'Adicionar Vídeo</button>' +
          '</div>' +
        '</div>' +
        tabsHTML([{ id: 'palestras', label: 'Palestras IA' }, { id: 'videos', label: 'Vídeos' }], 'recTab') +
        conteudo;

      return { html, after: (el) => ativarTabs(el, 'recTab', () => App.rerender()) };
    },
  };

  /* =========================================================
     ALERTAS / NOTIFICAÇÕES
     ========================================================= */
  const notifIcon = { atendimento: 'users', agenda: 'calendar', palestra: 'video', sistema: 'bell' };
  const prioBadge = { alta: 'badge-destructive', media: 'badge-navy', baixa: 'badge-secondary' };
  const prioLabel = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

  const Notificacoes = {
    render() {
      const n = MOCK.notificacoes;
      const naoLidas = ui.notifLidas ? 0 : n.lista.filter((x) => !x.lida).length;

      let conteudo;
      if (ui.notTab === 'recentes') {
        conteudo =
          '<div class="section-head" style="padding:0 1rem"><h3>Notificações Recentes</h3>' +
            '<button class="btn-underline" data-toast="Filtrar notificações: em breve" type="button">Filtrar ' + icon('chevron-right', 'icon-sm') + '</button></div>' +
          (n.lista.length
            ? '<div class="list-grid">' + n.lista.map((x) =>
              '<div class="item-card" style="border-left-color:' + (x.lida ? '#d1d5db' : 'var(--lime)') + (x.lida ? '' : ';background:#eff6ff;border-color:#bfdbfe') + '" data-action="detalhe" data-tipo="notificacao" data-id="' + escapeHtml(x.titulo) + '">' +
                '<span class="item-icon-box" style="background:' + (x.lida ? 'var(--muted)' : '#dbeafe') + ';color:' + (x.lida ? 'var(--muted-text)' : '#2563eb') + '">' + icon(notifIcon[x.tipo] || 'bell') + '</span>' +
                '<div class="item-body" style="' + (x.lida ? 'opacity:.75' : '') + '">' +
                  '<div class="item-title" style="' + (x.lida ? 'color:var(--muted-text)' : '') + '">' + escapeHtml(x.titulo) + '</div>' +
                  '<div class="item-badges"><span class="badge ' + prioBadge[x.prioridade] + '">' + prioLabel[x.prioridade] + '</span></div>' +
                  '<div class="item-sub" style="white-space:normal;margin-top:.25rem">' + escapeHtml(x.desc) + '</div>' +
                  '<div class="item-acoes">' +
                    '<button class="btn btn-outline btn-sm" data-action="ver-notificacao" data-id="' + escapeHtml(x.titulo) + '" title="Ver detalhes completos">' + ic('eye') + ' Ver</button>' +
                  '</div>' +
                '</div>' +
                '<span class="item-meta">' + escapeHtml(x.hora) + '</span>' +
              '</div>'
            ).join('') + '</div>'
            : '<div class="empty-state">' + icon('bell') + '<p>Nenhuma notificação</p></div>');
      } else {
        conteudo =
          '<div class="card"><div class="card-head">' + icon('bell') + 'Preferências de Notificação</div><div class="card-body">' +
            n.config.map((c) =>
              '<div class="switch-row clickable" data-toast="Configuração: ' + escapeHtml(c.label) + '">' +
                '<div><div class="label">' + escapeHtml(c.label) + '</div><div class="sub">' + escapeHtml(c.sub) + '</div></div>' +
                switchHTML(c.on) +
              '</div>'
            ).join('') +
          '</div></div>' +
          '<div class="card"><div class="card-head">' + icon('settings') + 'Configurações Avançadas</div><div class="card-body" style="display:flex;flex-direction:column;gap:.6rem">' +
            n.avancadas.map((adv) =>
              '<button class="btn outline block" data-toast="' + escapeHtml(adv.toast) + '" type="button">' + icon(adv.icon, 'icon-sm') + escapeHtml(adv.label) + '</button>'
            ).join('') +
          '</div></div>';
      }

      const html =
        '<div class="view-header">' +
          '<div style="display:flex;align-items:center;justify-content:space-between">' +
            '<div><h2>Notificações</h2><p class="subtitle">' + naoLidas + ' não lidas</p></div>' +
            '<div class="avatar avatar-56" style="background:var(--lime)">' + icon('bell') + '</div>' +
          '</div>' +
          '<div class="glass-card"><p class="small">Central de Avisos</p><p class="strong">' + n.lista.length + ' notificações totais</p></div>' +
        '</div>' +
        '<div class="stat-grid">' + n.stats(naoLidas, n.lista.length).map(statBtnHTML).join('') + '</div>' +
        '<div style="height:1rem"></div>' +
        '<div class="section"><button class="btn outline block" data-action="marcar-lidas" type="button">' + icon('check-circle', 'icon-sm') + 'Marcar todas como lidas</button></div>' +
        tabsHTML([{ id: 'recentes', label: 'Recentes' }, { id: 'config', label: 'Configurações' }], 'notTab') +
        conteudo;

      return { html, after: (el) => ativarTabs(el, 'notTab', () => App.rerender()) };
    },
  };

  /* =========================================================
     CONFIGURAÇÕES
     ========================================================= */
  const Settings = {
    render() {
      let conteudo;
      if (ui.setTab === 'geral') {
        conteudo =
          '<div class="card"><div class="card-head">' + icon('user') + 'Perfil</div><div class="card-body">' +
            '<div class="perfil-top" style="margin-bottom:.6rem">' + avatarDe(Usuario.dados.nome, 'avatar-80 avatar-ring') +
              '<div><strong>' + escapeHtml(Usuario.dados.nome) + '</strong><span>' + escapeHtml(Usuario.dados.email) + '</span>' +
                '<div style="font-size:.74rem;color:var(--muted-text);margin-top:.2rem">' + escapeHtml(Usuario.dados.cargo || '') + ' · ' + escapeHtml(Usuario.dados.igreja || '') + '</div>' +
              '</div></div>' +
            '<button class="link-row" data-action="editar-perfil" type="button"><span>Editar Perfil</span>' + icon('chevron-right', 'icon-sm') + '</button>' +
            '<button class="link-row" data-action="foto-perfil" type="button"><span>Foto de Perfil</span>' + icon('chevron-right', 'icon-sm') + '</button>' +
            '<button class="link-row" data-action="alterar-senha" type="button"><span>Alterar Senha</span>' + icon('chevron-right', 'icon-sm') + '</button>' +
          '</div></div>' +
          '<div class="card"><div class="card-head">' + icon('palette') + 'Aparência</div><div class="card-body">' +
            '<div class="switch-row">' + icon('moon') + '<div style="flex:1"><div class="label">Modo Escuro</div><div class="sub">Ativar tema escuro</div></div>' +
              '<span class="switch"><input type="checkbox" data-tema-switch' + (Tema.atual() === 'escuro' ? ' checked' : '') + '><span class="track"></span><span class="thumb"></span></span></div>' +
            '<div class="switch-row">' + icon('sun') + '<div style="flex:1"><div class="label">Tema do sistema</div><div class="sub">Segue o tema do dispositivo</div></div>' +
              '<span class="badge badge-secondary">Automático</span></div>' +
            '<div class="switch-row">' + icon('globe') + '<div style="flex:1"><div class="label">Idioma</div><div class="sub">Português (BR)</div></div>' + icon('chevron-right', 'icon-sm') + '</div>' +
          '</div></div>' +
          '<div class="card"><div class="card-head">' + icon('bell') + 'Notificações</div><div class="card-body">' +
            '<div class="switch-row"><div><div class="label">Push Notifications</div><div class="sub">Receber alertas</div></div>' + switchHTML(true) + '</div>' +
            '<div class="switch-row"><div><div class="label">E-mail</div><div class="sub">Notificações por e-mail</div></div>' + switchHTML(true) + '</div>' +
            '<div class="switch-row"><div><div class="label">Som</div><div class="sub">Sons de notificação</div></div>' + switchHTML(false) + '</div>' +
          '</div></div>';
      } else if (ui.setTab === 'dados') {
        conteudo =
          '<div class="card"><div class="card-head">' + icon('cloud') + 'Sincronização</div><div class="card-body">' +
            '<div class="switch-row"><div><div class="label">Sincronização Automática</div><div class="sub">Quando online</div></div>' + switchHTML(true) + '</div>' +
            '<hr class="sep" style="margin:.7rem 0">' +
            '<button class="btn outline block" style="justify-content:space-between" data-toast="Google Calendar já está conectado" type="button"><span>Google Calendar</span><span class="badge badge-green">Conectado</span></button>' +
            '<button class="btn outline block" style="justify-content:space-between" data-toast="Conectando com Microsoft Outlook..." type="button"><span>Microsoft Outlook</span><span class="badge badge-secondary">Desconectado</span></button>' +
            '<button class="btn outline block" style="justify-content:space-between" data-toast="Conectando com Apple Calendar..." type="button"><span>Apple Calendar</span><span class="badge badge-secondary">Desconectado</span></button>' +
            '<hr class="sep" style="margin:.7rem 0">' +
            '<button class="btn outline block" data-action="sync" type="button">' + icon('cloud', 'icon-sm') + 'Sincronizar Agora</button>' +
          '</div></div>' +
          '<div class="card"><div class="card-head">' + icon('download') + 'Armazenamento</div><div class="card-body">' +
            '<div class="progress-row"><div class="bar-label"><span>Sermões</span><span class="val">2.4 MB</span></div><div class="progress-track"><div class="progress-fill lime" style="width:60%"></div></div></div>' +
            '<div class="progress-row"><div class="bar-label"><span>Atendimentos</span><span class="val">1.2 MB</span></div><div class="progress-track"><div class="progress-fill blue" style="width:30%"></div></div></div>' +
            '<div class="progress-row"><div class="bar-label"><span>Total Utilizado</span><span class="val">3.6 MB / 100 MB</span></div><div class="progress-track"><div class="progress-fill navy" style="width:4%"></div></div></div>' +
            '<hr class="sep" style="margin:.7rem 0">' +
            '<button class="btn outline block sm" data-toast="Exportando dados..." type="button">' + icon('download', 'icon-sm') + 'Exportar Todos os Dados</button>' +
            '<button class="btn outline block sm danger-outline" data-action="limpar-cache" type="button">' + icon('trash-2', 'icon-sm') + 'Limpar Cache</button>' +
          '</div></div>' +
          '<div class="card"><div class="card-head">' + icon('shield') + 'Privacidade e Segurança</div><div class="card-body">' +
            '<button class="link-row" data-toast="Política de Privacidade: em breve" type="button"><span>Política de Privacidade</span>' + icon('chevron-right', 'icon-sm') + '</button>' +
            '<button class="link-row" data-toast="Termos de Uso: em breve" type="button"><span>Termos de Uso</span>' + icon('chevron-right', 'icon-sm') + '</button>' +
            '<div class="switch-row"><div><div class="label">Bloqueio Automático</div><div class="sub">Após 5 minutos</div></div>' + switchHTML(false) + '</div>' +
          '</div></div>';
      } else {
        conteudo =
          '<div class="card"><div class="app-info">' +
            '<div class="logo-box">' + icon('user', 'icon-lg') + '</div>' +
            '<h3>PastorHub</h3><p class="version">Versão 1.0.0</p>' +
            '<span class="badge badge-lime">Atualizado</span>' +
            '<div style="margin-top:14px;display:flex;justify-content:center;gap:8px">' + avatarDe(Usuario.dados.nome, 'avatar-48 avatar-ring') +
              '<div style="text-align:left"><b style="color:var(--navy);font-size:.9rem">' + escapeHtml(Usuario.dados.nome) + '</b>' +
              '<div style="font-size:.76rem;color:var(--muted-text)">' + escapeHtml(Usuario.dados.email) + '</div></div></div>' +
          '</div></div>' +
          '<div class="card"><div class="card-head">' + icon('help-circle') + 'Ajuda e Suporte</div><div class="card-body">' +
            '<button class="link-row" data-toast="Central de Ajuda: em breve" type="button"><span>Central de Ajuda</span>' + icon('chevron-right', 'icon-sm') + '</button>' +
            '<button class="link-row" data-toast="Tutoriais: em breve" type="button"><span>Tutoriais</span>' + icon('chevron-right', 'icon-sm') + '</button>' +
            '<button class="link-row" data-toast="Reportar Problema: em breve" type="button"><span>Reportar Problema</span>' + icon('chevron-right', 'icon-sm') + '</button>' +
            '<button class="link-row" data-toast="Fale Conosco: em breve" type="button"><span>Fale Conosco</span>' + icon('chevron-right', 'icon-sm') + '</button>' +
          '</div></div>' +
          '<div class="card"><div class="credits"><p>Desenvolvido com ❤️ para pastores</p><p class="tiny">© 2024 PastorHub. Todos os direitos reservados.</p></div></div>' +
          '<div class="section"><button class="btn outline block danger-outline" data-action="sair" type="button">' + icon('log-out', 'icon-sm') + 'Sair da Conta</button></div>';
      }

      const html =
        '<div class="view-header">' +
          '<div class="settings-profile">' +
            avatarDe(Usuario.dados.nome, 'avatar-80 avatar-ring') +
            '<div><h2>' + escapeHtml(Usuario.dados.nome) + '</h2><p class="subtitle">' + escapeHtml(Usuario.dados.email) + '</p><span class="badge badge-lime plan-badge">Plano Premium</span></div>' +
          '</div>' +
        '</div>' +
        tabsHTML([{ id: 'geral', label: 'Geral' }, { id: 'dados', label: 'Dados' }, { id: 'sobre', label: 'Sobre' }], 'setTab') +
        conteudo;

      return { html, after: (el) => ativarTabs(el, 'setTab', () => App.rerender()) };
    },
  };

  window.Views = {
    dashboard: Dashboard,
    agenda: Agenda,
    atendimentos: Atendimentos,
    recursos: Recursos,
    notificacoes: Notificacoes,
    settings: Settings,
  };

  window.NOTIF_UI = ui;
})();
