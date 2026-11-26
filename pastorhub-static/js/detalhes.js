/* ============================================================
   Modais de detalhes — abrem a ficha completa de cada card
   (Início, Agenda, Atendimentos, Sermões, Conselho, Recursos)
   ============================================================ */
(function () {
  const Actions = (window.Actions = window.Actions || {});

  function linha(label, valor, extra) {
    return '<div class="det-linha"><span>' + escapeHtml(label) + '</span><b>' + (extra || '') + escapeHtml(valor) + '</b></div>';
  }

  function chip(texto, classe) {
    return '<span class="badge ' + (classe || 'badge-secondary') + '">' + escapeHtml(texto) + '</span>';
  }

  function acoes(itens) {
    return '<div class="det-acoes">' + itens.map((a) =>
      '<button class="btn ' + (a.classe || 'outline') + '" data-action="' + a.action + '"' +
      (a.id ? ' data-id="' + escapeHtml(a.id) + '"' : '') +
      (a.extra || '') + ' type="button">' + icon(a.icone || 'chevron-right', 'icon-sm') + escapeHtml(a.label) + '</button>'
    ).join('') + '</div>';
  }

  const Detalhe = {
    abrir(tipo, id) {
      switch (tipo) {
        case 'atendimento': return this.atendimento(id);
        case 'evento': return this.evento(id);
        case 'sermao': return this.sermao(id);
        case 'sessao': return this.sessao(id);
        case 'notificacao': return this.notificacao(id);
        case 'palestra': return this.palestra(id);
        case 'video': return this.video(id);
        case 'livro': return this.livro(id);
        default: return null;
      }
    },

    /* ---------- Atendimento ---------- */
    atendimento(nome) {
      const at = MOCK.atendimentos.lista.find((x) => x.nome === nome);
      if (!at) return;
      const concluida = at.status === 'Concluído';
      const modIcon = at.modalidade === 'Online' ? 'video' : at.modalidade === 'Telefone' ? 'phone' : 'map-pin';
      openSheet({
        title: at.nome,
        desc: at.tipo + ' · ' + at.quando,
        icon: 'users',
        body:
          '<div class="det-top">' + avatarDe(at.nome, 'avatar-80 avatar-ring') +
            '<div><strong>' + escapeHtml(at.nome) + '</strong><span>' + escapeHtml(at.tipo) + '</span>' +
              '<div class="det-chips">' + chip(at.status, concluida ? 'badge-secondary' : 'badge-lime') + chip(at.modalidade, 'badge-outline') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="det-linhas">' +
            linha('Motivo do atendimento', at.motivo) +
            linha('Modalidade', at.modalidade) +
            linha('Data e hora', at.quando) +
            linha('Pastor responsável', 'Pastor Silva') +
            linha('Canal de lembrete', 'WhatsApp · enviado às ' + (concluida ? '09:00' : '10:30')) +
            linha('Histórico', concluida ? 'Atendimento concluído e registrado' : 'Aguardando o encontro') +
          '</div>' +
          '<div class="det-bloco"><h4>Observações pastorais</h4><p>' +
            (concluida
              ? 'Encaminhado para acompanhamento semanal. Membro orientado a manter a rotina de oração e a participação na comunhão.'
              : 'Membro telefonou confirmando presença. Reforçar a necessidade de devido cuidado com o Probe:([-') +
          '</div></p></div>' +
          acoes([
            { label: 'Abrir no módulo Atendimento', icon: 'users', action: 'ir-para-atendimentos' },
            { label: 'Enviar lembrete (WhatsApp)', icon: 'message', action: 'enviar-lembrete', id: at.nome, classe: 'lime' },
            { label: 'Registrar acompanhamento', icon: 'edit', action: 'toast', extra: ' data-msg="Acompanhamento registrado"', classe: 'outline' },
          ]),
      });
    },

    /* ---------- Evento da agenda ---------- */
    evento(titulo) {
      const ev = MOCK.agenda.eventos.find((x) => x.titulo === titulo);
      if (!ev) return;
      const localIcon = ev.local === 'Online' ? 'video' : ev.local === 'Casa' ? 'map-pin' : 'calendar';
      openSheet({
        title: ev.titulo,
        desc: ev.tipo + ' · ' + ev.quando,
        icon: 'calendar',
        body:
          '<div class="det-top">' +
            '<span class="det-icon" style="background:var(--blue);color:#fff">' + icon(localIcon) + '</span>' +
            '<div><strong>' + escapeHtml(ev.titulo) + '</strong><span>' + escapeHtml(ev.tipo) + '</span>' +
              '<div class="det-chips">' + chip(ev.local, 'badge-outline') + chip('Confirmado', 'badge-lime') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="det-linhas">' +
            linha('Quando', ev.quando) +
            linha('Local', ev.local) +
            linha('Participantes', ev.tipo === 'Palestra' ? 'Jovens da igreja · 60 inscritos' : '1 pessoa') +
            linha('Lembrete', 'WhatsApp enviado às 09:00') +
            linha('Organizador', 'Pastor Silva') +
          '</div>' +
          acoes([
            { label: 'Abrir na Agenda', icon: 'calendar', action: 'ir-para-agenda' },
            { label: 'Reenviar lembrete', icon: 'message', action: 'enviar-lembrete', id: ev.titulo, classe: 'lime' },
            { label: 'Editar evento', icon: 'edit', action: 'ir-para-agenda' },
          ]),
      });
    },

    /* ---------- Sermão ---------- */
    sermao(id) {
      const s = Storage.getSermoes().find((x) => x.id === id);
      if (!s) return;
      openSheet({
        title: s.titulo,
        desc: s.texto_biblico + ' · ' + s.tipo_sermao,
        icon: 'book-open',
        body:
          '<div class="det-top">' +
            '<span class="det-icon" style="background:var(--navy);color:#fff">' + icon('book-open') + '</span>' +
            '<div><strong>' + escapeHtml(s.titulo) + '</strong><span>' + escapeHtml(s.tema) + ' · ' + escapeHtml(s.publico_alvo) + '</span>' +
              '<div class="det-chips">' + chip(s.tipo_sermao, 'badge-secondary') + chip(s.publico_alvo, 'badge-outline') +
                (s.status_pregado ? chip('Pregado', 'badge-lime') : chip('Aguardando', 'badge-orange')) +
                (s.tags || []).map((t) => chip('#' + t, 'badge-outline')).join('') +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="det-linhas">' +
            linha('Referência bíblica', s.texto_biblico) +
            linha('Criado em', fmtDateBR(s.data_criacao)) +
            linha('Palavras', String((s.conteudo_plain || '').split(/\s+/).filter(Boolean).length)) +
            (s.data_pregado ? linha('Pregado em', fmtDateBR(s.data_pregado) + (s.local_pregado ? ' · ' + s.local_pregado : '')) : '') +
          '</div>' +
          '<div class="det-bloco"><h4>Prévia do sermão</h4><div class="sermon-prose">' +
            (window.sanitizeHtml ? window.sanitizeHtml((s.conteudo_html || '').split('</p>').slice(0, 3).join('</p>')) : escapeHtml(s.conteudo_html || '')) + '</p></div></div>' +
          acoes([
            { label: 'Editar sermão', icon: 'edit', action: 'editar-sermao', id: s.id },
            { label: 'Exportar PDF', icon: 'download', action: 'exportar-pdf', id: s.id },
            { label: 'Baixar TXT', icon: 'download', action: 'exportar-txt', id: s.id },
            s.status_pregado
              ? { label: 'Desmarcar', icon: 'x', action: 'desmarcar-pregado', id: s.id }
              : { label: 'Marcar pregado', icon: 'check', action: 'marcar-pregado', id: s.id, classe: 'lime' },
          ]),
      });
    },

    /* ---------- Sessão do Conselho (Meet AI) ---------- */
    sessao(nome) {
      const s = MOCK.conselho.sessoes.find((x) => x.nome === nome);
      if (!s) return;
      let relatorios = [];
      try { relatorios = JSON.parse(localStorage.getItem('pastorhub_conselhos')) || []; } catch (e) {}
      const rel = relatorios.find((r) => r.nome === s.nome);

      const itens = [
        { label: 'Abrir na Agenda', icon: 'calendar', action: 'ir-para-agenda' },
        { label: 'Enviar lembrete (WhatsApp)', icon: 'message', action: 'enviar-lembrete', id: s.nome, classe: 'lime' },
      ];
      if (rel) {
        itens.unshift({ label: 'Ver relatório', icon: 'file-text', action: 'abrir-relatorio', id: rel.id });
        itens.splice(2, 0, { label: 'Baixar TXT', icon: 'download', action: 'export-relatorio-txt', id: rel.id });
      } else {
        itens.unshift({ label: 'Iniciar sessão', icon: 'video', action: 'nova-sessao', classe: 'lime' });
      }

      openSheet({
        title: s.nome,
        desc: s.tipo + ' · ' + s.quando,
        icon: 'video',
        body:
          '<div class="det-top">' +
            '<span class="det-icon" style="background:var(--navy);color:#fff">' + icon('video') + '</span>' +
            '<div><strong>' + escapeHtml(s.nome) + '</strong><span>' + escapeHtml(s.tipo) + '</span>' +
              '<div class="det-chips">' + chip(s.status, s.status === 'Concluída' ? 'badge-lime' : 'badge-secondary') + chip('Meet AI', 'badge-outline') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="det-linhas">' +
            linha('Data e hora', s.quando) +
            linha('Duração', s.duracao) +
            linha('Sala', s.meet) +
            linha('Modalidade', 'Tele-aconselhamento (Google Meet)') +
            linha('Transcrição', rel ? 'Concluída · relatório gerado' : 'Pendente — iniciar a sessão') +
            linha('Análise de sentimento', rel ? rel.analise.nivel.rot + ' (' + rel.analise.score + '%)' : '—') +
          '</div>' +
          '<div class="det-bloco"><h4>Como funciona</h4><p>O áudio é transcrito em tempo real, o tom emocional é analisado pela IA ' +
            'e, ao final, um relatório confidencial é gerado exclusivamente para o pastor — base do histórico de cuidado.</p></div>' +
          acoes(itens),
      });
    },

    /* ---------- Notificação ---------- */
    notificacao(titulo) {
      const n = MOCK.notificacoes.lista.find((x) => x.titulo === titulo);
      if (!n) return;
      const prio = { alta: ['Alta', 'badge-destructive'], media: ['Média', 'badge-navy'], baixa: ['Baixa', 'badge-secondary'] }[n.prioridade];
      const temVersiculo = n.ref && n.ref.includes(':');
      openSheet({
        title: n.titulo,
        desc: n.desc,
        icon: 'bell',
        body:
          '<div class="det-top">' +
            '<span class="det-icon" style="background:' + (n.lida ? 'var(--muted)' : '#dbeafe') + ';color:' + (n.lida ? 'var(--muted-text)' : '#2563eb') + '">' + icon('bell') + '</span>' +
            '<div><strong>' + escapeHtml(n.titulo) + '</strong><span>' + escapeHtml(n.desc) + '</span>' +
              '<div class="det-chips">' + chip(prio[0], prio[1]) + chip(n.lida ? 'Lida' : 'Não lida', n.lida ? 'badge-secondary' : 'badge-lime') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="det-linhas">' +
            linha('Recebida em', n.hora) +
            linha('Tipo', n.tipo) +
            linha('Prioridade', prio[0]) +
          '</div>' +
          // Se a notificação tem versículo, exibi-lo em destaque
          (temVersiculo ? '<div class="versiculo-destacado">' +
            '<div class="versiculo-ref">' + escapeHtml(n.ref) + '</div>' +
            '<blockquote class="versiculo-texto">“' + escapeHtml(n.desc) + '”</blockquote>' +
            '<div class="versao-info">' + (n.versao ? '<small>' + n.versao + '</small>' : '') + '</div>' +
          '</div>' : '') +
          acoes([
            { label: 'Abrir no módulo', icon: 'bell', action: 'ir-para-alertas' },
            { label: 'Marcar como lida', icon: 'check', action: 'marcar-lidas', classe: 'lime' },
            (temVersiculo ? { label: 'Compartilhar', icon: 'share', action: 'compartilhar-versiculo', classe: 'blue' } : null),
          ].filter(item => item !== null)),
      });
    },

    /* ---------- Palestra / vídeo ---------- */
    palestra(titulo) {
      const p = MOCK.recursos.palestras.find((x) => x.titulo === titulo);
      if (!p) return;
      openSheet({
        title: p.titulo,
        desc: 'Palestra gerada com IA',
        icon: 'sparkles',
        body:
          '<div class="det-top">' +
            '<span class="det-icon" style="background:linear-gradient(135deg,#a855f7,#ec4899);color:#fff">' + icon('sparkles') + '</span>' +
            '<div><strong>' + escapeHtml(p.titulo) + '</strong><span>Público: ' + escapeHtml(p.publico) + '</span>' +
              '<div class="det-chips">' + chip(p.duracao, 'badge-outline') + chip('Gerada com IA', 'badge-lime') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="det-linhas">' + linha('Público-alvo', p.publico) + linha('Duração', p.duracao) + linha('Idioma', 'Português brasileiro') + '</div>' +
          acoes([
            { label: 'Abrir na biblioteca', icon: 'book-open', action: 'ir-para-recursos' },
            { label: 'Editar', icon: 'edit', action: 'ir-para-recursos' },
          ]),
      });
    },

    video(titulo) {
      const v = MOCK.recursos.videos.find((x) => x.titulo === titulo);
      if (!v) return;
      openSheet({
        title: v.titulo,
        desc: v.categoria + ' · ' + v.views,
        icon: 'video',
        body:
          '<div class="det-video"><span>' + icon('video', 'icon-lg') + '</span><b>' + escapeHtml(v.titulo) + '</b></div>' +
          '<div class="det-linhas">' + linha('Categoria', v.categoria) + linha('Visualizações', v.views) + linha('Idioma', 'Português brasileiro') + '</div>' +
          acoes([
            { label: 'Reproduzir', icon: 'video', action: 'ir-para-recursos', classe: 'lime' },
            { label: 'Abrir na biblioteca', icon: 'book-open', action: 'ir-para-recursos' },
          ]),
      });
    },

    /* ---------- Livro da Biblioteca Digital ---------- */
    livro(id) {
      const B = window.BIBLIOTECA;
      if (!B) return;
      const l = B.livros.find((x) => x.id === id);
      if (!l) return;
      const cat = B.categorias.find((c) => c.id === l.categoria) || { nome: l.categoria };
      const favs = JSON.parse(localStorage.getItem('pastorhub_biblioteca_favs') || '[]');
      const fav = favs.indexOf(l.id) !== -1;
      openSheet({
        title: l.titulo,
        desc: l.autor + ' · ' + l.ano,
        icon: 'book-open',
        body:
          '<div class="det-top">' +
            '<span class="det-icon" style="background:' + l.gradiente + ';color:#fff;font-size:1.5rem">' + (l.emoji || '📖') + '</span>' +
            '<div><strong>' + escapeHtml(l.titulo) + '</strong><span>' + escapeHtml(l.autor) + '</span>' +
              '<div class="det-chips">' + chip(cat.nome, 'badge-lime') + chip(l.licenca, 'badge-outline') + '</div>' +
            '</div>' +
          '</div>' +
          '<p class="item-meta" style="margin:.75rem 0">' + escapeHtml(l.descricao) + '</p>' +
          '<div class="det-linhas">' +
            linha('Categoria', cat.nome) +
            linha('Ano', String(l.ano)) +
            linha('Páginas', l.paginas + ' páginas') +
            linha('Licença', l.licenca) +
          '</div>' +
          '<div class="det-linhas">' +
            l.destaques.map((d) => '<div class="det-linha"><span>Destaque</span><b>' + escapeHtml(d) + '</b></div>').join('') +
          '</div>' +
          acoes([
            { label: 'Ler agora', icone: 'book-open', action: 'bib-ler-inicio', classe: 'lime', id: l.id },
            { label: fav ? 'Remover dos favoritos' : 'Favoritar', icone: 'star', action: 'bib-favoritar', id: l.id },
            { label: 'Abrir a biblioteca', icone: 'file-text', action: 'bib-abrir-pagina' },
          ]),
      });
    },
  };

  window.Detalhe = Detalhe;

  // ação genérica: data-action="detalhe" data-tipo="..." data-id="..."
  Actions['detalhe'] = function (el) {
    Detalhe.abrir(el.dataset.tipo, el.dataset.id);
  };

  /* ---------- Ações de navegação a partir dos modais ---------- */
  Actions['ir-para-atendimentos'] = function () { closeSheet(); App.navigate('atendimentos'); };
  Actions['ir-para-agenda'] = function () { closeSheet(); App.navigate('agenda'); };
  Actions['ir-para-alertas'] = function () { closeSheet(); App.navigate('notificacoes'); };
  Actions['ir-para-recursos'] = function () { closeSheet(); App.navigate('recursos'); };

  /* ---------- Ações da Biblioteca Digital ---------- */
  Actions['bib-ler-inicio'] = function () {
    toast('Leitor por capítulos chega na fase 2 da Biblioteca Digital.', 'success');
  };

  Actions['bib-favoritar'] = function (el) {
    const id = el.dataset.id;
    const favs = JSON.parse(localStorage.getItem('pastorhub_biblioteca_favs') || '[]');
    const i = favs.indexOf(id);
    if (i === -1) favs.push(id); else favs.splice(i, 1);
    localStorage.setItem('pastorhub_biblioteca_favs', JSON.stringify(favs));
    toast(i === -1 ? 'Livro salvo nos favoritos!' : 'Livro removido dos favoritos.', 'success');
    Detalhe.abrir('livro', id);
  };

  Actions['bib-abrir-pagina'] = function () {
    closeSheet();
    window.open('docs/biblioteca.html', '_blank', 'noopener,noreferrer');
  };

  Actions['enviar-lembrete'] = function (el) {
    const nome = el.dataset.id;
    closeSheet();
    toast('Lembrete enviado para ' + nome + ' via WhatsApp', 'success');
  };

  // ação: compartilhar versículo da notificação
  Actions['compartilhar-versiculo'] = function (el) {
    const refTitulo = el.dataset && el.dataset.ref ? el.dataset.ref : 'Versículo do dia';
    if (navigator.share) {
      navigator.share({ title: 'Versículo do PastorHub', text: refTitulo }).catch(() => {});
    } else {
      toast('Versículo: ' + refTitulo, 'success');
      // Fallback: copiar para área de transferência
      if (navigator.clipboard) {
        navigator.clipboard.writeText(refTitulo).then(() => {
          toast('Versículo copiado', 'success');
        }).catch(() => {});
      }
    }
  };
})();
