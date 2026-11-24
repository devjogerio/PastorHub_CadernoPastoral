/* pastor.html — entrada do app do pastor.
   Abre a versão adequada ao tamanho da tela: mobile, tablet ou desktop.
   Os cortes são os mesmos de css/styles.css e de js/app-shell.js. */
(function () {
  var largura = window.innerWidth || document.documentElement.clientWidth || 0;
  var destino = largura >= 1024 ? 'desktop.html' : largura >= 768 ? 'tablet.html' : 'index.html';
  window.location.replace(destino);
})();
