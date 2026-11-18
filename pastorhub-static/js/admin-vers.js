/* ============================================================
   Versículos diários — configuração no painel administrativo
   Liga/desliga o envio automático, escolhe hora e canais,
   gerencia o banco de versículos e vê o histórico de envios.
   ============================================================ */
(function () {
  const api = window.AdminAPI;
  if (!api) return;
  const { VIEWS, modal, confirmAction, toast, kpi, panel, esc, switchBox, Actions } = api;
  const ic = (n, c) => window.icon(n, c);
  const V = window.PastorVers;
  if (!V) return;

  const state = { busca: '' };

  /* ================= VIEW ================= */
  VIEWS.versiculos = function () {
    const cfg = V.config();
    const hoje = V.doDia();
    const logs = V.log();
    const banco = V.banco();
    const ativos = banco.filter((v) => v.ativo !== false);

    const termos = state.busca.toLowerCase();
    const lista = banco.filter((v) =>
      !termos || (v.ref + ' ' + v.texto).toLowerCase().includes(termos));

    const linhas = lista.map((v, i) =>
      '<tr>' +
        '<td style="max-width:340px"><b>' + esc(v.ref) + '</b>' +
          '<div style="font-size:.78rem;color:var(--muted);margin-top:2px">' + esc(v.texto.slice(0, 90)) + (v.texto.length > 90 ? '…' : '') + '</div></td>' +
        '<td>' + esc(v.versao || 'ACF') + '</td>' +
        '<td>' + (v.ativo !== false
          ? '<span class="tag tag-green">Ativo</span>'
          : '<span class="tag tag-gray">Pausado</span>') + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="icon-btn" data-action="vers-toggle" data-id="' + i + '" title="' + (v.ativo !== false ? 'Pausar' : 'Ativar') + '">' + ic(v.ativo !== false ? 'lock' : 'check') + '</button>' +
          '<button class="btn btn-outline btn-sm" data-action="vers-editar" data-id="' + i + '">' + ic('edit', 'icon-sm') + 'Editar</button>' +
          '<button class="icon-btn" data-action="vers-ver" data-id="' + i + '" title="Ver versículo completo">' + ic('eye') + ' Ver</button>' +
          '<button class="icon-btn danger" data-action="vers-excluir" data-id="' + i + '" title="Excluir">' + ic('trash-2') + '</button>' +
        '</div></td>' +
      '</tr>').join('');

    const linhasLog = logs.slice(0, 12).map((l) =>
      '<tr>' +
        '<td style="font-size:.8rem;color:var(--muted)">' + esc(l.data) + ' · ' + esc(l.hora) + '</td>' +
        '<td><b>' + esc(l.ref) + '</b></td>' +
        '<td>' + (l.origem === 'manual' ? '<span class="tag tag-blue">Manual</span>' : '<span class="tag tag-lime">Automático</span>') + '</td>' +
        '<td style="font-size:.78rem">' +
          '<span class="tag ' + (l.canais.app ? 'tag-green' : 'tag-gray') + '">App</span> ' +
          '<span class="tag ' + (l.canais.notificacao ? 'tag-green' : 'tag-gray') + '">Notificação</span> ' +
          '<span class="tag ' + (l.canais.whatsapp === 'enviado' ? 'tag-green' : l.canais.whatsapp === 'desligado' ? 'tag-gray' : 'tag-amber') + '">WhatsApp</span>' +
        '</td>' +
      '</tr>').join('');

    return '<div class="kpi-grid">' +
        kpi('Envio automático', cfg.ativo ? 'Ativo' : 'Desligado', 'todos os dias às ' + cfg.hora, 'book', cfg.ativo ? 'b-lime' : 'b-red', cfg.ativo) +
        kpi('Versículos no banco', ativos.length + ' de ' + banco.length, 'ativos / total', 'library', 'b-navy') +
        kpi('Envios registrados', logs.length, 'histórico recente', 'history', 'b-blue') +
        kpi('WhatsApp', cfg.canais.whatsapp ? (V.whatsappPronto() ? 'Conectado' : 'Integração pendente') : 'Desligado', 'canal de envio', 'message', cfg.canais.whatsapp && V.whatsappPronto() ? 'b-lime' : 'b-amber', V.whatsappPronto()) +
      '</div>' +

      '<div class="grid-2">' +
        panel('Envio automático',
          '<div class="vers-config">' +
            '<div class="vers-canal">' +
              '<div class="grow"><b>Ligado</b><small>o versículo é enviado automaticamente todos os dias, no horário abaixo</small></div>' +
              switchBox(cfg.ativo, 'vers-ativo') +
            '</div>' +
            '<div class="vers-canal">' +
              '<div class="grow"><b>Horário do envio</b><small>quando qualquer página do projeto estiver aberta (app ou painel)</small></div>' +
              '<input id="vers-hora" type="time" value="' + esc(cfg.hora) + '">' +
            '</div>' +
            '<div class="vers-canal">' +
              '<div class="grow"><b>Card no app</b><small>versículo do dia no Início (mobile, tablet e desktop)</small></div>' +
              switchBox(cfg.canais.app !== false, 'vers-app') +
            '</div>' +
            '<div class="vers-canal">' +
              '<div class="grow"><b>Notificação</b><small>aviso visual quando o versículo do dia é enviado</small></div>' +
              switchBox(cfg.canais.notificacao !== false, 'vers-notif') +
            '</div>' +
            '<div class="vers-canal">' +
              '<div class="grow"><b>WhatsApp</b><small>envio aos contatos pela integração WhatsApp Business API (ative em Integrações)</small></div>' +
              switchBox(cfg.canais.whatsapp, 'vers-wa') +
            '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">' +
              '<button class="btn btn-primary" data-action="vers-salvar-config">' + ic('save') + 'Salvar configuração</button>' +
              '<button class="btn btn-outline" data-action="vers-enviar-agora">' + ic('send') + 'Enviar agora</button>' +
            '</div>' +
          '</div>') +
        panel('Prévia atual',
          (hoje
            ? '<div class="vers-preview"><div class="ref">' + esc(hoje.ref) + ' · ' + esc(hoje.versao || cfg.versao) + '</div><div class="txt">“' + esc(hoje.texto) + '”</div></div>'
            : '<p style="color:var(--muted)">Nenhum versículo ativo no banco. Ative pelo menos um.</p>') +
          '<div class="info-box blue" style="margin-top:14px"><div>💡</div><div>O versículo é sorteado de forma aleatória e trocado a cada 3 minutos: todos os usuários veem o mesmo versículo enquanto a janela durar. O envio automático continua 1×/dia no horário configurado.</div></div>') +
      '</div>' +

      panel('Banco de versículos',
        '<div class="toolbar">' +
          '<div class="filter-input vers-banco-busca">' + ic('search') +
            '<input id="vers-q" placeholder="Buscar por referência ou texto..." value="' + esc(state.busca) + '"></div>' +
          '<div class="grow"></div>' +
          '<button class="btn btn-outline btn-sm" data-action="vers-restaurar">' + ic('refresh-cw') + 'Restaurar padrão</button>' +
          '<button class="btn btn-primary btn-sm" data-action="vers-novo">' + ic('plus') + 'Novo versículo</button>' +
        '</div>' +
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Versículo</th><th>Versão</th><th>Estado</th><th></th>' +
        '</tr></thead><tbody>' + (linhas ||
          '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:30px">Nenhum versículo encontrado</td></tr>') +
        '</tbody></table></div>',
        { flush: true }) +

      panel('Histórico de envios',
        '<div class="table-wrap"><table class="data"><thead><tr>' +
          '<th>Quando</th><th>Versículo</th><th>Origem</th><th>Canais</th>' +
        '</tr></thead><tbody>' + (linhasLog ||
          '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:26px">Nenhum envio registrado ainda — use “Enviar agora” para testar</td></tr>') +
        '</tbody></table></div>',
        { flush: true });
  };

  /* ================= AÇÕES ================= */
  Actions['vers-salvar-config'] = function () {
    const cfg = V.config();
    const inAtivo = document.querySelector('input[data-flag="vers-ativo"]');
    cfg.ativo = !!(inAtivo && inAtivo.checked);
    cfg.hora = document.getElementById('vers-hora').value || '07:00';
    cfg.canais.app = !!document.querySelector('input[data-flag="vers-app"]:checked');
    cfg.canais.notificacao = !!document.querySelector('input[data-flag="vers-notif"]:checked');
    cfg.canais.whatsapp = !!document.querySelector('input[data-flag="vers-wa"]:checked');
    V.salvarConfig(cfg);
    toast('Configuração dos versículos salva', 'ok');
    api.render();
  };

  Actions['vers-enviar-agora'] = function () {
    const reg = V.enviar('manual', true);
    if (!reg) { toast('Nenhum versículo ativo no banco', 'err'); return; }
    const canalWa = reg.canais.whatsapp;
    toast('Versículo enviado · ' + reg.ref + (canalWa === 'enviado' ? ' · WhatsApp ✓' :
      canalWa.startsWith('pendente') ? ' · WhatsApp aguardando integração' : ''), 'ok');
    api.render();
  };

  Actions['vers-novo'] = function () {
    formVersiculo(null);
  };

  Actions['vers-editar'] = function (el) {
    formVersiculo(Number(el.dataset.id));
  };

  function formVersiculo(indice) {
    const banco = V.banco();
    const v = indice != null ? banco[indice] : { ref: '', texto: '', versao: 'ACF', ativo: true };
    modal({
      title: indice != null ? 'Editar versículo' : 'Novo versículo',
      confirmLabel: indice != null ? 'Salvar' : 'Adicionar',
      body:
        '<div class="field-row">' +
          '<div class="field"><label>Referência bíblica</label><input id="v-ref" value="' + esc(v.ref) + '" placeholder="Ex: Salmos 119:105"></div>' +
          '<div class="field"><label>Versão</label><select id="v-versao">' +
            ['ACF', 'NVI', 'AA', 'ARC'].map((o) => '<option' + ((v.versao || 'ACF') === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
        '</div>' +
        '<div class="field"><label>Texto</label><textarea id="v-texto" rows="4" placeholder="Texto completo do versículo...">' + esc(v.texto) + '</textarea></div>' +
        (indice != null
          ? '<div class="field" style="flex-direction:row;align-items:center;gap:10px"><label style="margin:0">Ativo no envio automático</label><input type="checkbox" id="v-ativo"' + (v.ativo !== false ? ' checked' : '') + ' style="width:auto"></div>'
          : ''),
      onSave(root) {
        const ref = root.querySelector('#v-ref').value.trim();
        const texto = root.querySelector('#v-texto').value.trim();
        if (!ref || !texto) { toast('Informe a referência e o texto', 'err'); return false; }
        const lista = V.banco();
        const dados = {
          ref, texto,
          versao: root.querySelector('#v-versao').value,
          ativo: indice != null ? !!root.querySelector('#v-ativo').checked : true,
        };
        if (indice != null) Object.assign(lista[indice], dados);
        else lista.unshift(dados);
        if (!V.salvarBanco(lista)) { toast('Não foi possível salvar (armazenamento cheio?)', 'err'); return false; }
        toast(indice != null ? 'Versículo atualizado' : 'Versículo adicionado ao banco', 'ok');
        api.render();
      },
    });
  }

  Actions['vers-toggle'] = function (el) {
    const lista = V.banco();
    const v = lista[Number(el.dataset.id)];
    if (!v) return;
    v.ativo = v.ativo === false;
    V.salvarBanco(lista);
    toast(v.ativo ? '"' + v.ref + '" ativado no envio' : '"' + v.ref + '" pausado', 'ok');
    api.render();
  };

  Actions['vers-excluir'] = function (el) {
    const lista = V.banco();
    const v = lista[Number(el.dataset.id)];
    confirmAction('Excluir versículo', 'Remover <b>' + esc(v.ref) + '</b> do banco de versículos?', () => {
      lista.splice(Number(el.dataset.id), 1);
      V.salvarBanco(lista);
      toast('Versículo excluído', 'ok');
      api.render();
    });
  };

  Actions['vers-restaurar'] = function () {
    confirmAction('Restaurar banco', 'Substituir o banco atual pelos ' + V.bancoPadrao.length + ' versículos padrão?', () => {
      V.salvarBanco(JSON.parse(JSON.stringify(V.bancoPadrao)));
      toast('Banco de versículos restaurado', 'ok');
      api.render();
    });
  };

  Actions['vers-ver'] = function (el) {
    const idx = Number(el.dataset.id);
    const banco = V.banco();
    const v = banco[idx];
    if (!v) return;
    modal({
      title: 'Versículo — ' + esc(v.ref),
      body:
        '<div class="vers-modal">' +
        '<div class="ref-large">' + esc(v.ref) + ' · ' + esc(v.versao || cfg.versao) + '</div>' +
        '<blockquote class="txt">“' + esc(v.texto) + '”</blockquote>' +
        '</div>',
      confirmLabel: 'Fechar',
      wide: true,
    });
  };
  document.addEventListener('input', (e) => {
    if (e.target.id === 'vers-q') {
      state.busca = e.target.value;
      const scrollY = window.scrollY;
      document.getElementById('admin-content').innerHTML = VIEWS.versiculos();
      window.scrollTo(0, scrollY);
      const campo = document.getElementById('vers-q');
      if (campo) { campo.focus(); campo.setSelectionRange(campo.value.length, campo.value.length); }
    }
  });

  /* envio automático acontece: atualiza a seção se estiver aberta */
  document.addEventListener('pastorhub:versiculo', () => {
    api.toast('📖 Versículo do dia enviado · ' + (V.doDia() || {}).ref, 'ok');
    if (api.state.section === 'versiculos') api.render();
  });
})();
