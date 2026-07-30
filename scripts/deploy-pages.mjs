import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const outputDir = join(projectRoot, 'dist-pages');
const wranglerCli = join(projectRoot, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

if (!existsSync(outputDir)) {
  console.error('No existe dist-pages. Ejecuta npm run build:pages antes de publicar.');
  process.exit(1);
}

const deployment = spawnSync(
  process.execPath,
  [
    wranglerCli,
    'pages',
    'deploy',
    outputDir,
    '--project-name',
    'elkystudio',
    '--branch',
    'main',
  ],
  {
    cwd: tmpdir(),
    stdio: 'inherit',
  },
);

process.exit(deployment.status ?? 1);
