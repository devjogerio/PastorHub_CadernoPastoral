/* ============================================================
   PastorHub – Versão Usuário: nova página principal (home)
   Layout de referência (creme + verde-sálvia): busca, banner do
   dia, versículo, cartões, evento, mensagem de fé, ações rápidas
   e navegação inferior. Publica window.UsuarioHome.
   ============================================================ */
(function () {
  'use strict';

  const esc = (s) => (window.escapeHtml || String)(s == null ? '' : s);
  const ico = (nome, cls) => (window.icon ? window.icon(nome, cls || '') : '');

  // Cartões "Comunidade · Bíblia · Adoração" (ordem da referência)
  const CARTOES = [
    { icone: 'users', titulo: 'Comunidade', sub: 'Conecte-se', ir: 'chat' },
    { icone: 'book-open', titulo: 'Bíblia', sub: 'Leia e cresça', ir: 'biblioteca' },
    { icone: 'music', titulo: 'Adoração', sub: 'Ouça e cante', ir: 'sermoes' },
  ];

  // Ações rápidas: Oração · Eventos · Devocionais
  const ACOES = [
    { icone: 'message-circle', titulo: 'Oração', sub: 'Pedidos e motivos', ir: 'chat' },
    { icone: 'calendar', titulo: 'Eventos', sub: 'Confira a agenda', ir: 'agenda' },
    { icone: 'book', titulo: 'Devocionais', sub: 'Para o seu dia', ir: 'sermoes' },
  ];

  // Navegação inferior (item ativo acompanha a view atual)
  const NAV = [
    { id: 'home', rotulo: 'Início', icone: 'home' },
    { id: 'biblioteca', rotulo: 'Bíblia', icone: 'book-open' },
    { id: 'chat', rotulo: 'Comunidade', icone: 'users' },
    { id: 'agenda', rotulo: 'Eventos', icone: 'calendar' },
    { id: 'perfil', rotulo: 'Perfil', icone: 'user' },
  ];
  const MAPA_NAV = { home: 'home', biblioteca: 'biblioteca', livro: 'biblioteca', chat: 'chat', agenda: 'agenda', perfil: 'perfil' };

  const VERSICULO = { texto: '“O Senhor é a minha luz e a minha salvação.”', ref: 'Salmos 27:1' };

  // Cada bloco entra com um atraso crescente (animação de carregamento)
  let seq = 0;
  const anim = () => ' style="--hm-d:' + (seq++ * 70) + 'ms"';

  function render() {
    seq = 0;
    return '<div class="home-view">' +
      '<label class="home-busca"' + anim() + '>' +
        ico('search') +
        '<input id="home-search" type="search" placeholder="Busque uma passagem, plano ou evento…" aria-label="Buscar no app">' +
      '</label>' +

      '<button class="home-banner" type="button" data-action="home-oracao"' + anim() + '>' +
        '<span class="home-banner-ico">' + ico('sun') + '</span>' +
        '<span class="home-banner-txt"><b>Hoje é um ótimo dia para orar!</b>' +
          '<small>Ore por sua família, amigos e comunidade</small></span>' +
        ico('chevron-right') +
      '</button>' +

      '<blockquote class="home-versiculo" data-action="home-versiculo" data-hsearch="versículo ' + esc(VERSICULO.ref) + ' ' + esc(VERSICULO.texto) + '"' + anim() + '>' +
        '<span class="home-versiculo-aspa" aria-hidden="true">❝</span>' +
        '<p>' + esc(VERSICULO.texto) + '</p>' +
        '<cite>' + esc(VERSICULO.ref) + '</cite>' +
        '<span class="home-versiculo-dica">' + ico('share') + '</span>' +
      '</blockquote>' +

      '<div class="home-cartoes"' + anim() + '>' +
        CARTOES.map((c) =>
          '<button class="home-cartao" type="button" data-home-ir="' + c.ir + '" data-hsearch="' + esc(c.titulo + ' ' + c.sub) + '">' +
            '<span class="home-cartao-ico">' + ico(c.icone) + '</span>' +
            '<span class="home-cartao-txt"><b>' + esc(c.titulo) + '</b><small>' + esc(c.sub) + '</small></span>' +
          '</button>').join('') +
      '</div>' +

      '<div class="home-secao"' + anim() + '>' +
        '<h2>Participe do nosso próximo encontro</h2>' +
        '<button type="button" data-home-ir="agenda" aria-label="Ver todos os eventos">' + ico('chevron-right') + '</button>' +
      '</div>' +

      '<article class="home-evento" data-home-ir="agenda" data-hsearch="estudo bíblico sábado 19 de abril 19h pr. lucas ferreira encontro"' + anim() + '>' +
        '<div class="home-evento-info">' +
          '<h3>Estudo bíblico</h3>' +
          '<div class="home-evento-meta">' +
            '<span>' + ico('calendar', 'icon-sm') + 'Sábado, 19 de abril</span>' +
            '<span>' + ico('clock', 'icon-sm') + '19h</span>' +
          '</div>' +
          '<p class="home-evento-host"><span class="home-evento-avatar">PL</span>Pr. Lucas Ferreira</p>' +
        '</div>' +
        '<span class="home-evento-acao" aria-hidden="true">' + ico('chevron-right') + '</span>' +
      '</article>' +

      '<div class="home-secao"' + anim() + '>' +
        '<h2><span class="home-secao-ico">' + ico('message-circle') + '</span>Mensagem de fé</h2>' +
      '</div>' +

      '<article class="home-mensagem" data-home-ir="sermoes" data-hsearch="mensagem de fé líder da comunidade oração esta noite"' + anim() + '>' +
        '<span class="home-msg-avatar">LC</span>' +
        '<div class="home-msg-txt">' +
          '<b>Líder da Comunidade</b>' +
          '<p>Momento de oração esta noite</p>' +
        '</div>' +
        ico('chevron-right') +
      '</article>' +

      '<div class="home-acoes"' + anim() + '>' +
        ACOES.map((a) =>
          '<button class="home-acao" type="button" data-home-ir="' + a.ir + '" data-hsearch="' + esc(a.titulo + ' ' + a.sub) + '">' +
            '<span class="home-acao-ico">' + ico(a.icone) + '</span>' +
            '<span class="home-acao-txt"><b>' + esc(a.titulo) + '</b><small>' + esc(a.sub) + '</small></span>' +
          '</button>').join('') +
      '</div>' +

      '<p class="home-vazio" hidden>Nenhuma seção encontrada. Tente outro termo.</p>' +
    '</div>';
  }

  // Navegação inferior: montada uma única vez no #app (persiste entre views)
  function montarNav(viewId) {
    const app = document.querySelector('#app');
    if (!app || document.querySelector('#home-nav')) { atualizarNav(viewId); return; }
    const nav = document.createElement('nav');
    nav.className = 'home-nav';
    nav.id = 'home-nav';
    nav.setAttribute('aria-label', 'Navegação principal');
    nav.innerHTML = NAV.map((n) =>
      '<button type="button" data-hnav="' + n.id + '" aria-label="' + esc(n.rotulo) + '">' +
        ico(n.icone) + '<span>' + esc(n.rotulo) + '</span>' +
      '</button>').join('');
    app.appendChild(nav);
    atualizarNav(viewId);
  }

  // Marca o item ativo conforme a view corrente (chamado após cada renderView)
  function atualizarNav(viewId) {
    const ativo = MAPA_NAV[viewId] || '';
    document.querySelectorAll('#home-nav [data-hnav]').forEach((b) => {
      const on = b.dataset.hnav === ativo;
      b.classList.toggle('ativo', on);
      b.setAttribute('aria-current', on ? 'page' : 'false');
    });
  }

  // Filtro ao vivo da busca: esconde os blocos que não casam com o termo
  function filtrar(termo) {
    const t = String(termo || '').trim().toLowerCase();
    const blocos = document.querySelectorAll('.home-view [data-hsearch]');
    let visiveis = 0;
    blocos.forEach((el) => {
      const casa = !t || (el.dataset.hsearch || '').toLowerCase().indexOf(t) !== -1;
      el.hidden = !casa;
      if (casa) visiveis++;
    });
    // Seções sem resultado também saem (cabeçalhos órfãos)
    document.querySelectorAll('.home-view .home-secao').forEach((s) => {
      const alvo = s.nextElementSibling;
      s.hidden = !!t && (!alvo || alvo.hidden);
    });
    const vazio = document.querySelector('.home-vazio');
    if (vazio) vazio.hidden = !(t && visiveis === 0);
  }

  // Banner: folha de oração do dia
  function abrirOracao() {
    window.openSheet({
      title: 'Oração do dia',
      desc: 'Um momento breve para começar o dia com Deus.',
      icon: 'sun',
      body: '<div class="home-oracao"><p>“Senhor, guarda a minha família, os meus amigos e a nossa comunidade' +
        ' no Teu cuidado. Que a Tua luz guie as escolhas deste dia e a Tua paz encontre lugar em cada coração.”</p>' +
        '<cite>Em nome de Jesus, amém.</cite></div>',
      footer: '<button class="btn outline" data-action="close-sheet" type="button">Fechar</button>' +
        '<button class="btn primary" data-action="home-amen" type="button">Amém</button>',
    });
  }

  // Versículo: compartilha (ou copia, sem suporte nativo)
  async function compartilharVersiculo() {
    const texto = VERSICULO.texto + ' — ' + VERSICULO.ref;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Versículo do dia', text: texto });
        return 'Versículo compartilhado.';
      } catch (e) { return ''; } // usuário cancelou a folha nativa
    }
    try {
      await navigator.clipboard.writeText(texto);
      return 'Versículo copiado para compartilhar.';
    } catch (e) {
      return 'Não foi possível copiar neste navegador.';
    }
  }

  window.UsuarioHome = { render, montarNav, atualizarNav, filtrar, abrirOracao, compartilharVersiculo };
})();
