# PastorHub — Projeto estático completo (HTML/CSS/JS puro)

Réplica estática de **todo o projeto Pastoral Care App (PastorHub)** em HTML, CSS e JavaScript puro — sem React, Vite,
Supabase ou qualquer build. Inclui o **app em 3 shells**, o **site institucional**, o **painel administrativo** e os
**documentos de apresentação** derivados da *Proposta de Investimento PastorHub v2.0*.

## 🚀 Como usar

```bash
# opção 1: abrir direto
pastorhub-static/index.html

# opção 2: servir localmente (recomendado)
cd pastorhub-static
python -m http.server 8080
```

## 📄 Páginas

| Arquivo | Versão | Descrição |
|---|---|---|
| `index.html` | **Mobile** | App vertical com navegação inferior (6 módulos) |
| `tablet.html` | **Tablet** | Navegação horizontal no topo, grade em 2 colunas |
| `desktop.html` | **Desktop** | Menu lateral fixo, painel lateral com agenda/alertas/status |
| `site.html` | **Site institucional** | Site público completo de investimento (15 seções) |
| `admin.html` | **Admin** | Painel de gestão com **18 seções** |
| `docs/proposta-investimento.html` | **Documento** | Proposta de Investimento v2.0 — 17 páginas, 16 tabelas |
| `docs/apresentacao.html` | **Documento** | Deck de apresentação — 13 slides 16:9 |
| `docs/ficha-tecnica.html` | **Documento** | Ficha técnica e arquitetura (5 páginas) |
| `docs/manual-usuario.html` | **Documento** | Manual do usuário passo a passo (4 páginas) |
| `docs/roadmap.html` | **Documento** | Roadmap v1.0 → v2.0 com marcos (4 páginas) |
| `docs/ecossistema-ia.html` | **Documento** | Ecossistema de IA: RAG + OCR + LLMs, ponta a ponta |
| `docs/registro-tecnico.html` | **Documento** | **Registro Técnico de Implementação**: tudo o que já foi construído + 23 melhorias para aprovação |

Todos os documentos abrem em nova aba e são **prontos para imprimir em PDF** pelo próprio navegador (botão na barra superior).

As três versões do app compartilham o mesmo núcleo (`js/`, `css/styles.css`); o que muda é o shell declarado antes dos scripts:

```html
<script>window.APP_SHELL = 'desktop';</script>  <!-- mobile | tablet | desktop -->
```

## 🧑 Usuário logado (perfil completo)

Todo o app passa a refletir o usuário autenticado (`localStorage` → `pastorhub_user`):

- **Editar Perfil** — nome, e-mail, igreja, telefone e cargo; salvo em tempo real
- **Foto de Perfil** — upload de imagem do dispositivo (JPG/PNG/WEBP), convertida em data URL e aplicada no avatar do drawer, do dashboard, do menu e da sidebar desktop; opção de remover
- **Alterar Senha** — senha atual + nova + confirmação, com validação de mínimo de 8 caracteres
- O **drawer**, o **dashboard**, as **configurações** e o card "Sobre" mostram o nome, e-mail e foto atuais; a **sidebar desktop** mostra nome, e-mail e iniciais (sem foto)
- O login/cadastro atualiza o perfil salvo automaticamente

## 🌙 Modo escuro

Toggle real em **Configurações → Geral → Aparência**, com persistência (`pastorhub_tema`) e aplicação antes da primeira
renderização (sem flash). O tema cobre app shell, cards, formulários, abas, tabelas, modais de detalhes, relatório do
Conselho e o sermão formatado.

## 📋 Fichas de detalhes (modais)

Todo card clicável abre uma **modal com a ficha completa** do item, com ações contextuais:

| Card | Ficha | Ações |
|---|---|---|
| Próximos Atendimentos (Início) / Atendimentos | dados, motivo, modalidade, WhatsApp, histórico | Abrir no módulo · Enviar lembrete · Registrar acompanhamento |
| Eventos da Agenda | quando, local, participantes, lembrete | Abrir na Agenda · Reenviar lembrete · Editar |
| Sermões | referência, tags, status de pregação, prévia do texto | Editar · Exportar PDF · Baixar TXT · Pregar/Desmarcar |
| Sessões do Conselho | data, duração, sala Meet, transcrição, sentimento | Ver relatório · Baixar TXT · Enviar lembrete |
| Alertas | prioridade, tipo, horário, estado | Abrir no módulo · Marcar como lida |
| Palestras e Vídeos | público, duração, categoria, views | Abrir na biblioteca · Editar |

