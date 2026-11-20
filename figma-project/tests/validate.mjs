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
