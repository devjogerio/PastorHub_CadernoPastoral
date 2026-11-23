# PastorHub — Regras de Integração de Design (Figma MCP)

Este arquivo é a fonte canônica de regras para integrar designs do Figma ao projeto usando o servidor MCP da Figma.
Leia-o **antes** de converter Figma → código ou código → Figma.

Idioma do projeto: **pt-BR**. Commits: **Conventional Commits** (cabeçalho e corpo ≤ 100 caracteres).

---

## 0. Decisão preliminar: qual código é o alvo?

O repositório mantém **duas implementações completas**. Nunca comece a escrever código sem declarar qual é o alvo.

| Alvo | Pasta | Como é servido | Quando usar |
| --- | --- | --- | --- |
| **App estático / site público** | `pastorhub-static/` | GitHub Pages (`pages.yml` copia `pastorhub-static/` → `_site/`); URL pública `devjogerio.github.io/PastorHub_CadernoPastoral/pastorhub-static/` | Qualquer mudança visível no site/app/painel públicos. É a UI mais usada hoje. |
| **App React/PWA/Capacitor** | `src/` | `vite build` → `dist/`; APK via `npm run apk:generate` | Tela do app mobile/PWA/APK, componentes shadcn/Radix, Supabase. |

- Os 3 shells do app estático (`index.html`, `tablet.html`, `desktop.html`) compartilham **exatamente os mesmos módulos JS/CSS**; só muda `window.APP_SHELL` ('mobile' | 'tablet' | 'desktop'). O mesmo vale para `usuario*.html`.
- O gerado `dist/`, `build/`, `_site/` e `node_modules/` **nunca** devem ser editados.
- Se o usuário não especificar o alvo, pergunte. Se o contexto for "site/painel", use `pastorhub-static/`; se for "app/APK", use `src/`.

### Regras obrigatórias do Figma MCP

1. Use o servidor configurado globalmente em `~/.config/opencode/opencode.json` (`https://mcp.figma.com/mcp`, OAuth via `/mcps`). Ferramentas ficam em `tools.figma.*` via Code Mode.
2. **Design → código:** carregue a skill `/figma-design-to-code` antes de `get_design_context`; chame `create_session(fileKey, descrição)` antes de qualquer ferramenta de arquivo; reutilize o `sessionId` retornado em todas as chamadas seguintes. A resposta de `get_design_context` é **referência**, não código final.
3. **Código → design:** carregue `/figma-generate-design`; `create_session`; `search_design_system` é sempre a **primeira** consulta (reutilize componentes/variáveis existentes — nunca crie do zero se houver match). Para páginas web, use `generate_figma_design` e `use_figma` em paralelo, refine e remova a captura de tela de referência.
4. `use_figma` exige a skill `/figma-use`; `generate_diagram` exige `/figma-generate-diagram`; Code Connect exige `/figma-code-connect`.
5. Extraia `fileKey`/`nodeId` de URLs `figma.com/design/:fileKey/:fileName?node-id=:n1-:n2` (converta `-` em `:` no nodeId). URLs `/slides/`, `/board/`, `/make/` têm regras próprias; use `get_figjam` para FigJam.

---

## 1. Estrutura de Design Tokens

### 1.1 App React — `src/styles/globals.css` (única fonte de verdade)

```css
/* src/styles/globals.css:3-42 — :root (tema claro) */
:root {
  --font-size: 16px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --primary: #002645;
  --primary-foreground: #ffffff;
  --secondary: oklch(0.95 0.0058 264.53);
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #95C121;          /* verde/lima da marca */
  --accent-foreground: #ffffff;
  --destructive: #d4183d;
  --border: rgba(0, 0, 0, 0.1);
  --ring: #95C121;
  --radius: 0.625rem;
  /* --chart-1..5, --sidebar-*, ... */
}

/* src/styles/globals.css:44-79 — .dark sobrescreve os mesmos nomes */
.dark { --background: oklch(0.145 0 0); /* ... */ }

/* src/styles/globals.css:81-120 — ponte para o Tailwind v4 */
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  --color-accent: var(--accent);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-lg: var(--radius);
  /* ... */
}
```

