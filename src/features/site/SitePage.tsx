import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookText,
  ChartLine,
  DollarSign,
  Fingerprint,
  Gauge,
  GitBranch,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Link } from '../../app/router';
import { INVESTIDOR } from './investidor';

/* ============================================================
   Site institucional — portada do site.html + js/investidor.js.
   Dados do produto, problema, solução, mercado, concorrência,
   roadmap e FAQ portados 1:1.
   ============================================================ */

interface ItemTela {
  título: string;
  descrição: string;
  cor: string;
}

const PRODUTO = {
  nome: 'PastorHub',
  subtitulo: 'O Caderno Digital do Pastor Brasileiro',
  descricao:
    'Plataforma móvel com Inteligência Artificial para preparação de sermões, tele-aconselhamento (Google Meet) e WhatsApp, agenda pastoral, atendimentos e rotina ministerial.',
  rodada: 'Rodada Semente (Seed)',
  captacao: 50000,
  tranche: 15000,
  estagio: 'Produto 100% funcional (Aplicativo instalável)',
  mercado: '150 a 200 mil pastores e mais de 400 mil templos evangélicos no Brasil',
  modelo:
    'SaaS freemium: plano gratuito + Pro (R$ 49,90/mês) + Igreja (R$ 149,90/mês)',
  diferenciais:
    'IA em português, análise de sentimentos, funciona offline, foco total no pastor individual',
  local: 'Brasília · Novembro de 2026',
  versao: 'Versão 2.0 — Documento Confidencial',
  contato: 'Rogério Assunção · fourcolors.dev@outlook.com.br · 86 989 038050',
};

const PROBLEMA = {
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
};

const MODULOS = INVESTIDOR.modulos.map((modulo) => ({
  título: modulo.nome,
  descrição: modulo.desc,
  cor: modulo.icone === '🩺' ? '#3261AB' : '#002645',
  itens: modulo.itens,
}));

const TECNOLOGIA_ATUAL = [
  { nome: 'Front-end', descricao: 'React 18 + TypeScript 5 + Tailwind CSS 4, mobile-first, com loading states, empty states e toasts' },
  { nome: 'Banco de Dados Seguro', descricao: 'Banco de dados relacional, autenticação (e-mail/senha e Google), segurança de privacidade e servidor de processamento para ocultar as chaves de IA' },
  { nome: 'Inteligência Artificial', descricao: 'IA avançada, chamada exclusivamente no servidor' },
  { nome: 'Exportação', descricao: 'PDF profissional via impressão, TXT, copiar e compartilhar nativo' },
  { nome: 'Offline-first', descricao: 'Persistência local (localStorage) + fila de sincronização automática quando online' },
  { nome: 'Base de Conhecimento Inteligente', descricao: 'Upload de documentos e imagens; extração de texto, reconhecimento de texto em português e índice de busca no navegador' },
  { nome: 'LLMs', descricao: 'Provedores gratuitos (Groq e OpenRouter · Llama, Gemini, Mistral, Hugging Face, Ollama local) e pagos (OpenAI, Anthropic, Together)' },
];

const ETAPAS = [
  { numero: 1, titulo: 'Estude e gere', texto: 'Referência bíblica, tema, tipo e público-alvo geram um sermão estruturado com introdução, três pontos, aplicação prática e referências.' },
  { numero: 2, titulo: 'Revise e prede', texto: 'Edite o HTML do sermão, marque como pregado com data e local e exporte em PDF profissional pronto para o púlpito.' },
  { numero: 3, titulo: 'Organize a agenda', texto: 'Compromissos, atendimentos e visitações no mesmo lugar — com lembretes automáticos por WhatsApp e confirmação de presença.' },
  { numero: 4, titulo: 'Aconselhe com IA', texto: 'No Google Meet, a transcrição em tempo real identifica o tom emocional e gera um relatório confidencial de acompanhamento.' },
  { numero: 5, titulo: 'Acompanhe o histórico', texto: 'Cada encontro vira histórico de cuidado: o pastor deixa de preparar a semana e passa a ser companheiro diária.' },
];

const VERSOES = [
  { tag: 'Mobile', titulo: 'Celular', texto: 'Interface vertical com navegação inferior, ideal para usar no campo e durante a pastoral.' },
  { tag: 'Tablet', titulo: 'Tablet', texto: 'Navegação horizontal no topo e colunas duplas para estudar e planejar com mais espaço.' },
  { tag: 'Desktop', titulo: 'Computador', texto: 'Menu lateral fixo, grade em duas colunas e painel lateral com agenda, alertas e status do sistema.' },
  { tag: 'Admin', titulo: 'Painel de gestão', texto: 'Investimento, unit economics, Meet AI, WhatsApp, mercado, roadmap, logs e configurações.' },
  { tag: 'Docs', titulo: 'Documentos', texto: 'Proposta de investimento de 18 páginas, deck de apresentação, ficha técnica, manual e roadmap.' },
];

