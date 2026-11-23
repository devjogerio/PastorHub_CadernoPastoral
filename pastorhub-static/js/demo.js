/* Modo demonstração: sinaliza que o app é uma vitrine pública, sem autenticação real.
   Em modo offline (localStorage pastorhub_modo_offline='1') o aviso é persistente. */
(function () {
  window.PASTORHUB_DEMO = true;

  var CHAVE = 'pastorhub_demo_banner_off';
  var offline = false;
  try { offline = localStorage.getItem('pastorhub_modo_offline') === '1'; } catch (e) { /* storage indisponível */ }
  try {
    if (!offline && sessionStorage.getItem(CHAVE) === '1') return;
  } catch (e) { /* storage indisponível: segue exibindo o aviso */ }

  function montar() {
    if (document.getElementById('ph-demo-banner')) return;

    if (!document.getElementById('ph-demo-css')) {
      var link = document.createElement('link');
      link.id = 'ph-demo-css';
      link.rel = 'stylesheet';
      link.href = 'css/demo.css';
      document.head.appendChild(link);
    }

    var banner = document.createElement('div');
    banner.id = 'ph-demo-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML =
      '<span class="ph-demo-tag">DEMO</span>' +
      '<span class="ph-demo-text"><strong>' + (offline ? 'Modo offline.' : 'Modo demonstração.') + '</strong> ' +
      (offline
        ? 'Seus dados ficam apenas neste dispositivo, sem sincronização.'
        : 'Dados fictícios e acesso aberto — não insira informações reais ou sensíveis.') + '</span>' +
      (offline ? '' : '<button type="button" aria-label="Ocultar aviso de demonstração">Entendi</button>');

    document.body.appendChild(banner);
    document.body.classList.add('ph-demo-on');

    function ajustarAltura() {
      document.documentElement.style.setProperty('--ph-demo-h', banner.offsetHeight + 'px');
    }
    ajustarAltura();
    window.addEventListener('resize', ajustarAltura);

    var botao = banner.querySelector('button');
    if (botao) {
      botao.addEventListener('click', function () {
        try { sessionStorage.setItem(CHAVE, '1'); } catch (e) { /* ignora */ }
        banner.remove();
        document.body.classList.remove('ph-demo-on');
        document.documentElement.style.removeProperty('--ph-demo-h');
      });
    }
  }

  if (document.body) montar();
  else document.addEventListener('DOMContentLoaded', montar);
})();
