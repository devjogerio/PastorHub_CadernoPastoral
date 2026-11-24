# Busca do painel administrativo

Documentação da busca global do painel administrativo, implementada nos dois projetos:
o painel estático (`pastorhub-static/admin.html`) e o painel React (`src/features/admin/AdminPage.tsx`).

## Casos de uso

| Caso | Exemplo | Resultado esperado |
| --- | --- | --- |
| Localizar um usuário pelo começo do nome | `marc` | Marcos Vieira |
| Encontrar por igreja, cidade ou plano | `igreja` | Usuários cuja igreja, cidade ou plano contém "igreja" |
| Busca exata de um campo | `"Igreja"` | Apenas campos cujo valor inteiro é "Igreja" |
| Palavras em qualquer ordem | `vieira marcos` | Marcos Vieira |
| Filtrar por módulo | chip "Usuários" | Só resultados do módulo escolhido |
| Filtrar por status | `Suspenso` | Só registros com esse status |
| Navegar em muitos resultados | "Próxima ›" | Páginas de 6 (estático) ou 5 (React) itens |
| Termo curto | `a` | Mensagem pedindo pelo menos 2 caracteres |
| Sem correspondência | `zzzz` | Mensagem "Nenhum resultado para …" |

## Regras de correspondência

- **Normalização:** maiúsculas, minúsculas e acentos são ignorados (`Ação` = `acao`).
- **Parcial (padrão):** cada palavra digitada precisa aparecer em algum campo do registro. A ordem não importa.
- **Exata:** o termo entre aspas precisa ser igual a um dos campos inteiros.
- **Mínimo:** busca parcial exige 2 caracteres; a exata aceita 1.
- **Filtros:** módulo e status combinam com o texto (lógica E).

As regras estão em `pastorhub-static/js/admin-busca-core.js` (estático) e em `src/features/admin/busca.ts` (React). As duas implementações seguem a mesma semântica e são cobertas por testes próprios.

## Estados da interface

- **Carregando:** indicador "Pesquisando…" enquanto o debounce aguarda (250 ms).
- **Vazio:** mensagem com o termo pesquisado e a sugestão de remover filtros.
- **Erro:** mensagem "Não foi possível pesquisar agora" com opção de tentar novamente (estático). No estático, se só um módulo falhar, os demais resultados continuam aparecendo e o aviso indica qual módulo falhou.
- **Dica:** termo com menos de 2 caracteres mostra como usar aspas.

## Implementação estática (`pastorhub-static`)

- `js/admin-busca-core.js`: lógica pura (normalização, correspondência, filtros, paginação). Sem DOM.
- `js/admin-busca.js`: interface sobre o campo `#global-search`. Indexa os módulos a partir de `window.AdminAPI`, respeita as seções permitidas ao perfil (`secoesPermitidas`) e navega ao clicar no resultado.
- Fontes indexadas: usuários, conteúdo, agenda e atendimentos, recursos (palestras e vídeos), Conselho (Meet AI), WhatsApp (modelos), integrações, planos (`localStorage` `pastorhub_admin_planos`) e configurações.
- Responsivo: em até 640px a busca vira uma linha inteira abaixo do cabeçalho (antes ficava oculta).
- Tema escuro: estilos próprios em `css/admin.css`.

## Implementação React (`src/`)

- `src/features/admin/busca.ts`: tipos, normalização, correspondência, filtros, paginação e `montarIndiceAdmin`.
- `src/features/admin/AdminBusca.tsx`: componente com campo de busca, seletores de módulo e status, estados e paginação.
- `src/hooks/useDebouncedValue.ts`: hook de debounce reutilizável.
- `AdminPage.tsx` monta o índice (usuários, contas, registros e planos) e renderiza o componente acima das abas.

## Limitações conhecidas

- Os dados do painel são de demonstração. Não há consulta ao banco nem busca no servidor.
- No React, os resultados são informativos: clicar em um item não navega para outra aba.
- O React não tem módulos de conteúdo, agenda ou configurações; a busca cobre o que a tela tem hoje.
- O estático não indexa Notificações nem a Base de conhecimento (RAG), que não têm lista em memória.
- A busca reconstrói o índice a cada consulta. Para o volume de demonstração isso é imediato; com dados reais seria preciso indexar uma vez e atualizar sob demanda.

## Compatibilidade de navegadores

Usa `String.prototype.normalize`, `Array.from`, `Object.assign` e `Set`, suportados em Chrome, Edge, Firefox e Safari atuais (e Android/iOS recentes). Navegadores antigos sem `normalize` (como Internet Explorer) não são suportados, assim como o restante do painel.

## Testes

- `src/features/admin/__tests__/adminBuscaEstatica.test.ts`: carrega os arquivos reais do estático em jsdom. Cobre precisão, debounce, estados (carregando, vazio, erro, falha parcial), permissões por perfil, paginação e navegação.
- `src/features/admin/__tests__/busca.test.ts`: lógica pura do React (correspondência, filtros, paginação e índice).
- `src/features/admin/__tests__/AdminBusca.test.tsx`: componente React com debounce, carregamento, vazio, paginação e filtro de status.

Validação manual no navegador (iframes em 390, 768 e 1280 px), com o painel estático logado como administrador:

- Mesmo resultado nas três larguras; campo visível em todas; sem overflow horizontal.
- Termo `igreja`: 9 resultados, todos conferidos contra os dados.
- Termo `"Igreja"`: 5 resultados exatos (3 planos e 2 locais).
- Filtro por módulo "Usuários": 3 resultados.
- Zero erros de console.