```css
/* src/index.css — entrypoint (importado por src/main.tsx:2) */
@import "tailwindcss";
@import "./styles/globals.css";
```

```css
/* src/styles/globals.css:1,122-130 */
@custom-variant dark (&:is(.dark *));
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

**Regras para mapeamento Figma (React):**
- Valores de token são **cores CSS completas** (`hex`, `rgba()`, `oklch()`), **não** tripletas HSL. Use `bg-primary`, `text-accent`, `ring-ring`, etc. **Nunca** escreva `hsl(var(--primary))` — o único uso assim está em `ui/sidebar.tsx:483` e é legado inconsistente.
- Marca: `--primary: #002645`, `--accent`/`--ring: #95C121`. O azul `#3261AB` **não tem token nomeado** — aparece como classe arbitrária (`bg-[#3261AB]`) em componentes de app.
- Tipografia: só `--font-size: 16px` e `--font-weight-medium/normal`; escala de tamanhos vem de `--text-*` do Tailwind (`globals.css:135-185`). **Não há** tokens de `font-family`, spacing ou shadow.
- Se o design do Figma trouxer uma cor nova, adicione a variável em `:root` **e** o alias em `@theme inline` antes de usar o utilitário.
- **Não existe sistema de transformação de tokens**: sem Style Dictionary, sem JSON de tokens, sem CSS-in-JS. Tokens são escritos à mão.

### 1.2 App estático — tokens repetidos por arquivo

Cada CSS declara seu próprio `:root` (não há arquivo de tokens compartilhado):

```css
/* pastorhub-static/css/styles.css:6-20 */
:root {
  --navy: #002645; --blue: #3261AB; --lime: #95C121; --red: #d4183d;
  --bg: #f9fafb; --card: #ffffff; --muted: #ececf0; --muted-text: #717182;
  --border: #e5e7eb; --radius: 0.625rem; --radius-lg: 1rem;
  --shadow: 0 1px 3px rgba(0,0,0,.08);
  --shadow-lg: 0 12px 32px rgba(0, 38, 69, .18);
}
```

```css
/* pastorhub-static/css/admin.css:5-18 */
:root {
  --navy: #002645; --navy-deep: #001a2f; --blue: #3261AB;
  --lime: #95C121; --red: #d4183d; --amber: #f59e0b;
  --ink: #16202b; --muted: #64748b; --line: #e5eaf0;
  --soft: #f5f8fb; --radius: 12px; --sidebar: 258px;
}
```

`site.css`, `docs.css` e `usuario.css` repetem o padrão com variações (`--lime-dark`, `--bg-soft`, `--max`, `--sky`, `--purple`, `--card`, `--accent-from/to`).

**Armadilha documentada:** o app usa `--border`; painel/site/docs/usuário usam `--line`. Já houve bug de borda preta por usar `var(--border)` no painel (`docs/registro-tecnico.html:238`). **Use a variável correta do arquivo em que está trabalhando.**

Brand documentada em `pastorhub-static/docs/ficha-tecnica.html:34`: `#002645 · #95C121 · #3261AB`.

---

## 2. Biblioteca de Componentes

### 2.1 React — `src/components/ui/` (48 arquivos, planos)

Componentes **shadcn/ui gerados por Figma Make** (`docs/Attributions.md` registra a proveniência). Convenções:

- Arquivos **kebab-case** diretamente em `src/components/ui/` (`button.tsx`, `alert-dialog.tsx`, `input-otp.tsx`); sem pastas por componente.
- `data-slot="<nome>"` na raiz e nas partes; `cn()` para mesclar classes; `React.ComponentProps` / `VariantProps`; exports nomeados.
- Imports de terceiros **com versão fixa** (`@radix-ui/react-dialog@1.1.6`, `lucide-react@0.487.0`, `class-variance-authority@0.7.1`), viáveis graças aos aliases de `vite.config.mts` e `src/types/shims.d.ts`.

```tsx
// src/components/ui/button.tsx (pattern canônico)
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ... focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-background text-foreground hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: { default: "h-9 px-4", sm: "h-8 px-3", lg: "h-10 px-6", icon: "size-9" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
// Button = React.forwardRef(... asChild ? Slot : "button" ...)
```

