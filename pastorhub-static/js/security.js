/* ============================================================
   Utilitários de segurança compartilhados do app estático
   · sanitizeHtml: remove scripts/handlers antes de qualquer innerHTML
   · openPrintWindow: abre janela de impressão sem acesso ao opener
   Depende de js/vendor/purify.min.js (DOMPurify) carregado antes.
   ============================================================ */
(function () {
  'use strict';

  var TAGS_PERMITIDAS = [
    'a', 'b', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'h1', 'h2',
    'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'li', 'mark', 'ol', 'p', 'pre', 's',
    'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'th', 'thead',
    'tr', 'u', 'ul',
  ];
  var ATRIBUTOS_PERMITIDOS = ['class', 'href', 'rel', 'target', 'title'];

  /* Escapa texto puro. Usa o escapeHtml global quando existir para manter
     uma única implementação; senão, cria um nó de texto. */
  function escapeHtml(valor) {
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(valor);
    var d = document.createElement('div');
    d.textContent = valor == null ? '' : String(valor);
    return d.innerHTML;
  }

  /* Sanitiza HTML vindo de usuário, IA ou armazenamento local.
     Sem DOMPurify disponível, degrada para texto escapado (nunca HTML cru). */
  function sanitizeHtml(html) {
    if (html == null) return '';
    var entrada = String(html);
    if (window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
      return window.DOMPurify.sanitize(entrada, {
        ALLOWED_TAGS: TAGS_PERMITIDAS,
        ALLOWED_ATTR: ATRIBUTOS_PERMITIDOS,
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'base', 'svg', 'math'],
        FORBID_ATTR: ['style', 'src', 'srcset', 'formaction', 'xlink:href'],
        KEEP_CONTENT: true,
      });
    }
    return escapeHtml(entrada);
  }

  /* Abre uma janela de impressão já com o HTML final. O opener é anulado
     imediatamente para impedir reverse tabnabbing; o script inline de
     impressão foi removido (CSP sem 'unsafe-inline'). */
  function openPrintWindow(html) {
    var win = window.open('', '_blank');
    if (!win) return null;
    try { win.opener = null; } catch (e) { /* alguns navegadores bloqueiam */ }
    win.document.open();
    win.document.write(html);
    win.document.close();
    /* Dispara a impressão a partir do documento pai (o script inline seria
       bloqueado pela CSP). */
    try {
      win.addEventListener('load', function () {
        try { win.focus(); win.print(); } catch (e) { /* usuário imprime manualmente */ }
      });
      setTimeout(function () {
        try { win.focus(); win.print(); } catch (e) { /* idiossincrasias de load */ }
      }, 350);
    } catch (e) { /* janela fechada antes */ }
    return win;
  }

  window.PastorSecurity = {
    escapeHtml: escapeHtml,
    sanitizeHtml: sanitizeHtml,
    openPrintWindow: openPrintWindow,
  };
  window.sanitizeHtml = sanitizeHtml;
  window.openPrintWindow = openPrintWindow;
})();