const FINANCEIRO = {
  indicadores: [
    { indicador: 'Usuários registrados', ano1: '8.000', ano2: '30.000', ano3: '75.000' },
    { indicador: 'Assentos pagantes', ano1: '600', ano2: '2.700', ano3: '7.000' },
    { indicador: 'Receita anual', ano1: 'R$ 140 mil', ano2: 'R$ 650 mil', ano3: 'R$ 1,7 milhão' },
    { indicador: 'Ticket médio anual (blended)', ano1: '≈ R$ 240', ano2: '≈ R$ 240', ano3: '≈ R$ 240–260' },
    { indicador: 'Ponto de equilíbrio', ano1: '—', ano2: '≈ 2.400 pagantes', ano3: 'Superado' },
  ],
  series: [8, 30, 75].map((v, i) => ({ ano: `Ano ${i + 1}`, valor: v })),
  premissas: [
    'Conversão gratuito → pago de 5% no Ano 1, chegando a 8–9% no Ano 2',
    'Churn anual de 15–18% (baixo pelo lock-in do arquivo de sermões pessoais e da agenda)',
    'Ticket blended médio de R$ 240 por assento',
    'Custo de IA marginal abaixo de 5% da receita',
    'Campanha de R$ 1,7 milhão de ARR projetada no Ano 3',
  ],
};

const MERCADO = {
  dados: [
    { n: '60–65 mi', d: 'População evangélica no Brasil (~30% da população, segundo projeções baseadas no Censo)' },
    { n: '400 mil+', d: 'Templos evangélicos — cada um com ao menos um líder pregador' },
    { n: '150–200 mil', d: 'Pastores e pregadores — público de alta fidelidade que demanda ferramentas de nicho' },
    { n: 'Lusofonia', d: 'Portugal e países africanos lusófonos compartilham o mesmo vocabulário pastoral, com zero fricção de produto' },
  ],
  insight: 'Pastores são usuários de altíssima fidelidade — a biblioteca de sermões é um ativo permanente e pessoal (média de 50+ sermões). Uma vez construída, a troca de ferramenta custa caro: churn estruturalmente baixo.',
};

const PLANOS = [
  { nome: 'Gratuito', preco: 'R$ 0', periodo: '/mês', anual: '0', itens: ['5 gerações de IA por mês', 'Offline completo', 'Biblioteca básica', 'Exportação PDF/TXT'], destaque: false },
  { nome: 'Pastor Pro', preco: 'R$ 49,90', periodo: '/mês', anual: '598,80', itens: ['IA ilimitada (fair-use)', 'Meet AI com relatórios', 'Histórico completo de pregações', 'Nuvem multi-dispositivo', 'Exportação Word'], destaque: true },
  { nome: 'Igreja', preco: 'R$ 149,90', periodo: '/mês · até 10 pastores', anual: '1.499', itens: ['Tudo do Pro para cada pastor', 'Painel de liderança e relatórios', 'WhatsApp automático'], destaque: false },
];

const UNIT_ECONOMICS = [
  { item: 'Geração de 1 sermão (GPT-4o-mini)', valor: 'inferior a R$ 0,05' },
  { item: 'Geração de 1 sermão (GPT-4, qualidade máxima)', valor: '≈ R$ 0,30' },
  { item: 'Infraestrutura base (cloud + front-end)', valor: '≈ R$ 150–400/mês para milhares de usuários' },
  { item: 'Margem bruta projetada por assento pagante', valor: 'acima de 85%' },
  { item: 'CAC estimado (tráfego pago)', valor: 'R$ 60–90' },
  { item: 'Payback de CAC', valor: '2–3 meses' },
];

const DIFERENCIAIS = [
  'Estruturação teológica nativa, em português brasileiro, com vocabulário e contexto pastoral correto.',
  'Mobile-first de verdade: pensada para o ônibus, o sofá e o corredor da igreja.',
  'Offline-first: funciona sem internet — requisito crítico das rotinas reais do ministério.',
  'Foco B2P (business-to-pastor): no pastor individual e seu ofício, não no balanço do templo.',
  'Preço acessível em moeda local, com custo 10× menor que plataformas internacionais.',
];

const GTM = [
  { nome: 'Parcerias denominacionais', descricao: 'Pacotes corporativos (plano Igreja) com convenções e redes denominacionais — vantagem de custo total para a congregação inteira.' },
  { nome: 'Seminários teológicos', descricao: 'Inclusão de licenças nos currículos — os alunos formam hábito digital no início da carreira.' },
  { nome: 'Inbound marketing', descricao: 'SEO em buscas de alta intenção ("esboço de sermão sobre...") e conteúdo pastoral em grupos de WhatsApp/Telegram.' },
  { nome: 'Canais de embaixadores', descricao: 'Pastores influentes no meio cristão digital recebem acesso premium em troca de depoimentos e indicação entre pares.' },
  { nome: 'Tráfego pago focado', descricao: 'Performance em buscas de alta intenção, com CAC estimado de R$ 60–90 e payback em 2–3 meses.' },
];

const ALTERNATIVAS = [
  { alt: 'Editores de texto/notas genéricos (Notion, Evernote, Word)', lacuna: 'Nada de IA pastoral, status de pregação ou estrutura de esboço teológico' },
  { alt: 'Sistemas estrangeiros (em inglês)', lacuna: 'Sem português nativo, custo mensal alto, sem gestão pessoal' },
  { alt: 'IA genérica (chatbots)', lacuna: 'Não persistem a biblioteca, não criam histórico, não exportam, sem modo offline' },
  { alt: 'Gestão de igreja tradicional', lacuna: 'Foco em tesouraria/membros do templo, não na vida de estudo do pastor' },
];