```ts
// src/components/ui/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// src/components/ui/card.tsx — data-slot como hook de estilo e de teste
<div data-slot="card-header"
  className={cn("@container/card-header grid auto-rows-min ... has-data-[slot=card-action]:grid-cols-[1fr_auto]", className)} />
```

**Regras:**
- Novo primitive: arquivo kebab-case em `ui/`, `cva` para variantes, `data-slot`, `cn()`, exports nomeados, imports versionados + entrada em `src/types/shims.d.ts`.
- Novo componente de tela: PascalCase em `src/components/`, importa de `./ui/*`, padrão de `Dashboard.tsx` / `QuickActions.tsx` (Dialog controlado, `DialogClose asChild`, `toast` de `sonner@2.0.3`).
- `ui/form.tsx` e `ui/chart.tsx` existem mas **não são usados**: formulários reais usam `useState` + `<Input>`; não há gráficos renderizados. Não os tome como padrão.
- Testes ficam em `__tests__/` ao lado do componente; seletores são `data-slot` e `data-testid` (ex.: `src/components/__tests__/Dashboard.atendimentos.test.tsx`).
- **Não há Storybook, `.storybook/`, `components.json` nem catálogo de componentes**.

### 2.2 Estático — blocos reutilizáveis gerados por strings

Não há componentes JSX; a UI é produzida por template strings e helpers globais:

```js
// pastorhub-static/js/icons.js:75
window.icon = function (name, cls) { /* ... */ return '<svg class="icon' + c + '" ...>' + (ICONS[name] || '') + '</svg>'; };

// pastorhub-static/js/admin.js:7
const ic = (name, cls) => window.icon(name, cls);

// pastorhub-static/js/admin.js:426-436
function panel(title, body, opts) {
  opts = opts || {};
  return '<section class="panel' + (opts.class ? ' ' + opts.class : '') + '">' +
    (title ? '<div class="panel-head"><div><h3>' + esc(title) + '</h3>' +
      (opts.sub ? '<div class="sub">' + esc(opts.sub) + '</div>' : '') + '</div>' + (opts.action || '') + '</div>' : '') +
    '<div class="panel-body' + (opts.flush ? ' flush' : '') + '">' + body + '</div></section>';
}

function kpi(label, value, delta, iconName, colorClass, good) { /* .kpi > .kpi-top/.kpi-value/.kpi-delta */ }
```

Namespaces globais: `window.icon`, `window.escapeHtml`, `window.toast`, `window.openSheet`, `window.tabsHTML`, `window.Views` (`views.js:552`), `window.App` (`app.js:69`), `window.Actions` (registro por `data-action`), `window.AdminAPI` (`admin.js:2609`), `window.BIBLIOTECA` (`biblioteca.js`), `window.INVESTIDOR`, `window.Docs`, `window.PastorAI`, `window.PastorVers`, `window.Usuario`.

```js
// pastorhub-static/js/views.js:82-94 — item de lista clicável
'<div class="item-card" data-action="detalhe" data-tipo="atendimento" data-id="' + escapeHtml(a.nome) + '">' +
  avatarHTML(a.nome, 'avatar-48 avatar-navy') +
  '<div class="item-body"><div class="item-title">' + escapeHtml(a.nome) + '</div>' +
  '<div class="item-sub">' + escapeHtml(a.tipo) + '</div></div>' +
  '<div class="item-right"><span class="item-time">' + icon('clock', 'icon-sm') + escapeHtml(a.hora) + '</span>' +
  '<span class="badge badge-soft-lime">' + escapeHtml(a.badge) + '</span></div></div>'
```

**Famílias visuais do estático** (use como "componentes" no Figma): `.btn`/`.btn-icon`, `.badge`, `.item-card`, `.card`, `.stat-grid/.stat-btn`, `.tabs/.tab`, `.pills/.pill`, `.field/.switch`, `.modal`/`.sheet-panel`, `.toast`, `.drawer`, `.table-wrap table.data`, `.panel/.kpi`, `.tag-*`, `.info-box`, `.avatar`, `.det-*` (ficha de detalhe), `.doc-*` (editorial/A4), `.user-*` (versão usuário), `.bib-*`, `.rag-*`, `.int-*`, `.acq-*`.

