/* Núcleo puro da busca do painel: normalização, mínimo de caracteres,
   correspondência parcial/exata, filtros por tipo/módulo/status e agrupamento
   por categoria (conteúdo, funcionalidade, ação). Sem DOM, para ser testável.
   Expõe window.AdminBuscaCore (e module.exports em ambiente Node). */
(function (raiz) {
  'use strict';

  var MIN_CARACTERES = 3;
  var TIPOS = [
    { id: 'conteudo', rotulo: 'Conteúdo' },
    { id: 'funcionalidade', rotulo: 'Funcionalidade' },
    { id: 'acao', rotulo: 'Ação' },
  ];

  function normalizar(texto) {
    return String(texto == null ? '' : texto)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* "texto entre aspas" = correspondência exata; o restante é parcial. */
  function interpretarTermo(bruto) {
    var t = String(bruto == null ? '' : bruto).trim();
    var entreAspas = t.length >= 2 && t.charAt(0) === '"' && t.charAt(t.length - 1) === '"';
    if (entreAspas) return { texto: normalizar(t.slice(1, -1)), modo: 'exato' };
    return { texto: normalizar(t), modo: 'parcial' };
  }

  /* Só há busca com pelo menos MIN_CARACTERES no termo (aspas não contam). */
  function termoPesquisavel(bruto) {
    return interpretarTermo(bruto).texto.length >= MIN_CARACTERES;
  }

  /* Parcial: todas as palavras digitadas aparecem em algum campo (ordem livre).
     Exato: o termo inteiro é igual a um dos campos. */
  function correspondeItem(item, termo) {
    if (termo.modo === 'exato') {
      return item.campos.some(function (campo) { return normalizar(campo) === termo.texto; });
    }
    return termo.texto.split(' ').every(function (palavra) {
      return item.texto.indexOf(palavra) !== -1;
    });
  }

  function filtrar(itens, opcoes) {
    var termo = interpretarTermo(opcoes.termo);
    if (termo.texto.length < MIN_CARACTERES) return [];
    return itens.filter(function (item) {
      if (opcoes.tipo && opcoes.tipo !== 'todos' && item.tipo !== opcoes.tipo) return false;
      if (opcoes.grupo && opcoes.grupo !== 'todos' && item.grupo !== opcoes.grupo) return false;
      if (opcoes.status && opcoes.status !== 'todos' && item.status !== opcoes.status) return false;
      return correspondeItem(item, termo);
    });
  }

  /* Agrupa na ordem fixa de TIPOS e descarta categorias vazias. */
  function agrupar(lista) {
    return TIPOS.map(function (t) {
      return {
        id: t.id,
        rotulo: t.rotulo,
        itens: lista.filter(function (item) { return item.tipo === t.id; }),
      };
    }).filter(function (g) { return g.itens.length > 0; });
  }

  var nucleo = {
    MIN_CARACTERES: MIN_CARACTERES,
    TIPOS: TIPOS,
    normalizar: normalizar,
    interpretarTermo: interpretarTermo,
    termoPesquisavel: termoPesquisavel,
    filtrar: filtrar,
    agrupar: agrupar,
  };

  raiz.AdminBuscaCore = nucleo;
  if (typeof module !== 'undefined' && module.exports) module.exports = nucleo;
})(typeof window !== 'undefined' ? window : this);
