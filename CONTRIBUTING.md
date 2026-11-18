# Contribuindo com o PastorHub

Obrigado por contribuir com o PastorHub — Caderno Pastoral. Este guia define o fluxo para
manter o histórico legível, os testes reproduzíveis e as revisões simples.

## 1. Antes de começar

- Leia o [README](README.md) e o [Código de Conduta](CODE_OF_CONDUCT.md).
- Para dúvidas sobre comportamento existente, consulte o
  [Registro Técnico](pastorhub-static/docs/registro-tecnico.html).
- Para bugs ou novas funcionalidades, abra uma issue com o template correspondente antes de
  iniciar mudanças grandes. Correções pequenas podem ir direto para um pull request.
- Use Node.js 20 ou superior e npm 10 ou superior para o app React e os hooks de Git.
- Não envie credenciais, chaves privadas, dados pessoais reais ou `.env` em nenhum commit.

## 2. Configuração local

```bash
git clone https://github.com/devjogerio/PastorHub_CadernoPastoral.git
cd PastorHub_CadernoPastoral
npm install

# App React original (http://localhost:5173)
npm run dev

# App estático, em outro terminal (http://localhost:8080)
cd pastorhub-static
python -m http.server 8080
```

O `npm install` instala os hooks do Husky. O hook `pre-commit` valida a sintaxe de todos os
módulos estáticos e o `commit-msg` valida a mensagem segundo Conventional Commits.

Se precisar configurar os hooks manualmente, use `npm run prepare`. Não use `--no-verify`
para contornar validações sem discutir o motivo no pull request.

## 3. Branches

A branch `main` contém a versão integrada do projeto. Trabalhe sempre em uma branch curta,
derivada da `main` atualizada:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/portal-assinante
```

Prefixos recomendados:

- `feat/<escopo>-<descricao>` — funcionalidades;
- `fix/<escopo>-<descricao>` — correções;
- `docs/<descricao>` — documentação;
- `refactor/<escopo>-<descricao>` — refatorações sem mudança de comportamento;
- `chore/<descricao>` — tooling, dependências e manutenção.

Use letras minúsculas e hífens. Evite alterações não relacionadas na mesma branch.

## 4. Conventional Commits (obrigatório)

Formato:

```text
<tipo>(<escopo>): <descrição curta no imperativo>

[explicação opcional do problema e da decisão]

[rodapés opcionais, por exemplo: Closes #123]
```

Exemplos válidos:

```text
feat(billing): adicionar histórico de faturas ao portal do assinante
fix(admin): corrigir quebra da tabela de assinaturas no celular
docs(registro): atualizar inventário de módulos estáticos
ci(validacao): verificar sintaxe JavaScript em pull requests
refactor(storage)!: versionar a estrutura dos dados locais
```

Tipos aceitos:

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de bug |
| `docs` | Somente documentação |
| `style` | Formatação, sem mudança de lógica |
| `refactor` | Reorganização de código, sem nova feature ou correção |
| `perf` | Melhoria de desempenho |
| `test` | Inclusão ou correção de testes |
| `build` | Build ou dependências |
| `ci` | Automação e pipelines |
| `chore` | Manutenção sem alterar código de produção |
| `revert` | Reversão de commit anterior |

Boas práticas:

- Use escopo curto quando ajudar: `app`, `admin`, `billing`, `ai`, `site`, `docs`, `ci`.
- Escreva no imperativo: “adicionar”, “corrigir”, “remover”; evite “adicionado” e “ajustes”.
- Limite o cabeçalho a 100 caracteres e as linhas do corpo a 100 caracteres.
- Um commit deve representar uma mudança coerente; não agrupe assuntos independentes.
- Use `!` e um rodapé `BREAKING CHANGE:` apenas para mudanças incompatíveis.
- Títulos de pull requests seguem o mesmo padrão; o merge por squash preserva essa convenção.

## 5. Padrões do projeto

### Aplicação React (`src/`)

- Preserve os padrões existentes de TypeScript, componentes e serviços.
- Rode typecheck, build e testes antes de abrir o PR.
- Segredos e configurações pertencem ao `.env`, nunca ao código versionado.

### Aplicação estática (`pastorhub-static/`)

- HTML, CSS e JavaScript puro, sem framework e sem build obrigatório.
- Mantenha o núcleo compartilhado entre mobile, tablet e desktop; teste os três shells.
- Use funções globais já adotadas (`AdminAPI`, `PastorAI`, `PastorVers`, `PastorPag`,
  `Actions`) sem introduzir um segundo mecanismo de estado.
- Faça escape de valores renderizados em HTML com `esc`/`escapeHtml`.
- Preserve os dados e as migrações do `localStorage` existentes.
- Não coloque chaves reais de gateways ou LLMs no navegador; os campos atuais são para
  demonstração local.

## 6. Validação antes do PR

```bash
npm run check:static
npm run typecheck
npm test
npm run build
```

Confira também:

- console do navegador sem erros;
- ausência de overflow horizontal nas telas alteradas;
- fluxos afetados em mobile e desktop, além de tablet quando houver mudança no núcleo;
- tema claro e escuro, se alterar componentes visuais;
- documentação atualizada quando houver mudança de comportamento ou arquitetura.

## 7. Pull requests e revisão

1. Faça push da branch e abra o PR para `main` usando o template.
2. Relacione a issue (`Closes #123`) e descreva motivação, solução e validação.
3. Anexe capturas de tela para mudanças visuais, quando possível.
4. Aguarde CI verde e revisão dos responsáveis definidos em `CODEOWNERS`.
5. Responda aos comentários com novos commits convencionais; não apague o histórico da revisão.
6. Prefira **Squash and merge**, com o título do PR em Conventional Commits.

Nenhum PR deve alterar arquivos gerados (`dist/`, `build/`, `node_modules/`) ou artefatos de
assinatura Android. Releases e tags devem ser criados somente após alinhamento com os mantenedores.

## 8. Reportar vulnerabilidades

Não abra issues públicas para vulnerabilidades. Siga o processo em [SECURITY.md](SECURITY.md).
