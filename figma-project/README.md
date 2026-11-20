# Find Local Church — versão web estática (Figma → código)

Implementação estática do protótipo **[Find Local Church App (Community)](https://www.figma.com/design/Rhq8Rosks7Rx5ib2jbils4/Find-local-church-App--Community-?node-id=0-1)**, isolada nesta pasta e sem dependências de backend.

## Executar localmente

Requisitos: **Node.js ≥ 18** (opcional) e um navegador moderno (Chrome, Edge, Firefox ou Safari).

```bash
# Opção 1 — Python (sem dependências)
python -m http.server 8090 --directory figma-project
# Abra http://localhost:8090

# Opção 2 — Node
npx serve figma-project
```

Também é possível abrir `figma-project/index.html` diretamente no navegador (os SVG locais funcionam via `file://`).

## Estrutura

```
figma-project/
├── index.html              # 13 telas do protótipo (hash routing)
├── css/styles.css          # tokens, componentes e responsividade
├── js/app.js               # dados e interações (sem backend)
├── assets/*.svg            # vetores exportados do Figma
├── design-reference/*.png  # screenshots de referência (não usados em runtime)
├── tests/validate.mjs      # validação estática sem dependências
├── .nojekyll               # permite publicar no GitHub Pages
└── README.md
```

## Telas

`signin`, `home`, `find`, `churches`, `church`, `recordings`, `sermons`, `songs`, `messages`, `events`, `needs`, `testimony` e `alt` (variante clara/escura). Use a barra no topo para alternar; em telas com `[data-go]`, os cards navegam entrefluxos.

## Design e tokens

- Base: frame mobile **414 × 896**.
- Cores: laranja `#FE7940`, texto `#4a4a4a`, placeholder `#cbcbcb`, superfícies brancas, fundo `#f8f8f8`.
- Tipografia: Roboto (corpo) e Poppins (placeholders), com fallback de sistema se a CDN de fontes estiver indisponível.
- Componentes: cartões brancos com raio `12px` e sombra `0 8px 8px rgba(129,99,214,.15)`.
- Responsividade: o frame é centralizado no desktop; em telas ≤ 460 px ocupa a viewport inteira.

## Validação

```bash
node figma-project/tests/validate.mjs
```

O script verifica arquivos obrigatórios, integridade dos assets, ausência de URLs temporárias do Figma no código, quantidade de telas e a presença de media queries.

## Publicação no GitHub Pages

O workflow `pages.yml` deste repositório publica apenas `pastorhub-static/`. Para publicar esta pasta isolada:

1. Mover/copiar o conteúdo de `figma-project/` para um repositório próprio (ou para a raiz de um `gh-pages`/branch de demonstração).
2. Habilitar **Pages → Deploy from a branch → main / root**.
3. Manter o arquivo `.nojekyll`.

URL pública de teste: https://devjogerio.github.io/PastorHub_CadernoPastoral/figma-project/index.html
(O GitHub Pages publica a raiz do repositório; basta fazer push desta pasta.)

## Observações

- Fotos de igrejas e capas de sermões são representadas por gradientes CSS: os URLs de imagem originais do Figma não estavam disponíveis dentro do limite de chamadas do plano MCP no momento da exportação.
- Os SVGs em `assets/` foram baixados do servidor MCP da Figma e são usados exatamente nas posições do design.
- Screenshots em `design-reference/` são apenas referência visual — não são carregadas pela aplicação.
