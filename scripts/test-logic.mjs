#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(tmpdir(), 'hoolah-logic-tests');
const tscBin = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsc.cmd' : 'tsc'
);

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

rmSync(outDir, { recursive: true, force: true });

run(tscBin, [
  '--pretty',
  'false',
  '--target',
  'ES2022',
  '--lib',
  'dom,dom.iterable,esnext',
  '--module',
  'commonjs',
  '--moduleResolution',
  'node',
  '--esModuleInterop',
  'true',
  '--skipLibCheck',
  'true',
  '--strict',
  'true',
  '--noEmit',
  'false',
  '--rootDir',
  root,
  '--outDir',
  outDir,
  'tests/lib.test.ts',
  'src/lib/daily.ts',
  'src/lib/game.ts',
  'src/lib/share.ts',
  'src/lib/stats.ts',
  'src/lib/storage.ts',
  'src/lib/time.ts',
  'src/lib/types.ts',
]);

run(process.execPath, ['--test', path.join(outDir, 'tests/lib.test.js')]);