## ⚡ Ações Rápidas implementadas

As 4 ações do dashboard abrem fluxos reais: **Novo Agendamento** (sheet de compromisso), **Atendimento** (navega ao
módulo), **Sermão IA** (navega e abre o gerador) e **Biblioteca** (navega aos recursos).

## 🩺 NOVO · Módulo Conselho (Aconselhamento Digital com IA — Google Meet)
Implementado funcionalmente no app (mobile, tablet e desktop):

- **Sessão ao vivo**: transcrição em tempo real com turnos Pastor/Membro, cronômetro e streaming da conversa
- **Análise de sentimentos** por léxico: índice de confiança, distribuição positivo/intenso e nível emocional
- **Mapeamento de picos emocionais**: angústias detectadas com trecho de origem
- **Relatório confidencial**: resumo, transcrição integral, análise, orientações pastorais e histórico de cuidado
- **Exportação**: PDF (impressão profissional) e TXT (download)
- **Persistência**: `localStorage` → `pastorhub_conselhos`

## 💬 NOVO · Integração WhatsApp (aba na Agenda)

- Status da conexão (número, provedor WhatsApp Business API / Meta Cloud)
- **4 templates** de mensagem com variáveis (`{{nome}}`, `{{hora}}`, `{{local}}`) e toggle individual
- Lista de lembretes com status **Enviado / Confirmado / Falho**, resposta recebida e ação de reenvio/cobrar
- Métricas de envio, entrega, confirmação e falhas

## 🛠️ Painel administrativo (17 seções)

| Seção | O que gerencia |
|---|---|
| **Visão geral** | KPIs, gráficos de usuários ativos, plataformas, tipos de sermão, módulos mais usados, auditoria e saúde dos serviços |
| **Investimento & Financeiro** | MRR/ARR, CAC, LTV, LTV/CAC, churn, funil de conversão, projeção 3 anos, unit economics, uso das tranches e condições da captação |
| **Usuários** | Tabela com busca, filtros, criar/editar/suspender/excluir, planos |
| **Planos & Assinaturas** | Modelo de negócio: planos Offline/Premium (Pro)/Igreja com preços, limites e recursos editáveis; assinaturas por usuário (ciclo mensal/anual), cobrança, faturas, cancelar/reativar, exportar CSV e assentos por igreja |
| **Conteúdo (Sermões)** | Moderação, origem IA vs. manual, ranking de temas, distribuição por tipo |
| **Conselho (Meet AI)** | Sessões, distribuição de sentiment, picos emocionais, custo por sessão, conformidade LGPD |
| **WhatsApp** | Funil de remetes/respostas, modelo de mensagem, lembretes, templates do bot |
| **Agenda & Atendimentos** | Eventos, atendimentos pastorais, ocupação semanal |
| **Recursos pastorais** | Palestras, vídeos, categorias |
| **Notificações** | Templates com toggle, automações, campanhas, métricas de entrega |
| **Integrações** | Supabase, OpenAI, Calendários, Meet, WhatsApp, Capacitor, webhooks, chaves de API |
| **Base de conhecimento (RAG)** | Upload de .md/.pdf/imagens, agentes, playground |
| **Versículos diários** | Envio automático: ligar/desligar, horário, canais (app/notificação/WhatsApp), banco de versículos (CRUD) e histórico de envios |
| **Mercado & Concorrência** | TAM/SAM/SOM, dados demográficos, tabela competitiva, 5 diferenciais, moat, GTM |
| **Roadmap** | Timeline v1.0/v1.5/v2.0, marcos de desbloqueio de tranche |
| **Sistema & Logs** | Edge Functions, limites de uso, banco/RLS, auditoria |
| **Configurações** | Identidade, segurança, 12 feature flags, backup |
| **Documentos** | Todos os documentos de apresentação com links diretos |

Login de demonstração: qualquer e-mail/senha (pré-preenchidos).

### 📱 Painel no celular e no tablet

O painel funciona em telas pequenas: a navegação lateral vira **gaveta** com backdrop (botão de menu no topo), a barra inferior
**mobile-nav** dá acesso rápido a Visão geral, Usuários, Planos, RAG e Versículos, as tabelas rolam horizontalmente, os KPIs
se organizam em 2 colunas, modais ficam quase em tela cheia e os botões têm alvos de toque maiores.

### Planos & Assinaturas (modelo de negócio)