Regras: escape sempre com `esc()`/`escapeHtml()`; ações via `data-action` + `Actions[...]`; novo módulo é IIFE que publica em `window.*`; **`js/*.js` precisa passar em `node --check`** (`npm run check:static`, também no pre-commit).

---

## 3. Frameworks & Libraries

### React (`package.json`, `vite.config.mts`)
- React 18.3.1, TypeScript 5.6, Vite 6.3.5, `@vitejs/plugin-react-swc`.
- Tailwind CSS 4.1.18 com `@tailwindcss/vite` — **sem `tailwind.config.*`** (configuração CSS-first).
- Radix UI (~26 pacotes), `lucide-react` 0.487, `class-variance-authority`, `clsx`, `tailwind-merge`, `sonner`, `next-themes`, `react-hook-form` (presente mas não usado em telas), `recharts` (presente mas não usado), Capacitor 8, Supabase.
- Scripts: `dev`, `build`, `typecheck`, `test` (Vitest), `check:static`, `build:mobile`, `apk:generate`.
- `vite.config.mts`: aliases de versão + `'@' → ./src` (linha 94). **`tsconfig.json` não tem `paths`**: use imports relativos.
- `index.html` (raiz): `<html lang="en">`, CSP, `#root`, `/src/main.tsx` e redirect para `pastorhub-static/` em domínios `.github.io`.

### Estático
HTML + CSS + JS puro, **sem build**. Nove entrypoints HTML; 6 CSS; 26 JS. Viewports definidos por `window.APP_SHELL`. `admin.html` **não carrega** `styles.css` (tem `admin.css` próprio).

### CI/Deploy
- `.github/workflows/ci.yml`: `check:static` (job `static`) e `typecheck → test → build` (job `react`).
- `.github/workflows/pages.yml`: publica somente `pastorhub-static/` no GitHub Pages (push em `main` com mudanças nessa pasta).
- `.github/workflows/commitlint.yml`: valida commits. Husky: pre-commit `npm run check:static`; commit-msg `commitlint`.

---

## 4. Gestão de Assets

- **Não existe `public/` nem `src/assets/`**. Não importe imagens no React; não assuma pipeline de raster.
- Único PNG de documento: `pastorhub-static/docs/app-frame.png`. Ícones launcher/splash Android em `android/app/src/main/res/` (mipmaps + drawables).
- Imagem de perfil: `pastorhub-static/js/imagem.js` recorta 256×256 e comprime JPEG q=0.86 para **data URL** no `localStorage`.
- `src/components/figma/ImageWithFallback.tsx` contém um placeholder SVG em base64 (helper Figma Make, hoje não usado).
- **SVGs inline são o mecanismo padrão de "asset"**. Não há `loading="lazy"`, `srcset` ou `<picture>` — não presuma esses atributos.
- PWA (`vite.config.mts:20-43`) referencia `favicon.ico`, `apple-touch-icon.png`, `mask-icon.svg`, `pwa-192x192.png`, `pwa-512x512.png` — **arquivos ausentes no repositório**. Se o design incluir ícones PWA, crie-os em `public/`.
- CDNs carregados em runtime: pdf.js (`cdnjs`), tesseract.js (`jsdelivr`), qrcodejs (`cdnjs`) em `js/ai.js`, `js/pagamentos.js`, `js/admin-planos.js`. CSP da `index.html` não lista esses hosts em `script-src` — cuidado com markup gerado que injete scripts remotos.
- Fontes: **nenhuma webfont**; stack do sistema `"Segoe UI", system-ui, -apple-system, Roboto, ...` em todos os CSS. Não adicione `@font-face` sem necessidade explícita.

---

## 5. Sistema de Ícones

