import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const source = resolve(process.env.TRANSPARENCY_SOURCE || '../betterpililla-transparency');
const target = resolve(root, 'public/budget-portal');
const pkg = JSON.parse(await readFile(resolve(source, 'package.json'), 'utf8'));
if (pkg.name !== 'betterpililla-transparency') throw new Error('Select the configured BetterPililla transparency source.');
const build = spawnSync(process.execPath, [resolve(source, 'node_modules/typescript/bin/tsc'), '-b'], { cwd: source, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const bundle = spawnSync(process.execPath, [resolve(source, 'node_modules/vite/bin/vite.js'), 'build', '--base', '/budget-portal/', '--outDir', 'dist-integrated'], { cwd: source, stdio: 'inherit', env: { ...process.env, VITE_EMBEDDED: 'true' } });
if (bundle.status !== 0) process.exit(bundle.status || 1);
await readFile(resolve(source, 'dist-integrated/index.html'), 'utf8');
// Delete only this generated directory after checking its absolute destination.
if (relative(resolve(root, 'public'), target) !== 'budget-portal') throw new Error('Unsafe generated directory.');
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(resolve(source, 'dist-integrated'), target, { recursive: true });
await cp(resolve(source, 'LICENSE'), resolve(target, 'LICENSE'));
const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' });
await writeFile(resolve(target, 'UPSTREAM.md'), `# Bundled BetterPililla budget portal\n\nSource: https://github.com/bettergovph/transparency-portal\nConfigured source revision: ${revision.stdout.trim()}\n\nGenerated with npm run transparency:sync. Served by the main BetterPililla website; no second server is required. Source records await review. License: MIT (see LICENSE).\n`);
console.log('Bundled the budget portal into public/budget-portal.');