- **Planos**: Offline (porta de entrada), **Premium/Pro** (R$ 49,90/mês ou R$ 598,80/ano) e **Igreja** (R$ 149,90/mês ou R$ 1.499/ano, até 10 assentos) — valores conforme os documentos do projeto. Preços, limites (sermões, atendimentos, assentos, agentes de IA, armazenamento) e recursos são editáveis no painel.
- **Faturamento recorrente**: motor automático com dia de vencimento configurável (1–28), período de tolerância, lembretes (WhatsApp/e-mail), gateway padrão e execução periódica (a cada 5 min e ao abrir a seção). No vencimento a fatura do ciclo é gerada automaticamente; ultrapassada a tolerância, o acesso é **bloqueado** até a regularização.
- **Gateways de pagamento**: **Mercado Pago, Pagar.me, Stripe, PagSeguro, Asaas e Banco/Pix direto** — cada um com modo (sandbox/produção), chave pública/privada, webhook, ativação, teste de conexão e indicadores de suporte a **Pix, Pix recorrente, cartão e boleto**.
- **Pix recorrente**: chave, tipo (estática/dinâmica), valor fixo ou valor da assinatura, gateway escolhido e **QR Code** (BR Code/EMV com CRC16) gerado na hora — no painel e no app do usuário.
- **Assinaturas**: cada usuário tem assinatura vinculada ao plano — troca de plano, ciclo mensal/anual, dia do vencimento, método (Cartão recorrente / Pix recorrente / Boleto / Pix chave+QR), gateway, status de cobrança (**Em dia, Pendente, Bloqueada, Isento**), **faturar agora**, histórico de faturas, **bloquear por pendência / regularizar pagamento** e exportação CSV.
- **Bloqueio por pendência financeira**: no lugar do cancelamento, a conta é **bloqueada** (usuário fica com status Bloqueado) até regularizar. No app (mobile/tablet/desktop) aparece uma tela de bloqueio com plano, valor da pendência, chave Pix para copiar, "Já paguei — enviar comprovante" e link de WhatsApp do suporte; com fatura em aberto (ainda no prazo de tolerância) aparece um aviso não bloqueante.
- **KPIs de negócio**: MRR, assinantes pagantes, igrejas no plano Igreja e bloqueadas/pendentes.
- **Assentos por igreja**: uso vs. limite do plano Igreja, com aviso quando o limite é atingido.

### 📖 Versículos diários

- **Painel (Versículos diários)**: liga/desliga o envio automático, define o horário, escolhe os canais (card no app, notificação, WhatsApp via integração ativa), edita o banco de versículos (adicionar/editar/pausar/excluir/restaurar padrão), vê o versículo de hoje em prévia e o histórico de envios por canal.
- **App (mobile, tablet e desktop)**: card "Versículo do dia" no Início, com **Copiar** e **Compartilhar** (WhatsApp). Quando o versículo do dia é enviado, o card atualiza e o app avisa com uma notificação.
- O envio acontece automaticamente no horário configurado quando qualquer página do projeto está aberta (uma vez por dia, registrada em `pastorhub_vers_log`). O versículo é fixo por data: todos veem o mesmo no mesmo dia.

### Integrações com chaves de API (painel · Integrações)

17 integrações e provedores de IA, cada um com seus botões: **Configurar/Editar**, **Testar conexão** (chamada real ao serviço quando o navegador permite; sem CORS, informa a falha), **Pausar/Ativar**, **Ver chave** (com copiar), **Rotacionar**, **Remover** e **Console** (link para o painel do provedor). Também há **Testar todas**, **Exportar configuração sem chaves**, e webhooks com novo, editar, testar, pausar e remover.

- IAs gratuitas: Groq (Llama 3), OpenRouter (Llama :free), Google Gemini, Mistral, Hugging Face e Ollama (Llama local).
- IAs pagas: OpenAI, Anthropic (Claude) e Together AI (Llama).
- Chaves ficam no `localStorage` (`pastorhub_integracoes`). Em produção, mova-as para uma Edge Function.

### Base de conhecimento RAG (painel · Base de conhecimento e app · Assistente)

