#!/usr/bin/env node
/* Valida os módulos JavaScript da aplicação estática sem instalar dependências. */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const staticRoot = join(root, 'pastorhub-static');

function javascriptFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return javascriptFiles(path);
    return entry.endsWith('.js') ? [path] : [];
  });
}

const files = javascriptFiles(staticRoot).sort();
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failures.push(`${relative(root, file)}\n${result.stderr.trim()}`);
  }
}

if (failures.length) {
  console.error(`Falha de sintaxe em ${failures.length} arquivo(s):\n\n${failures.join('\n\n')}`);
  process.exit(1);
}

console.log(`PastorHub estático: ${files.length} arquivos JavaScript válidos.`);
