# Busca do painel administrativo

Documentação da busca global do painel administrativo, implementada nos dois alvos ativos:

- painel estático: `pastorhub-static/admin.html` (GitHub Pages);
- painel React: `src/features/admin/AdminPage.tsx` (PWA/APK).

Os dois seguem a mesma semântica: mínimo de 3 caracteres, categorias por tipo (conteúdo, funcionalidade e ação), lista completa sem paginação, filtros e navegação por teclado.

## Requisitos atendidos

| Requisito | Comportamento |
| --- | --- |
| Conteúdos cadastrados | Usuários, sermões, agenda/atendimentos, recursos, sessões de conselho, modelos de WhatsApp, integrações, planos e configurações (estático); usuários, contas, registros e planos (React). |
| Funcionalidades disponíveis | Módulos do menu do painel, respeitando o perfil do usuário (estático) e as abas Painel, Financeiro e Planos (React). |
| Ações executáveis | Atualizar, alternar tema, criar/exportar registros e sair (estático); configurar chave Pix e editar planos, abrindo a aba correspondente (React). |
| Mínimo de 3 caracteres | Abaixo disso não há consulta nem resultados; apenas a orientação na interface. Aspas não entram na contagem. |
| Lista categorizada | Grupos "Conteúdo", "Funcionalidade" e "Ação", com contador por grupo e total de resultados. Todos os itens correspondentes são exibidos, sem paginação. |

## Regras de correspondência

- **Normalização:** acentos e caixa são ignorados (`Ação` = `acao`). Espaços repetidos são colapsados.
- **Parcial (padrão):** todas as palavras digitadas precisam aparecer em algum campo do item, em qualquer ordem.
- **Exata:** com o termo entre aspas, um dos campos precisa ser exatamente igual ao termo. Ex.: `"Marcos Vieira"`.
- **Mínimo:** 3 caracteres após normalização. `"ab"` não pesquisa; `"abc"` pesquisa.
- **Filtros:** categoria, módulo e status combinam com o texto (lógica E). As opções dos filtros vêm do índice completo, então não desaparecem ao filtrar.
- **Permissões (estático):** itens de seções não permitidas ao perfil não entram no índice, inclusive ações.

As regras estão em `pastorhub-static/js/admin-busca-core.js` (estático) e em `src/features/admin/busca.ts` (React), cobertas por testes próprios.

## Interface e interação

- Campo com `role="combobox"` e placeholder indicando o mínimo de 3 letras.
- Debounce de 250 ms: o indicador "Pesquisando…" aparece durante a espera.
- Resultados agrupados por tipo, com ícone, título, módulo, descrição e status quando houver.
- Filtros por categoria (chips "Tudo / Conteúdo / Funcionalidade / Ação"), módulo e status.
- Teclado: `↓`/`↑` movem o item ativo, `Enter` executa o item selecionado e `Esc` limpa a busca.
- **Estados:** orientação para termo curto, carregamento, vazio ("Nenhum resultado para …"), erro com "Tentar novamente" e aviso de falha parcial por módulo (estático).
- A execução de um resultado limpa o campo e fecha a lista.

## Implementação estática (`pastorhub-static`)

- `js/admin-busca-core.js`: lógica pura (normalização, interpretação do termo, filtros, agrupamento). Sem DOM.
- `js/admin-busca.js`: interface sobre `#global-search`; indexa `window.AdminAPI` e `window.AdminBuscaCore`.
- `AdminAPI.SECTIONS` é exposto em `admin.js` para indexar as funcionalidades.
- Fontes de conteúdo: usuários, conteúdo, agenda e atendimentos, recursos (palestras e vídeos), Conselho (Meet AI), WhatsApp, integrações, planos (`localStorage pastorhub_admin_planos`) e configurações.
- Ações: `Atualizar painel` (`#refresh-btn`), `Alternar tema` (`#theme-btn`), `Novo usuário`, `Exportar usuários`, `Novo sermão`, `Exportar conteúdo` e `Sair do painel`. Elas abrem a seção necessária e acionam o controle real da tela.
- `admin.html` carrega `admin.js?v=4`, `admin-busca-core.js?v=2` e `admin-busca.js?v=2` (versionamento para renovar cache).
- `css/admin.css`: estilos das categorias, filtros, item ativo, tema escuro e responsividade (campo em uma linha própria até 640px).

## Implementação React (`src/`)

- `src/features/admin/busca.ts`: tipos, normalização, correspondência, filtros, agrupamento e `montarIndiceAdmin`.
- `src/features/admin/AdminBusca.tsx`: campo, categorias, filtros, estados, teclado e lista completa.
- `src/hooks/useDebouncedValue.ts`: debounce reutilizável (250 ms).
- `AdminPage.tsx` fornece `navegar: setTab`, de modo que funcionalidades e ações trocam de aba de verdade.
- Fontes de conteúdo: usuários, contas, registros de auditoria e planos.

## Desempenho

A busca é local: o índice é montado em memória e percorrido a cada consulta, com debounce para evitar trabalho a cada tecla. Com os volumes atuais da demonstração, o processamento é imediato; a medição no navegador incluiu principalmente os 350 ms de espera do debounce (resultados entre ~356 e ~366 ms após a digitação, ou seja, ~6–16 ms de processamento). Um teste com 40 itens confirma que nenhum resultado é omitido por paginação.

Para volumes reais, a evolução natural é manter o índice atualizado incrementalmente em vez de reconstruí-lo por consulta.

## Validação

Comandos executados com sucesso:

- `npm.cmd run check:static` — 37 arquivos JavaScript válidos;
- `npm.cmd run typecheck` — sem erros;
- `npm.cmd test` — 16 arquivos, 89 testes aprovados;
- `npm.cmd run build` — build de produção concluído.

Testes automatizados da busca: `adminBuscaEstatica.test.ts` (20 casos), `busca.test.ts` (9) e `AdminBusca.test.tsx` (8). Cobrem mínimo de caracteres, categorias, ações, teclado, filtros, estados de carregamento/vazio/erro, falha parcial, permissões e ausência de paginação.

Validação manual no navegador, com login de administrador no painel estático e no build de produção do React, em 390, 768 e 1280 px:

- Estático: `mar` → 11 resultados; `igreja` → 9; `"Igreja"` → 5 exatos; `usuario` → 3 (1 funcionalidade e 2 ações); `exportar usuarios` → 1 ação; `zzzz` → mensagem de vazio. A ação "Novo usuário" abriu o formulário e limpou o campo.
- React: `ab` → nenhum resultado; `ana` → 3; `pix` → 2 (funcionalidade e ação); `plano` → 3 categorias; `zzzz` → mensagem de vazio. `↓` + `Enter` em `pix` navegou para Financeiro.
- Mesmos resultados nas três larguras, campo visível e dentro da viewport, sem overflow horizontal e zero erros de console.

## Limitações conhecidas

- Os dados do painel são de demonstração: não há consulta a banco nem busca no servidor.
- No React, o índice cobre apenas o que a tela possui hoje (usuários, contas, registros e planos).
- No estático, Notificações e Base de conhecimento aparecem como funcionalidades, mas não têm itens de conteúdo indexados por não manterem lista em memória.
- A busca do app do usuário (sermões e biblioteca) é outra funcionalidade e não foi alterada.

## Compatibilidade de navegadores

Usa `String.prototype.normalize`, `Array.from`, `Object.assign` e `Set`, disponíveis em Chrome, Edge, Firefox e Safari atuais (e Android/iOS recentes). Internet Explorer não é suportado, assim como o restante do painel.
