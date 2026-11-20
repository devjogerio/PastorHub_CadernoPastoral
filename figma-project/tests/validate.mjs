import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let errors = 0;
const fail = (msg) => { errors++; console.error('✗ ' + msg); };
const ok = (msg) => console.log('✓ ' + msg);

for (const f of ['index.html', 'css/styles.css', 'js/app.js', 'README.md', '.nojekyll']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p) || (f !== '.nojekyll' && fs.statSync(p).size === 0)) fail('arquivo ausente/vazio: ' + f);
}
if (!errors) ok('arquivos obrigatórios presentes');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const all = html + css + js;

const screens = [...html.matchAll(/data-screen="([a-z]+)"/g)].map(m => m[1]);
const uniq = new Set(screens);
if (screens.length < 13 || uniq.size !== screens.length) fail('telas ausentes ou duplicadas: ' + screens.length + '/' + uniq.size);
else ok('telas: ' + screens.length + ' (' + [...uniq].join(', ') + ')');

// Localização pt-BR
if (!/lang="pt-BR"/.test(html)) fail('html sem lang pt-BR');
else ok('idioma pt-BR declarado');
const ingles = ['Sign in', 'Sign Up', 'Log In', 'Search...', 'Back', 'Latest Messages', 'Write a post', 'View All', 'Daily scripture', 'Need Hand', 'Service Recordings', 'Kids Corner'];
const encontrados = ingles.filter((w) => html.indexOf(w) !== -1 || js.indexOf(w) !== -1);
if (encontrados.length) fail('textos em inglês restantes: ' + encontrados.join(', '));
else ok('textos da interface em pt-BR');

// Navegação e pesquisa global
if ((html.match(/class="nav-link"/g) || []).length < 6) fail('menu horizontal incompleto');
if ((html.match(/class="submenu"/g) || []).length < 3) fail('submenus ausentes');
if (html.indexOf('id="nav-toggle"') === -1) fail('menu hambúrguer ausente');
for (const token of ['id="global-search"', 'id="search-input"', 'data-filter="registros"', 'data-filter="arquivos"', 'sem-resultados', 'normalizar', 'destacar', 'performance.now']) {
  if ((html + js).indexOf(token) === -1) fail('recurso de pesquisa ausente: ' + token);
}
if (!/nav-open/.test(css) || !/@media \(max-width: 920px\)/.test(css)) fail('CSS responsivo do menu ausente');
if (!/mark \{/.test(css)) fail('realce de termos ausente');
ok('menu responsivo, submenus e pesquisa global presentes');

const refs = [...all.matchAll(/(?:src|url\(|href)="?\/?(assets\/[A-Za-z0-9._-]+\.svg)/g)].map(m => m[1]);
const uniqueRefs = [...new Set(refs)];
for (const ref of uniqueRefs) {
  const p = path.join(root, ref);
  if (!fs.existsSync(p) || fs.statSync(p).size < 50) fail('asset inválido: ' + ref);
}
ok('assets referenciados: ' + uniqueRefs.length);

if (/figma\.com\/api\/mcp\/asset/.test(all)) fail('URL temporária do Figma no código');
else ok('sem URLs temporárias do Figma');

if (!/@media \(max-width: 460px\)/.test(css)) fail('media query mobile ausente');
else ok('media queries presentes');

if (/https?:\/\//.test(js)) fail('JavaScript com dependência de rede');
else ok('JavaScript sem backend/rede');

try { execFileSync(process.execPath, ['--check', path.join(root, 'js/app.js')], { stdio: 'pipe' }); ok('sintaxe JS válida'); }
catch (e) { fail('sintaxe JS inválida'); }

console.log(errors ? `\n${errors} falha(s)` : '\nTodas as verificações passaram');
process.exit(errors ? 1 : 0);
