/* ============================================================
   PastorHub – Versão Usuário: tela "Perfil" (pt-BR)
   Publica window.UsuarioPerfil. Os dados ficam em localStorage
   (chave pastorhub_perfil_usuario); nada é enviado a servidor.
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
  };

  const MENU = [
    { titulo: 'Devocional', desc: 'Palavra de Deus para o seu dia', icone: 'book', nav: 'sermoes' },
    { titulo: 'Pedidos de oração', desc: 'Compartilhe suas orações', icone: 'message-circle', nav: 'chat' },
    { titulo: 'Minhas comunidades', desc: 'Conecte-se com sua igreja', icone: 'users', nav: 'chat' },
    { titulo: 'Eventos', desc: 'Confira a agenda e participe', icone: 'calendar', nav: 'agenda' },
  ];

  const esc = (s) => (window.escapeHtml || String)(s == null ? '' : s);
  const ico = (nome, cls) => (window.icon ? window.icon(nome, cls || '') : '');

  // Lê o perfil salvo e completa com os valores padrão; JSON inválido não quebra a tela.
  function carregar() {
    try {
      return Object.assign({}, PADRAO, JSON.parse(localStorage.getItem(KEY) || '{}'));
    } catch (e) {
      return Object.assign({}, PADRAO);
    }
  }

  function salvar(dados) {
    localStorage.setItem(KEY, JSON.stringify(dados));
  }

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
    const d = carregar();
    return '<section class="perfil-view" aria-label="Perfil do usuário">' +
      '<header class="perfil-head">' +
        '<div class="perfil-avatar" aria-hidden="true">' + ico('user') + '</div>' +
        '<div><h2>' + esc(d.nome) + '</h2><p>' + esc(d.apelido) + '</p></div>' +
      '</header>' +
      '<nav class="perfil-menu">' + MENU.map(itemMenu).join('') + '</nav>' +
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
          '<div class="perfil-photo" aria-label="Foto do perfil">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
          '</div>' +
        '</div>' +
        '<div class="perfil-actions">' +
          '<button class="perfil-btn primary" type="button" data-action="perfil-editar">' + ico('user') + ' Editar perfil</button>' +
          '<button class="perfil-btn outline" type="button" data-action="perfil-compartilhar">' + ico('share') + ' Compartilhar</button>' +
        '</div>' +
      '</article>' +
    '</section>';
  }

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

  // Valida o formulário aberto na sheet e salva; retorna { ok } ou { erro }.
  function salvarFormulario() {
    const valor = (nome) => {
      const campo = document.querySelector('#perfil-form [name="' + nome + '"]');
      return campo ? campo.value.trim() : '';
    };
    const dados = { nome: valor('nome'), apelido: valor('apelido'), email: valor('email'), cidade: valor('cidade') };
    if (!dados.nome || dados.email.indexOf('@') === -1) {
      return { erro: 'Informe um nome e um e-mail válido.' };
    }
    salvar(Object.assign(carregar(), dados));
    return { ok: true };
  }

  // Usa a folha de compartilhamento do sistema; sem suporte, copia o resumo.
  async function compartilhar() {
    const d = carregar();
    const texto = d.nome + ' · ' + d.apelido;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meu perfil – PastorHub', text: texto });
        return 'Perfil compartilhado.';
      } catch (e) {
        return '';
      }
    }
    try {
      await navigator.clipboard.writeText(texto);
      return 'Resumo do perfil copiado.';
    } catch (e) {
      return 'Não foi possível compartilhar neste navegador.';
    }
  }

  window.UsuarioPerfil = { render, abrirEdicao, salvarFormulario, compartilhar };
})();
