/* ============================================================
   Renderização dos documentos de apresentação a partir
   dos dados da Proposta de Investimento (js/investidor.js)
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);
  const INV = window.INVESTIDOR;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const set = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };
  const setText = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };

  window.Docs = {
    renderProposta() {
      const p = INV.produto;

      setText('#cover-foot', p.local + ' · ' + p.versao + ' · ' + p.contato);
      setText('#legal-foot', p.contato);

      // Sumário
      const sumario = [
        'Resumo Executivo', 'O Problema', 'A Solução — PastorHub “Caderno do Pastor”',
        'Demonstração do Produto (registro do vídeo)', 'Tecnologia e Maturidade do Produto',
        'Mercado e Oportunidade', 'Modelo de Negócio', 'Estratégia de Go-to-Market',
        'Concorrência e Diferencial', 'Plano Financeiro', 'Roadmap do Produto', 'Equipe',
        'Riscos e Mitigações', 'Perguntas Frequentes (FAQ Investidor)', 'Próximos Passos',
        'Anexo — Ficha Técnica do Produto',
      ];
      set('#sumario', sumario.map((s, i) => {
        const id = 'sec-' + (i + 1);
        return '<li><a href="#' + id + '">' + esc(s) + '</a></li>';
      }).join(''));

      // 1. Resumo
      set('#resumo-facts', [
        { v: 'R$ 50 mil', l: 'Captação semente' },
        { v: 'R$ 15 mil', l: 'Tranche prioritária' },
        { v: '85%+', l: 'Margem bruta por assento' },
        { v: '2–3 meses', l: 'Payback de CAC' },
        { v: '7.000', l: 'Assentos alvo no Ano 3' },
      ].map((k) => '<div class="keyfact"><div class="v">' + esc(k.v) + '</div><div class="l">' + esc(k.l) + '</div></div>').join(''));

      set('#resumo-table', [
        ['Produto', p.descricao],
        ['Estágio', p.estagio + ' · documentação técnica e arquitetura de migração concluídas'],
        ['Mercado', p.mercado],
        ['Modelo', p.modelo],
        ['Pedido', p.rodada + ': R$ ' + p.captacao + ' (Tranche 1: R$ ' + p.tranche + ')'],
        ['Diferencial', p.diferenciais],
      ].map((r) => '<tr><td style="width:26%"><b>' + esc(r[0]) + '</b></td><td>' + esc(r[1]) + '</td></tr>').join(''));

      // 2. Problema
      set('#problema-table', INV.problema.alternativas.map((a) =>
        '<tr><td><b>' + esc(a.atual) + '</b></td><td>' + esc(a.limitacao) + '</td></tr>').join(''));

      // 5. Tecnologia
      set('#tecnologia-table', INV.tecnologia.atual.map((t) =>
        '<tr><td><b>' + esc(t.nome) + '</b></td><td>' + esc(t.desc) + '</td></tr>').join(''));
      set('#maturidade-table', INV.tecnologia.maturidade.map((m) =>
        '<tr><td>' + esc(m.item) + '</td><td><b>' + esc(m.status) + '</b></td></tr>').join(''));
      setText('#volumes-text', 'A base de código conta com mais de ' + INV.tecnologia.volumes.codigo.replace('+ ', '') +
        ' organizada em componentes, hooks e serviços, construída para evolução, e ' +
        INV.tecnologia.volumes.doc.replace('+ ', '') + '.');
      set('#migracao-grid', INV.tecnologia.migracao.map((m) =>
        '<div class="mini-card"><h4>' + esc(m.nome) + '</h4><p>' + esc(m.desc) + '</p></div>').join(''));
      setText('#porque-migrar', INV.tecnologia.porqueMigrar);

      // 6. Mercado
      set('#mercado-dados', INV.mercado.dados.map((d) =>
        '<div class="mini-card" style="margin-bottom:10px"><h4>' + esc(d.n) + '</h4><p>' + esc(d.d) + '</p></div>').join(''));
      set('#tam-cards', [INV.mercado.tam, INV.mercado.sam, INV.mercado.som].map((x, i) =>
        '<div class="mini-card" style="margin-bottom:10px;border-left:4px solid ' + ['#002645', '#3261AB', '#95C121'][i] + '">' +
          '<h4>' + esc(x.rotulo) + '</h4><p style="font-size:1.1rem;font-weight:700;color:#002645">' + esc(x.valor) + '</p>' +
          '<p>' + esc(x.def) + '</p></div>').join(''));
      setText('#mercado-insight', INV.mercado.insight);

      // 7. Modelo
      set('#planos-table', INV.planos.map((pl) =>
        '<tr><td><b>' + esc(pl.nome) + '</b></td><td><b>' + esc(pl.preco) + '</b><br><span style="color:#5b6775;font-size:.8rem">' + esc(pl.periodo) + '</span></td>' +
        '<td>' + pl.itens.map((i) => esc(i)).join('<br>') + '</td></tr>').join(''));
      setText('#receitas-futuras', INV.receitasFuturas.join('; ') + '.');
      set('#unit-table', INV.unitEconomics.map((u) =>
        '<tr><td>' + esc(u.item) + '</td><td><b>' + esc(u.valor) + '</b></td></tr>').join(''));

      // 8. GTM
      set('#gtm-grid', INV.gtm.map((g) =>
        '<div class="mini-card"><h4>' + esc(g.nome) + '</h4><p>' + esc(g.desc) + '</p></div>').join(''));

      // 9. Concorrência
      set('#concorrencia-table', INV.concorrencia.map((c) =>
        '<tr><td><b>' + esc(c.alt) + '</b></td><td>' + esc(c.lacuna) + '</td></tr>').join(''));
      set('#diferenciais-list', INV.diferenciais.map((d) => '<li>' + esc(d) + '</li>').join(''));
      setText('#moat-text', INV.moat);

      // 10. Financeiro
      set('#financeiro-table', INV.financeiro.linhas.map((l) =>
        '<tr><td><b>' + esc(l.indicador) + '</b></td><td class="num">' + esc(l.ano1) + '</td><td class="num">' + esc(l.ano2) + '</td><td class="num">' + esc(l.ano3) + '</td></tr>').join(''));

      const receita = [
        { ano: 'Ano 1', v: 140, rot: 'R$ 140 mil', cor: '#002645' },
        { ano: 'Ano 2', v: 650, rot: 'R$ 650 mil', cor: '#3261AB' },
        { ano: 'Ano 3', v: 1700, rot: 'R$ 1,7 mi', cor: '#95C121' },
      ];
      set('#financeiro-chart',
        '<div class="bars">' + receita.map((r) =>
          '<div class="b"><span class="val">' + esc(r.rot) + '</span>' +
          '<div class="col" style="height:' + ((r.v / 1700) * 100) + '%;background:' + r.cor + '"></div>' +
          '<span class="lbl">' + esc(r.ano) + '</span></div>').join('') + '</div>');

      set('#premissas-list', INV.financeiro.premissas.map((x) => '<li>' + esc(x) + '</li>').join(''));

      const usoRows = [];
      INV.financeiro.uso.forEach((t) => {
        usoRows.push('<tr><td><b>' + esc(t.fase) + '</b></td><td class="num"><b>' + esc(t.valor) + '</b></td><td>—</td></tr>');
        t.itens.forEach((i) => {
          usoRows.push('<tr><td>&nbsp;&nbsp;↳ ' + esc(i.nome) + '</td><td class="num">' + esc(i.v) + '</td><td>' + esc(i.obj) + '</td></tr>');
        });
      });
      usoRows.push('<tr><td><b>Total</b></td><td class="num"><b>R$ ' + p.captacao + '</b></td><td>Runway até o ponto de equilíbrio da operação enxuta inicial</td></tr>');
      set('#uso-table', usoRows.join(''));

      set('#condicoes-table', INV.financeiro.condicoes.map((c) =>
        '<tr><td><b>' + esc(c.cond) + '</b></td><td>' + esc(c.termo) + '</td></tr>').join(''));
      setText('#logica-tranches', INV.financeiro.logicaTranches);

      // 11. Roadmap
      set('#roadmap-table', INV.roadmap.map((r) =>
        '<tr><td><b>' + esc(r.versao) + '</b></td><td>' + esc(r.prazo) + '</td><td>' + r.entregas.map(esc).join('<br>') + '</td></tr>').join(''));

      const stMap = { done: 'done', wip: 'wip', next: 'next' };
      set('#roadmap-timeline', INV.roadmap.map((r) =>
        '<div class="tl-item ' + stMap[r.status] + '"><div class="tl-card"><div class="h"><b>' + esc(r.versao) + '</b>' +
          '<span style="font-size:.8rem;color:#5b6775">' + esc(r.prazo) + '</span></div>' +
          '<ul>' + r.entregas.map((e) => '<li>' + esc(e) + '</li>').join('') + '</ul></div></div>').join(''));

      // 12. Equipe
      set('#equipe-table', INV.equipe.map((e) =>
        '<tr><td><b>' + esc(e.perfil) + '</b></td><td>' + esc(e.papel) + '</td><td>' + esc(e.status) + '</td></tr>').join(''));

      // 13. Riscos
      set('#riscos-table', INV.riscos.map((r) =>
        '<tr><td><b>' + esc(r.risco) + '</b></td><td>' + esc(r.prob) + '</td><td>' + esc(r.mitig) + '</td></tr>').join(''));

      // 14. FAQ
      set('#faq-investidor', INV.faqInvestidor.map((f) =>
        '<div class="mini-card" style="margin-bottom:12px"><h4>' + esc(f.p) + '</h4><p>' + esc(f.r) + '</p></div>').join(''));

      // 15. Próximos passos
      set('#passos-table', INV.proximosPassos.map((x) =>
        '<tr><td>' + esc(x.etapa) + '</td><td><b>' + esc(x.prazo) + '</b></td></tr>').join(''));
      setText('#convite', ' Convidamos você a investir na digitalização do ministério pastoral brasileiro — um mercado fiel, ' +
        'inexplorado e pronto para o seu primeiro player líder. Fica o convite para agendarmos a conversa: ' + p.contato + '.');

      // Anexo
      set('#ficha-table', INV.ficha.map((f) =>
        '<tr><td><b>' + esc(f.attr) + '</b></td><td>' + esc(f.spec) + '</td></tr>').join(''));
    },

    /* ---------- Ficha técnica ---------- */
    renderFicha() {
      set('#ficha-table', INV.ficha.map((f) =>
        '<tr><td style="width:32%"><b>' + esc(f.attr) + '</b></td><td>' + esc(f.spec) + '</td></tr>').join(''));

      set('#stack-grid', [
        { t: 'Front-end atual', d: INV.tecnologia.atual[0].desc },
        { t: 'Back-end atual', d: INV.tecnologia.atual[1].desc },
        { t: 'IA', d: INV.tecnologia.atual[2].desc },
        { t: 'Exportação', d: INV.tecnologia.atual[3].desc },
        { t: 'Offline-first', d: INV.tecnologia.atual[4].desc },
        { t: 'Stack futura', d: INV.tecnologia.migracao.map((m) => m.nome + ': ' + m.desc).join(' ') },
      ].map((c) => '<div class="mini-card"><h4>' + esc(c.t) + '</h4><p>' + esc(c.d) + '</p></div>').join(''));

      setText('#porque-migrar', INV.tecnologia.porqueMigrar);

      set('#modulos-doc', INV.modulos.map((m) =>
        '<div class="mini-card"><h4>' + m.icone + ' ' + esc(m.nome) + (m.novo ? ' <span class="new-tag">Novo</span>' : '') + '</h4>' +
        '<p>' + esc(m.desc) + '</p><ul>' + m.itens.map((i) => '<li>' + esc(i) + '</li>').join('') + '</ul></div>').join(''));

      set('#maturidade-doc', INV.tecnologia.maturidade.map((m) =>
        '<tr><td>' + esc(m.item) + '</td><td><b>' + esc(m.status) + '</b></td></tr>').join(''));

      set('#fluxo-doc', [
        { t: '1 · Autenticação', d: 'E-mail/senha ou Google OAuth via Supabase Auth. RLS por usuário no PostgreSQL — nenhum pastor enxerga dados de outro.' },
        { t: '2 · Offline-first', d: 'Todo dado é persistido localmente (localStorage) e enfileirado. O app funciona integralmente sem internet.' },
        { t: '3 · Fila de sincronização', d: 'Cada criação/edição/exclusão entra na fila pastorhub_sync_queue e é enviada quando a conexão volta.' },
        { t: '4 · IA no servidor', d: 'Edge Function chama o OpenAI GPT-4 com a chave protegida no servidor; o app recebe apenas o conteúdo gerado.' },
        { t: '5 · Exportação', d: 'PDF (impressão profissional), TXT (download), copiar e compartilhar nativo do dispositivo.' },
        { t: '6 · Alertas', d: 'Push e e-mail disparados por eventos da agenda e dos atendimentos, com preferências por canal.' },
      ].map((f) => '<div class="mini-card"><h4>' + esc(f.t) + '</h4><p>' + esc(f.d) + '</p></div>').join(''));
    },

    /* ---------- Roadmap ---------- */
    renderRoadmap() {
      const stMap = { done: 'done', wip: 'wip', next: 'next' };
      const labels = { done: 'Concluído', wip: 'Em andamento', next: 'Planejado' };

      set('#roadmap-cards', INV.roadmap.map((r) =>
        '<div class="mini-card" style="border-top:4px solid ' + (r.status === 'done' ? '#95C121' : r.status === 'wip' ? '#f59e0b' : '#3261AB') + '">' +
          '<h4>' + esc(r.versao) + '</h4>' +
          '<p style="color:#95C121;font-weight:700;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">' + esc(r.prazo) + ' · ' + labels[r.status] + '</p>' +
          '<ul>' + r.entregas.map((e) => '<li>' + esc(e) + '</li>').join('') + '</ul></div>').join(''));

      set('#roadmap-timeline-doc', INV.roadmap.map((r) =>
        '<div class="tl-item ' + stMap[r.status] + '"><div class="tl-card"><div class="h"><b>' + esc(r.versao) + '</b>' +
          '<span style="font-size:.82rem;color:#5b6775">' + esc(r.prazo) + '</span></div>' +
          '<ul>' + r.entregas.map((e) => '<li>' + esc(e) + '</li>').join('') + '</ul></div></div>').join(''));

      set('#marcos-doc', [
        { v: 'Semana 1', l: 'Reunião de apresentação e demonstração ao vivo da stack atual' },
        { v: 'Semana 2', l: 'Acesso à base de código (repositórios Frontend/Backend) e ao plano de migração' },
        { v: 'Semanas 3–4', l: 'Term sheet preliminar para liberação da Tranche 1 (R$ 15.000)' },
        { v: 'Semana 4', l: 'Início imediato do uso dos recursos para configuração da IA em produção' },
        { v: 'Mês 3', l: 'Migração FastAPI + Vue 3 concluída no ambiente de homologação' },
        { v: 'Mês 6', l: 'IA em produção contínua + temas claro/escuro + PWA instalável (v1.5)' },
        { v: 'Mês 12', l: 'Meet AI + bot de agenda via WhatsApp liberados (v2.0) + 1.000 assentos pagantes' },
      ].map((m) => '<div class="keyfact"><div class="v" style="font-size:1.15rem">' + esc(m.v) + '</div><div class="l">' + esc(m.l) + '</div></div>').join(''));

      set('#riscos-doc', INV.riscos.map((r) =>
        '<tr><td><b>' + esc(r.risco) + '</b></td><td>' + esc(r.prob) + '</td><td>' + esc(r.mitig) + '</td></tr>').join(''));
    },

    /* ---------- Manual ---------- */
    renderManual() {
      const modulos = [
        {
          t: '1 · Caderno do Pastor (Sermões)',
          ic: '📖',
          passos: [
            ['Abra a aba Sermões', 'Na navegação inferior, toque em <b>Sermões</b>. No topo você vê Total, Pregados, Aguardando e a fila de sincronização.'],
            ['Crie um sermão com IA', 'Toque em <b>“Criar Novo Sermão com IA”</b>. Preencha Texto Bíblico, Tema Central, Tipo e Público (obrigatórios) e opcionalmente título, tom e observações.'],
            ['Gere e revise', 'Toque em <b>“Gerar Sermão”</b>. Em ~2 segundos o conteúdo é criado com introdução, três pontos, aplicação prática e referências. Edite o HTML diretamente na aba <b>Editar</b>.'],
            ['Marque como pregado', 'Na aba <b>Detalhes</b>, ative <b>Status de Pregação</b>, informe data e local. O histórico evita pregação repetida.'],
            ['Exporte', 'No menu do card: <b>Exportar PDF</b> (impressão A4 profissional), <b>Baixar TXT</b>, copiar ou compartilhar.'],
          ],
        },
        {
          t: '2 · Agenda',
          ic: '📅',
          passos: [
            ['Veja o dia', 'A aba <b>Eventos</b> lista os próximos compromissos com tipo, local e status. O botão <b>+ Novo</b> abre a ficha de compromisso.'],
            ['Sincronize calendários', 'Na aba <b>Integrações</b>, conecte Google Calendar, Outlook ou Apple Calendar.'],
            ['Confirme pelo WhatsApp', 'Na aba <b>WhatsApp</b> você envia lembretes; a resposta do membro atualiza o status do atendimento automaticamente.'],
          ],
        },
        {
          t: '3 · Atendimentos',
          ic: '🤝',
          passos: [
            ['Registre', 'Aba <b>Atendimento</b> → <b>+ Novo</b>: nome, data, hora, tipo, modalidade, motivo e observações.'],
            ['Acompanhe', 'Use as tabs <b>Todos / Agendados / Concluídos</b> e a busca para filtrar por nome ou motivo.'],
          ],
        },
        {
          t: '4 · Conselho (Meet AI)',
          ic: '🩺',
          passos: [
            ['Crie a sessão', 'Em <b>Conselho</b>, toque em <b>“Nova Sessão de Aconselhamento”</b>: membro, data, hora, tipo e link do Google Meet.'],
            ['Acompanhe a transcrição', 'Ao iniciar, o áudio é transcrito em tempo real, com os turnos Pastor/Membro e um cronômetro.'],
            ['Leia a análise', 'Ao final, o app mostra o sentimento geral, a distribuição positivo/intenso e os picos emocionais que exigem acompanhamento.'],
            ['Gere o relatório', 'Toque em <b>“Gerar Relatório”</b>: resumo, transcrição integral, análise de sentimentos, orientações pastorais e histórico de cuidado. Exporte em PDF ou TXT.'],
          ],
        },
        {
          t: '5 · Recursos e Alertas',
          ic: '📚',
          passos: [
            ['Biblioteca', 'Na aba <b>Recursos</b>, gere palestras com IA ou adicione vídeos ao catálogo.'],
            ['Alertas', 'Em <b>Alertas</b>, veja avisos por prioridade e ajuste preferências de notificação.'],
          ],
        },
        {
          t: '6 · Assistente de estudo (IA + RAG)',
          ic: '🤖',
          passos: [
            ['Abra o assistente', 'No Início, toque no cartão <b>“Assistente de estudo”</b>. Também há atalhos em Sermões e Conselho.'],
            ['Escolha o agente', 'Homilética (sermões), Aconselhamento (casos e histórico) ou Pastoral Geral (agenda e recursos).'],
            ['Pergunte', 'O agente busca os trechos mais relevantes na base e responde citando as fontes [1], [2].'],
            ['Entenda o modo', 'Com LLM configurado (Llama, Gemini, GPT…), a resposta é gerada por IA. Sem chave, você vê os trechos recuperados — modo extrativo.'],
            ['Base vazia?', 'O administrador envia .md, .pdf e imagens pelo painel (Base de conhecimento). PDFs digitalizados passam por OCR em português.'],
          ],
        },
      ];

      set('#manual-modulos', modulos.map((m) =>
        '<div class="mini-card" style="margin-bottom:14px">' +
          '<h4 style="font-size:1.05rem">' + m.ic + ' ' + esc(m.t) + '</h4>' +
          m.passos.map((p, i) =>
            '<div class="step-block"><div class="num">' + (i + 1) + '</div><div class="c"><h4>' + esc(p[0]) + '</h4><p>' + p[1] + '</p></div></div>').join('') +
        '</div>').join(''));

      set('#manual-modulos-lista', modulos.map((m) =>
        '<div class="mini-card"><h4>' + m.ic + ' ' + esc(m.t) + '</h4><p>' + m.passos.length + ' passos</p></div>').join(''));

      set('#manual-faq', [
        ['Funciona sem internet?', 'Sim. É o princípio offline-first: tudo é salvo localmente e sincronizado quando a conexão voltar.'],
        ['A chave da OpenAI fica no meu celular?', 'Não. Ela fica apenas na Edge Function, no servidor. O app chama o backend.'],
        ['Quem enxerga meus sermões?', 'Apenas você. As políticas de RLS no PostgreSQL isolam os dados por usuário.'],
        ['Posso apagar meus dados?', 'Sim, a qualquer momento, em <b>Configurações → Dados → Limpar Cache</b>, com portabilidade via exportação.'],
      ].map((f) => '<div class="mini-card"><h4>' + esc(f[0]) + '</h4><p>' + f[1] + '</p></div>').join(''));

      set('#manual-planilha', [
        ['Caderno do Pastor', 'Sermões com IA, biblioteca, editor, PDF/TXT, histórico'],
        ['Agenda', 'Compromissos, integrações de calendário, WhatsApp'],
        ['Atendimentos', 'Fichas, status, busca e histórico'],
        ['Conselho (Meet AI)', 'Transcrição, análise de sentimentos, relatório confidencial'],
        ['Recursos', 'Palestras IA, vídeos, categorias'],
        ['Alertas', 'Notificações por prioridade e canal'],
      ].map((r) => '<tr><td><b>' + esc(r[0]) + '</b></td><td>' + esc(r[1]) + '</td></tr>').join(''));
    },
  };
})();
