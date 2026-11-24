/* Raiz do site: /  -> site.html (vitrine institucional).
   Abrir /index.html diretamente carrega a versão mobile do app.
   Script externo porque a CSP do projeto bloqueia scripts inline.
   A checagem é feita antes do body renderizar para evitar piscar o app. */
(function () {
  var caminho = window.location.pathname || '/';
  if (caminho.charAt(caminho.length - 1) !== '/') return;
  window.location.replace('site.html');
})();
