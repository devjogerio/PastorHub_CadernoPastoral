/* ============================================================
   Perfil do app do usuário — implementação moderna.
   Novo conteúdo renderiza dentro de #view (referência do usuário).
   Funcionalidade de foto: exibição (avatar), seleção (galeria ou
   câmera), visualização ampliada (zoom) e remoção — com estados de
   carregamento, validação de formato/tamanho e animações integradas.
   Dados persistem no localStorage (chave pastorhub_perfil_usuario).
   ============================================================ */
(function () {
  'use strict';

  const KEY = 'pastorhub_perfil_usuario';
  const PADRAO = {
    nome: 'Ana Silva',
    apelido: 'Serva de Cristo',
    email: 'ana.silva@email.com',
    cidade: 'São Paulo - SP',
    membroDesde: '2021',
    fotoUrl: null,
  };

  const MENU = [
    { titulo: 'Devocional', desc: 'Palavra de Deus para o seu dia', icone: 'book', nav: 'sermoes' },
    { titulo: 'Pedidos de oração', desc: 'Compartilhe suas orações', icone: 'message-circle', nav: 'chat' },
    { titulo: 'Minhas comunidades', desc: 'Conecte-se com sua igreja', icone: 'users', nav: 'chat' },
    { titulo: 'Eventos', desc: 'Confira a agenda e participe', icone: 'calendar', nav: 'agenda' },
  ];

  const FORMATOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_BYTES = 4 * 1024 * 1024;
  const AVISO_BYTES = 3.5 * 1024 * 1024;

  const esc = (v) =>
    window.escapeHtml ? window.escapeHtml(String(v == null ? '' : v)) : String(v == null ? '' : v);
  const ico = (n, c) => (window.icon ? window.icon(n, c || '') : '');
  const el = (sel) => document.querySelector(sel);
  const toast = (m, t) => window.toast && window.toast(m, t);

  const carregar = () => {
    try {
      return Object.assign({}, PADRAO, JSON.parse(localStorage.getItem(KEY) || '{}'));
    } catch (e) {
      return Object.assign({}, PADRAO);
    }
  };
  const salvar = (d) => localStorage.setItem(KEY, JSON.stringify(d));
  const iniciais = (nome) =>
    String(nome || carregar().nome || 'AS').trim().split(/\s+/).map((p) => p[0] || '').join('').toUpperCase().slice(0, 2) || 'AS';

  /* ---------------- Estado da foto ---------------- */
  const estadoFoto = { arquivo: null, preview: null, erro: '' };

  function validarFoto(arquivo) {
    if (!arquivo) return null;
    if (FORMATOS.indexOf(arquivo.type) === -1) return 'Formato não suportado. Envie JPEG, PNG ou WebP.';
    if (arquivo.size > MAX_BYTES) return 'A imagem é muito grande. Tente até 4 MB.';
    if (arquivo.size > AVISO_BYTES) return 'Tamanho de ' + (arquivo.size / 1048576).toFixed(1) + ' MB — recomendado até 3,5 MB.';
    return null;
  }

  function lerArquivo(arquivo) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej(new Error('Não foi possível ler a imagem.'));
      r.readAsDataURL(arquivo);
    });
  }

  function atualizarAvatar() {
    const url = estadoFoto.preview || carregar().fotoUrl || '';
    const btn = el('#perfil-foto-btn');
    if (btn) btn.setAttribute('aria-label', url ? 'Anexar nova foto do perfil' : 'Alterar foto do perfil');
    const zoom = el('#perfil-foto-zoom');
    if (zoom) zoom.hidden = !url;
    const remover = el('#perfil-foto-remover');
    if (remover) remover.disabled = !url;
    const loading = el('#perfil-avatar-loading');
    const av = el('#perfil-avatar');
    if (!av) return;
    if (url && av.tagName === 'SPAN') {
      const img = document.createElement('img');
      img.id = 'perfil-avatar';
      img.className = 'perfil-avatar';
      img.alt = 'Foto do perfil';
      img.src = url;
      av.replaceWith(img);
    } else if (av.tagName === 'IMG' && url) {
      av.src = url;
    } else if (av.tagName === 'IMG' && !url) {
      const span = document.createElement('span');
      span.id = 'perfil-avatar';
      span.className = 'perfil-avatar perfil-avatar-texto';
      span.textContent = iniciais(carregar().nome);
      av.replaceWith(span);
    }
    if (loading) loading.hidden = true;
  }

  function setStatus(texto) {
    const status = el('#perfil-foto-status');
    if (status) status.textContent = texto || '';
  }

  function escolherFoto(arquivo) {
    const erro = validarFoto(arquivo);
    if (erro) {
      estadoFoto.erro = erro;
      setStatus(erro);
      toast(erro, 'error');
      return;
    }
    estadoFoto.erro = '';
    setStatus('Carregando foto…');
    el('#perfil-foto-loader').hidden = false;
    const loading = el('#perfil-avatar-loading');
    if (loading) loading.hidden = false;
    const confirmar = el('#perfil-foto-confirmar');
    if (confirmar) confirmar.disabled = true;
    lerArquivo(arquivo).then((url) => {
      estadoFoto.arquivo = arquivo;
      estadoFoto.preview = url;
      estadoFoto.erro = '';
      atualizarAvatar();
      el('#perfil-foto-loader').hidden = true;
      if (confirmar) confirmar.disabled = false;
      setStatus('Foto carregada — revise e confirme o upload.');
    }).catch((e) => {
      estadoFoto.arquivo = null;
      estadoFoto.preview = null;
      estadoFoto.erro = e.message;
      el('#perfil-foto-loader').hidden = true;
      if (loading) loading.hidden = true;
      setStatus(e.message);
      toast(e.message, 'error');
    });
  }

  function abrirGaleria() { el('#perfil-foto-input')?.click(); }
  function abrirCamera() { el('#perfil-foto-cam')?.click(); }
  function abrirZoom() {
    const zoom = el('#perfil-zoom');
    if (!zoom) return;
    const url = estadoFoto.preview || carregar().fotoUrl || '';
    const photo = el('#perfil-zoom-foto');
    if (photo) photo.src = url;
    zoom.hidden = false;
  }
  function fecharZoom() { if (el('#perfil-zoom')) el('#perfil-zoom').hidden = true; }
  function confirmarFoto() {
    const url = estadoFoto.preview || carregar().fotoUrl || '';
    if (!url) return;
    const btn = el('#perfil-foto-confirmar');
    if (btn) btn.disabled = true;
    setTimeout(() => {
      const d = carregar();
      d.fotoUrl = url;
      salvar(d);
      estadoFoto.arquivo = null;
      estadoFoto.preview = null;
      estadoFoto.erro = '';
      atualizarAvatar();
      setStatus('Foto atualizada!');
      toast('Foto atualizada!');
    }, 250);
  }
  function removerFoto() {
    const d = carregar();
    if (!d.fotoUrl && !estadoFoto.preview) {
      toast('Nenhuma foto para remover.');
      return;
    }
    if (d.fotoUrl) {
      d.fotoUrl = null;
      salvar(d);
      estadoFoto.preview = null;
      atualizarAvatar();
      setStatus('Foto removida.');
      toast('Foto removida.');
    } else {
      estadoFoto.preview = null;
      atualizarAvatar();
    }
  }

  /* ---------------- Renderização moderna ---------------- */
  function itemMenu(m) {
    return '<button class="perfil-menu-item" type="button" data-nav-id="' + m.nav + '">' +
      '<span class="perfil-ico">' + ico(m.icone) + '</span>' +
      '<span><b>' + esc(m.titulo) + '</b><small>' + esc(m.desc) + '</small></span>' +
      '<span class="perfil-chev">' + ico('chevron-right', 'icon-sm') + '</span>' +
    '</button>';
  }

  function campo(icone, texto) {
    return '<div class="perfil-field">' + ico(icone, 'icon-sm') + '<span>' + esc(texto) + '</span></div>';
  }

  function render() {
    estadoFoto.arquivo = null;
    estadoFoto.preview = null;
    estadoFoto.erro = '';
    const d = carregar();
    const urlAvatar = d.fotoUrl || '';

    return '<section class="perfil-view" aria-label="Perfil do usuário">' +
      /* ----- Foto do perfil: exibição, seleção, zoom, remoção ----- */
      '<div class="perfil-foto-area">' +
        '<div class="perfil-foto-card">' +
          '<button type="button" class="perfil-foto-btn" id="perfil-foto-btn" data-action="perfil-foto-alterar" aria-label="Alterar foto do perfil">' +
            (urlAvatar
              ? '<img class="perfil-avatar" id="perfil-avatar" src="' + esc(urlAvatar) + '" alt="Foto do perfil">'
              : '<span class="perfil-avatar perfil-avatar-texto" id="perfil-avatar">' + esc(iniciais(d.nome)) + '</span>') +
            '<span class="perfil-avatar-overlay" aria-hidden="true">' + ico('edit') + '</span>' +
            '<span id="perfil-avatar-loading" class="perfil-avatar-loading" hidden>' + ico('loader') + '</span>' +
          '</button>' +
          '<button type="button" id="perfil-foto-zoom" class="perfil-foto-zoom" data-action="perfil-foto-zoom" aria-label="Visualizar foto em tamanho ampliado" ' + (!urlAvatar ? 'hidden' : '') + '>' + ico('zoom-in') + '</button>' +
        '</div>' +
        '<p class="perfil-foto-status" id="perfil-foto-status" role="status"></p>' +
        '<p class="perfil-foto-loader" id="perfil-foto-loader" hidden><span class="spinner spinner-lime"></span>Carregando a foto…</p>' +
        '<button type="button" id="perfil-foto-confirmar" class="perfil-btn primary perfil-btn-block" data-action="perfil-foto-confirmar" disabled>' +
          '<span id="perfil-foto-loader-text" hidden></span>Confirmar alteração' +
        '</button>' +
        '<div class="perfil-foto-actions">' +
          '<button type="button" class="perfil-btn outline perfil-btn-block" data-action="perfil-foto-galeria">' + ico('image') + 'Escolher da galeria</button>' +
          '<button type="button" class="perfil-btn outline perfil-btn-block" data-action="perfil-foto-camera">' + ico('camera') + 'Tirar foto</button>' +
        '</div>' +
        '<button type="button" id="perfil-foto-remover" class="perfil-btn danger perfil-btn-block" data-action="perfil-foto-remover" ' + (d.fotoUrl ? '' : 'disabled') + '>' + ico('trash-2') + 'Remover foto</button>' +
      '</div>' +
      /* ----- Ampliação da foto ----- */
      '<div class="perfil-zoom" id="perfil-zoom" hidden>' +
        '<div class="perfil-zoom-backdrop" data-action="perfil-foto-fechar"></div>' +
        '<div class="perfil-zoom-panel">' +
          '<button type="button" class="btn-icon" data-action="perfil-foto-fechar" aria-label="Fechar zoom">' + ico('x') + '</button>' +
          '<img class="perfil-zoom-foto" id="perfil-zoom-foto" alt="Foto ampliada do perfil">' +
          '<button type="button" class="perfil-btn primary perfil-btn-block" data-action="perfil-foto-confirmar" disabled>Confirmar alteração</button>' +
        '</div>' +
      '</div>' +
      /* ----- menu (padrão anterior, mantido) ----- */
      '<nav class="perfil-menu">' + MENU.map(itemMenu).join('') + '</nav>' +
      /* ----- card de informações (padrão anterior, mantido) ----- */
      '<article class="perfil-card">' +
        '<div class="perfil-card-head">' +
          '<div><h3>Meu perfil</h3><p>Veja e edite suas informações.</p></div>' +
          '<button class="perfil-edit-ico" type="button" data-action="perfil-editar" aria-label="Editar informações">' + ico('edit') + '</button>' +
        '</div>' +
        '<div class="perfil-card-body">' +
          '<div class="perfil-fields">' +
            campo('user', d.nome) +
            campo('mail', d.email) +
            campo('map-pin', d.cidade) +
            campo('calendar', 'Membro desde ' + d.membroDesde) +
          '</div>' +
        '</div>' +
        '<div class="perfil-actions">' +
          '<button class="perfil-btn primary" type="button" data-action="perfil-editar">' + ico('user') + ' Editar perfil</button>' +
          '<button class="perfil-btn outline" type="button" data-action="perfil-compartilhar">' + ico('share') + ' Compartilhar</button>' +
        '</div>' +
      '</article>' +
      /* ----- inputs ocultos de seleção de foto ----- */
      '<input id="perfil-foto-input" type="file" accept="image/jpeg, image/png, image/webp, image/gif" class="perfil-foto-input">' +
      '<input id="perfil-foto-cam" type="file" accept="image/*" capture="environment" class="perfil-foto-input">' +
    '</section>';
  }

  /* Ativa listeners de mudança dos inputs após renderizar no #view. */
  function ativarEventos(viewEl) {
    const inputs = [
      ['perfil-foto-input', 'galeria'],
      ['perfil-foto-cam', 'camera'],
    ];
    for (const [id, ] of inputs) {
      const elIn = viewEl ? viewEl.querySelector('#' + id) : document.querySelector('#' + id);
      if (!elIn) continue;
      elIn.addEventListener('change', () => {
        const arquivo = elIn.files && elIn.files[0];
        elIn.value = '';
        if (arquivo) escolherFoto(arquivo);
      });
    }
  }

  /* ---------------- Edição e compartilhamento (mantidos) ---------------- */
  function campoForm(nome, rotulo, valor, tipo) {
    return '<div class="field"><label for="perfil-' + nome + '">' + esc(rotulo) + '</label>' +
      '<input id="perfil-' + nome + '" name="' + nome + '" type="' + (tipo || 'text') + '" value="' + esc(valor) + '"></div>';
  }

  function abrirEdicao() {
    const d = carregar();
    const corpo = '<form id="perfil-form" class="perfil-form" autocomplete="off">' +
      campoForm('nome', 'Nome', d.nome) +
      campoForm('apelido', 'Apelido ou frase', d.apelido) +
      campoForm('email', 'E-mail', d.email, 'email') +
      campoForm('cidade', 'Cidade', d.cidade) +
    '</form>';
    const rodape = '<button class="btn outline" data-action="close-sheet" type="button">Cancelar</button>' +
      '<button class="btn primary" data-action="perfil-salvar" type="button">Salvar</button>';
    window.openSheet({
      title: 'Editar perfil',
      desc: 'Atualize as informações exibidas no seu perfil.',
      body: corpo,
      footer: rodape,
      icon: 'edit',
    });
  }

  function salvarFormulario() {
    const valor = (nome) => {
      const campo = document.querySelector('#perfil-form [name="' + nome + '"]');
      return campo ? campo.value.trim() : '';
    };
    const dados = { nome: valor('nome'), apelido: valor('apelido'), email: valor('email'), cidade: valor('cidade') };
    if (!dados.nome || dados.email.indexOf('@') === -1) {
      return { erro: 'Informe um nome e um e-mail válido.' };
    }
    const d = carregar();
    salvar(Object.assign({}, d, dados, { fotoUrl: d.fotoUrl }));
    return { ok: true };
  }

  async function compartilhar() {
    const d = carregar();
    const texto = d.nome + ' · ' + d.apelido;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meu perfil – PastorHub', text: texto });
        return 'Perfil compartilhado.';
      } catch (e) { return ''; }
    }
    try {
      await navigator.clipboard.writeText(texto);
      return 'Resumo do perfil copiado.';
    } catch (e) {
      return 'Não foi possível compartilhar neste navegador.';
    }
  }

  window.UsuarioPerfil = {
    render, ativarEventos,
    abrirEdicao, salvarFormulario, compartilhar, carregar, iniciais,
    abrirGaleria, abrirCamera, abrirZoom, fecharZoom,
    confirmarFoto, removerFoto, escolherFoto,
  };
})();
