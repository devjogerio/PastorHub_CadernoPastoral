/* Shell do app do usuário: 'mobile' | 'tablet' | 'desktop'.
   Definido pelo atributo data-shell do <html> de cada página
   (CSP do projeto bloqueia scripts inline, então o valor vem daqui). */
(function () {
  window.APP_SHELL = document.documentElement.getAttribute('data-shell') || 'mobile';
})();
