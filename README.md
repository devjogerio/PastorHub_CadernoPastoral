# PastorHub — Caderno Pastoral

[![CI](https://github.com/devjogerio/PastorHub_CadernoPastoral/actions/workflows/ci.yml/badge.svg)](https://github.com/devjogerio/PastorHub_CadernoPastoral/actions/workflows/ci.yml)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://www.conventionalcommits.org/pt-br/v1.0.0/)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](LICENSE)

Ecossistema web e mobile para gestão pastoral: sermões com apoio de IA, agenda, atendimentos,
recursos pastorais, versículos diários, administração e modelo de negócio com assinaturas.

O repositório reúne duas implementações:

| Implementação | Stack | Uso |
|---|---|---|
| `pastorhub-static/` | HTML, CSS e JavaScript puro | App mobile/tablet/desktop, site institucional, painel e documentos; abre sem build |
| `src/` | React, TypeScript, Vite e Capacitor | Aplicação web/mobile-first original, com Supabase opcional e modo offline |

## 🚀 Início rápido

### Aplicação estática

```bash
git clone https://github.com/devjogerio/PastorHub_CadernoPastoral.git
cd PastorHub_CadernoPastoral/pastorhub-static
python -m http.server 8080
```

Abra http://localhost:8080. Também é possível abrir os arquivos HTML diretamente, mas o servidor
local é recomendado para que todos os módulos, integrações e a persistência funcionem na mesma
origem. Consulte o [guia completo da versão estática](pastorhub-static/README.md).

### Aplicação React

Na raiz do repositório:

```bash
npm install
npm run dev
```

O app funciona offline sem configuração. Para Supabase, copie `.env.example` para `.env` e
preencha apenas as variáveis públicas necessárias. Nunca versione o `.env`.

## 📱 Versão estática

| Página | Conteúdo |
|---|---|
| `pastorhub-static/index.html` | App mobile com seis módulos e navegação inferior |
| `pastorhub-static/tablet.html` | Shell tablet com navegação superior |
| `pastorhub-static/desktop.html` | Shell desktop com sidebar e painel de detalhes |
| `pastorhub-static/admin.html` | Painel administrativo com 18 seções |
| `pastorhub-static/site.html` | Site institucional e proposta de investimento |
| `pastorhub-static/docs/` | Manual, ficha técnica, roadmap, proposta e registro técnico |

Principais recursos:

- Caderno do Pastor com CRUD, busca, filtros, geração de sermões com IA e exportação PDF/TXT.
- Agenda, atendimentos, recursos, alertas, perfil, tema claro/escuro e persistência local.
- Conselho (Meet AI), assistente de estudo e banco de versículos com envio diário configurável.
- Base de conhecimento RAG, OCR em português e integrações com LLMs gratuitos e pagos.
- Planos Pro/Igreja, faturamento recorrente, gateways, Pix com QR Code e bloqueio por pendência.
- Painel responsivo, site público e documentos prontos para impressão em PDF.

**Arquitetura e estado atual:**
[Registro Técnico de Implementação](pastorhub-static/docs/registro-tecnico.html).

## 🧱 Estrutura do repositório

```text
.
├── src/                    # App React/TypeScript original
├── android/                # Projeto Android via Capacitor
├── docs/                   # Guias da implementação React
├── pastorhub-static/       # App, admin, site e documentos sem build
│   ├── css/
│   ├── docs/
│   ├── js/
│   └── README.md
├── tools/check-static.mjs  # Validação dos módulos JavaScript estáticos
├── .github/                # Actions, templates, CODEOWNERS e Dependabot
├── .husky/                 # Hooks locais de commits e validação
├── CONTRIBUTING.md         # Fluxo de branches, commits e PRs
├── SECURITY.md             # Canal privado para vulnerabilidades
├── CHANGELOG.md            # Histórico de mudanças relevantes
└── LICENSE                 # MIT
```

## ✅ Qualidade e comandos

```bash
npm run check:static  # node --check em todos os módulos estáticos
npm run typecheck     # TypeScript sem geração de arquivos
npm test              # Suíte de testes do Vitest
npm run build         # Build de produção do app React
```

O CI executa essas validações na `main` e em pull requests. Um workflow separado verifica
Conventional Commits nos commits enviados.

## 🌐 Demonstração via GitHub Pages

**Publicação ativa** — fonte: branch `main`, pasta raiz. A raiz redireciona para o app
estático e qualquer push na `main` reconstrói o site automaticamente.

- https://devjogerio.github.io/PastorHub_CadernoPastoral/

O workflow [pages.yml](.github/workflows/pages.yml) é a alternativa pela fonte *GitHub
Actions* (requer conta sem pendência de cobrança) e publica direto em `pastorhub-static/`.

A publicação é uma demonstração local-first: os dados ficam no navegador; não substitui backend,
autenticação multiusuário, processamento real de pagamentos ou armazenamento seguro de segredos.

## 🤝 Contribuindo

1. Abra uma issue pelo template de bug ou funcionalidade.
2. Crie uma branch a partir de `main` (`feat/...`, `fix/...`, `docs/...`).
3. Faça commits pequenos e coerentes usando **Conventional Commits**.
4. Execute as validações, preencha o template do PR e aguarde revisão e CI.

Exemplos:

```text
feat(billing): adicionar histórico de faturas ao portal do assinante
fix(admin): corrigir tabela de assinaturas no celular
docs(registro): atualizar inventário de módulos estáticos
ci(validacao): verificar sintaxe JavaScript em pull requests
```

Os hooks Husky validam os módulos antes do commit e a mensagem com Commitlint. O fluxo
completo está no [CONTRIBUTING.md](CONTRIBUTING.md). Pull requests seguem **squash merge** para
`main`, com o título no mesmo padrão.

## 📚 Governança

- [Código de Conduta](CODE_OF_CONDUCT.md)
- [Política de Segurança](SECURITY.md)
- [Suporte](SUPPORT.md)
- [Changelog](CHANGELOG.md)
- [Guia de geração do APK](GUIA_GERACAO_APK.md)

## 🔐 Dados e segredos

A versão estática salva dados em `localStorage` para demonstração. Não use credenciais reais de
pagamentos ou IA no navegador e não inclua dados pessoais em prints, issues ou commits. Builds,
dependências, `.env`, `.idea/`, keystores e dados locais ficam fora do versionamento.

## 📄 Licença

Distribuído sob a [Licença MIT](LICENSE).