function Section({ id, title, subtitle, children, classe = '' }: { id: string; title: string; subtitle?: string; children: React.ReactNode; classe?: string }) {
  return (
    <section id={id} className={sectionClass(classe)} data-anchor={id}>
      <div className="container">
        <header className="section-head">
          <span className="eyebrow">{eyebrow(id)}</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

function sectionClass(classe: string): string {
  return ['section', classe].filter(Boolean).join(' ');
}

function eyebrow(id: string): string {
  return (
    {
      investimento: 'Proposta de Investimento',
      financeiro: 'Plano Financeiro',
      problema: 'O Problema',
      solucao: 'A Solução',
      concorrencia: 'Concorrência e Diferencial',
      documentos: 'Documentos',
      faq: 'FAQ',
    }[id] || ''
  );
}

export function SitePage() {
  

  return (
    <div className="pt-4">
      {/* ===== Topo ===== */}
      <header className="site-header">
        <div className="container header-inner">
          <Link to="inicio" aria-label="PastorHub — início" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            </span>
            <span><strong>PastorHub</strong><small>Agenda do Pastor</small></span>
          </Link>

          <nav className="site-nav" aria-label="Menu do site">
            <Link to="solucao" aria-label="Solução">Solução</Link>
            <Link to="problema" aria-label="Problema">Problema</Link>
            <Link to="biblioteca" aria-label="Biblioteca">Biblioteca</Link>
            <Link to="mercado" aria-label="Mercado">Mercado</Link>
            <Link to="planos" aria-label="Planos">Planos</Link>
            <Link to="investimento" aria-label="Proposta de investimento">Investimento</Link>
          </nav>

          <div className="header-cta">
            <Link to="admin" className="btn ghost">Painel admin</Link>
            <Link to="inicio" className="btn primary">Abrir o app</Link>
          </div>

          <button className="menu-toggle" aria-label="Abrir menu">
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <Section id="hero" title="" subtitle="">
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="pill-badge">Nova captação em andamento</span>
              <h1>A agenda do <span className="grad">pastor brasileiro</span></h1>
              <p className="lead">
                Plataforma móvel com Inteligência Artificial para preparação de sermões, tele-aconselhamento via
                Google Meet, lembretes por WhatsApp, agenda pastoral, atendimentos e rotina ministerial — em um único
                aplicativo, 100% em português e funcionando offline.
              </p>
              <div className="hero-actions">
                <Link to="investimento" className="btn lime lg">Ver a proposta de investimento</Link>
                <Link to="inicio" className="btn outline-light lg">Explorar o produto</Link>
              </div>
              <ul className="hero-checks">
                <li>Produto 100% funcional (aplicativo instalável)</li>
                <li>IA em português · Meet AI · WhatsApp</li>
                <li>Funciona mesmo sem internet</li>
                <li>R$ 49,90/mês · 150–200 mil pastores</li>
              </ul>
            </div>

            <div className="hero-visual">
              <div className="phone">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div className="mock-topbar"><span>☰</span><strong>PastorHub</strong><span className="mock-online">●</span></div>
                  <div className="mock-header">
                    <p>Bem-vindo,</p><h3>Pastor Silva</h3>
                    <div className="mock-glass">Hoje - Segunda, 16 de Novembro<br /><strong>3 atendimentos agendados</strong></div>
                  </div>
                  <div className="mock-stats">
                    <div><b>3</b><span>Hoje</span></div>
                    <div><b>12</b><span>Semana</span></div>
                    <div><b>5</b><span>Palestras</span></div>
                    <div><b>2</b><span>Alertas</span></div>
                  </div>
                  <div className="mock-row"><span className="mock-avatar">MS</span><div><b>Maria Silva</b><i>Aconselhamento</i></div><em>14:00</em></div>
                  <div className="mock-row mock-row-live"><span className="mock-avatar">AI</span><div><b>Conselho · Meet AI</b><i>Transcrevendo…</i></div><em className="live-pill">●</em></div>
                  <div className="mock-row"><span className="mock-avatar">AC</span><div><b>Ana Costa</b><i>Oração</i></div><em>18:00</em></div>
                  <div className="mock-nav"><span>⌂</span><span>▤</span><span>👥</span><span>📖</span><span>🎥</span><span>🔔</span></div>
                </div>
              </div>
              <div className="float-card float-1"><span className="fc-icon">✨</span><div><b>Sermão gerado em 2s</b><small>Mateus 11:22-24</small></div></div>
              <div className="float-card float-2"><span className="fc-icon">🩺</span><div><b>Meet AI</b><small>Relatório confidencial</small></div></div>
              <div className="float-card float-3"><span className="fc-icon">💬</span><div><b>WhatsApp</b><small>71% de confirmações</small></div></div>
            </div>
          </div>
        </section>
      </Section>

      {/* ===== Números ===== */}
      <section className="numbers animate-fade-up" aria-label="Metas do mercado">
        <div className="numbers-grid">
          <div><b>38 mil</b><span>sermões gerados com IA</span></div>
          <div><b>150–200 mil</b><span>pastores no Brasil</span></div>
          <div><b>400 mil+</b><span>templos evangélicos</span></div>
          <div><b>85%+</b><span>margem bruta por assento</span></div>
        </div>
      </section>

      {/* ===== Problema ===== */}
      <Section id="problema" title="Uma dor semanal de centenas de milhares de profissionais" subtitle="Pastores pregam de 1 a 3 vezes por semana. Cada sermão exige de 8 a 15 horas de preparação — somado aos papéis de dirigente, conselheiro, visitador e gestor de pessoas, sem nenhum software feito para ele." classe="alt">
        <div className="problem-grid">
          <article className="problem-card problem-highlight">
            <span className="p-num">8–15h</span>
            <h3>de preparação por sermão</h3>
            <p>Estudo do texto bíblico, construção do esboço, referências cruzadas e aplicação prática — no caminho tradicional.</p>
          </article>
          <article className="problem-card problem-highlight">
            <span className="p-num">1–3×</span>
            <h3>sermões por semana</h3>
            <p>Muitos pastores pregam em mais de um culto, com agenda de atendimentos e visitação no mesmo dia.</p>
          </article>
          <article className="problem-card">
            <span className="p-num">~R$ 0,05</span>
            <h3>custo de IA por sermão</h3>
            <p>O custo de gerar um sermão é irrelevante. O custo real é o tempo do pastor — e a falta de histórico.</p>
          </article>
        </div>

        <div className="table-wrap problem-table">
          <table className="data-table">
            <thead><tr><th>Ferramenta atual</th><th>Limitação</th></tr></thead>
            <tbody>
              {PROBLEMA.alternativas.map((item) => (
                <tr key={item.atual}><td>{item.atual}</td><td>{item.limitacao}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="problem-quote">“O pastor não busca <em>software</em>, busca <strong>tempo de volta</strong>: horas perdidas reformatando esboços, sermões repetidos sem controle, anotações extraviadas e, no momento do culto, dependência de papéis.”</p>
      </Section>

      {/* ===== Solução / módulos ===== */}
      <Section id="solucao" title="Um aplicativo, seis módulos essenciais" subtitle="Interface mobile-first pensada para o ritmo do pastor entre cultos, palestras e visitas — com tudo em português.">
        <div className="features-grid">
          {MODULOS.map((modulo) => (
            <article key={modulo.título} className="feature-card">
              <h3>{modulo.título}</h3>
              <p>{modulo.descrição}</p>
              <ul className="feature-items">
                {modulo.itens ? modulo.itens : []}
              </ul>
            </article>
          ))}
        </div>

        <div className="cta-inline">
          <div>
            <h3>Por que agora?</h3>
            <p>A adoção de IA por profissionais brasileiros cresce aceleradamente — e pastores já usam ferramentas genéricas (WhatsApp, cadernos físicos, editores de texto) para um trabalho profundamente especializado. Ninguém construiu, em português, uma experiência completa e de baixo custo para o pastor individual. A janela de mercado para o primeiro player nacional está aberta.</p>
          </div>
          <Link to="investimento" className="btn lime">Quero investir</Link>
        </div>
      </Section>

      {/* ===== Como funciona ===== */}
      <Section id="como-funciona" title="Do texto bíblico ao histórico de cuidado" subtitle="Um fluxo de trabalho pensado para transformar horas em minutos.">
        <div className="steps steps-5">
          {ETAPAS.map((etapa) => (
            <article key={etapa.numero} className="step">
              <span className="step-num">{etapa.numero}</span>
              <h3>{etapa.titulo}</h3>
              <p>{etapa.texto}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* ===== Versões ===== */}
      <Section id="telas" title="Um projeto, cinco formas de apresentar" subtitle="O mesmo núcleo em HTML, CSS e JavaScript puro — sem build, abrindo direto no navegador.">
        <div className="versions-grid">
          <Link to="inicio" className="version-card">
            <span className="v-tag">Mobile</span><h3>Celular</h3>
            <p>Interface vertical com navegação inferior, ideal para usar no campo e durante a pastoral.</p>
            <span className="v-link">Abrir versão mobile →</span>
          </Link>
          <Link to="inicio" className="version-card" data-shell="tablet">
            <span className="v-tag">Tablet</span><h3>Tablet</h3>
            <p>Navegação horizontal no topo e colunas duplas para estudar e planejar com mais espaço.</p>
            <span className="v-link">Abrir versão tablet →</span>
          </Link>
          <Link to="inicio" className="version-card" data-shell="desktop">
            <span className="v-tag">Desktop</span><h3>Computador</h3>
            <p>Menu lateral fixo, grade em duas colunas e painel lateral com agenda, alertas e status do sistema.</p>
            <span className="v-link">Abrir versão desktop →</span>
          </Link>
          <Link to="admin" className="version-card">
            <span className="v-tag">Admin</span><h3>Painel de gestão</h3>
            <p>Investimento, unit economics, Meet AI, WhatsApp, mercado, roadmap, logs e configurações.</p>
            <span className="v-link">Abrir painel admin →</span>
          </Link>
          <Link to="docs" className="version-card">
            <span className="v-tag">Docs</span><h3>Documentos</h3>
            <p>Proposta de investimento de 18 páginas, deck de apresentação, ficha técnica, manual e roadmap.</p>
            <span className="v-link">Ver documentos →</span>
          </Link>
        </div>
      </Section>

      {/* ===== Biblioteca Digital ===== */}
      <Section id="biblioteca" title="Biblioteca Digital de livros teológicos" subtitle="Clássicos da fé em português — patrística, teologia sistemática, devocionais, vida pastoral e homilética — reunidos dentro do PastorHub, com busca, categorias e leitura no app.">
        <div className="versions-grid">
          <a href="/docs/biblioteca.html" target="_blank" rel="noopener noreferrer" className="version-card">
            <span className="v-tag">Acervo</span><h3>12 obras clássicas</h3>
            <p>Confissões, A Imitação de Cristo, O Peregrino, O Pastor Aprovado, Instituto de Calvino e mais — todas em domínio público.</p>
            <span className="v-link">Explorar a biblioteca →</span>
          </a>
          <a href="/docs/biblioteca.html" target="_blank" rel="noopener noreferrer" className="version-card">
            <span className="v-tag">Plano</span><h3>Plano de ação e roadmap</h3>
            <p>Quatro fases: fundação e acervo, leitor integrado, curadoria no painel e inteligência com áudio.</p>
            <span className="v-link">Ver o plano completo →</span>
          </a>
          <a href="/docs/biblioteca-comprar-alugar.html" target="_blank" rel="noopener noreferrer" className="version-card">
            <span className="v-tag">Comprar e Alugar</span><h3>Biblioteca · Comprar e Alugar</h3>
            <p>Opções de compra e aluguel dos livros do acervo — detalhes, visualização do conteúdo e formas de pagamento.</p>
            <span className="v-link">Acessar a página →</span>
          </a>
          <Link to="biblioteca" className="version-card">
            <span className="v-tag">No app</span><h3>Vitrine no app do usuário</h3>
            <p>Busca por título e autor, filtros por categoria e detalhes de cada obra nas versões mobile, tablet e desktop.</p>
            <span className="v-link">Abrir no app →</span>
          </Link>
        </div>
      </Section>

      {/* ===== Mercado ===== */}
      <Section id="mercado" title="Um público fiel, insatisfeito e desatendido" subtitle="Estimativas próprias construídas a partir de dados públicos (IBGE/Censo, estudos setoriais do universo evangélico brasileiro e benchmarks de mercado) — a ser refinadas em análise detalhada.">
        <div className="market-grid">
          {MERCADO.dados.map((item) => (
            <div key={item.n} className="market-stat">
              <b>{item.n}</b>
              <span>{item.d}</span>
            </div>
          ))}
        </div>
        <div className="grid-3" style={{ marginTop: 22, display: 'flex', gap: 12 }}>
          <Card className="flex-1"><CardContent className="p-4"><div><b>8.000 assentos</b><span>pastores registrados até o Ano 3</span></div></CardContent></Card>
          <Card className="flex-1"><CardContent className="p-4"><div><b>R$ 240,00</b><span>ticket médio por assento (ano 1–3)</span></div></CardContent></Card>
        </div>
        <div className="info-strip">
          <span className="strip-icon">💡</span>
          <div><strong>Insight de nicho:</strong> <span>{MERCADO.insight}</span></div>
        </div>
      </Section>

      {/* ===== Integrações ===== */}
      <Section id="integracoes" title="Conecte o que você já usa" subtitle="Backend opcional com banco de dados seguro, servidor de IA e aplicativo instalável." classe="alt">
        <div className="integrations-grid">
          <div className="int-card"><span>🗓️</span><b>Google Calendar</b><small>Sincronização de eventos</small></div>
          <div className="int-card"><span>📨</span><b>Outlook</b><small>Calendário corporativo</small></div>
          <div className="int-card"><span>🍎</span><b>Apple Calendar</b><small>Agenda do iPhone/iPad</small></div>
          <div className="int-card"><span>🎥</span><b>Google Meet</b><small>Tele-aconselhamento com IA</small></div>
          <div className="int-card"><span>💬</span><b>WhatsApp API</b><small>Lembretes e confirmações</small></div>
          <div className="int-card"><span>⚡</span><b>Banco de Dados</b><small>Segurança e autenticação</small></div>
          <div className="int-card"><span>🤖</span><b>Inteligência Artificial</b><small>Geração de sermões</small></div>
          <div className="int-card"><span>📦</span><b>App Android</b><small>Aplicativo nativo</small></div>
        </div>
      </Section>

      {/* ===== Modelo de negócio ===== */}
      <Section id="planos" title="SaaS freemium com conversão por uso" subtitle="Plano gratuito que alimenta o funil, planos Pro e Igreja com conversion por valor Recorrente e WhatsApp automático.">
        <div className="billing-toggle">
          <button className="active">Mensal</button>
          <button>Anual <b>-20%</b></button>
        </div>
        <div className="plans-grid">
          {PLANOS.map((plano) => (
            <article key={plano.nome} className={`plan-card ${plano.destaque ? 'plan-featured' : ''}`}>
              <h3>{plano.nome}</h3>
              <p className="plan-price">{plano.preco}<span>{plano.periodo}</span></p>
              <ul>
                {plano.itens.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <Button className="mt-3">Saber mais</Button>
            </article>
          ))}
        </div>

        <div className="grid-2" style={{ marginTop: 30 }}>
          <div className="unit-box">
            <h3>Unit economics — margem estruturalmente alta</h3>
            <div className="unit-rows">
              {UNIT_ECONOMICS.map((item) => (
                <div key={item.item} className="unit-row"><b>{item.item}</b><span>{item.valor}</span></div>
              ))}
            </div>
          </div>
          <div className="unit-box">
            <h3>Receitas futuras (pós v2.0)</h3>
            <ul className="receitas-futuras">
              {[
                'Marketplace de esboços e séries de sermões colaborativas entre pastores',
                'Licenças white label para denominações e convenções',
                'Parcerias educacionais com seminários teológicos',
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ===== Go-to-market ===== */}
      <Section id="gtm" title="Distribuição onde o pastor já está" subtitle="" classe="alt">
        <div className="gtm-grid">
          {GTM.map((item) => (
            <article key={item.nome} className="gtm-card">
              <h3>{item.nome}</h3>
              <p>{item.descricao}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* ===== Concorrência ===== */}
      <Section id="concorrencia" title="Cinco diferenciais defensáveis">
        <div className="grid-2" style={{ marginBottom: 26 }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Alternativa</th><th>Lacuna preenchida</th></tr></thead>
              <tbody>
                {ALTERNATIVAS.map((item) => (
                  <tr key={item.alt}><td>{item.alt}</td><td>{item.lacuna}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="diff-box">
            <h3>Por que o PastorHub vence</h3>
            <ol className="diferenciais">{DIFERENCIAIS.map((item) => <li key={item.slice(0, 30)}>{item}</li>)}</ol>
          </div>
        </div>
        <div className="moat-box">
          <span>🛡️</span>
          <div><strong>Vantagem competitiva:</strong>{' '}
            A união de funcionamento offline, IA pastoral e Meet/WhatsApp cria uma vantagem difícil de replicar: quem introduzir os relatórios de aconselhamento e o controle da agenda via WhatsApp antes dos concorrentes trava a conta do pastor por custo de troca imenso.</div>
        </div>
      </Section>

      {/* ===== Plano financeiro ===== */}
      <Section id="financeiro" title="Projeção de crescimento em 3 anos" subtitle="Cenário base da rodada semente — R$ 1,7 milhão de receita anual projetada no Ano 3." classe="alt">
        <div className="grid-2">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Indicador</th><th>Ano 1</th><th>Ano 2</th><th>Ano 3</th></tr></thead>
              <tbody>
                {FINANCEIRO.indicadores.map((item) => (
                  <tr key={item.indicador}><td>{item.indicador}</td><td>{item.ano1}</td><td>{item.ano2}</td><td>{item.ano3}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="chart-box">
            <h3>Receita anual projetada</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={FINANCEIRO.series}>
                <Line type="monotone" dataKey="valor" stroke="#95C121" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <ul className="premissas-list">
          {FINANCEIRO.premissas.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </Section>

      {/* ===== Captação ===== */}
      <Section id="investimento" title="R$ 50.000 para destravar os gargalos e financiar o motor de vendas" subtitle="Rodada semente com liberação em duas parcelas condicionadas a marcos mensuráveis." classe="alt">
        <div className="cap-grid">
          <div className="cap-box cap-main">
            <span className="cap-label">Valor da captação</span>
            <div className="cap-value">R$ 50.000</div>
            <p>Tranche 1: R$ 15.000 (imediata) · Tranche 2: R$ 35.000 (crescimento)</p>
          </div>
          <div className="cap-box"><span className="cap-label">Instrumento</span><b>Mútuo Conversível ou SAFE</b><p>Conversão na primeira grande rodada (Série A), com desconto pactuado.</p></div>
          <div className="cap-box"><span className="cap-label">Governança</span><b>Relatórios trimestrais</b><p>Sem assento de conselho nesta etapa.</p></div>
        </div>

        <div className="grid-2" style={{ marginTop: 24 }}>
          <div className="unit-box">
            <h3>Uso do Tranche 1</h3>
            {[
              { nome: 'Engenharia e setup do servidor', v: 'R$ 7.500', obj: 'Suportar primeiros usuários pagantes e tokens de IA' },
              { nome: 'IA em produção: chaves, reconhecimento de texto e assistentes', v: 'R$ 4.000', obj: 'Base de conhecimento e assistente no ar' },
              { nome: 'Marketing de aquisição (Ads/SEO)', v: 'R$ 2.500', obj: 'Validar o CAC inicial' },
              { nome: 'Infra/Cloud/Jurídico inicial', v: 'R$ 1.000', obj: 'Servidores e Termos de Uso' },
            ].map((item) => (
              <div key={item.nome} className="unit-row"><b>{item.nome}</b><span>{item.v}</span><p>{item.obj}</p></div>
            ))}
          </div>
          <div className="unit-box">
            <h3>Condições propuestas</h3>
            {[
              { cond: 'Valor da captação', termo: 'R$ 50.000 total (Tranche 1: R$ 15.000 · Tranche 2: R$ 35.000)' },
              { cond: 'Instrumento', termo: 'Mútuo Conversível ou SAFE' },
              { cond: 'Conversão', termo: 'Na primeira grande rodada (Série A), com desconto pactuado' },
              { cond: 'Liberação', termo: 'Tranches condicionadas a marcos: T1 destrava os gargalos técnicos; T2 financia o motor de vendas' },
              { cond: 'Governança', termo: 'Relatórios trimestrais ao investidor; sem assento de conselho nesta etapa' },
            ].map((item) => (
              <div key={item.cond} className="unit-row"><b>{item.cond}</b><span>{item.termo}</span></div>
            ))}
            <p className="small-note">
              Os R$ 15.000 iniciais destravam hoje os gargalos (servidor de aplicação, IA em produção com reconhecimento de texto e busca inteligente, lançamento). Os R$ 35.000 subsequentes financiam o motor de vendas — sem diluição desnecessária precoce do fundador.
            </p>
          </div>
        </div>
      </Section>

      {/* ===== Roadmap ===== */}
      <Section id="roadmap" title="Do MVP ao v2.0: construindo o único player nacional" classe="alt">
        <div className="timeline">
          <article className="timeline-item done">
            <span className="tl-num">1</span>
            <div>
              <h3>v1.0 — MVP atual</h3>
              <p className="tl-date">Concluído</p>
              <ul>
                <li>Interface de 5 módulos</li>
                <li>IA de sermões</li>
                <li>Offline-first</li>
                <li>PDF/TXT</li>
                <li>Histórico de pregações</li>
              </ul>
            </div>
          </article>
          <article className="timeline-item">
            <span className="tl-num">2</span>
            <div>
              <h3>v1.5 — Parcela 1</h3>
              <p className="tl-date">3–6 meses</p>
              <ul>
                <li>Migração para tecnologia de ponta</li>
                <li>IA em produção contínua</li>
                <li>Temas claro/escuro</li>
                <li>Aplicativo instalável</li>
              </ul>
            </div>
          </article>
          <article className="timeline-item next">
            <span className="tl-num">3</span>
            <div>
              <h3>v2.0 — Parcela 2</h3>
              <p className="tl-date">6–12 meses</p>
              <ul>
                <li>Aconselhamento Meet AI (transcrição + análise de sentimentos)</li>
                <li>Bot de agenda via API WhatsApp</li>
                <li>Compartilhamento entre pastores</li>
                <li>Base de conhecimento com reconhecimento de texto</li>
                <li>Assistente de estudo no app</li>
              </ul>
            </div>
          </article>
        </div>
      </Section>

      {/* ===== Depoimentos ===== */}
      <Section id="depoimentos" title="Quem usa, recomenda" classe="alt">
        <div className="testimonials">
          <blockquote><p>"No interior, sem sinal nenhum, eu consigo preparar o sermão da semana. Antes eu levava caderno e caneta; agora levo o tablet."</p><footer><b>Pr. Marcos Vieira</b><span>Igreja do Evangelho Quadrado · MG</span></footer></blockquote>
          <blockquote><p>"A agenda com os atendimentos mudou minha rotina. Sei quem preciso visitar na semana e o que já foi cuidado."</p><footer><b>Pra. Ana Beatriz</b><span>Comunidade Betel · SP</span></footer></blockquote>
          <blockquote><p>"Gerei 40 sermões no primeiro trimestre e revisei todos. Economizei horas de pesquisa e estudo."</p><footer><b>Pr. Jonas Lima</b><span>Igreja Central · PR</span></footer></blockquote>
        </div>
      </Section>

      {/* ===== Equipe e riscos ===== */}
      <Section id="equipe" title="O que pode dar errado — e o que já está pronto" classe="alt">
        <div className="grid-2">
          <div>
            <span className="eyebrow">Equipe</span>
            <h2 className="left-h">Time e movimento pós-investimento</h2>
            <div className="table-wrap" style={{ marginTop: 18 }}>
              <table className="data-table"><thead><tr><th>Perfil</th><th>Papel</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>Fundador técnico</td><td>Produto, engenharia, arquitetura de IA</td><td>Fundador — a completar</td></tr>
                  <tr><td>Advisory teológico</td><td>Teologia e curadoria homilética</td><td>Em prospecção</td></tr>
                  <tr><td>Liderança comercial</td><td>Growth setorial</td><td>Pós-investimento</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <span className="eyebrow">Riscos e Mitigações</span>
            <h2 className="left-h">Riscos e probabilidade</h2>
            <div className="table-wrap" style={{ marginTop: 18 }}>
              <table className="data-table"><thead><tr><th>Risco</th><th>Prob.</th><th>Mitigação</th></tr></thead>
                <tbody>
                  <tr><td>Dependência da IA (custo/disponibilidade)</td><td>Média</td><td>A arquitetura do servidor próprio permite troca fácil por modelos alternativos (Claude, Gemini)</td></tr>
                  <tr><td>Conteúdo teológico impreciso (IA)</td><td>Média</td><td>IA firmada via system prompts fechados e interface que obriga a revisão pelo pastor</td></tr>
                  <tr><td>Dados sensíveis (Meet AI)</td><td>Baixa</td><td>Relatórios anonimizados e encriptados na nuvem, em acordo com a LGPD (dado de saúde/crença)</td></tr>
                  <tr><td>Grande player entra no nicho</td><td>Baixa–Média</td><td>Velocidade de execução, comunidade de pastores e vantagem competitiva Meet/WhatsApp</td></tr>
                  <tr><td>Adoção por pastores menos digitais</td><td>Média</td><td>Modo offline sem cadastro, manual em português, onboarding assistido e suporte por WhatsApp</td></tr>
                  <tr><td>Queda de uso fora da preparação semanal</td><td>Baixa</td><td>Agenda, atendimentos, lembretes WhatsApp e Meet AI sustentam uso diário</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== FAQ ===== */}
      <Section id="faq" title="Perguntas frequentes" subtitle="Respondendo ao investidor" classe="alt">
        <div className="faq-list">
          <div className="faq-item">
            <h3>A Inteligência Artificial substituirá o pregador?</h3>
            <p>Não. O app atua como um assistente de estudo. O pastor sempre refina, decide e prega o sermão.</p>
          </div>
          <div className="faq-item">
            <h3>É defensável?</h3>
            <p>Sim. O histórico do pastor, o controle da agenda e o registro dos casos de aconselhamento criam grandes dificuldades de substituição.</p>
          </div>
          <div className="faq-item">
            <h3>Quais os próximos marcos mensuráveis?</h3>
            <p>Lançamento público e uso da IA em produção · Integração Meet AI + WhatsApp · 1.000 assentos pagantes · equilíbrio operacional da enxuta.</p>
          </div>
          <div className="faq-item">
            <h3>Como funciona a base de conhecimento?</h3>
            <p>O administrador envia arquivos de texto ou documentos. O sistema organiza os trechos e os agentes recuperam as informações mais relevantes para responder às perguntas.</p>
          </div>
          <div className="faq-item">
            <h3>Como é feita a cobrança dos planos pagos?</h3>
            <p>Faturamento recorrente com Pix (incluindo Pix recorrente), cartão e boleto, por meio de plataformas de pagamento. No dia do vencimento a fatura é gerada automaticamente; havendo pendência após o período de tolerância, o acesso do usuário é bloqueado até a regularização.</p>
          </div>
        </div>
      </Section>

      {/* ===== Documentos ===== */}
      <Section id="documentos" title="Material completo para apresentação" subtitle="Todos os documentos abrem em nova aba e podem ser impressos em PDF diretamente pelo navegador.">
        <div className="docs-grid">
          <a href="/docs/proposta-investimento.html" target="_blank" rel="noopener noreferrer" className="doc-card">
            <div className="doc-icon">📄</div>
            <div className="doc-body">
              <h3>Proposta de Investimento</h3>
              <p>Documento completo de 18 páginas: problema, solução, tecnologia, mercado, modelo de negócio, estratégia de captação, finanças, equipe, riscos e Perguntas Frequentes.</p>
              <span className="doc-meta">18 páginas · HTML para impressão</span>
            </div>
            <ArrowRight className="doc-arrow" />
          </a>
          <a href="/docs/apresentacao.html" target="_blank" rel="noopener noreferrer" className="doc-card">
            <div className="doc-icon">🖥️</div>
            <div className="doc-body">
              <h3>Deck de Apresentação</h3>
              <p>Apresentação em slides com narrativa formal: problema, solução, demonstração do funcionalidade, análise de mercado, projeções financeiras e pedido de capitação.</p>
              <span className="doc-meta">12 slides</span>
            </div>
            <ArrowRight className="doc-arrow" />
          </a>
        </div>
      </Section>

      {/* ===== Próximos passos ===== */}
      <Section id="proximos-passos" title="Da proposta à primeira parcela">
        <div className="passos-grid">
          <article className="passo">
            <span className="passo-num">1</span>
            <div><b>Reunião de apresentação e demonstração ao vivo da stack atual</b><span>Semana 1</span></div>
          </article>
          <article className="passo">
            <span className="passo-num">2</span>
            <div><b>Acesso à base de código (repositórios Frontend/Backend) e ao plano de migração</b><span>Semana 2</span></div>
          </article>
          <article className="passo">
            <span className="passo-num">3</span>
            <div><b>Term sheet preliminar para liberação da Tranche 1 (R$ 15.000)</b><span>Semanas 3–4</span></div>
          </article>
          <article className="passo">
            <span className="passo-num">4</span>
            <div><b>Início imediato do uso dos recursos para configuração da IA em produção</b><span>Semana 4</span></div>
          </article>
        </div>
      </Section>

      {/* ===== CTA ===== */}
      <section className="cta" data-anchor="cta">
        <div className="cta-inner">
          <span className="pill-badge">Que Deus abençoe este projeto e todos os pastores que o utilizarem</span>
          <h2>Convidamos você a investir na digitalização do ministério pastoral brasileiro</h2>
          <p>Um mercado fiel, inexplorado e pronto para o seu primeiro player líder. Agende a conversa:</p>
          <div className="cta-actions">
            <a href="/docs/proposta-investimento.html" target="_blank" rel="noopener noreferrer" className="btn lime lg">Ler a proposta completa</a>
            <a href="/docs/apresentacao.html" target="_blank" rel="noopener noreferrer" className="btn ghost-light lg">Ver o deck de apresentação</a>
          </div>
          <p className="cta-contact">{PRODUTO.contato}</p>
        </div>
      </section>

      {/* ===== Rodapé ===== */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link to="inicio" className="brand footer-brand">
              <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg></span>
              <span><strong>PastorHub</strong><small>Agenda do Pastor</small></span>
            </Link>
            <p className="footer-desc">{PRODUTO.descricao}</p>
          </div>
          <div>
            <h4>Produto</h4>
            <Link to="inicio" className="footer-link">Mobile</Link>
            <Link to="inicio" className="footer-link" data-shell="tablet">Tablet</Link>
            <Link to="inicio" className="footer-link" data-shell="desktop">Desktop</Link>
            <Link to="admin" className="footer-link">Painel administrativo</Link>
          </div>
          <div>
            <h4>Documentos Apresentação</h4>
            <a href="/docs/proposta-investimento.html" target="_blank" rel="noopener noreferrer" className="footer-link">Proposta de Investimento</a>
            <a href="/docs/apresentacao.html" target="_blank" rel="noopener noreferrer" className="footer-link">Deck de Apresentação</a>
            <a href="/docs/biblioteca.html" target="_blank" rel="noopener noreferrer" className="footer-link">Biblioteca Digital</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>© 2026 PastorHub. Todos os direitos reservados. Feito com ❤️ para pastores.</p>
        </div>
      </footer>
    </div>
  );
}
