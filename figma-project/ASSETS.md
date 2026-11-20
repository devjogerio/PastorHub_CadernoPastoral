# Assets visuais importados — Find Local Church (Figma)

Arquivo de origem: https://www.figma.com/design/Rhq8Rosks7Rx5ib2jbils4/Find-local-church-App--Community-?node-id=0-1&t=AHe0d8GPpmazolA-1

## Situação da exportação

Os assets abaixo foram exportados pelo MCP oficial da Figma **com as dimensões e formatos originais** (SVG). O plano **Starter** permite apenas **20 chamadas de leitura por mês**; o limite foi atingido antes da exportação das imagens rasterizadas (fotos de igrejas, capas de sermões e ilustrações fotográficas). Esses itens estão listados como **pendentes** com seus node IDs para retomada assim que o limite for renovado ou o plano atualizado.

O inventário bruto completo (117 nós identificados nos metadados do arquivo) está em `design-reference/figma-metadata.xml`.

## Assets importados (organizados por tela)

Pasta canônica: `assets/figma/<tela>/`.

| Arquivo | Node ID | Dimensões originais | Uso no projeto |
|---|---|---|---|
| `home/priest.svg` | 69:570 | 26,53 × 26,53 | Avatar do usuário (todas as telas) |
| `home/search.svg` | 69:578 | 17,6 × 17,6 | Ícone dos campos de busca |
| `home/avatar-ellipse.svg` | 69:569 | 60 × 60 | Fundo do avatar (referência) |
| `home/feature-icone-a.svg` | 184:0 | 60 × 60 | Cartão "Encontrar igreja" |
| `home/feature-icone-b.svg` | 184:3 | 60 × 60 | Cartão "Culto presencial" |
| `home/hero-capa.svg` | 69:209 | 339 × 146 | Fundo do cartão principal |
| `home/decoracao-export.svg` | 69:584 | 306,07 × 336,10 | Ilustração decorativa (export bruto) |
| `home/decoracao-parte-07..23.svg` | 69:610–69:812 | fragmentos | Partes da ilustração decorativa (export bruto) |
| `home/decoracao-corrigida.svg` | 69:580 (reconstrução) | 306 × 336 | Ilustração decorativa usada na interface (cores corrigidas) |
| `home/oracao-corrigida.svg` | 69:208 (reconstrução) | 130 × 146 | Ilustração da mulher orando no cartão principal |

**Total: 25 arquivos SVG** em `assets/figma/home/` (23 exportações originais + 2 reconstruções corrigidas).

## Imagens raster pendentes de exportação

| Tela | Node IDs | Nomes | Dimensões | Uso |
|---|---|---|---|---|
| Sign in | 69:44 / 69:93 | person-praying-with-cross-holy-book 1 | 508 × 338 | Fundo da tela de entrada |
| Sign in | 69:45 / 69:94 | spirituality-religion-hands-folded... | 440 × 293 | Variante oculta |
| Início | 69:208–69:210 | Mask Group / Rectangle 38 | 339 × 146 | Ilustração do cartão principal |
| Encontrar igreja | 69:1068, 69:1104, 69:1138 | Rectangle 4 | 329 × 146 | Fotos dos cards de igrejas |
| Lista de igrejas | 69:1190, 69:1195, 69:1557 | g6621 1, g16972, g2489 | 123×132, 146×118, 215×115 | Miniaturas dos cards |
| Gravações | 69:2217/2232/2249/2264/2280/2294 | image 1 | 170 × 170 | Capas dos sermões |
| Sermões (ppt) | 69:2330/2346/2362/2378/2394/2409 | image 1 | 170 × 170 | Capas dos sermões |
| Tema alternativo | 501:21, 501:43/44/46 | church-interior-neat-bible, Mask Group | 392×245, 127×180 | Hero e miniaturas |

## Vinculação com o arquivo original

Cada SVG exportado veio de URLs temporárias do serviço MCP (`https://www.figma.com/api/mcp/asset/<uuid>.svg`) e foi salvo localmente — **nenhuma URL temporária é usada em runtime**. O vínculo permanente com o arquivo de origem é a URL do Figma no topo deste documento e os node IDs das tabelas.

## Validação realizada

- 25 SVGs presentes, não vazios e com `width`/`height` originais preservados.
- Referências relativas verificadas no HTML/JS e carregadas no navegador (sem 404).
- Dimensões exibidas preservadas: ícones 17,6 px e 26,5 px; ilustração decorativa 306×336; avatar 60×60.
- Screenshots de referência mantidos em `design-reference/` (não usados em runtime).
