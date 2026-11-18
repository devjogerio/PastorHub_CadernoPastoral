#!/usr/bin/env node
/* Executa Vitest desativando o stub experimental de storage do Node recente. */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const env = { ...process.env };
if (Object.hasOwn(globalThis, 'localStorage') && globalThis.localStorage === undefined) {
  env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--no-experimental-webstorage']
    .filter(Boolean)
    .join(' ');
}

const vitest = fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url));
const result = spawnSync(process.execPath, [vitest, 'run', ...process.argv.slice(2)], {
  env,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
