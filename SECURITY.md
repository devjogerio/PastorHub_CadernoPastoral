# Política de Segurança

## Versões suportadas

A branch `main` é a versão mantida do projeto. Correções de segurança são priorizadas nela.

| Versão | Suporte |
|---|---|
| `main` | ✅ |
| Branches antigas e demonstrações locais | ❌ |

## Reportar uma vulnerabilidade

**Não abra uma issue pública.** Use o canal privado de Security Advisories do GitHub:

https://github.com/devjogerio/PastorHub_CadernoPastoral/security/advisories/new

Inclua, quando possível:

- descrição do problema e impacto;
- página, módulo ou versão afetada;
- passos mínimos para reprodução;
- evidências sem dados pessoais ou credenciais reais;
- sugestão de mitigação, se houver.

O mantenedor analisará o relatório, confirmará o recebimento pelo próprio advisory e combinará
a correção e a divulgação de forma responsável. Prazos podem variar conforme gravidade e
complexidade; não publique detalhes antes da coordenação com o mantenedor.

## Cuidados específicos do projeto

- Nunca versione `.env`, tokens, access keys, chaves privadas ou certificados/keystores.
- Credenciais inseridas no painel estático ficam no `localStorage` do navegador e servem apenas
  para demonstração. Elas não devem ser usadas como armazenamento de produção.
- Dados de aconselhamento, atendimento e faturamento podem ser sensíveis; use dados fictícios
  em testes, issues e capturas de tela.
- Integrações reais devem proteger chamadas e segredos em um backend, com validação de
  webhooks, CORS restrito, controle de acesso e monitoramento.
