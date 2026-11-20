/* ============================================================
   Dados da Proposta de Investimento PastorHub v2.0
   Compartilhados entre o site institucional e o painel admin
   ============================================================ */
(function () {
  window.INVESTIDOR = {
    produto: {
      nome: 'PastorHub',
      subtitulo: 'O Caderno Digital do Pastor Brasileiro',
      descricao:
        'Plataforma móvel com Inteligência Artificial para preparação de sermões, tele-aconselhamento (Google Meet) e WhatsApp, agenda pastoral, atendimentos e rotina ministerial.',
      rodada: 'Rodada Semente (Seed)',
      captacao: 50000,
      tranche: 15000,
      estagio: 'Produto 100% funcional (Aplicativo instalável)',
      mercado: '150 a 200 mil pastores e mais de 400 mil templos evangélicos no Brasil',
      modelo: 'SaaS freemium: plano gratuito + Pro (R$ 49,90/mês) + Igreja (R$ 149,90/mês)',
      diferenciais: 'IA em português, análise de sentimentos, funciona offline, foco total no pastor individual',
      local: 'Brasília · Novembro de 2026',
      versao: 'Versão 2.0 — Documento Confidencial',
      contato: 'Rogério Assunção · fourcolors.dev@outlook.com.br · 86 989 038050',
    },

    /* ---------- 2. O problema ---------- */
    problema: {
      horas: '8 a 15 horas de preparação por sermão',
      frequencia: '1 a 3 sermões por semana',
      alternativas: [
        { atual: 'Caderno físico / Word', limitacao: 'Nada indexável; sem busca, sem histórico de pregações, sem backup' },
        { atual: 'Sistemas estrangeiros', limitacao: 'Custo alto (US$ 10–50/mês), sem vocabulário cultural pastoral brasileiro' },
        { atual: 'IA genérica (chatbots)', limitacao: 'Não guardam a biblioteca do pastor, não controlam status/data de pregação, não geram PDF pronto' },
        { atual: 'Gestão de igrejas', limitacao: 'Focados em tesouraria/membros; ignoram o trabalho individual do pastor' },
      ],
      conclusao:
        'O pastor não busca "software", busca tempo de volta. O PastorHub transforma essa rotina de horas em minutos — mantendo o pastor no controle teológico da mensagem.',
    },

    /* ---------- 3. A solução ---------- */
    modulos: [
      { nome: 'Caderno do Pastor', icone: '📖', novo: false, desc: 'Sermões com IA (5 tipos, 6 tons), biblioteca com estatísticas, busca, filtros, tags automáticas, editor em 3 abas, histórico de pregação, exportação PDF/TXT.', itens: ['5 tipos de sermão', '6 tons pastorais', 'Estrutura profissional automática', 'Tags #fé #santidade #amor'] },
      { nome: 'Aconselhamento Digital com IA', icone: '🩺', novo: true, desc: 'Tele-aconselhamento via Google Meet com transcrição em tempo real, análise de sentimentos, mapeamento de picos emocionais e relatório confidencial automático.', itens: ['Transcrição automática', 'Análise de sentimentos', 'Mapeamento de angústias', 'Relatório confidencial'] },
      { nome: 'Agenda e Atendimentos', icone: '📅', novo: false, desc: 'Agenda de compromissos, cadastro de atendimentos (aconselhamento, visitação, oração, discipulado), filtros entre agendados e concluídos e alertas da igreja.', itens: ['Agenda de hoje e semana', 'Fichas de atendimento', 'Agenda via WhatsApp', 'Alertas automáticos'] },
      { nome: 'Lembretes via WhatsApp', icone: '💬', novo: true, desc: 'Envio automático de lembretes e confirmações de presença via API do WhatsApp para membros agendados, com atualização de status em tempo real.', itens: ['Confirmação automática', 'Menos faltas', 'Zero digitação', 'Respostas no app'] },
      { nome: 'Base de Conhecimento Inteligente', icone: '🧠', novo: true, desc: 'Upload de documentos e imagens para treinar os assistentes: extração de texto, reconhecimento de texto em português, índice de busca e respostas com fontes citadas.', itens: ['Reconhecimento de texto em PDFs digitalizados (pt-BR)', 'Índice de trechos por seção', 'Assistentes por área do ministério', 'Fontes citadas em cada resposta'] },
      { nome: 'Assistente de estudo (IA)', icone: '🤖', novo: true, desc: 'Chat com a base de conhecimento no app e no painel, com LLMs gratuitos (Llama, Gemini) e pagos (GPT, Claude). Sem chave, responde em modo extrativo.', itens: ['Llama 3 via Groq/OpenRouter/Ollama', 'Gemini, Mistral e Hugging Face', 'GPT-4o e Claude nos planos pagos', 'Modo extrativo sem chave'] },
      { nome: 'Versículos diários', icone: '📖', novo: true, desc: 'Envio automático de um versículo por dia, no horário configurado, com card no app (mobile, tablet e desktop), notificação e canal WhatsApp. O administrador escolhe hora, canais e o banco de versículos.', itens: ['Horário configurável no painel', 'Card "Versículo do dia" no app', 'Banco editável por referência e versão', 'Histórico de envios por canal'] },
      { nome: 'Planos & Assinaturas', icone: '💳', novo: true, desc: 'Gestão do modelo de negócio no painel: planos Offline, Premium (Pro) e Igreja com preços, limites e recursos editáveis, assinaturas por usuário, faturamento, faturas e controle de assentos por igreja.', itens: ['Preços e limites editáveis', 'Ciclo mensal ou anual', 'Faturas e cobrança por usuário', 'Assentos do plano Igreja', 'Faturamento recorrente automático', 'Gateways: Mercado Pago, Pagar.me, Stripe, PagSeguro, Asaas', 'Pix recorrente com QR Code', 'Bloqueio por pendência financeira'] },
      { nome: 'Recursos Pastorais', icone: '📚', novo: false, desc: 'Biblioteca com palestras geradas por IA e vídeos de MASTER para aconselhamento, família, juventude e espiritualidade.', itens: ['Palestras por tema', 'Vídeos categorizados', 'Gerador de palestras'] },
      { nome: 'Segurança e Funcionamento Offline', icone: '🔒', novo: false, desc: 'Fila de sincronização inteligente, segurança de dados no banco, chaves de IA apenas no servidor e conformidade com a lei de proteção de dados com portabilidade de dados.', itens: ['Fila de sincronização', 'Segurança por usuário', 'Chave fora do app', 'Proteção de dados'] },
    ],

    /* ---------- 5. Tecnologia ---------- */
    tecnologia: {
      atual: [
        { nome: 'Front-end', desc: 'React 18 + TypeScript 5 + Tailwind CSS 4, mobile-first, com loading states, empty states e toasts' },
        { nome: 'Banco de Dados Seguro', desc: 'Banco de dados relacional, autenticação (e-mail/senha e Google), segurança de privacidade e servidor de processamento para ocultar as chaves de IA' },
        { nome: 'Inteligência Artificial', desc: 'IA avançada (ou versão econômica conforme custo), chamada exclusivamente no servidor' },
        { nome: 'Exportação', desc: 'PDF profissional via impressão, TXT, copiar e compartilhar nativo' },
        { nome: 'Offline-first', desc: 'Persistência local (localStorage) + fila de sincronização automática quando online' },
        { nome: 'Base de Conhecimento Inteligente', desc: 'Upload de documentos e imagens; extração de texto, reconhecimento de texto em português e índice de busca no navegador' },
        { nome: 'LLMs', desc: 'Provedores gratuitos (Groq e OpenRouter · Llama, Gemini, Mistral, Hugging Face, Ollama local) e pagos (OpenAI, Anthropic, Together), com teste real de conexão e chaves no dispositivo' },
      ],
      maturidade: [
        { item: 'Interface completa (5 módulos)', status: 'Concluído' },
        { item: 'Autenticação (e-mail + Google)', status: 'Concluído' },
        { item: 'Gerador de sermões com IA (chave no servidor)', status: 'Concluído' },
        { item: 'Editor e biblioteca com estatísticas, busca, filtros e tags', status: 'Concluído' },
        { item: 'Sincronização offline-first', status: 'Concluído' },
        { item: 'Exportação PDF/TXT e histórico de pregação', status: 'Concluído' },
        { item: 'Documentação técnica e manual do usuário', status: 'Concluída (3.000+ linhas)' },
        { item: 'Arquitetura de migração (Tecnologia de ponta)', status: 'Concluída (planejada em detalhe)' },
        { item: 'Ecossistema de IA: integrações com chaves e teste de conexão', status: 'Concluído' },
        { item: 'Reconhecimento de texto para PDFs digitalizados e imagens', status: 'Concluído' },
        { item: 'Busca inteligente com assistentes e fontes citadas', status: 'Concluído' },
      ],
      migracao: [
        { nome: 'Servidor de Aplicação', desc: 'Tecnologia de servidor de alta performance, tipagem forte e documentação automática; liberdade para trocar modelos de IA (Claude, Gemini) sem refazer telas.' },
        { nome: 'Interface Moderna', desc: 'Tecnologia de interface de altíssima performance para ferramentas de edição rica e painéis do usuário.' },
      ],
      porqueMigrar:
        'Os módulos Meet AI e WhatsApp exigem processamento contínuo — áudio, mensagens assíncronas e integrações em tempo real — que o servidor próprio gerencia de forma nativa e econômica. Enquanto isso, o produto em banco de dados entra no ar imediatamente.',
      volumes: { codigo: '3.500+ linhas de código', doc: '3.000+ linhas de documentação técnica e de usuário' },
    },

    /* ---------- 6. Mercado ---------- */
    mercado: {
      dados: [
        { n: '60–65 mi', d: 'População evangélica no Brasil (~30% da população, segundo projeções baseadas no Censo)' },
        { n: '400 mil+', d: 'Templos evangélicos — cada um com ao menos um líder pregador' },
        { n: '150–200 mil', d: 'Pastores e pregadores — público de alta fidelidade que demanda ferramentas de nicho' },
        { n: 'Lusofonia', d: 'Portugal e países africanos lusófonos compartilham o mesmo vocabulário pastoral, com zero fricção de produto' },
      ],
      tam: { rotulo: 'TAM (ampliado)', def: 'Pastores e pregadores lusófonos com smartphone', valor: 'R$ 75+ milhões/ano' },
      sam: { rotulo: 'SAM (servível)', def: 'Pastores brasileiros que usam apps ministeriais', valor: 'R$ 15–20 milhões/ano' },
      som: { rotulo: 'SOM (3 anos)', def: '7.000 assinaturas ativas na plataforma', valor: 'R$ 1,7 milhão/ano' },
      insight:
        'Pastores são usuários de altíssima fidelidade — a biblioteca de sermões é um ativo permanente e pessoal (média de 50+ sermões). Uma vez construída, a troca de ferramenta custa caro: churn estruturalmente baixo.',
    },

    /* ---------- 7. Modelo de negócio ---------- */
    planos: [
      { nome: 'Gratuito', preco: 'R$ 0', periodo: '/mês', anual: '0', itens: ['5 gerações de IA por mês', 'Offline completo', 'Biblioteca básica', 'Exportação PDF/TXT'], destaque: false },
      { nome: 'Pastor Pro', preco: 'R$ 49,90', periodo: '/mês', anual: '598,80', itens: ['IA ilimitada (fair-use)', 'Meet AI com relatórios', 'Histórico completo de pregações', 'Nuvem multi-dispositivo', 'Exportação Word'], destaque: true },
      { nome: 'Igreja', preco: 'R$ 149,90', periodo: '/mês · até 10 pastores', anual: '1.499', itens: ['Tudo do Pro para cada pastor', 'Painel de liderança e relatórios', 'WhatsApp automático'], destaque: false },
    ],
    receitasFuturas: [
      'Marketplace de esboços e séries de sermões colaborativas entre pastores',
      'Licenças white label para denominações e convenções',
      'Parcerias educacionais com seminários teológicos',
    ],
    unitEconomics: [
      { item: 'Geração de 1 sermão (GPT-4o-mini)', valor: 'inferior a R$ 0,05' },
      { item: 'Geração de 1 sermão (GPT-4, qualidade máxima)', valor: '≈ R$ 0,30' },
      { item: 'Infraestrutura base (cloud + front-end)', valor: '≈ R$ 150–400/mês para milhares de usuários' },
      { item: 'Margem bruta projetada por assento pagante', valor: 'acima de 85%' },
      { item: 'CAC estimado (tráfego pago)', valor: 'R$ 60–90' },
      { item: 'Payback de CAC', valor: '2–3 meses' },
    ],

    /* ---------- 8. Go-to-market ---------- */
    gtm: [
      { nome: 'Parcerias denominacionais', desc: 'Pacotes corporativos (plano Igreja) com convenções e redes denominacionais — vantagem de custo total para a congregação inteira.' },
      { nome: 'Seminários teológicos', desc: 'Inclusão de licenças nos currículos — os alunos formam hábito digital no início da carreira.' },
      { nome: 'Inbound marketing', desc: 'SEO em buscas de alta intenção ("esboço de sermão sobre...") e conteúdo pastoral em grupos de WhatsApp/Telegram.' },
      { nome: 'Canais de embaixadores', desc: 'Pastores influentes no meio cristão digital recebem acesso premium em troca de depoimentos e indicação entre pares.' },
      { nome: 'Tráfego pago focado', desc: 'Performance em buscas de alta intenção, com CAC estimado de R$ 60–90 e payback em 2–3 meses.' },
    ],

    /* ---------- 9. Concorrência ---------- */
    concorrencia: [
      { alt: 'Editores de texto/notas genéricos (Notion, Evernote, Word)', lacuna: 'Nada de IA pastoral, status de pregação ou estrutura de esboço teológico' },
      { alt: 'Sistemas estrangeiros (em inglês)', lacuna: 'Sem português nativo, custo mensal alto, sem gestão pessoal' },
      { alt: 'IA genérica (chatbots)', lacuna: 'Não persistem a biblioteca, não criam histórico, não exportam, sem modo offline' },
      { alt: 'Gestão de igreja tradicional', lacuna: 'Foco em tesouraria/membros do templo, não na vida de estudo do pastor' },
    ],
    diferenciais: [
      'Estruturação teológica nativa, em português brasileiro, com vocabulário e contexto pastoral correto.',
      'Mobile-first de verdade: pensada para o ônibus, o sofá e o corredor da igreja.',
      'Offline-first: funciona sem internet — requisito crítico das rotinas reais do ministério.',
      'Foco B2P (business-to-pastor): no pastor individual e seu ofício, não no balanço do templo.',
      'Preço acessível em moeda local, com custo 10× menor que plataformas internacionais.',
    ],
    moat:
      'A união de funcionamento offline, IA pastoral e Meet/WhatsApp cria uma vantagem difícil de replicar: quem introduzir os relatórios de aconselhamento e o controle da agenda via WhatsApp antes dos concorrentes trava a conta do pastor por custo de troca imenso.',

    /* ---------- 10. Plano financeiro ---------- */
    financeiro: {
      linhas: [
        { indicador: 'Usuários registrados', ano1: '8.000', ano2: '30.000', ano3: '75.000' },
        { indicador: 'Assentos pagantes', ano1: '600', ano2: '2.700', ano3: '7.000' },
        { indicador: 'Receita anual', ano1: 'R$ 140 mil', ano2: 'R$ 650 mil', ano3: 'R$ 1,7 milhão' },
        { indicador: 'Ticket médio anual (blended)', ano1: '≈ R$ 240', ano2: '≈ R$ 240', ano3: '≈ R$ 240–260' },
        { indicador: 'Ponto de equilíbrio', ano1: '—', ano2: '≈ 2.400 pagantes', ano3: 'Superado' },
      ],
      premissas: [
        'Conversão gratuito → pago de 5% no Ano 1, chegando a 8–9% no Ano 2',
        'Churn anual de 15–18% (baixo pelo lock-in do arquivo de sermões pessoais e da agenda)',
        'Ticket blended médio de R$ 240 por assento',
        'Custo de IA marginal abaixo de 5% da receita',
        'Campanha de R$ 1,7 milhão de ARR projetada no Ano 3',
      ],
      uso: [
        { fase: 'Tranche 1 (imediata)', valor: 'R$ 15.000', itens: [
          { nome: 'Engenharia e setup do servidor', v: 'R$ 7.500', obj: 'Suportar primeiros usuários pagantes e tokens de IA' },
          { nome: 'IA em produção: chaves, reconhecimento de texto e assistentes', v: 'R$ 4.000', obj: 'Base de conhecimento e assistente no ar' },
          { nome: 'Marketing de aquisição (Ads/SEO)', v: 'R$ 2.500', obj: 'Validar o CAC inicial' },
          { nome: 'Infra/Cloud/Jurídico inicial', v: 'R$ 1.000', obj: 'Servidores e Termos de Uso' },
        ] },
        { fase: 'Tranche 2 (crescimento)', valor: 'R$ 35.000', itens: [
          { nome: 'Meet AI e WhatsApp', v: 'R$ 12.000', obj: 'Análise de sentimentos e API WhatsApp' },
          { nome: 'Tração comercial escalonada', v: 'R$ 14.000', obj: 'Parcerias e tráfego pago agressivo' },
          { nome: 'Evolução da busca inteligente e novos assistentes', v: 'R$ 6.000', obj: 'Busca semântica e mais áreas do ministério' },
          { nome: 'Conformidade LGPD e auditoria', v: 'R$ 3.000', obj: 'Blindar dados sensíveis de aconselhamento religioso' },
        ] },
      ],
      condicoes: [
        { cond: 'Valor da captação', termo: 'R$ 50.000 total (Tranche 1: R$ 15.000 · Tranche 2: R$ 35.000)' },
        { cond: 'Instrumento', termo: 'Mútuo Conversível ou SAFE' },
        { cond: 'Conversão', termo: 'Na primeira grande rodada (Série A), com desconto pactuado' },
        { cond: 'Liberação', termo: 'Tranches condicionadas a marcos: T1 destrava os gargalos técnicos; T2 financia o motor de vendas' },
        { cond: 'Governança', termo: 'Relatórios trimestrais ao investidor; sem assento de conselho nesta etapa' },
      ],
      logicaTranches:
        'Os R$ 15.000 iniciais destravam hoje os gargalos (servidor de aplicação, IA em produção com reconhecimento de texto e busca inteligente, lançamento). Os R$ 35.000 subsequentes financiam o motor de vendas — sem diluição desnecessária precoce do fundador.',
    },

    /* ---------- 11. Roadmap ---------- */
    roadmap: [
      { versao: 'v1.0 — MVP atual', prazo: 'Concluído', status: 'done', entregas: ['Interface de 5 módulos', 'IA de sermões', 'Offline-first', 'PDF/TXT', 'Histórico de pregações'] },
      { versao: 'v1.5', prazo: '3–6 meses (Parcela 1)', status: 'wip', entregas: ['Migração para tecnologia de ponta', 'IA em produção contínua', 'Temas claro/escuro', 'Aplicativo instalável'] },
      { versao: 'v2.0', prazo: '6–12 meses (Parcela 2)', status: 'next', entregas: ['Aconselhamento Meet AI (transcrição + análise de sentimentos)', 'Bot de agenda via API WhatsApp', 'Compartilhamento entre pastores', 'Base de conhecimento com reconhecimento de texto', 'Assistente de estudo no app'] },
    ],

    /* ---------- 12. Equipe ---------- */
    equipe: [
      { perfil: 'Fundador técnico', papel: 'Produto, engenharia, arquitetura de IA', status: 'Fundador — a completar' },
      { perfil: 'Advisory teológico', papel: 'Teologia e curadoria homilética', status: 'Em prospecção' },
      { perfil: 'Liderança comercial', papel: 'Growth setorial', status: 'Pós-investimento' },
    ],

    /* ---------- 13. Riscos ---------- */
    riscos: [
      { risco: 'Dependência da IA (custo/disponibilidade)', prob: 'Média', mitig: 'A arquitetura do servidor próprio permite troca fácil por modelos alternativos (Claude, Gemini)' },
      { risco: 'Conteúdo teológico impreciso (IA)', prob: 'Média', mitig: 'IA firmada via system prompts fechados e interface que obriga a revisão pelo pastor' },
      { risco: 'Dados sensíveis (Meet AI)', prob: 'Baixa', mitig: 'Relatórios anonimizados e encriptados na nuvem, em acordo com a LGPD (dado de saúde/crença)' },
      { risco: 'Grande player entra no nicho', prob: 'Baixa–Média', mitig: 'Velocidade de execução, comunidade de pastores e vantagem competitiva Meet/WhatsApp' },
      { risco: 'Adoção por pastores menos digitais', prob: 'Média', mitig: 'Modo offline sem cadastro, manual em português, onboarding assistido e suporte por WhatsApp' },
      { risco: 'Queda de uso fora da preparação semanal', prob: 'Baixa', mitig: 'Agenda, atendimentos, lembretes WhatsApp e Meet AI sustentam uso diário' },
    ],

    /* ---------- 14. FAQ investidor ---------- */
    faqInvestidor: [
      { p: 'A Inteligência Artificial substituirá o pregador?', r: 'Não. O app atua como um assistente de estudo. O pastor sempre refina, decide e prega o sermão.' },
      { p: 'É defensável?', r: 'Sim. O histórico do pastor, o controle da agenda e o registro dos casos de aconselhamento criam grandes dificuldades de substituição.' },
      { p: 'Quais os próximos marcos mensuráveis?', r: 'Lançamento público e uso da IA em produção · Integração Meet AI + WhatsApp · 1.000 assentos pagantes · equilíbrio operacional da enxuta.' },
      { p: 'Como funciona a base de conhecimento?', r: 'O administrador envia arquivos de texto ou documentos. O sistema organiza os trechos e os agentes recuperam as informações mais relevantes para responder às perguntas.' },
      { p: 'Como é feita a cobrança dos planos pagos?', r: 'Faturamento recorrente com Pix (incluindo Pix recorrente), cartão e boleto, por meio de plataformas de pagamento. No dia do vencimento a fatura é gerada automaticamente; havendo pendência após o período de tolerância, o acesso do usuário é bloqueado até a regularização.' },
    ],

    /* ---------- 15. Próximos passos ---------- */
    proximosPassos: [
      { etapa: 'Reunião de apresentação e demonstração ao vivo da stack atual', prazo: 'Semana 1' },
      { etapa: 'Acesso à base de código (repositórios Frontend/Backend) e ao plano de migração', prazo: 'Semana 2' },
      { etapa: 'Term sheet preliminar para liberação da Tranche 1 (R$ 15.000)', prazo: 'Semanas 3–4' },
      { etapa: 'Início imediato do uso dos recursos para configuração da IA em produção', prazo: 'Semana 4' },
    ],

    /* ---------- Ficha técnica ---------- */
    ficha: [
      { attr: 'Nome do produto', spec: 'PastorHub — Caderno do Pastor (v1.0 MVP)' },
      { attr: 'Plataformas', spec: 'Web responsiva / Aplicativo instalável (mobile-first); apps nativos no roadmap' },
      { attr: 'Tecnologia atual', spec: 'Interface moderna · Banco de dados seguro (PostgreSQL/Autenticação/Servidor de processamento) · Inteligência Artificial avançada' },
      { attr: 'Tecnologia futura (migração)', spec: 'Servidor de aplicação Python · Interface moderna com alta performance' },
      { attr: 'Novos módulos planejados', spec: 'Meet AI (transcrição + análise de sentimentos) · Bot de agenda via API WhatsApp' },
      { attr: 'Autenticação', spec: 'E-mail/senha + Google; Segurança por usuário; modo offline sem cadastro' },
      { attr: 'Persistência', spec: 'Nuvem (PostgreSQL) + offline-first com fila de sincronização automática' },
      { attr: 'Uso responsável de IA', spec: 'Chave protegida no servidor, prompts fechados, revisão pastoral obrigatória, LGPD' },
      { attr: 'Base de conhecimento inteligente', spec: 'Upload de documentos e imagens · Leitor de documentos + Reconhecimento de texto (pt-BR) · índice de busca no navegador · fontes citadas' },
      { attr: 'LLMs', spec: 'Groq · OpenRouter · Gemini · Mistral · Hugging Face · Ollama (Llama local) · OpenAI · Anthropic · Together' },
      { attr: 'Exportações', spec: 'PDF (impressão profissional) · TXT · copiar/compartilhar nativo' },
      { attr: 'Domínio de linguagem', spec: 'Exclusivo português brasileiro, com prompts de homilética' },
      { attr: 'Volume construído', spec: '3.500+ linhas de código · 3.000+ linhas de documentação técnica e de usuário' },
      { attr: 'Cores de marca', spec: 'Azul-marinho #002645 · Verde #95C121 · Azul #3261AB' },
    ],

    /* ---------- Documentos para apresentação ---------- */
    documentos: [
      { id: 'proposta', nome: 'Proposta de Investimento', desc: 'Documento completo de 18 páginas: problema, solução, tecnologia, mercado, modelo de negócio, estratégia de captação, finanças, equipe, riscos e Perguntas Frequentes.', tipo: 'PDF · HTML para impressão', icone: 'file-text', link: 'docs/proposta-investimento.html', tamanho: '18 páginas' },
      { id: 'apresentacao', nome: 'Deck de Apresentação', desc: 'Apresentação em slides com narrativa formal: problema, solução, demonstração do funcionalidade, análise de mercado, projeções financeiras e pedido de capitação.', tipo: '12 slides', icone: 'monitor', link: 'docs/apresentacao.html', tamanho: '12 slides' },
      { id: 'biblioteca', nome: 'Biblioteca Digital', desc: 'Nova funcionalidade: plano de ação, roadmap e catálogo interativo de livros teológicos clássicos em domínio público, com busca e filtros por categoria.', tipo: 'Catálogo interativo', icone: '📚', link: 'docs/biblioteca.html', tamanho: '12 obras' },
    ],
  };
})();
