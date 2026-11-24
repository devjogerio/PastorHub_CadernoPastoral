/* Busca global do painel administrativo: indexa os módulos, aplica debounce,
   filtros (grupo e status), paginação e estados de carregamento, vazio e erro.
   Depende de window.AdminAPI (admin.js) e de window.AdminBuscaCore (admin-busca-core.js).
   A lista respeita as seções permitidas ao perfil logado (secoesPermitidas). */
(function () {
  'use strict';

  var A = window.AdminAPI;
  var Core = window.AdminBuscaCore;
  var input = document.getElementById('global-search');
  var pop = document.getElementById('search-pop');
  if (!A || !Core || !input || !pop) return;

  var DEBOUNCE_MS = 250;
  var TAMANHO_PAGINA = 6;
  var PLANOS_KEY = 'pastorhub_admin_planos';

  var busca = { termo: '', grupo: 'todos', status: 'todos', pagina: 1, erro: false, carregando: false };
  var indice = { itens: [], falhas: [] };
  var resultado = { itens: [], pagina: null };
  var timer = null;

  function item(grupo, secao, titulo, sub, status, campos, icone, ir) {
    var valores = campos.filter(function (v) { return v != null && v !== ''; }).map(String);
    return {
      grupo: grupo,
      secao: secao,
      titulo: String(titulo || ''),
      sub: sub || '',
      status: status || '',
      icone: icone,
      campos: valores,
      texto: Core.normalizar(valores.join(' ')),
      ir: ir,
    };
  }

  function abrir(secao, extra) {
    return function () {
      A.state.section = secao;
      Object.assign(A.state, extra || {});
      A.render();
    };
  }

  function lerLista(chave) {
    try {
      var v = JSON.parse(localStorage.getItem(chave));
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  /* Cada fonte converte um módulo em itens pesquisáveis. Uma fonte com erro
     não derruba as demais: o nome dela entra em `falhas`. */
  function fontes() {
    var st = A.state;
    return [
      ['Usuários', 'usuarios', function () {
        return st.users.map(function (u) {
          return item('Usuários', 'usuarios', u.nome, u.email, u.status,
            [u.nome, u.email, u.igreja, u.cidade, u.plano], 'users', abrir('usuarios', { userQuery: u.nome }));
        });
      }],
      ['Conteúdo', 'conteudo', function () {
        return st.content.map(function (c) {
          return item('Conteúdo', 'conteudo', c.titulo, c.autor + ' · ' + c.tipo, c.status,
            [c.titulo, c.autor, c.tema, c.tipo], 'book-open', abrir('conteudo', { contentQuery: c.titulo }));
        });
      }],
      ['Agenda & Atendimentos', 'agenda', function () {
        var eventos = st.eventos.map(function (e) {
          return item('Agenda & Atendimentos', 'agenda', e.titulo, e.quando + ' · ' + e.local, e.status,
            [e.titulo, e.pastor, e.tipo, e.local], 'calendar', abrir('agenda'));
        });
        var atend = st.atendimentos.map(function (a) {
          return item('Agenda & Atendimentos', 'agenda', a.nome, a.data + ' · ' + a.modalidade, a.status,
            [a.nome, a.pastor, a.tipo, a.modalidade], 'users', abrir('agenda'));
        });
        return eventos.concat(atend);
      }],
      ['Recursos pastorais', 'recursos', function () {
        var palestras = st.palestras.map(function (p) {
          return item('Recursos pastorais', 'recursos', p.titulo, 'Palestra · ' + p.publico, p.status,
            [p.titulo, p.autor, p.publico], 'library', abrir('recursos'));
        });
        var videos = st.videos.map(function (v) {
          return item('Recursos pastorais', 'recursos', v.titulo, 'Vídeo · ' + v.categoria, v.status,
            [v.titulo, v.categoria], 'library', abrir('recursos'));
        });
        return palestras.concat(videos);
      }],
      ['Conselho (Meet AI)', 'meetai', function () {
        return A.SESSOES_MEET.map(function (s) {
          return item('Conselho (Meet AI)', 'meetai', s.nome, s.data + ' · ' + s.sentimento, s.status,
            [s.nome, s.pastor, s.sentimento], 'video', abrir('meetai'));
        });
      }],
      ['WhatsApp', 'whatsapp', function () {
        return st.templates.map(function (t) {
          return item('WhatsApp', 'whatsapp', t.nome, t.canal, t.ativo ? 'Ativo' : 'Inativo',
            [t.nome, t.canal], 'message', abrir('whatsapp'));
        });
      }],
      ['Integrações', 'integracoes', function () {
        return st.integrations.map(function (i) {
          return item('Integrações', 'integracoes', i.nome, i.desc, i.status,
            [i.nome, i.desc], i.icone, abrir('integracoes'));
        });
      }],
      ['Planos & Assinaturas', 'planos', function () {
        return lerLista(PLANOS_KEY).map(function (p) {
          return item('Planos & Assinaturas', 'planos', p.nome, p.desc || 'Plano', p.status || '',
            [p.nome, p.desc], 'card', abrir('planos'));
        });
      }],
      ['Configurações', 'configuracoes', function () {
        var cfg = A.carregarConfig();
        var rotulos = { nome: 'Nome do produto', cores: 'Cores da marca', email: 'E-mail de suporte', dominio: 'Domínio', link: 'Link do app' };
        return Object.keys(rotulos).filter(function (k) { return cfg[k]; }).map(function (k) {
          return item('Configurações', 'configuracoes', cfg[k], rotulos[k], '',
            [cfg[k], rotulos[k]], 'settings', abrir('configuracoes'));
        });
      }],
    ];
  }

  function construirIndice() {
    var permitidas = A.secoesPermitidas().map(function (s) { return s.id; });
    var itens = [];
    var falhas = [];
    fontes().forEach(function (f) {
      if (permitidas.indexOf(f[1]) === -1) return;
      try {
        itens = itens.concat(f[2]());
      } catch (e) {
        falhas.push(f[0]);
      }
    });
    return { itens: itens, falhas: falhas };
  }

  function statusDisponiveis() {
    var vistos = {};
    indice.itens.forEach(function (i) { if (i.status) vistos[i.status] = true; });
    return Object.keys(vistos).sort();
  }

  function gruposDisponiveis() {
    var vistos = [];
    indice.itens.forEach(function (i) { if (vistos.indexOf(i.grupo) === -1) vistos.push(i.grupo); });
    return vistos;
  }

  function executar() {
    try {
      indice = construirIndice();
      var lista = Core.filtrar(indice.itens, { termo: busca.termo, grupo: busca.grupo, status: busca.status });
      resultado = { itens: lista, pagina: Core.paginar(lista, busca.pagina, TAMANHO_PAGINA) };
      busca.erro = false;
    } catch (e) {
      resultado = { itens: [], pagina: null };
      busca.erro = true;
    }
    busca.carregando = false;
    desenhar();
  }

  function agendar() {
    clearTimeout(timer);
    busca.carregando = true;
    desenhar();
    timer = setTimeout(function () { busca.pagina = 1; executar(); }, DEBOUNCE_MS);
  }

  function chips() {
    var grupos = ['todos'].concat(gruposDisponiveis());
    return '<div class="sp-chips" role="group" aria-label="Filtrar por módulo">' + grupos.map(function (g) {
      var rotulo = g === 'todos' ? 'Todos' : g;
      return '<button type="button" class="sp-chip' + (busca.grupo === g ? ' active' : '') + '" data-grupo="' + A.esc(g) + '">' + A.esc(rotulo) + '</button>';
    }).join('') + '</div>';
  }

  function seletorStatus() {
    var opcoes = ['todos'].concat(statusDisponiveis());
    return '<label class="sp-filtro"><span>Status</span><select data-status aria-label="Filtrar por status">' + opcoes.map(function (s) {
      var rotulo = s === 'todos' ? 'Todos os status' : s;
      return '<option value="' + A.esc(s) + '"' + (busca.status === s ? ' selected' : '') + '>' + A.esc(rotulo) + '</option>';
    }).join('') + '</select></label>';
  }

  function linhaResultado(r, idx) {
    return '<button class="sp-item" type="button" data-idx="' + idx + '">' +
      '<span class="sp-icon">' + window.icon(r.icone) + '</span>' +
      '<span style="flex:1;min-width:0"><b>' + A.esc(r.titulo) + '</b><br><span>' +
        A.esc(r.grupo + (r.sub ? ' · ' + r.sub : '')) + '</span></span>' +
      (r.status ? '<span class="sp-status">' + A.esc(r.status) + '</span>' : '') +
      '</button>';
  }

  function paginador(p) {
    if (p.totalPaginas <= 1) return '';
    return '<div class="sp-pager">' +
      '<button type="button" data-pagina="' + (p.pagina - 1) + '"' + (p.pagina <= 1 ? ' disabled' : '') + '>‹ Anterior</button>' +
      '<span>Página ' + p.pagina + ' de ' + p.totalPaginas + '</span>' +
      '<button type="button" data-pagina="' + (p.pagina + 1) + '"' + (p.pagina >= p.totalPaginas ? ' disabled' : '') + '>Próxima ›</button>' +
      '</div>';
  }

  function corpo() {
    if (busca.carregando) return '<div class="sp-loading"><span class="spinner spinner-sm spinner-navy"></span> Pesquisando…</div>';
    if (busca.erro) {
      return '<div class="sp-erro">Não foi possível pesquisar agora.' +
        '<button type="button" class="sp-retry" data-retry="1">Tentar novamente</button></div>';
    }
    var termo = Core.interpretarTermo(busca.termo);
    if (!termo.texto || (termo.modo === 'parcial' && termo.texto.length < Core.MIN_CARACTERES_PARCIAL)) {
      return '<div class="sp-empty">Digite pelo menos ' + Core.MIN_CARACTERES_PARCIAL + ' caracteres. ' +
        'Use aspas para busca exata, ex.: <b>"Marcos Vieira"</b>.</div>';
    }
    if (!resultado.itens.length) {
      return '<div class="sp-empty">Nenhum resultado para “' + A.esc(busca.termo) + '”.' +
        '<br>Tente um trecho do nome ou remova os filtros.</div>';
    }
    var p = resultado.pagina;
    var lista = p.itens.map(function (r, i) { return linhaResultado(r, p.inicio + i); }).join('');
    return '<div class="sp-count">' + p.total + (p.total === 1 ? ' resultado' : ' resultados') + '</div>' +
      lista + paginador(p);
  }

  function avisoFalhas() {
    if (!indice.falhas.length) return '';
    return '<div class="sp-aviso">Não foi possível pesquisar em: ' + A.esc(indice.falhas.join(', ')) + '.</div>';
  }

  function desenhar() {
    if (!busca.termo.trim() && !busca.carregando) { pop.hidden = true; pop.innerHTML = ''; return; }
    pop.hidden = false;
    var filtros = busca.carregando ? '' : '<div class="sp-filtros">' + chips() + seletorStatus() + '</div>';
    pop.innerHTML = filtros + avisoFalhas() + corpo();
  }

  function fechar() {
    pop.hidden = true;
  }

  function limpar() {
    clearTimeout(timer);
    input.value = '';
    busca.termo = '';
    busca.pagina = 1;
    fechar();
  }

  function abrirResultado(idx) {
    var r = resultado.itens[idx];
    if (!r) return;
    limpar();
    r.ir();
  }

  input.addEventListener('input', function (e) {
    busca.termo = e.target.value;
    busca.pagina = 1;
    if (!busca.termo.trim()) { clearTimeout(timer); busca.carregando = false; desenhar(); return; }
    agendar();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { limpar(); return; }
    if (e.key !== 'Enter') return;
    clearTimeout(timer);
    executar();
    if (resultado.itens.length) abrirResultado(0);
    else if (busca.erro) A.toast('Não foi possível pesquisar agora', 'err');
    else A.toast('Nenhum resultado encontrado', 'err');
  });

  pop.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.grupo) { busca.grupo = t.dataset.grupo; busca.pagina = 1; executar(); return; }
    if (t.dataset.pagina) { busca.pagina = Number(t.dataset.pagina); executar(); return; }
    if (t.dataset.retry) { executar(); return; }
    if (t.dataset.idx !== undefined) abrirResultado(Number(t.dataset.idx));
  });

  pop.addEventListener('change', function (e) {
    if (e.target.dataset.status === undefined) return;
    busca.status = e.target.value;
    busca.pagina = 1;
    executar();
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.admin-search')) fechar();
  });
})();