### React
```tsx
import { Home, Calendar, Users, BookOpen, Bell } from 'lucide-react';
<item.icon className={`w-5 h-5 ${isActive ? 'fill-[#95C121]/20 scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
```
- Tamanhos: `w-3/4/5/7/8/12/16 h-*`; cor via `text-*` (muitas vezes `text-[#95C121]`), `currentColor` por herança.
- Se o Figma usar um ícone Lucide, **reutilize o de `lucide-react`** — não reescreva o SVG.

### Estático
```js
// Univérsio: chaves minúsculas/kebab-case no mapa ICONS (71 entradas)
icon('book-open', 'icon-lg');   // ex.: menu, search, x, home, calendar, book-open,
                                // chevron-right, check-circle, trash-2, file-text,
                                // chart, database, zap, library, monitor, send ...
```
```css
/* pastorhub-static/css/styles.css:38-40 */
.icon { width: 20px; height: 20px; flex-shrink: 0; }
.icon-sm { width: 16px; height: 16px; }
.icon-lg { width: 28px; height: 28px; }
```
- `window.icon(name, cls)` gera `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ...>` com o **inner SVG** do mapa. Nome desconhecido → SVG vazio (sem fallback).
- Para adicionar: insira `'nome-kebab': '<path d="..."/>'` em `js/icons.js` (sem `<svg>`, sem width/height), depois use `icon('nome-kebab', 'icon-sm')`.
- Atenção: `js/ui.js:141` usa `icon('trash', ...)`, mas a chave correta é `trash-2` — não replique esse bug.

---

## 6. Abordagem de Estilização

### React
- Utilitários Tailwind v4 + padrões shadcn: `data-slot`, `cva`, `cn()`, variantes arbitrárias (`[&_svg]:`, `has-data-[slot=...]:`, `data-[state=open]:`), opacidade (`bg-primary/90`).
- Dark: `.dark` + `@custom-variant dark`. **Não há `ThemeProvider` montado** (`next-themes` só é usado em `ui/sonner.tsx`); as classes `dark:` existem mas nada alterna o tema.
- Responsivo: apenas breakpoints padrão do Tailwind (`sm:`, `md:`, `lg:`, `xl:`):
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">   // Dashboard.tsx:184
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">   // QuickActions.tsx:158
```
- Um único container query: `@container/card-header` em `ui/card.tsx`.

### Estático
- Reset global em todos os CSS: `* { box-sizing: border-box; margin: 0; padding: 0; }`; `[hidden] { display: none !important; }`.
- Nomenclatura: kebab-case com prefixo de domínio e modificadores de uma palavra (`.item-card.active`, `.plan.featured`, `.tag-green`, `.b-navy`) — **não é BEM** (`__`/`--` não são usados).
- Breakpoints reais (use estes ao converter frames do Figma):

| Arquivo | Media queries |
| --- | --- |
| `styles.css` | `min-width:421px`, `max-width:1023px`, `max-width:700px`, `768–1023px`, `min-width:1440px` |
| `admin.css` | `max-width:1180px`, `980px`, `820px` (sidebar→drawer), `640px` |
| `site.css` | `769–1024px`, `max-width:1020px`, `max-width:768px` |
| `docs.css` | `max-width:760px`, `@page A4`, `@media print` |
| `usuario.css` | `max-width:767px`, `768–1439px`, `min-width:1440px` |

```css
/* pastorhub-static/css/styles.css:1514-1524 */
@media (min-width: 1440px) {
  .view-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  .quick-grid { grid-template-columns: repeat(4, 1fr); }
  .shell-desktop #view { padding: 1.5rem; }
}
```
- Dark do estático é uma paleta **hardcoded**, não troca de variáveis (`styles.css:977+`, `admin.css:356+`):
```css
body.theme-dark { background: #050b13; color: #dfe9f5; }
body.theme-dark .card, body.theme-dark .item-card, body.theme-dark .modal-panel {
  background: #132234; border-color: #23374e;
}
```
Há até override de estilo inline: `body.theme-dark [style*="color:var(--navy)"] { color: #e7eff9 !important; }`.
- `docs.css` tem `@page { size: A4; margin: 16mm 14mm; }` + `@media print` — designs de documentos devem respeitar impressão.

---

## 7. Estrutura do Projeto

```
D:\PastoralApp-main\
├── src/                       # App React/PWA (Vite) — alvo de APK
│   ├── main.tsx, App.tsx, index.css
│   ├── components/            # telas (PascalCase) + ui/ (primitives) + figma/ + __tests__/
│   ├── hooks/, lib/, styles/globals.css, test/, types/
├── pastorhub-static/          # App estático + site + painel — alvo do GitHub Pages
│   ├── index.html tablet.html desktop.html     # shells do app (APP_SHELL)
│   ├── usuario.html usuario-tablet.html usuario-desktop.html
│   ├── site.html admin.html
│   ├── css/  (styles, site, admin, docs, usuario, demo)
│   ├── js/   (26 módulos IIFE + globals)
│   ├── docs/ (9 páginas editoriais + app-frame.png)
│   └── README.md
├── android/                   # projeto Capacitor (recursos nativos)
├── docs/                      # documentação de produto/processo (Guidelines.md = stub de regras)
├── tools/                     # check-static.mjs, test.mjs
├── .github/workflows/         # ci.yml, pages.yml, commitlint.yml
├── CLAUDE.md                  # este arquivo
└── opencode.json              # registra este arquivo como instruction do OpenCode
```

Padrões de organização por feature:
- React: uma tela por arquivo em `components/`, lógica em `hooks/` e `lib/`, testes em `__tests__/` ao lado.
- Estático: um módulo por domínio em `js/`, que publica funções em `window`; a view é uma string HTML renderizada por `Views.render()` / `VIEWS.*` / `Docs.*`; ações são `data-action` registradas em `Actions`.

---

## 8. Checklist antes de entregar uma conversão Figma → código

1. [ ] Alvo declarado: `pastorhub-static/` (Pages) ou `src/` (React/APK).
2. [ ] `create_session` chamada com o `fileKey` e `sessionId` reutilizado; skill adequada carregada.
3. [ ] Cores do design mapeadas para tokens existentes (`--primary`/`--accent`/`--navy`/`--lime`...); se novo token, adicionado em `:root` **e** `@theme inline` (React) ou no `:root` do CSS correspondente (estático).
4. [ ] Componentes reaproveitados de `src/components/ui/` ou das famílias `.item-card/.panel/.btn/...` do estático — nada recriado do zero sem motivo.
5. [ ] Ícones: Lucide no React; `icon('nome', 'icon-sm')` no estático; nomes kebab-case.
6. [ ] Responsividade: breakpoints Tailwind padrão (React) ou media queries reais listadas em §6 (estático); verificadas as 3 larguras mobile/tablet/desktop.
7. [ ] Tema escuro tratado (`.dark` no React; `body.theme-dark` no estático) quando o design tiver variante escura.
8. [ ] Textos em pt-BR; escape HTML no estático (`esc`/`escapeHtml`).
9. [ ] Validação: `npm run check:static`, `npm run typecheck`, `npm test`, `npm run build` — conforme o alvo.
10. [ ] Smoke visual no navegador: sem erros de console e sem overflow horizontal; para mudanças estáticas, testar também site, admin e app do usuário.
11. [ ] Commit Conventional (≤100 chars) — hooks do Husky validam automaticamente.

---

## Referências rápidas

- Tokens React: `src/styles/globals.css:3-120`
- Tokens estáticos: `pastorhub-static/css/{styles,site,admin,docs,usuario}.css` (`:root`)
- Primitives: `src/components/ui/` (ex.: `button.tsx`, `card.tsx`, `dialog.tsx`)
- Helpers estáticos: `pastorhub-static/js/{icons,ui,views,admin}.js`
- Ícones: `lucide-react` (React) / `pastorhub-static/js/icons.js` (estático)
- Build/deploy: `vite.config.mts`, `capacitor.config.ts`, `.github/workflows/pages.yml`
- Convenções: `README.md`, `CONTRIBUTING.md`, `.editorconfig`, `commitlint.config.cjs`
- MCP Figma: `~/.config/opencode/opencode.json` → `https://mcp.figma.com/mcp` (OAuth via `/mcps`)
