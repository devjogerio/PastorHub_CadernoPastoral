/* Busca global do painel administrativo. Pesquisa conteúdos cadastrados,
   funcionalidades (módulos do menu) e ações executáveis. Só pesquisa com
   pelo menos 3 caracteres, com debounce, filtros, teclado e estados.
   Depende de window.AdminAPI (admin.js) e de window.AdminBuscaCore (admin-busca-core.js). */
(function () {
  'use strict';

  var A = window.AdminAPI;
  var Core = window.AdminBuscaCore;
  var input = document.getElementById('global-search');
  var pop = document.getElementById('search-pop');
  if (!A || !Core || !input || !pop) return;

  var DEBOUNCE_MS = 250;
  var PLANOS_KEY = 'pastorhub_admin_planos';

  /* Palavras extras para encontrar funcionalidades por sinônimos. */
  var PALAVRAS_FUNCIONALIDADE = {
    overview: 'dashboard resumo indicadores kpi visao geral',
    investimento: 'financeiro receita unit economics previsao tranche investidor',
    usuarios: 'contas cadastro perfil pastor membro',
    planos: 'assinatura preco faturamento pagamento pix',
    conteudo: 'sermao sermoes texto publicar',
    meetai: 'conselho aconselhamento ia sentimento meet',
    whatsapp: 'mensagem lembrete notificacao modelo',
    agenda: 'atendimento calendario compromisso evento',
    recursos: 'palestra video categoria recurso',
    biblioteca: 'acervo livro compra aluguel',
    notificacoes: 'alerta push aviso',
    integracoes: 'api chave conectar servico',
    rag: 'base conhecimento documento ocr agente',
    versiculos: 'biblia verso diario',
    configuracoes: 'preferencias ajustes config',
  };

  var busca = { termo: '', tipo: 'todos', grupo: 'todos', status: 'todos', carregando: false, erro: false };
  var lista = [];
  var ativo = -1;
  var timer = null;

  function item(tipo, grupo, titulo, sub, status, campos, icone, executar) {
    var valores = campos.filter(function (v) { return v != null && v !== ''; }).map(String);
    return {
      tipo: tipo,
      grupo: grupo,
      titulo: String(titulo || ''),
      sub: sub || '',
      status: status || '',
      icone: icone,
      campos: valores,
      texto: Core.normalizar(valores.join(' ')),
      executar: executar,
    };
  }

  function abrir(secao, extra) {
    return function () {
      A.state.section = secao;
      Object.assign(A.state, extra || {});
      A.render();
    };
  }

  /* Abre a seção e aciona o botão da própria tela (ex.: "Novo usuário").
     render() é síncrono, então o botão já existe quando é clicado. */
  function abrirEAcionar(secao, seletor) {
    return function () {
      abrir(secao)();
      var botao = document.querySelector(seletor);
      if (botao) botao.click();
    };
  }

  function clicar(seletor) {
    return function () {
      var botao = document.querySelector(seletor);
      if (botao) botao.click();
    };
  }

  function lerLista(chave) {
    try {
      var v = JSON.parse(localStorage.getItem(chave));
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function permitida(secao) {
    return A.secoesPermitidas().some(function (s) { return s.id === secao; });
  }

  /* Cada fonte converte um módulo em itens pesquisáveis. Uma fonte com erro
     não derruba as demais: o nome dela entra em `falhas`. */
  function fontesConteudo() {
    var st = A.state;
    var conteudo = [
      ['Usuários', 'usuarios', function () {
        return st.users.map(function (u) {
          return item('conteudo', 'Usuários', u.nome, u.email, u.status,
            [u.nome, u.email, u.igreja, u.cidade, u.plano], 'users', abrir('usuarios', { userQuery: u.nome }));
        });
      }],
      ['Conteúdo', 'conteudo', function () {
        return st.content.map(function (c) {
          return item('conteudo', 'Conteúdo', c.titulo, c.autor + ' · ' + c.tipo, c.status,
            [c.titulo, c.autor, c.tema, c.tipo], 'book-open', abrir('conteudo', { contentQuery: c.titulo }));
        });
      }],
      ['Agenda & Atendimentos', 'agenda', function () {
        var eventos = st.eventos.map(function (e) {
          return item('conteudo', 'Agenda & Atendimentos', e.titulo, e.quando + ' · ' + e.local, e.status,
            [e.titulo, e.pastor, e.tipo, e.local], 'calendar', abrir('agenda'));
        });
        var atend = st.atendimentos.map(function (a) {
          return item('conteudo', 'Agenda & Atendimentos', a.nome, a.data + ' · ' + a.modalidade, a.status,
            [a.nome, a.pastor, a.tipo, a.modalidade], 'users', abrir('agenda'));
        });
        return eventos.concat(atend);
      }],
      ['Recursos pastorais', 'recursos', function () {
        var palestras = st.palestras.map(function (p) {
          return item('conteudo', 'Recursos pastorais', p.titulo, 'Palestra · ' + p.publico, p.status,
            [p.titulo, p.autor, p.publico], 'library', abrir('recursos'));
        });
        var videos = st.videos.map(function (v) {
          return item('conteudo', 'Recursos pastorais', v.titulo, 'Vídeo · ' + v.categoria, v.status,
            [v.titulo, v.categoria], 'library', abrir('recursos'));
        });
        return palestras.concat(videos);
      }],
      ['Conselho (Meet AI)', 'meetai', function () {
        return A.SESSOES_MEET.map(function (s) {
          return item('conteudo', 'Conselho (Meet AI)', s.nome, s.data + ' · ' + s.sentimento, s.status,
            [s.nome, s.pastor, s.sentimento], 'video', abrir('meetai'));
        });
      }],
      ['WhatsApp', 'whatsapp', function () {
        return st.templates.map(function (t) {
          return item('conteudo', 'WhatsApp', t.nome, t.canal, t.ativo ? 'Ativo' : 'Inativo',
            [t.nome, t.canal], 'message', abrir('whatsapp'));
        });
      }],
      ['Integrações', 'integracoes', function () {
        return st.integrations.map(function (i) {
          return item('conteudo', 'Integrações', i.nome, i.desc, i.status,
            [i.nome, i.desc], i.icone, abrir('integracoes'));
        });
      }],
      ['Planos & Assinaturas', 'planos', function () {
        return lerLista(PLANOS_KEY).map(function (p) {
          return item('conteudo', 'Planos & Assinaturas', p.nome, p.desc || 'Plano', p.status || '',
            [p.nome, p.desc], 'card', abrir('planos'));
        });
      }],
      ['Configurações', 'configuracoes', function () {
        var cfg = A.carregarConfig();
        var rotulos = { nome: 'Nome do produto', cores: 'Cores da marca', email: 'E-mail de suporte', dominio: 'Domínio', link: 'Link do app' };
        return Object.keys(rotulos).filter(function (k) { return cfg[k]; }).map(function (k) {
          return item('conteudo', 'Configurações', cfg[k], rotulos[k], '',
            [cfg[k], rotulos[k]], 'settings', abrir('configuracoes'));
        });
      }],
    ];
    return conteudo.filter(function (f) { return permitida(f[1]); });
  }

  function funcionalidades() {
    return A.SECTIONS
      .filter(function (s) { return s.id && !s.group && !s.href && !s.action; })
      .filter(function (s) { return permitida(s.id); })
      .map(function (s) {
        return item('funcionalidade', 'Funcionalidades', s.label, 'Abrir módulo do painel', '',
          [s.label, PALAVRAS_FUNCIONALIDADE[s.id] || ''], s.icon, abrir(s.id));
      });
  }

  function acoes() {
    var lista = [
      { secao: null, titulo: 'Atualizar painel', sub: 'Recarrega os dados exibidos', icone: 'refresh-cw', campos: ['atualizar recarregar painel'], executar: clicar('#refresh-btn') },
      { secao: null, titulo: 'Alternar tema claro/escuro', sub: 'Muda a aparência do painel', icone: 'settings', campos: ['tema escuro claro modo'], executar: clicar('#theme-btn') },
      { secao: 'usuarios', titulo: 'Novo usuário', sub: 'Cadastra um usuário no painel', icone: 'users', campos: ['novo usuario criar cadastrar'], executar: abrirEAcionar('usuarios', '[data-action="new-user"]') },
      { secao: 'usuarios', titulo: 'Exportar usuários (CSV)', sub: 'Baixa a lista de usuários', icone: 'download', campos: ['exportar usuarios csv planilha baixar'], executar: abrirEAcionar('usuarios', '[data-action="export-users"]') },
      { secao: 'conteudo', titulo: 'Novo sermão', sub: 'Cadastra um sermão', icone: 'plus', campos: ['novo sermao criar cadastrar'], executar: abrirEAcionar('conteudo', '[data-action="new-content"]') },
      { secao: 'conteudo', titulo: 'Exportar conteúdo', sub: 'Baixa a lista de sermões', icone: 'download', campos: ['exportar conteudo sermoes'], executar: abrirEAcionar('conteudo', '[data-action="export-content"]') },
      { secao: null, sair: true, titulo: 'Sair do painel', sub: 'Encerra a sessão atual', icone: 'log-out', campos: ['sair logout encerrar sessao'], executar: function () { if (A.Actions.sair) A.Actions.sair(); } },
    ];
    return lista
      .filter(function (a) { return a.sair || !a.secao || permitida(a.secao); })
      .map(function (a) {
        return item('acao', 'Ações', a.titulo, a.sub, '', a.campos.concat([a.titulo]), a.icone, a.executar);
      });
  }

  function construirIndice() {
    var itens = [];
    var falhas = [];
    fontesConteudo().forEach(function (f) {
      try { itens = itens.concat(f[2]()); } catch (e) { falhas.push(f[0]); }
    });
    try {
      itens = itens.concat(funcionalidades(), acoes());
    } catch (e) {
      falhas.push('Funcionalidades e ações');
    }
    return { itens: itens, falhas: falhas };
  }

  var indiceAtual = { itens: [], falhas: [] };

  /* Opções dos filtros vêm do índice completo, para não sumirem ao filtrar. */
  function valoresUnicos(campo) {
    var vistos = {};
    indiceAtual.itens.forEach(function (i) { if (i[campo]) vistos[i[campo]] = true; });
    return Object.keys(vistos).sort();
  }

  function executar() {
    try {
      indiceAtual = construirIndice();
      var encontrados = Core.filtrar(indiceAtual.itens, { termo: busca.termo, tipo: busca.tipo, grupo: busca.grupo, status: busca.status });
      lista = Core.agrupar(encontrados).reduce(function (todos, g) { return todos.concat(g.itens); }, []);
      busca.erro = false;
    } catch (e) {
      lista = [];
      busca.erro = true;
    }
    busca.carregando = false;
    ativo = lista.length ? 0 : -1;
    desenhar();
  }

  function agendar() {
    clearTimeout(timer);
    busca.carregando = true;
    desenhar();
    timer = setTimeout(executar, DEBOUNCE_MS);
  }

  function chipsTipo() {
    var opcoes = [{ id: 'todos', rotulo: 'Tudo' }].concat(Core.TIPOS);
    return '<div class="sp-chips" role="group" aria-label="Filtrar por categoria">' + opcoes.map(function (t) {
      return '<button type="button" class="sp-chip' + (busca.tipo === t.id ? ' active' : '') + '" data-tipo="' + t.id + '">' + A.esc(t.rotulo) + '</button>';
    }).join('') + '</div>';
  }

  function selectFiltro(rotulo, campo, valores, atual, nomeTodos) {
    var opcoes = ['todos'].concat(valores);
    return '<label class="sp-filtro"><span>' + rotulo + '</span><select data-campo="' + campo + '" aria-label="Filtrar por ' + rotulo.toLowerCase() + '">' +
      opcoes.map(function (v) {
        return '<option value="' + A.esc(v) + '"' + (atual === v ? ' selected' : '') + '>' + A.esc(v === 'todos' ? nomeTodos : v) + '</option>';
      }).join('') + '</select></label>';
  }

  function linha(r, idx) {
    return '<button class="sp-item' + (idx === ativo ? ' sp-ativo' : '') + '" type="button" role="option" aria-selected="' + (idx === ativo) + '" data-idx="' + idx + '">' +
      '<span class="sp-icon">' + window.icon(r.icone) + '</span>' +
      '<span style="flex:1;min-width:0"><b>' + A.esc(r.titulo) + '</b><br><span>' + A.esc(r.grupo + (r.sub ? ' · ' + r.sub : '')) + '</span></span>' +
      (r.status ? '<span class="sp-status">' + A.esc(r.status) + '</span>' : '') +
      '</button>';
  }

  function corpoResultados() {
    var porTipo = Core.agrupar(lista);
    var indice = 0;
    var blocos = porTipo.map(function (g) {
      var html = '<div class="sp-group" role="presentation">' + A.esc(g.rotulo) + ' · ' + g.itens.length + '</div>';
      g.itens.forEach(function (r) { html += linha(r, indice); indice += 1; });
      return html;
    }).join('');
    return '<div class="sp-count" aria-live="polite">' + lista.length + (lista.length === 1 ? ' resultado' : ' resultados') + '</div>' +
      '<div role="listbox" aria-label="Resultados da busca">' + blocos + '</div>';
  }

  function corpo() {
    if (busca.carregando) return '<div class="sp-loading"><span class="spinner spinner-sm spinner-navy"></span> Pesquisando…</div>';
    if (busca.erro) {
      return '<div class="sp-erro">Não foi possível pesquisar agora.' +
        '<button type="button" class="sp-retry" data-retry="1">Tentar novamente</button></div>';
    }
    if (!Core.termoPesquisavel(busca.termo)) {
      return '<div class="sp-empty">Digite pelo menos ' + Core.MIN_CARACTERES + ' caracteres para pesquisar. ' +
        'Use aspas para busca exata, ex.: <b>"Marcos Vieira"</b>.</div>';
    }
    if (!lista.length) {
      return '<div class="sp-empty">Nenhum resultado para “' + A.esc(busca.termo.trim()) + '”.' +
        '<br>Tente outro termo ou remova os filtros.</div>';
    }
    return corpoResultados();
  }

  function filtrosOuVazio() {
    if (busca.carregando || !Core.termoPesquisavel(busca.termo)) return '';
    var grupos = valoresUnicos('grupo');
    var status = valoresUnicos('status');
    return '<div class="sp-filtros">' + chipsTipo() +
      '<div class="sp-selects">' +
        selectFiltro('Módulo', 'grupo', grupos, busca.grupo, 'Todos os módulos') +
        selectFiltro('Status', 'status', status, busca.status, 'Todos os status') +
      '</div></div>';
  }

  function avisoFalhas() {
    if (!indiceAtual.falhas.length) return '';
    return '<div class="sp-aviso">Não foi possível pesquisar em: ' + A.esc(indiceAtual.falhas.join(', ')) + '.</div>';
  }

  function desenhar() {
    if (!busca.termo.trim() && !busca.carregando) { fechar(); return; }
    pop.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    pop.innerHTML = filtrosOuVazio() + avisoFalhas() + corpo();
  }

  function fechar() {
    pop.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }

  function limpar() {
    clearTimeout(timer);
    input.value = '';
    busca.termo = '';
    busca.carregando = false;
    lista = [];
    fechar();
  }

  function executarItem(idx) {
    var r = lista[idx];
    if (!r) return;
    limpar();
    r.executar();
  }

  function moverAtivo(delta) {
    if (!lista.length) return;
    ativo = (ativo + delta + lista.length) % lista.length;
    desenhar();
    var el = pop.querySelector('[data-idx="' + ativo + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('input', function (e) {
    busca.termo = e.target.value;
    if (!busca.termo.trim()) { clearTimeout(timer); busca.carregando = false; ativo = -1; desenhar(); return; }
    if (!Core.termoPesquisavel(busca.termo)) { clearTimeout(timer); busca.carregando = false; lista = []; ativo = -1; desenhar(); return; }
    agendar();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { limpar(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); moverAtivo(1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); moverAtivo(-1); return; }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    clearTimeout(timer);
    if (!Core.termoPesquisavel(busca.termo)) { A.toast('Digite pelo menos 3 caracteres', 'err'); return; }
    if (!lista.length || busca.carregando) executar();
    if (!lista.length) { A.toast(busca.erro ? 'Não foi possível pesquisar agora' : 'Nenhum resultado encontrado', 'err'); return; }
    executarItem(ativo >= 0 ? ativo : 0);
  });

  pop.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.tipo) { busca.tipo = t.dataset.tipo; executar(); return; }
    if (t.dataset.retry) { executar(); return; }
    if (t.dataset.idx !== undefined) executarItem(Number(t.dataset.idx));
  });

  pop.addEventListener('change', function (e) {
    var campo = e.target.dataset.campo;
    if (!campo) return;
    busca[campo] = e.target.value;
    executar();
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.admin-search')) fechar();
  });
})();
