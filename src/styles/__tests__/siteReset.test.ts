import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const cssPath = fileURLToPath(new URL('../site.css', import.meta.url));
const pagePath = fileURLToPath(new URL('../../features/site/SitePage.tsx', import.meta.url));
const css = readFileSync(cssPath, 'utf8');

/* O reset do site institucional precisa ficar em @layer base e escopado:
   regras universais fora de camada vencem utilitários do Tailwind e zeram
   margins/paddings de todo o app (ex.: md:pl-64 e px-3 calculavam 0px). */
describe('reset CSS do site institucional', () => {
  const page = readFileSync(pagePath, 'utf8');

  it('nao declara reset universal fora de camada', () => {
    expect(css).not.toMatch(/^\*\{[^}]*padding\s*:/m);
    expect(css).not.toMatch(/^\* \{[^}]*padding\s*:/m);
  });

  it('escopa o reset para o site e o mantem na camada base', () => {
    const layer = css.match(/@layer base\s*\{([\s\S]*?)\n\}/);
    expect(layer).not.toBeNull();
    expect(layer?.[1]).toContain('.site-scope *');
    expect(layer?.[1]).toMatch(/padding:\s*0;/);
  });

  it('aplica o escopo na raiz do SitePage', () => {
    expect(page).toMatch(/<div className="site-scope pt-4">/);
  });
});

/* Seções de largura total do site institucional precisam do mesmo container
   do site.html estático, senão o texto encosta nas bordas no mobile. */
describe('container das secoes do site institucional', () => {
  const page = readFileSync(
    fileURLToPath(new URL('../../features/site/SitePage.tsx', import.meta.url)),
    'utf8',
  );

  it('usa container nas secoes de numeros e CTA', () => {
    expect(page).toContain('<div className="container numbers-grid">');
    expect(page).toContain('<div className="container cta-inner">');
  });

  it('mantem os cards flutuantes dentro do container no app', () => {
    expect(css).toContain('.site-scope .float-2, .site-scope .float-3 { right: 0; }');
  });
});

/* O indice de documentos nao pode ultrapassar a largura da coluna em 360px. */
describe('indice de documentos', () => {
  const page = readFileSync(
    fileURLToPath(new URL('../../features/docs/DocsPage.tsx', import.meta.url)),
    'utf8',
  );

  it('permite quebrar linha nos cartoes e nos botoes', () => {
    expect(page).toContain('flex min-w-0 flex-wrap items-center');
    expect(page).toContain('flex flex-wrap items-center gap-1');
  });
});
