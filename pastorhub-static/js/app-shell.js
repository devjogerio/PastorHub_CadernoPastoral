/* Shell do app: 'mobile' | 'tablet' | 'desktop'.
   Fonte de verdade: atributo data-shell do <html> de cada página
   (a CSP do projeto bloqueia scripts inline, então o valor vem daqui).
   Sem o atributo, o shell é inferido pela largura da viewport, usando
   os mesmos cortes das media queries de css/styles.css. */
(function () {
  var declarado = document.documentElement.getAttribute('data-shell');
  if (declarado === 'mobile' || declarado === 'tablet' || declarado === 'desktop') {
    window.APP_SHELL = declarado;
    return;
  }

  var largura = window.innerWidth || document.documentElement.clientWidth || 0;
  if (largura >= 1024) {
    window.APP_SHELL = 'desktop';
  } else if (largura >= 768) {
    window.APP_SHELL = 'tablet';
  } else {
    window.APP_SHELL = 'mobile';
  }
})();
