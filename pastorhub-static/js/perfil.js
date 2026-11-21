/* ============================================================
   Usuário logado — perfil, foto, dados e preferências
   ============================================================ */
(function () {
  const Actions = (window.Actions = window.Actions || {});
  const KEY = 'pastorhub_user';

  const PADRAO = {
    nome: 'Pastor Silva',
    email: 'Modo Offline',
    igreja: 'Igreja Batista Central',
    telefone: '(86) 98903-8050',
    cargo: 'Pastor，顺便 titular',
    avatar: '',
    criadoEm: null,
  };

  function carregar() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      return s ? Object.assign({}, PADRAO, s) : Object.assign({}, PADRAO, { criadoEm: new Date().toISOString() });
    } catch (e) {
      return Object.assign({}, PADRAO, { criadoEm: new Date().toISOString() });
    }
  }

  function salvar(u) {
    try { localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) {}
  }

  const dados = carregar();

  const Usuario = {
    dados,
    salvar() {
      salvar(dados);
      if (Usuario.onChange) Usuario.onChange();
    },
    iniciais() {
      return String(dados.nome || 'P').split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    },
    onChange: null,
  };

  window.Usuario = Usuario;

  /* ---------- Avatar (foto ou iniciais) ---------- */
  window.avatarDe = function (nome, classe, extra) {
    const cls = 'avatar ' + (classe || 'avatar-48') + (extra ? ' ' + extra : '');
    if (Usuario.dados.avatar) {
      return '<span class="' + cls + ' avatar-img"><img src="' + Usuario.dados.avatar + '" alt="Foto de ' + escapeHtml(nome || Usuario.dados.nome) + '"></span>';
    }
    const ini = Usuario.dados.nome && nome === Usuario.dados.nome
      ? Usuario.iniciais()
      : String(nome || 'P').split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    return '<span class="' + cls + '">' + escapeHtml(ini) + '</span>';
  };

  /* ---------- Modal: editar perfil ---------- */
  Actions['editar-perfil'] = function () {
    const d = Usuario.dados;
    openSheet({
      title: 'Editar Perfil',
      desc: 'Dados exibidos no app e nos relatórios',
      icon: 'user',
      body:
        '<div class="perfil-top">' + avatarDe(d.nome, 'avatar-80 avatar-ring') +
          '<div><strong>' + escapeHtml(d.nome) + '</strong><span>' + escapeHtml(d.email) + '</span>' +
          '<button class="btn outline sm" data-action="foto-perfil" type="button" style="margin-top:.6rem">' + icon('camera' in window ? 'camera' : 'user', 'icon-sm') + 'Trocar foto</button></div>' +
        '</div>' +
        '<div class="field"><label>Nome completo</label><input id="pf-nome" value="' + escapeHtml(d.nome) + '"></div>' +
        '<div class="field"><label>E-mail</label><input id="pf-email" type="email" value="' + escapeHtml(d.email) + '"></div>' +
        '<div class="field"><label>Igreja</label><input id="pf-igreja" value="' + escapeHtml(d.igreja) + '"></div>' +
        '<div class="field"><label>Telefone / WhatsApp</label><input id="pf-tel" value="' + escapeHtml(d.telefone) + '"></div>' +
        '<div class="field"><label>Cargo na igreja</label><input id="pf-cargo" value="' + escapeHtml(d.cargo) + '"></div>',
      footer:
        '<button class="btn outline" data-action="close-sheet" type="button">Cancelar</button>' +
        '<button class="btn primary" data-action="salvar-perfil" type="button">' + icon('save', 'icon-sm') + 'Salvar</button>',
    });
  };

  Actions['salvar-perfil'] = function () {
    const nome = document.getElementById('pf-nome').value.trim();
    const email = document.getElementById('pf-email').value.trim();
    if (!nome || !email) { toast('Preencha nome e e-mail', 'error'); return; }
    Usuario.dados.nome = nome;
    Usuario.dados.email = email;
    Usuario.dados.igreja = document.getElementById('pf-igreja').value.trim();
    Usuario.dados.telefone = document.getElementById('pf-tel').value.trim();
    Usuario.dados.cargo = document.getElementById('pf-cargo').value.trim();
    Usuario.salvar();
    closeSheet();
    toast('Perfil atualizado!', 'success');
  };

  /* ---------- Modal: alterar senha ---------- */
  Actions['alterar-senha'] = function () {
    openSheet({
      title: 'Alterar Senha',
      desc: 'Recomendamos no mínimo 8 caracteres',
      icon: 'shield',
      body:
        '<div class="field"><label>Senha atual</label><input id="pw-atual" type="password" placeholder="••••••••"></div>' +
        '<div class="field"><label>Nova senha</label><input id="pw-nova" type="password" placeholder="Mínimo 8 caracteres"></div>' +
        '<div class="field"><label>Confirmar nova senha</label><input id="pw-conf" type="password" placeholder="Repita a nova senha"></div>' +
        '<div class="info-box lime"><div>🔒</div><div>A senha é armazenada de forma criptografada no dispositivo e nunca é enviada para terceiros.</div></div>',
      footer:
        '<button class="btn outline" data-action="close-sheet" type="button">Cancelar</button>' +
        '<button class="btn primary" data-action="salvar-senha" type="button">' + icon('check', 'icon-sm') + 'Alterar senha</button>',
    });
  };

  Actions['salvar-senha'] = function () {
    const nova = document.getElementById('pw-nova').value;
    const conf = document.getElementById('pw-conf').value;
    if (nova.length < 8) { toast('A nova senha precisa ter ao menos 8 caracteres', 'error'); return; }
    if (nova !== conf) { toast('As senhas não conferem', 'error'); return; }
    Usuario.dados.senha = nova;
    Usuario.salvar();
    closeSheet();
    toast('Senha alterada com sucesso!', 'success');
  };

  /* ---------- Modal: foto de perfil ---------- */
  Actions['foto-perfil'] = function () {
    openSheet({
      title: 'Foto de Perfil',
      desc: 'Escolha uma imagem do dispositivo',
      icon: 'user',
      body:
        '<div class="perfil-top" style="justify-content:center">' + avatarDe(Usuario.dados.nome, 'avatar-80 avatar-ring') +
          '<div style="text-align:center"><strong>Pré-visualização</strong><span>A imagem é salva apenas neste dispositivo.</span></div>' +
        '</div>' +
        '<div class="field"><label>Selecionar imagem</label><input id="pf-foto" type="file" accept="image/*"></div>' +
        '<div class="info-box blue"><div>🖼️</div><div>Formatos aceitos: JPG, PNG ou WEBP. A imagem é redimensionada e convertida para o armazenamento local do app.</div></div>',
      footer:
        '<button class="btn outline danger-outline" data-action="remover-foto" type="button">Remover foto</button>' +
        '<button class="btn primary" data-action="salvar-foto" type="button">' + icon('check', 'icon-sm') + 'Salvar foto</button>',
    });

    const input = document.getElementById('pf-foto');
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      lerImagemRedimensionada(file).then((url) => {
        Usuario.dados.avatar = url;
        Usuario.salvar();
        const box = document.querySelector('#sheet-body .perfil-top');
        if (box) box.innerHTML = avatarDe(Usuario.dados.nome, 'avatar-80 avatar-ring') +
          '<div style="text-align:center"><strong>Pré-visualização</strong><span>Foto salva neste dispositivo.</span></div>';
        toast('Foto de perfil atualizada!', 'success');
      }).catch((err) => toast(err.message || 'Erro ao carregar a foto', 'error'));
    });
  };

  Actions['salvar-foto'] = function () {
    closeSheet();
    toast(Usuario.dados.avatar ? 'Foto de perfil atualizada!' : 'Nenhuma foto selecionada', Usuario.dados.avatar ? 'success' : 'error');
  };

  Actions['remover-foto'] = function () {
    Usuario.dados.avatar = '';
    Usuario.salvar();
    closeSheet();
    toast('Foto removida — voltando às iniciais', 'success');
  };

  /* ---------- Preferência de tema (modo escuro) ---------- */
  const TEMA_KEY = 'pastorhub_tema';

  window.Tema = {
    atual() {
      return localStorage.getItem(TEMA_KEY) || 'claro';
    },
    aplicar(tema) {
      document.body.classList.toggle('theme-dark', tema === 'escuro');
      document.documentElement.style.colorScheme = tema === 'escuro' ? 'dark' : 'light';
    },
    definir(tema) {
      localStorage.setItem(TEMA_KEY, tema);
      this.aplicar(tema);
      if (this.onChange) this.onChange();
    },
    alternar() {
      this.definir(this.atual() === 'escuro' ? 'claro' : 'escuro');
    },
    onChange: null,
  };

  // aplica o tema salvo antes da primeira renderização
  Tema.aplicar(Tema.atual());
})();
