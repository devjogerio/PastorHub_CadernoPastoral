/* Sermões (Caderno do Pastor): lista, filtros, gerador IA, editor, exportação PDF/TXT */
(function () {
  const state = { filtro: 'todos', query: '', menuAberto: null };

  /* ---------- Cadastro de ações globais ---------- */
  const Actions = (window.Actions = window.Actions || {});

  /* =========================================================
     Tela: Sermões
     ========================================================= */
  const Sermoes = {
    render() {
      const lista = Storage.getSermoes();
      const total = lista.length;
      const pregados = lista.filter((s) => s.status_pregado).length;

      const naFila = Storage.getSyncQueue().length;
      const offline = !Storage.isOnline();

      const html =
        '<div style="padding:1rem 1rem .25rem;display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem">' +
          '<div><h2 style="color:var(--navy);font-size:1.35rem">Caderno do Pastor</h2><p style="font-size:.82rem;color:var(--muted-text)">Seus sermões e mensagens</p></div>' +
          '<div style="display:flex;gap:.35rem">' +
            (offline && naFila > 0
              ? '<button class="btn outline sm" data-action="sync" type="button"><span class="spin-wrap">' + icon('refresh-cw', 'icon-sm') + '</span>Sync (' + naFila + ')</button>'
              : '') +
            '<button class="btn-icon dark" data-action="refresh-sermoes" aria-label="Atualizar" type="button">' + icon('refresh-cw', 'icon-sm') + '</button>' +
          '</div>' +
        '</div>' +
        ((offline || naFila > 0)
          ? '<div class="mode-chip">🟢 Modo Offline • ' + total + ' sermões salvos localmente' + (naFila ? ' • ' + naFila + ' na fila' : '') + '</div>'
          : '') +
        '<div class="stat-grid">' +
          statBtnHTML({ label: 'Total', value: total, icon: 'book-open', bg: 'bg-navy', toast: 'Total: ' + total + ' sermões' }) +
          statBtnHTML({ label: 'Pregados', value: pregados, icon: 'check-circle', bg: 'bg-lime', toast: 'Pregados: ' + pregados + ' sermões' }) +
          statBtnHTML({ label: 'Aguardando', value: total - pregados, icon: 'clock', bg: 'bg-red', toast: 'Aguardando: ' + (total - pregados) + ' sermões' }) +
          statBtnHTML({ label: 'Fila', value: naFila, icon: 'refresh-cw', bg: 'bg-blue', toast: naFila + ' alteração(ões) na fila de sincronização' }) +
        '</div>' +
        '<div style="height:1rem"></div>' +
        '<button class="btn-primary-big" data-action="novo-sermao" type="button">' + icon('plus', 'icon-sm') + 'Criar Novo Sermão com IA</button>' +
        '<button class="btn-primary-big btn-secundario" data-action="abrir-assistente" data-agente="homiletica" type="button">' + icon('sparkles', 'icon-sm') + 'Perguntar ao assistente de homilética</button>' +
        '<div class="search-box">' + icon('search') + '<input type="text" id="serm-busca" placeholder="Buscar sermões..." value="' + escapeHtml(state.query) + '"></div>' +
        '<div class="pills">' +
          '<button class="pill ' + (state.filtro === 'todos' ? 'active-navy' : '') + '" data-filtro="todos" type="button">Todos</button>' +
          '<button class="pill ' + (state.filtro === 'pregados' ? 'active-lime' : '') + '" data-filtro="pregados" type="button">Pregados</button>' +
          '<button class="pill ' + (state.filtro === 'aguardando' ? 'active-orange' : '') + '" data-filtro="aguardando" type="button">Aguardando</button>' +
        '</div>' +
        '<div class="section">' +
          '<div id="serm-lista">' + sermoesListaHTML() + '</div>' +
        '</div>' +
        (naFila > 0
          ? '<div class="section"><button class="btn outline block" data-action="sync" type="button">' + icon('refresh-cw', 'icon-sm') + 'Sincronizar agora (' + naFila + ' pendências)</button></div>'
          : '');

      return { html, after: (el) => {
        // busca — atualiza apenas a lista (mantém foco e não rola a página)
        const busca = el.querySelector('#serm-busca');
        if (busca) busca.addEventListener('input', () => {
          state.query = busca.value;
          const alvo = el.querySelector('#serm-lista');
          if (alvo) alvo.innerHTML = sermoesListaHTML();
        });
        // filtros
        el.querySelectorAll('[data-filtro]').forEach((b) => b.addEventListener('click', () => {
          state.filtro = b.dataset.filtro;
          App.rerender();
        }));
        // dropdowns abertos
        if (state.menuAberto) {
          const pop = el.querySelector('.menu-pop[data-open]');
          if (pop) pop.hidden = false;
          el.addEventListener('click', (e) => {
            if (!e.target.closest('.item-menu')) { state.menuAberto = null; App.rerender(); }
          }, { once: true });
        }
      } };
    },
  };

  /* ---------- Lista filtrada (atualização parcial na busca) ---------- */
  function sermoesListaHTML() {
    const lista = Storage.getSermoes();
    const q = state.query.toLowerCase();
    let filtrados = lista.filter((s) =>
      s.titulo.toLowerCase().includes(q) ||
      s.texto_biblico.toLowerCase().includes(q) ||
      s.tema.toLowerCase().includes(q)
    );
    if (state.filtro === 'pregados') filtrados = filtrados.filter((s) => s.status_pregado);
    if (state.filtro === 'aguardando') filtrados = filtrados.filter((s) => !s.status_pregado);

    return (filtrados.length
      ? '<div class="list-grid">' + filtrados.map(sermonCard).join('') + '</div>'
      : '<div class="empty-state">' + icon('book-open') +
          '<p>' + (q || state.filtro !== 'todos'
            ? 'Nenhum sermão encontrado para “' + escapeHtml(state.query) + '”'
            : 'Você ainda não tem sermões.<br>Crie seu primeiro sermão com IA!') + '</p></div>');
  }

  /* ---------- Card de sermão ---------- */
  function sermonCard(s) {
    const tags = (s.tags || []).slice(0, 2).map((t) => '<span class="badge badge-outline">#' + escapeHtml(t) + '</span>').join('');
    return '<div class="card" style="margin-bottom:.7rem">' +
      '<div class="card-body" style="padding:.9rem">' +
        '<div style="display:flex;align-items:flex-start;gap:.4rem">' +
          '<div style="flex:1;min-width:0">' +
            '<div class="item-title" style="font-size:.95rem;cursor:pointer" data-action="detalhe" data-tipo="sermao" data-id="' + s.id + '">' + escapeHtml(s.titulo) + '</div>' +
            '<div class="item-sub">' + escapeHtml(s.texto_biblico) + '</div>' +
          '</div>' +
          (s.status_pregado ? '<span class="badge badge-lime">' + icon('check', 'icon-sm') + 'Pregado</span>' : '') +
          '<span class="item-menu"><button class="btn-icon dark" style="width:2rem;height:2rem" data-action="toggle-menu" data-id="' + s.id + '" aria-label="Mais opções" type="button">' + icon('more-vertical', 'icon-sm') + '</button>' +
            '<div class="menu-pop"' + (state.menuAberto === s.id ? ' data-open hidden' : ' hidden') + '>' +
              '<button data-action="exportar-pdf" data-id="' + s.id + '" type="button">' + icon('download', 'icon-sm') + 'Exportar PDF</button>' +
              '<button data-action="exportar-txt" data-id="' + s.id + '" type="button">' + icon('download', 'icon-sm') + 'Baixar TXT</button>' +
              '<hr>' +
              '<button class="danger" data-action="excluir-sermao" data-id="' + s.id + '" type="button">' + icon('trash-2', 'icon-sm') + 'Excluir</button>' +
            '</div></span>' +
        '</div>' +
        '<div class="item-badges" style="margin-top:.5rem">' +
          '<span class="badge badge-secondary">' + escapeHtml(s.tipo_sermao) + '</span>' +
          '<span class="badge badge-outline">' + escapeHtml(s.publico_alvo) + '</span>' + tags +
        '</div>' +
        (s.data_pregado
          ? '<div class="item-meta" style="margin-top:.5rem">' + icon('calendar', 'icon-sm') + 'Pregado em ' + escapeHtml(fmtDateBR(s.data_pregado)) + (s.local_pregado ? ' - ' + escapeHtml(s.local_pregado) : '') + '</div>'
          : '') +
        '<div style="display:flex;gap:.5rem;margin-top:.75rem">' +
          '<button class="btn outline sm" style="flex:1" data-action="editar-sermao" data-id="' + s.id + '" type="button">' + icon('edit', 'icon-sm') + 'Editar</button>' +
          (s.status_pregado
            ? '<button class="btn outline sm" style="flex:1" data-action="desmarcar-pregado" data-id="' + s.id + '" type="button">' + icon('x', 'icon-sm') + 'Desmarcar</button>'
            : '<button class="btn lime sm" style="flex:1" data-action="marcar-pregado" data-id="' + s.id + '" type="button">' + icon('check', 'icon-sm') + 'Pregar</button>') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* =========================================================
     Sheet: Gerar Sermão com IA
     ========================================================= */
  Actions['novo-sermao'] = function () {
    openSheet({
      title: 'Gerar Sermão com IA',
      desc: 'Crie um sermão estruturado usando Inteligência Artificial',
      body:
        '<div class="info-box blue"><strong>Campos obrigatórios</strong></div>' +
        '<div class="field"><label>Texto Bíblico *</label><input id="gen-texto" type="text" placeholder="Ex: Marcos 11:22-24"></div>' +
        '<div class="field"><label>Tema Central *</label><input id="gen-tema" type="text" placeholder="Ex: Fé, Amor, Santidade"></div>' +
        '<div class="field"><label>Tipo *</label><select id="gen-tipo"><option value="" disabled selected>Escolha</option><option>Expositivo</option><option>Temático</option><option>Textual</option><option>Narrativo</option><option>Evangelístico</option></select></div>' +
        '<div class="field"><label>Público *</label><select id="gen-publico"><option value="" disabled selected>Escolha</option><option>Geral</option><option>Igreja Local</option><option>Jovens</option><option>Adultos</option><option>Idosos</option><option>Crianças</option><option>Não Crentes</option></select></div>' +
        '<div class="info-box blue"><strong>Campos opcionais (para personalização)</strong></div>' +
        '<div class="field"><label>Título Personalizado (opcional)</label><input id="gen-titulo" type="text" placeholder="Deixe em branco para a IA sugerir"></div>' +
        '<div class="field"><label>Tom do Sermão (opcional)</label><select id="gen-tom"><option value="" disabled selected>Selecione o tom</option><option>Encorajador</option><option>Desafiador</option><option>Consolador</option><option>Evangelístico</option><option>Profético</option><option>Pastoral</option></select></div>' +
        '<div class="field"><label>Observações Especiais</label><textarea id="gen-obs" rows="4" placeholder="Ex: Incluir ilustrações sobre família, enfatizar aplicação prática, usar linguagem jovem..."></textarea></div>' +
        '<div class="info-box lime"><div>' + icon('book-open', 'icon-sm') + '</div><div><strong>Dicas para melhores resultados</strong><ul><li>Seja específico no tema central do sermão</li><li>Indique o contexto do público-alvo</li><li>Use as observações para personalizar o conteúdo</li><li>Após gerar, você pode editar e refinar o texto</li><li>A IA é uma ferramenta de auxílio, sempre revise o conteúdo teológico</li></ul></div></div>' +
        '<div class="info-box yellow"><div>⚠️</div><div><strong>Integração com OpenAI:</strong> Para usar a geração real com IA, você precisará configurar sua API Key da OpenAI no backend. Por enquanto, este é um protótipo funcional com conteúdo de exemplo.</div></div>',
      footer:
        '<button class="btn outline" data-action="close-sheet" type="button">Cancelar</button>' +
        '<button class="btn primary" data-action="gerar-sermao" type="button" id="btn-gerar">' + icon('sparkles', 'icon-sm') + 'Gerar Sermão</button>',
    });
  };

  function sermaoGeradoExemplo(opcoes) {
    const titulo = opcoes.titulo || 'A Fé Que Transforma Montanhas';
    const html =
      '<h2>' + escapeHtml(titulo) + '</h2>' +
      '<h3>Introdução</h3>' +
      '<p>Baseados em ' + escapeHtml(opcoes.texto_biblico) + ', exploramos hoje o tema <strong>' + escapeHtml(opcoes.tema) + '</strong>. Uma mensagem com tom ' + (opcoes.tom || 'pastoral').toLowerCase() + ' para ' + (opcoes.publico || 'todos').toLowerCase() + '.</p>' +
      '<h3>I. O Que a Palavra Diz</h3>' +
      '<p>O texto sagrado nos convida a refletir sobre ' + escapeHtml(opcoes.tema.toLowerCase()) + ' à luz da revelação divina.</p>' +
      '<h3>II. Aplicação Para Hoje</h3>' +
      '<ul><li>Reflita sobre como ' + escapeHtml(opcoes.tema.toLowerCase()) + ' se manifesta na sua vida</li><li>Busque comunhão e oração constante</li><li>Compartilhe esta mensagem com alguém</li></ul>' +
      '<h3>Conclusão</h3>' +
      '<p>Que Deus, pela Sua graça, nos ajude a viver plenamente esta verdade.</p>' +
      '<h3>Referências Bíblicas Adicionais</h3>' +
      '<ul><li>Salmos 119:105</li><li>Filipenses 4:13</li></ul>' +
      (opcoes.observacoes ? '<h3>Observações</h3><p>' + escapeHtml(opcoes.observacoes) + '</p>' : '');
    return {
      titulo: titulo,
      conteudo_html: html,
      conteudo_plain: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500),
    };
  }

  Actions['gerar-sermao'] = function () {
    const texto = document.getElementById('gen-texto').value.trim();
    const tema = document.getElementById('gen-tema').value.trim();
    const tipo = document.getElementById('gen-tipo').value;
    const publico = document.getElementById('gen-publico').value;
    if (!texto || !tema || !tipo || !publico) {
      toast('Preencha todos os campos obrigatórios', 'error');
      return;
    }
    const btn = document.getElementById('btn-gerar');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner spinner-sm spinner-navy" style="display:inline-block;vertical-align:middle;margin-right:.4rem"></span>Gerando...';

    setTimeout(() => {
      const opcoes = {
        texto_biblico: texto,
        tema,
        tipo,
        publico,
        tom: document.getElementById('gen-tom').value || null,
        titulo: document.getElementById('gen-titulo').value.trim() || null,
        observacoes: document.getElementById('gen-obs').value.trim() || null,
      };
      const gerado = sermaoGeradoExemplo(opcoes);
      const sermao = {
        id: uid(),
        titulo: gerado.titulo,
        texto_biblico: texto,
        tema,
        publico_alvo: publico,
        tipo_sermao: tipo,
        conteudo_html: gerado.conteudo_html,
        conteudo_plain: gerado.conteudo_plain,
        tags: [tema.toLowerCase(), texto.split(/[0-9:]/)[0].trim().toLowerCase()].filter(Boolean),
        data_criacao: new Date().toISOString(),
        data_pregado: null,
        status_pregado: false,
        local_pregado: '',
      };
      Storage.addSermao(sermao);
      closeSheet();
      toast(Storage.isOnline() ? 'Sermão gerado com sucesso!' : 'Sermão salvo localmente!', 'success');
      App.rerender();
    }, 2000);
  };

  /* =========================================================
     Sheet: Editar / Visualizar Sermão
     ========================================================= */
  Actions['editar-sermao'] = function (el) {
    const id = el.dataset.id;
    const s = Storage.getSermoes().find((x) => x.id === id);
    if (!s) return;

    const body =
      '<div class="tabs cols-3" style="margin:0 0 .9rem" id="ed-tabs">' +
        '<button class="tab active" data-edtab="view" type="button">Visualizar</button>' +
        '<button class="tab" data-edtab="edit" type="button">Editar</button>' +
        '<button class="tab" data-edtab="det" type="button">Detalhes</button>' +
      '</div>' +
      '<div id="ed-body"></div>';

    const footer =
      '<button class="btn outline" data-action="close-sheet" type="button">' + icon('x', 'icon-sm') + 'Cancelar</button>' +
      '<button class="btn primary" data-action="salvar-sermao" data-id="' + s.id + '" type="button">' + icon('save', 'icon-sm') + 'Salvar</button>';

    openSheet({ title: 'Editar Sermão', desc: s.titulo, body, footer, icon: 'book-open' });

    const edBody = document.getElementById('ed-body');
    const edTabs = document.getElementById('ed-tabs');

    function abaView() {
      edBody.innerHTML =
        '<div class="sermon-view-head">' +
          '<h2>' + escapeHtml(s.titulo) + '</h2>' +
          '<p class="ref">' + escapeHtml(s.texto_biblico) + '</p>' +
          '<div class="badges">' +
            '<span class="badge badge-lime">' + escapeHtml(s.tipo_sermao) + '</span>' +
            '<span class="badge badge-outline" style="color:#fff;border-color:rgba(255,255,255,.4)">' + escapeHtml(s.publico_alvo) + '</span>' +
            (s.status_pregado ? '<span class="badge badge-green">✓ Pregado</span>' : '') +
          '</div>' +
        '</div>' +
        (s.status_pregado
          ? '<div class="pregado-box">' +
              '<div class="row">' + icon('calendar', 'icon-sm') + '<strong>Pregado em:</strong> ' + escapeHtml(fmtDateBR(s.data_pregado)) + '</div>' +
              (s.local_pregado ? '<div class="row">' + icon('map-pin', 'icon-sm') + '<strong>Local:</strong> ' + escapeHtml(s.local_pregado) + '</div>' : '') +
            '</div>'
          : '') +
        '<div class="item-badges" style="margin-bottom:.6rem">' + (s.tags || []).map((t) => '<span class="badge badge-outline">' + icon('tag', 'icon-sm') + '#' + escapeHtml(t) + '</span>').join('') + '</div>' +
        '<div class="sermon-prose">' + s.conteudo_html + '</div>' +
        '<div style="display:flex;gap:.5rem;margin-top:1rem">' +
          '<button class="btn outline sm" style="flex:1" data-action="copiar-sermao" data-id="' + s.id + '" type="button">' + icon('copy', 'icon-sm') + 'Copiar Texto</button>' +
          '<button class="btn outline sm" style="flex:1" data-action="compartilhar-sermao" data-id="' + s.id + '" type="button">' + icon('share', 'icon-sm') + 'Compartilhar</button>' +
        '</div>';
    }

    function abaEdit() {
      edBody.innerHTML =
        '<div class="field"><label>Título</label><input id="ed-titulo" type="text" value="' + escapeHtml(s.titulo) + '"></div>' +
        '<div class="field"><label>Texto Bíblico</label><input id="ed-texto" type="text" value="' + escapeHtml(s.texto_biblico) + '"></div>' +
        '<div class="field"><label>Tema</label><input id="ed-tema" type="text" value="' + escapeHtml(s.tema) + '"></div>' +
        '<div class="field"><label>Tipo</label><select id="ed-tipo">' + ['Expositivo', 'Temático', 'Textual', 'Narrativo', 'Evangelístico'].map((t) => '<option' + (t === s.tipo_sermao ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
        '<div class="field"><label>Público-Alvo</label><select id="ed-publico">' + ['Geral', 'Igreja Local', 'Jovens', 'Adultos', 'Idosos', 'Crianças'].map((t) => '<option' + (t === s.publico_alvo ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
        '<div class="field"><label>Tags</label><input id="ed-tags" type="text" value="' + escapeHtml((s.tags || []).join(', ')) + '" placeholder="fé, milagres, marcos"><span class="hint">Separadas por vírgula</span></div>' +
        '<div class="field"><label>Conteúdo (HTML)</label><textarea id="ed-conteudo" rows="20" style="font-family:monospace;font-size:.75rem">' + escapeHtml(s.conteudo_html) + '</textarea><span class="hint">Você pode editar o HTML diretamente. Use tags como &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;</span></div>' +
        '<div class="info-box blue"><div>💡</div><div><strong>Dica:</strong> Edite com cuidado. As alterações no HTML afetarão a visualização do sermão.</div></div>';
    }

    function abaDet() {
      edBody.innerHTML =
        '<div class="switch-row"><div><div class="label">Status de Pregação</div><div class="sub">Marque como pregado quando utilizar este sermão</div></div>' +
          '<span class="switch"><input type="checkbox" id="ed-pregado"' + (s.status_pregado ? ' checked' : '') + '><span class="track"></span><span class="thumb"></span></span></div>' +
        '<div id="ed-pregado-fields" ' + (s.status_pregado ? '' : 'hidden') + '>' +
          '<div class="pregado-box" style="margin-top:.9rem"><strong>Detalhes da Pregação</strong>' +
            '<div class="field" style="margin:.5rem 0 0"><label>Data da Pregação</label><input id="ed-data-pregado" type="date" value="' + (s.data_pregado ? s.data_pregado.substring(0, 10) : '') + '"></div>' +
            '<div class="field" style="margin:.5rem 0 0"><label>Local da Pregação</label><input id="ed-local-pregado" type="text" value="' + escapeHtml(s.local_pregado || '') + '" placeholder="Ex: Igreja Sede, Culto da Juventude"></div>' +
          '</div>' +
        '</div>' +
        '<div class="card" style="margin:1rem 0 0"><div class="card-head">' + icon('book-open') + 'Informações do Sermão</div><div class="card-body" style="font-size:.82rem;color:var(--muted-text);display:flex;flex-direction:column;gap:.3rem">' +
          '<div><strong style="color:var(--navy)">ID:</strong> <span style="font-family:monospace">' + escapeHtml(s.id) + '</span></div>' +
          '<div><strong style="color:var(--navy)">Criado em:</strong> ' + escapeHtml(fmtDateBR(s.data_criacao)) + '</div>' +
          '<div><strong style="color:var(--navy)">Palavras:</strong> ' + ((s.conteudo_plain || '').split(/\s+/).filter(Boolean).length) + '</div>' +
          '<div><strong style="color:var(--navy)">Caracteres:</strong> ' + (s.conteudo_plain || '').length + '</div>' +
        '</div></div>' +
        '<div class="info-box lime" style="margin-top:.9rem"><div>📝</div><div><strong>Sobre este sermão</strong><ul><li>O conteúdo é salvo localmente no dispositivo</li><li>Você pode exportar para PDF ou TXT</li><li>Edite livremente o HTML do sermão</li><li>Marque como pregado após utilizar</li></ul></div></div>';

      const chk = document.getElementById('ed-pregado');
      chk.addEventListener('change', () => {
        document.getElementById('ed-pregado-fields').hidden = !chk.checked;
        if (chk.checked && !document.getElementById('ed-data-pregado').value) {
          document.getElementById('ed-data-pregado').value = new Date().toISOString().substring(0, 10);
        }
      });
    }

    abaView();
    edTabs.querySelectorAll('[data-edtab]').forEach((b) => b.addEventListener('click', () => {
      edTabs.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      const aba = b.dataset.edtab;
      if (aba === 'view') abaView();
      else if (aba === 'edit') abaEdit();
      else abaDet();
    }));
  };

  Actions['salvar-sermao'] = function (el) {
    const id = el.dataset.id;
    const val = (x) => (document.getElementById(x) ? document.getElementById(x).value : null);
    const updates = {};
    const titulo = val('ed-titulo');
    if (titulo !== null) {
      const conteudo = val('ed-conteudo');
      updates.titulo = titulo;
      updates.texto_biblico = val('ed-texto') || '';
      updates.tema = val('ed-tema') || '';
      updates.tipo_sermao = val('ed-tipo') || '';
      updates.publico_alvo = val('ed-publico') || '';
      updates.tags = (val('ed-tags') || '').split(',').map((t) => t.trim()).filter(Boolean);
      if (conteudo !== null) {
        updates.conteudo_html = conteudo;
        updates.conteudo_plain = conteudo.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500);
      }
    }
    const pregado = document.getElementById('ed-pregado');
    if (pregado) {
      updates.status_pregado = pregado.checked;
      updates.data_pregado = pregado.checked ? (val('ed-data-pregado') || new Date().toISOString()) : null;
      updates.local_pregado = val('ed-local-pregado') || '';
    }
    Storage.updateSermao(id, updates);
    closeSheet();
    toast(Storage.isOnline() ? 'Sermão atualizado!' : 'Sermão atualizado localmente!', 'success');
    App.rerender();
  };

  Actions['copiar-sermao'] = function (el) {
    const s = Storage.getSermoes().find((x) => x.id === el.dataset.id);
    if (!s) return;
    const texto = s.titulo + '\n\n' + (s.conteudo_plain || '');
    navigator.clipboard.writeText(texto).then(
      () => toast('Conteúdo copiado!', 'success'),
      () => toast('Não foi possível copiar', 'error')
    );
  };

  Actions['compartilhar-sermao'] = function (el) {
    const s = Storage.getSermoes().find((x) => x.id === el.dataset.id);
    if (!s) return;
    if (navigator.share) {
      navigator.share({ title: s.titulo, text: (s.conteudo_plain || '').substring(0, 500) }).catch(() => {});
    } else {
      toast('Compartilhamento não disponível neste dispositivo');
    }
  };

  /* ---------- Ações da lista ---------- */
  Actions['toggle-menu'] = function (el) {
    const id = el.dataset.id;
    state.menuAberto = state.menuAberto === id ? null : id;
    App.rerender();
  };

  Actions['refresh-sermoes'] = function () {
    toast('Sermões atualizados!', 'success');
    App.rerender();
  };

  Actions['marcar-pregado'] = function (el) {
    Storage.togglePregado(el.dataset.id, true);
    toast('Sermão marcado como pregado!', 'success');
    App.rerender();
  };

  Actions['desmarcar-pregado'] = function (el) {
    Storage.togglePregado(el.dataset.id, false);
    toast('Sermão desmarcado!');
    App.rerender();
  };

  Actions['excluir-sermao'] = function (el) {
    const id = el.dataset.id;
    const s = Storage.getSermoes().find((x) => x.id === id);
    if (!s) return;
    confirmDialog({
      title: 'Excluir Sermão',
      message: 'Tem certeza que deseja excluir "<strong>' + escapeHtml(s.titulo) + '</strong>"? Esta ação não pode ser desfeita.',
      onConfirm() {
        Storage.deleteSermao(id);
        toast(Storage.isOnline() ? 'Sermão excluído!' : 'Sermão excluído localmente!', 'success');
        App.rerender();
      },
    });
  };

  /* =========================================================
     Exportação PDF / TXT
     ========================================================= */
  Actions['exportar-pdf'] = function (el) {
    const s = Storage.getSermoes().find((x) => x.id === el.dataset.id);
    if (!s) return;
    const win = window.open('', '_blank');
    if (!win) {
      toast('Não foi possível abrir janela de impressão', 'error');
      return;
    }
    win.document.write(gerarHTMLImpressao(s));
    win.document.close();
    toast('Abrindo visualização de PDF...', 'success');
  };

  function gerarHTMLImpressao(s) {
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${escapeHtml(s.titulo)}</title>
<style>
@page { size: A4; margin: 2cm; }
body { font-family: Georgia, serif; font-size: 12pt; color: #222; line-height: 1.6; }
.logo { text-align: center; font-weight: bold; color: #002645; letter-spacing: .15em; font-size: 10pt; text-transform: uppercase; margin-bottom: 1.5rem; }
h1 { color: #002645; font-size: 24pt; text-align: center; margin: 0 0 .3rem; }
.ref { text-align: center; color: #3261AB; font-style: italic; margin-bottom: 1rem; }
.meta { text-align: center; margin-bottom: 1rem; }
.meta span { display: inline-block; background: #f1f1f1; border-radius: 999px; padding: .15rem .7rem; font-size: 9pt; margin: 0 .2rem .3rem; }
.tags { text-align: center; font-size: 9pt; color: #666; margin-bottom: 1.5rem; }
hr { border: none; border-top: 1px solid #ddd; margin: 1.2rem 0; }
h2 { color: #002645; font-size: 16pt; margin: 1.2rem 0 .4rem; }
h3 { color: #3261AB; font-size: 13pt; margin: 1rem 0 .3rem; }
p { text-align: justify; margin: .5rem 0; }
blockquote { border-left: 3px solid #3261AB; margin: .7rem 0; padding-left: .8rem; color: #555; font-style: italic; }
footer { margin-top: 2rem; border-top: 1px solid #ddd; padding-top: .8rem; font-size: 9pt; color: #666; text-align: center; }
.pregado { color: #95C121; font-weight: bold; }
</style></head><body>
<div class="logo">PastorHub</div>
<h1>${escapeHtml(s.titulo)}</h1>
<div class="ref">${escapeHtml(s.texto_biblico)}</div>
<div class="meta"><span>Tema: ${escapeHtml(s.tema)}</span><span>Tipo: ${escapeHtml(s.tipo_sermao)}</span><span>Público: ${escapeHtml(s.publico_alvo)}</span></div>
<div class="tags">Tags: ${(s.tags || []).map((t) => '#' + escapeHtml(t)).join(', ')}</div>
<hr>
${s.conteudo_html}
<footer>Gerado por PastorHub - Caderno do Pastor<br>Criado em: ${fmtDateBR(s.data_criacao)}${s.status_pregado ? '<br><span class="pregado">✓ Pregado em ' + fmtDateBR(s.data_pregado) + (s.local_pregado ? ' - ' + escapeHtml(s.local_pregado) : '') + '</span>' : ''}</footer>
<script>window.onload = function () { window.print(); };<\/script>
</body></html>`;
  }

  Actions['exportar-txt'] = function (el) {
    const s = Storage.getSermoes().find((x) => x.id === el.dataset.id);
    if (!s) return;
    const linha = '═'.repeat(39);
    const fina = '─'.repeat(39);
    let txt = '';
    txt += linha + '\n';
    txt += s.titulo.toUpperCase() + '\n';
    txt += linha + '\n';
    txt += 'Texto Bíblico: ' + s.texto_biblico + '\n';
    txt += 'Tipo: ' + s.tipo_sermao + '\n';
    txt += 'Público: ' + s.publico_alvo + '\n';
    txt += 'Tema: ' + s.tema + '\n';
    txt += 'Tags: ' + (s.tags || []).map((t) => '#' + t).join(', ') + '\n';
    if (s.status_pregado) {
      txt += '✓ PREGADO\n';
      txt += 'Data: ' + fmtDateBR(s.data_pregado) + '\n';
      if (s.local_pregado) txt += 'Local: ' + s.local_pregado + '\n';
    }
    txt += fina + '\n';
    txt += (s.conteudo_plain || s.conteudo_html.replace(/<[^>]+>/g, ' ')).trim() + '\n';
    txt += fina + '\n';
    txt += 'Gerado por PastorHub • Caderno do Pastor\n';
    txt += 'Data de criação: ' + fmtDateBR(s.data_criacao) + '\n';
    txt += linha + '\n';

    try {
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = s.titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.txt';
      a.click();
      URL.revokeObjectURL(a.href);
      toast('Arquivo baixado com sucesso!', 'success');
    } catch (e) {
      toast('Erro ao baixar arquivo', 'error');
    }
  };

  /* =========================================================
     Sincronização (fila local → "nuvem" simulada)
     ========================================================= */
  Actions['sync'] = function () {
    const fila = Storage.getSyncQueue();
    if (fila.length === 0) {
      toast('Tudo sincronizado!');
      return;
    }
    toast('Sincronizando ' + fila.length + ' alterações...');
    setTimeout(() => {
      Storage.clearSyncQueue();
      Storage.setLastSync();
      toast('Sincronização concluída!', 'success');
      App.rerender();
    }, 1200);
  };

  Actions['limpar-cache'] = function () {
    confirmDialog({
      title: 'Limpar Cache',
      message: 'Isso removerá os dados locais em cache. Seus sermões serão restaurados aos dados de exemplo.',
      confirmLabel: 'Limpar',
      onConfirm() {
        Storage.clearAll();
        toast('Cache limpo!', 'success');
        App.rerender();
      },
    });
  };

  window.Views.sermoes = Sermoes;
})();
