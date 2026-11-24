/* Núcleo puro da busca do painel: normalização, correspondência parcial/exata,
   filtros e paginação. Sem DOM, para ser testável isoladamente.
   Expõe window.AdminBuscaCore (e module.exports em ambiente Node). */
(function (raiz) {
  'use strict';

  var MIN_CARACTERES_PARCIAL = 2;

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

  function termoValido(termo) {
    if (termo.modo === 'exato') return termo.texto.length >= 1;
    return termo.texto.length >= MIN_CARACTERES_PARCIAL;
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
    if (!termoValido(termo)) return [];
    return itens.filter(function (item) {
      if (opcoes.grupo && opcoes.grupo !== 'todos' && item.grupo !== opcoes.grupo) return false;
      if (opcoes.status && opcoes.status !== 'todos' && item.status !== opcoes.status) return false;
      return correspondeItem(item, termo);
    });
  }

  function paginar(lista, pagina, tamanho) {
    var total = lista.length;
    var totalPaginas = Math.max(1, Math.ceil(total / tamanho));
    var atual = Math.min(Math.max(1, pagina || 1), totalPaginas);
    var inicio = (atual - 1) * tamanho;
    return {
      itens: lista.slice(inicio, inicio + tamanho),
      inicio: inicio,
      pagina: atual,
      totalPaginas: totalPaginas,
      total: total,
    };
  }

  var nucleo = {
    normalizar: normalizar,
    interpretarTermo: interpretarTermo,
    filtrar: filtrar,
    paginar: paginar,
    MIN_CARACTERES_PARCIAL: MIN_CARACTERES_PARCIAL,
  };

  raiz.AdminBuscaCore = nucleo;
  if (typeof module !== 'undefined' && module.exports) module.exports = nucleo;
})(typeof window !== 'undefined' ? window : this);
