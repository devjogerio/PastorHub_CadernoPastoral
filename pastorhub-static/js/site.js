/* ============================================================
   Site institucional PastorHub — renderização dos dados
   da Proposta de Investimento + interações
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);
  const INV = window.INVESTIDOR;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------- Menu mobile ---------- */
  const header = $('#site-header');
  const toggle = $('#menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.site-nav a').forEach((a) =>
      a.addEventListener('click', () => {
        header.classList.remove('nav-open');
        toggle.classList.remove('open');
      })
    );
  }

  /* ---------- 2. Problema ---------- */
  $('#problema-tbody').innerHTML = INV.problema.alternativas.map((a) =>
    '<tr><td><b>' + esc(a.atual) + '</b></td><td>' + esc(a.limitacao) + '</td></tr>').join('');

  /* ---------- 3. Módulos ---------- */
  $('#modulos-grid').innerHTML = INV.modulos.map((m) =>
    '<article class="feature' + (m.novo ? ' feature-novo' : '') + '">' +
      '<span class="f-icon">' + (window.SiteIcons ? SiteIcons.svg(m.icone) : '') + '</span>' +
      (m.novo ? '<span class="new-badge">Novo</span>' : '') +
      '<h3>' + esc(m.nome) + '</h3>' +
      '<p>' + esc(m.desc) + '</p>' +
      '<ul>' + m.itens.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul>' +
    '</article>').join('');

  /* ---------- 6. Mercado ---------- */
  $('#mercado-grid').innerHTML = INV.mercado.dados.map((d) =>
    '<div class="market-card"><span class="m-num">' + esc(d.n) + '</span><p>' + esc(d.d) + '</p></div>').join('');

  $('#mercado-insight').textContent = INV.mercado.insight;

  $('#tam-grid').innerHTML = [INV.mercado.tam, INV.mercado.sam, INV.mercado.som].map((x, i) =>
    '<div class="tam-card tam-' + i + '">' +
      '<span class="tam-label">' + esc(x.rotulo) + '</span>' +
      '<b class="tam-value">' + esc(x.valor) + '</b>' +
      '<p>' + esc(x.def) + '</p>' +
    '</div>').join('');

  /* ---------- 7. Planos ---------- */
  function renderPlanos(modo) {
    $('#planos-grid').innerHTML = INV.planos.map((p) => {
      const valor = modo === 'anual' ? p.anual : p.preco.replace('R$ ', '');
      const unidade = modo === 'anual' ? '/ano' : '/mês';
      const raw = modo === 'anual' ? p.anual : p.preco.replace(/[^0-9,.]/g, '');
      const num = raw.replace(/\./g, '').replace(',', '.');
      const partes = num.split('.');
      const inteiro = partes[0];
      const centavos = partes[1] || '00';
      return '<article class="plan' + (p.destaque ? ' featured' : '') + '">' +
        (p.destaque ? '<span class="plan-badge">Mais usado</span>' : '') +
        '<h3>' + esc(p.nome) + '</h3>' +
        '<p class="plan-desc">' + esc(p.periodo) + '</p>' +
        '<div class="price"><span class="cur">R$</span><b>' + inteiro + '<small class="cents">,' + centavos + '</small></b><small>' + unidade + '</small></div>' +
        (modo === 'anual' && p.anual !== '0' ? '<p class="plan-anual">equivalente a ' + esc(p.preco) + '/mês</p>' : '') +
        '<ul>' + p.itens.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul>' +
        '<p class="plan-pag">' + (p.nome === 'Gratuito' ? 'Sem cartão · funciona offline' : 'Pix, cartão ou boleto · cobrança recorrente automática') + '</p>' +
        '<a class="btn ' + (p.destaque ? 'lime' : 'outline') + ' block" href="desktop.html">' +
          (p.nome === 'Gratuito' ? 'Começar grátis' : 'Assinar ' + esc(p.nome)) + '</a>' +
      '</article>';
    }).join('');
  }
  renderPlanos('mensal');

  document.querySelectorAll('[data-billing]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-billing]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderPlanos(btn.dataset.billing);
    });
  });

  $('#unit-list').innerHTML = INV.unitEconomics.map((u) =>
    '<div class="setting-row"><div><b>' + esc(u.item) + '</b></div><b class="hl">' + esc(u.valor) + '</b></div>').join('');

  $('#receitas-futuras').innerHTML = INV.receitasFuturas.map((r) => '<li>' + esc(r) + '</li>').join('');

  /* ---------- 8. Go-to-market ---------- */
  $('#gtm-grid').innerHTML = INV.gtm.map((g, i) =>
    '<article class="gtm-card"><span class="gtm-num">' + (i + 1) + '</span>' +
      '<h3>' + esc(g.nome) + '</h3><p>' + esc(g.desc) + '</p></article>').join('');

  /* ---------- 9. Concorrência ---------- */
  $('#concorrencia-tbody').innerHTML = INV.concorrencia.map((c) =>
    '<tr><td><b>' + esc(c.alt) + '</b></td><td>' + esc(c.lacuna) + '</td></tr>').join('');
  $('#diferenciais-list').innerHTML = INV.diferenciais.map((d) => '<li>' + esc(d) + '</li>').join('');
  $('#moat-text').textContent = INV.moat;

  /* ---------- 10. Plano financeiro ---------- */
  $('#financeiro-tbody').innerHTML = INV.financeiro.linhas.map((l) =>
    '<tr><td><b>' + esc(l.indicador) + '</b></td><td>' + esc(l.ano1) + '</td><td>' + esc(l.ano2) + '</td><td>' + esc(l.ano3) + '</td></tr>').join('');

  const receita = [
    { ano: 'Ano 1', valor: 140, rot: 'R$ 140 mil' },
    { ano: 'Ano 2', valor: 650, rot: 'R$ 650 mil' },
    { ano: 'Ano 3', valor: 1700, rot: 'R$ 1,7 milhão' },
  ];
  const maxRec = 1700;
  $('#receita-chart').innerHTML =
    '<div style="display:flex;align-items:flex-end;gap:26px;height:200px;padding:0 6px">' +
      receita.map((r, i) => {
        const h = (r.valor / maxRec) * 100;
        const cores = ['#002645', '#3261AB', '#95C121'];
        return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">' +
          '<b style="font-size:.82rem;color:var(--navy);margin-bottom:6px">' + esc(r.rot) + '</b>' +
          '<div style="width:100%;height:' + h + '%;background:' + cores[i] + ';border-radius:10px 10px 4px 4px"></div>' +
          '<span style="margin-top:8px;font-size:.8rem;color:var(--muted)">' + esc(r.ano) + '</span></div>';
      }).join('') + '</div>';
  $('#receita-legend').innerHTML = receita.map((r, i) =>
    '<span><i class="legend-dot" style="background:' + ['#002645', '#3261AB', '#95C121'][i] + '"></i>' + esc(r.ano) + '</span>').join('');

  $('#premissas-box').innerHTML =
    '<h3>Premissas do modelo</h3><div class="premissas-grid">' +
    INV.financeiro.premissas.map((p) => '<div class="premissa"><span>▸</span><p>' + esc(p) + '</p></div>').join('') +
    '</div>';

  /* ---------- 10.3 Captação ---------- */
  $('#uso-tranches').innerHTML = INV.financeiro.uso.map((t) =>
    '<div class="tranche"><div class="tranche-head"><b>' + esc(t.fase) + '</b><span class="tag tag-lime">' + esc(t.valor) + '</span></div>' +
      t.itens.map((i) =>
        '<div class="tranche-item"><div><b>' + esc(i.nome) + '</b><p>' + esc(i.obj) + '</p></div><b class="hl">' + esc(i.v) + '</b></div>').join('') +
    '</div>').join('');

  $('#condicoes-list').innerHTML = INV.financeiro.condicoes.map((c) =>
    '<div class="setting-row"><div><b>' + esc(c.cond) + '</b><span>' + esc(c.termo) + '</span></div></div>').join('');
  $('#logica-tranches').textContent = INV.financeiro.logicaTranches;

  /* ---------- 11. Roadmap ---------- */
  const statusMap = { done: { rot: 'Concluído', cor: 'green' }, wip: { rot: 'Em andamento', cor: 'amber' }, next: { rot: 'Planejado', cor: 'blue' } };
  $('#roadmap-timeline').innerHTML = INV.roadmap.map((r) => {
    const st = statusMap[r.status];
    return '<div class="tl-item tl-' + r.status + '">' +
      '<span class="tl-dot"></span>' +
      '<div class="tl-card">' +
        '<div class="tl-head"><b>' + esc(r.versao) + '</b><span class="tag tag-' + st.cor + '">' + esc(r.prazo) + '</span></div>' +
        '<ul>' + r.entregas.map((e) => '<li>' + esc(e) + '</li>').join('') + '</ul>' +
      '</div></div>';
  }).join('');

  /* ---------- 12. Equipe e riscos ---------- */
  $('#equipe-tbody').innerHTML = INV.equipe.map((e) =>
    '<tr><td><b>' + esc(e.perfil) + '</b></td><td>' + esc(e.papel) + '</td><td>' + esc(e.status) + '</td></tr>').join('');
  $('#riscos-tbody').innerHTML = INV.riscos.map((r) =>
    '<tr><td><b>' + esc(r.risco) + '</b></td><td>' + esc(r.prob) + '</td><td>' + esc(r.mitig) + '</td></tr>').join('');

  /* ---------- 14. FAQ ---------- */
  const faqProduto = [
    { p: 'Preciso de internet para usar?', r: 'Não. O PastorHub é offline-first: todas as funcionalidades funcionam sem conexão e os dados ficam salvos no dispositivo. Quando a internet volta, a fila de alterações é sincronizada automaticamente.' },
    { p: 'A IA substitui o pregador?', r: 'De forma alguma. O app atua como um assistente de estudo (o Caderno). O pastor sempre refina, decide e prega o sermão — a chave da OpenAI nunca chega ao aplicativo.' },
    { p: 'Como funciona o aconselhamento com IA?', r: 'Na sessão do Google Meet, o app transcreve o áudio em tempo real, analisa o tom emocional, identifica os picos de intensidade e gera ao final um relatório confidencial exclusivo do pastor — base do histórico de cuidado entre os encontros.' },
    { p: 'Como o WhatsApp entra na rotina?', r: 'A plataforma envia lembretes automáticos para membros agendados. Quando o membro responde, o status do atendimento é atualizado no app — sem o pastor enviar recado um a um.' },
    { p: 'Como exporto o sermão?', r: 'No menu do card do sermão: "Exportar PDF" (abre a tela de impressão do navegador, em A4 profissional) e "Baixar TXT" (arquivo de texto puro). Também é possível copiar e compartilhar com um toque.' }
  ];
  $('#faq-produto').innerHTML = faqProduto.map((f) =>
    '<details><summary>' + esc(f.p) + '</summary><p>' + esc(f.r) + '</p></details>').join('');
  $('#faq-investidor').innerHTML = INV.faqInvestidor.map((f) =>
    '<details><summary>' + esc(f.p) + '</summary><p>' + esc(f.r) + '</p></details>').join('');

  /* ---------- Documentos ---------- */
  $('#docs-grid').innerHTML = INV.documentos.map((d) =>
    '<a class="doc-card" href="' + d.link + '">' +
      '<span class="doc-icon">' + (window.SiteIcons ? SiteIcons.svg(d.icone) : '') + '</span>' +
      '<h3>' + esc(d.nome) + '</h3>' +
      '<p>' + esc(d.desc) + '</p>' +
      '<div class="doc-foot"><span>' + esc(d.tipo) + '</span><b>' + esc(d.tamanho) + '</b></div>' +
      '<span class="v-link">Abrir documento →</span>' +
    '</a>').join('');

  /* ---------- Próximos passos ---------- */
  $('#passos-grid').innerHTML = INV.proximosPassos.map((p, i) =>
    '<div class="passo"><span class="passo-num">' + (i + 1) + '</span>' +
      '<h3>' + esc(p.etapa) + '</h3><span class="passo-prazo">' + esc(p.prazo) + '</span></div>').join('');

  /* ---------- Rodapé e CTA ---------- */
  const footerDesc = $('#footer-desc');
  if (footerDesc) footerDesc.textContent = INV.produto.descricao;
  const footerContato = $('#footer-contato');
  if (footerContato) footerContato.textContent = INV.produto.contato;
  const ctaContato = $('#cta-contato');
  if (ctaContato) ctaContato.textContent = INV.produto.contato;

  /* ---------- Reveal ---------- */
  const revealables = document.querySelectorAll('.feature, .step, .plan, .version-card, .int-card, .testimonials blockquote, .market-card, .tam-card, .gtm-card, .doc-card, .passo, .problem-card, .tl-card');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealables.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .45s ease ' + (i % 3) * 55 + 'ms, transform .45s ease ' + (i % 3) * 55 + 'ms';
      io.observe(el);
    });
  }
})();
