# Análise do Projeto PastorHub — revisão de 2026-11-21

Relatório da revisão de código/segurança realizada em 2026-11-21 sobre o repositório `PastoralApp-main` (PastorHub), em pt-BR. Ao final, cada item está marcado como **corrigido nesta entrega** ou **pendente**.

## 1. Visão geral

O repositório mantém **duas implementações completas** e um diretório de assets:

- **App estático / site público** em `pastorhub-static/` — HTML + CSS + JS puro, sem build, publicado no GitHub Pages por `.github/workflows/pages.yml`. Nove entrypoints HTML (`index/tablet/desktop`, `usuario*`, `site`, `admin`) que compartilham os mesmos módulos JS/CSS via `window.APP_SHELL`.
- **App React/PWA/Capacitor** em `src/` — React 18 + TypeScript + Vite 6 + Tailwind v4 + Radix/shadcn em `src/components/ui/`, build para `dist/` e APK via Capacitor (`android/`).
- **`figma-project/`** na raiz — assets visuais importados do Figma, porém fora do escopo documentado no `CLAUDE.md` (o `CLAUDE.md` descreve apenas `src/` e `pastorhub-static/`).

## 2. Achados CRÍTICOS

- **C1 — Autenticação simulada no app estático (corrigido nesta entrega).** `pastorhub-static/js/app.js:227` realiza login aceitando qualquer e-mail sem verificar senha; `app.js:251` simula o fluxo "Continuar com Google" com `setTimeout`; `usuario.js:45` usa `localStorage.getItem('usuario_authed') === 'true'` como gate de acesso; o painel `admin.js` era login demo com senhas fixas (ver C3). Risco: qualquer visitante acessa áreas "protegidas" do demo. Mitigação definitiva exige autenticação real (Supabase Auth) também no estático ou um aviso explícito de modo demo. Corrigido: auth real via Supabase Auth no app estático (js/config.js + js/supabase-client.js, window.PastorAuth) com fallback de demonstração claramente rotulado (banner persistente em modo offline, auth-foot honesto, sem promessas de privacidade no demo); app.js/usuario.js/admin.js validam sessão real e redirecionam ao login.
- **C2 — Chaves/segredos em localStorage e ausência de CSP (parcialmente corrigido).** Parte 1: CSP adicionada via meta tag nos 8 shells estáticos (`index/tablet/desktop/usuario*/site/admin.html`), permitindo apenas `script-src 'self' cdnjs jsdelivr` (qrcodejs/pdf.js/tesseract.js) e `connect-src https:` (APIs de IA/Supabase), sem `unsafe-eval`/`unsafe-inline` em scripts. Parte 2 (corrigido nesta entrega): credenciais/chaves de IA ainda são persistidas em `localStorage` no estático e o processamento deve migrar para Edge Functions do Supabase. Corrigido: Edge Function src/supabase/functions/ai-proxy/index.ts recebe {acao, provedor, modelo, mensagens} e chama os provedores no servidor via Deno.env; o cliente (js/ai.js) usa PastorAuth.invocarFuncao('ai-proxy', ...) e não armazena nenhuma chave de IA/WhatsApp; token do Meta nunca vai na URL; variáveis do servidor documentadas no .env.example.
- **C3 — Senhas hardcoded no modo demo (corrigido nesta entrega).** Removidas `senha: 'admin1234'` e `senha: 'ana1234'` de `admin.js` (CONTAS) e `senha: 'pastor123'` do objeto PADRAO de `perfil.js`; o formulário de login do painel agora é demo explícito (aceita qualquer senha ou nenhuma, valida apenas o e-mail contra as contas demo).
- **C4 — Fila de sync duplicada (corrigido nesta entrega).** `syncWithSupabase` em `src/hooks/useSermoes.ts` processava a fila e limpava tudo no fim; se uma ação falhasse no meio, todas eram reprocessadas. Adicionado `OfflineStorage.removeFromSyncQueue(id)` em `src/lib/offlineStorage.ts`, chamado após cada ação sincronizada dentro do `for`; `clearSyncQueue()` permanece como garantia no fim.
- **C5 — Vitest coletando worktrees (corrigido nesta entrega).** `vite.config.mts` agora importa `defineConfig, defaultExclude` de `vitest/config` e define `test.exclude: [...defaultExclude, '**/.claude/**']`, evitando coleta duplicada de testes em worktrees do Claude.
- **C6 — `.env.example` (corrigido nesta entrega).** Criado `.env.example` na raiz documentando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` sem valores reais.

## 3. Achados de REFATORAÇÃO

- `pastorhub-static/js/admin.js` com ~2600 linhas (limite do projeto: 250–300 por módulo) — pendente.
- ~2100 linhas de componentes React órfãos em `src/components/`: `Dashboard`, `QuickActions`, `AtendimentosList`, `AgendaCalendar`, `Notificacoes`, `VideosLinks`, `PalestrasIA`, `AppSidebar` + teste (`App.tsx` usa apenas as variantes `Mobile*`) — pendente.
- `escapeHtml` duplicado em ~8 arquivos de `pastorhub-static/js/` — pendente.
- Tokens `:root` repetidos nos 6 CSS do estático (sem fonte única compartilhada) — pendente.
- `src/hooks/useSermoes.ts` com 344 linhas — pendente.
- Cores hardcoded no React (ex.: `bg-[#3261AB]`) em vez de tokens — pendente.
- Dependências com versão `'*'` (`@supabase/supabase-js`, `clsx`, `tailwind-merge`) e pacotes presentes mas não usados (`react-hook-form`, `recharts`) — pendente.
- PWA referencia ícones (`pwa-192x192.png`, `pwa-512x512.png`, etc.) ausentes em `public/` — pendente.
- `figma-project/` fora do escopo documentado no `CLAUDE.md` — pendente.

## 4. Pontos APROVADOS (já conformes)

- Nenhum segredo commitado no histórico visível; `.gitignore` cobre `.env` e artefatos.
- `rel="noopener"` presente nos links `_blank`.
- `AndroidManifest.xml` enxuto.
- CI (`ci.yml`, `pages.yml`) com blocos `permissions:` mínimos.
- `tsconfig.json` com `strict: true`.
- Validações (`check:static`, `typecheck`, `test`, `build`) passando antes desta entrega.

## 5. Validações executadas nesta entrega

- `npm run check:static` — passou (sintaxe de todos os `js/*.js` do estático, incluindo `admin.js`, `perfil.js`, `ui.js` alterados).
- `npm run typecheck` — passou (`tsc --noEmit`).
- `npm test` — passou, incluindo o novo teste de remoção individual da fila (`useSermoes.test.tsx`) e o teste unitário de `removeFromSyncQueue` (`offlineStorage.test.ts`).
- `npm run build` — passou (`vite build`).

## 6. Roadmap

1. C1: autenticar de verdade o estático (Supabase Auth) ou rotular claramente como demo público sem dados reais.
2. C2 parte 2: mover chaves de IA para Edge Functions do Supabase; nada de segredos no cliente.
3. Remover componentes React órfãos (~2100 linhas) e o teste associado.
4. Quebrar `admin.js` (~2600 linhas) e `useSermoes.ts` (344 linhas) em módulos menores.
5. Unificar `escapeHtml` em um único helper e os tokens `:root` dos CSS em uma fonte compartilhada.
6. Fixar versões das dependências `'*'`, remover as não usadas e criar os ícones PWA em `public/`.
7. Documentar `figma-project/` no `CLAUDE.md` ou movê-lo para `pastorhub-static/docs/`.

## 7. Status dos itens

**Corrigidos nesta entrega:** C3, C4, C5, C6, C2-parte 1 (CSP nos shells), R5 (`icon('trash')` → `icon('trash-2')` em `ui.js:141`), R6 (`.DS_Store` não está rastreado — nada a remover do índice), C1 (auth real no estático com fallback demo rotulado), C2-parte 2 (IA/WhatsApp via Edge Function ai-proxy).

**Pendentes:** componentes órfãos e demais refatorações grandes listadas na seção 3.