- **Upload** de `.md`, `.txt`, `.pdf` e imagens (`.png`, `.jpg`, `.webp`) por arrastar e soltar ou seleção, com coleção de destino (Geral, Sermões, Aconselhamento, Agenda, Recursos).
- **PDF**: usa pdf.js quando há internet; sem ela, extração básica (PDFs simples).
- **OCR**: PDFs digitalizados e imagens passam por **Tesseract.js em português** (via CDN), com progresso por página e limite de 20 páginas por PDF. Precisa de internet.
- **Recuperação**: BM25 sobre trechos por seção, com fontes citadas. Não há embeddings nesta versão.
- **Geração**: LLM configurado no agente (Llama, Gemini, GPT, Claude). Sem chave, o agente responde em modo extrativo, mostrando os trechos.
- **Agentes**: Homilética, Aconselhamento e Pastoral Geral, editáveis (coleções, motor, modelo, temperatura, instruções). O painel tem um playground para testá-los.
- **App** (mobile, tablet e desktop): cartão "Assistente de estudo" no Início, e atalhos em Sermões e Conselho. O chat mostra o modo ativo e as fontes.
- Base e agentes ficam no `localStorage`, compartilhados entre painel e app na mesma origem. Processo detalhado em `docs/ecossistema-ia.html`.

### CRUD e exportação no painel

| Seção | Ações |
|---|---|
| Agenda & Atendimentos | Evento: criar, editar, excluir · Atendimento: criar, editar, excluir · **Exportar** em CSV ou PDF |
| Recursos pastorais | Palestra: criar, editar, excluir · Vídeo: criar, editar, excluir · Categoria: criar, excluir (bloqueado se estiver em uso) |
| Conselho (Meet AI) | Relatório: exportar em **PDF** (tabela, modal e cards), além de TXT e Markdown |
| Gestão de usuários | Editar dados e foto de perfil (recorte automático 256×256) |

Os dados editados ficam salvos no `localStorage` (`pastorhub_admin_*`). A exportação em PDF usa a janela de impressão do navegador; é preciso permitir pop-ups para este site.

## 🌐 Site institucional (15 seções)

Hero com mockup animado · Números · **O Problema** (4 alternativas + quote) · **A Solução** (6 módulos, 2 marcados como
Novo) · Como funciona (5 passos) · Versões · **Mercado** (TAM/SAM/SOM) · Integrações · **Modelo de negócio** (3 planos com
alternador mensal/anual + unit economics) · **Go-to-market** (5 canais) · **Concorrência e diferenciais** · **Plano
financeiro 3 anos** com gráfico · **Captação** (R$ 50.000, tranches, uso dos recursos) · **Roadmap** · Depoimentos ·
**Equipe e riscos** · **FAQ** (6 de produto + 4 do investidor) · **Documentos** · **Próximos passos** · CTA final.

## 📱 Módulos do app

Início · Agenda (Eventos / WhatsApp / Integrações) · Atendimento · Sermões · **Conselho (Meet AI)** · Alertas —
mais Configurações, Recursos pastorais e Busca global.

## 🗂️ Estrutura

```
pastorhub-static/
├── index.html · tablet.html · desktop.html    # app (shells mobile/tablet/desktop)
├── site.html                                   # site institucional
├── admin.html                                  # painel administrativo
├── docs/                                       # documentos de apresentação
│   ├── proposta-investimento.html · apresentacao.html
│   └── ficha-tecnica.html · manual-usuario.html · roadmap.html
├── css/
│   ├── styles.css      # tema do app + shells + módulos Conselho/WhatsApp
│   ├── site.css        # site institucional
│   ├── admin.css       # painel administrativo
│   └── docs.css        # documentos (tela + impressão A4)
└── js/
    ├── icons.js        # ícones SVG (estilo Lucide)
    ├── ui.js           # toasts, sheets, confirm dialog, formatadores
    ├── data.js         # dados mockados (incl. Meet AI e WhatsApp)
    ├── investidor.js   # dados da Proposta v2.0 (mercado, finanças, roadmap…)
    ├── storage.js      # OfflineStorage: sermões + fila de sync + conselhos
    ├── views.js        # Dashboard, Agenda, Atendimentos, Recursos, Alertas, Configurações
    ├── sermoes.js      # Caderno do Pastor (CRUD, IA, editor, PDF/TXT)
    ├── conselho.js     # NOVO · Meet AI + WhatsApp
    ├── app.js          # shells, navegação, drawer, busca global, auth
    ├── site.js         # renderização do site a partir dos dados da proposta
    ├── admin.js        # painel: 17 seções, tabelas, modais, gráficos SVG, nav mobile
    ├── ai.js           # núcleo: provedores de LLM, OCR, RAG/BM25, agentes
    ├── pagamentos.js   # NOVO · estado de cobrança no app: bloqueio, Pix/QR, gateways
    ├── admin-ai.js     # integrações (chaves de API) + Base de conhecimento
    ├── admin-planos.js # Planos & Assinaturas: valores documentados, faturamento recorrente,
    │                   # gateways (Mercado Pago, Pagar.me, Stripe, PagSeguro, Asaas, Pix),
    │                   # Pix recorrente com QR, bloqueio/regularização, faturas e assentos
    ├── versiculos.js   # motor dos versículos diários (painel + app)
    ├── admin-vers.js   # configuração dos versículos diários no painel
    ├── assistente.js   # chat do assistente no app (todas as versões)
    ├── imagem.js       # redimensionamento das fotos de perfil
    └── docs.js         # renderização dos documentos
```

## 💾 Persistência (localStorage)

| Chave | Conteúdo |
|---|---|
| `pastorhub_sermoes` | Lista de sermões (formato `Sermon` do app original) |
| `pastorhub_sync_queue` | Fila de alterações pendentes (create/update/delete) |
| `pastorhub_last_sync` | Timestamp da última sincronização |
| `pastorhub_conselhos` | Relatórios confidenciais do Meet AI |
| `pastorhub_admin_usuarios` | Usuários do painel (CRUD, plano, status, foto) |
| `pastorhub_admin_planos` | Planos Offline/Premium/Igreja (preços, limites, recursos) |
| `pastorhub_admin_assinaturas` | Assinatura de cada usuário (ciclo, vencimento, cobrança, faturas, pendência/bloqueio) |
| `pastorhub_faturamento` | Configuração do faturamento recorrente (vencimento, tolerância, lembretes, auto-bloqueio) |
| `pastorhub_gateways` | Credenciais dos gateways (Mercado Pago, Pagar.me, Stripe, PagSeguro, Asaas, Pix direto) |
| `pastorhub_pix` | Chave/tipo/gateway do Pix recorrente (gera o BR Code do QR) |
| `pastorhub_vers_config` | Configuração dos versículos diários (hora, canais) |
| `pastorhub_vers_banco` | Banco de versículos |
| `pastorhub_vers_log` | Histórico de envios dos versículos |

## ✅ O que funciona de verdade

- CRUD completo de sermões com persistência local · filtros · busca
- Fila de sincronização com botão "Sync (n)" no modo offline
- Detecção online/offline com toasts e indicadores
- Exportação PDF (impressão) e TXT (download) de sermões **e** de relatórios do Conselho
- Meet AI simulado com transcrição ao vivo, análise de sentimento e relatório confidencial
- WhatsApp com templates, lembretes, confirmação e status
- Busca global e buscas locais
- Layouts responsivos reais: bottom nav (mobile), top nav (tablet), sidebar (desktop)
- Painel admin com 17 seções, gráficos SVG próprios, modais, filtros, feature flags e auditoria
- Gestão de negócio no painel: planos Premium/Igreja, assinaturas, faturas e assentos
- Versículos diários automáticos configuráveis no painel, com card no app e canal WhatsApp

### 🔎 Buscas (otimizadas)

| Onde | Comportamento |
|---|---|
| App · Sermões | Filtra título, texto bíblico e tema **sem recarregar a tela** — foco e cursor preservados durante a digitação |
| App · Atendimentos | Filtra por nome ou motivo com atualização parcial da lista e título dinâmico |
| App · Busca global | Overlay com resultados agrupados por módulo (sermões / atendimentos / agenda) |
| Painel admin | Busca **ao vivo** com dropdown de resultados clicáveis (usuários, conteúdo, Meet AI, integrações) — Enter abre o primeiro resultado |

### 🩺 Painel Meet AI (real)

- **Transcrição**: modal com os turnos Pastor/Membro da sessão
- **Relatório**: modal com resumo, sentimento, angústias detectadas, transcrição e orientações pastorais
- **Download**: gera arquivo `.md` (ou `.txt`) no navegador — download real, não simulado
- Cards de relatórios gerados com ação rápida de ver/baixar

### ⚙️ Configurações da plataforma (real)

Os botões **Editar** abrem modal com campo editável + pré-visualização ao vivo e persistem em
`localStorage` (`pastorhub_config_admin`): nome do produto, cores da marca, e-mail de suporte, domínio e link do app.

## ⚠️ Simulações (iguais ao MVP em protótipo)

- Geração de sermão/palestra com IA retorna conteúdo de exemplo após 2s
- Login/cadastro/Google são demonstrativos (sem backend)
- Meet AI e WhatsApp são simulados localmente (sem APIs do Google/Meta/OpenAI)
- "Sincronizar" processa a fila local sem enviar a um servidor
- Painel administrativo usa dados de demonstração (os contadores de sermões locais são reais)
