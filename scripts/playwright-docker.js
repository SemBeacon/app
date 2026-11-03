#!/usr/bin/env node
/**
 * Run Playwright inside the official Docker image that matches the installed
 * @playwright/test version. Visual baselines must be generated this way so that
 * fonts and rendering are identical locally and in CI. WebKit also needs this on
 * hosts without its system libraries.
 *
 *   node scripts/playwright-docker.js test --project=visual-android --update-snapshots
 */
const { spawnSync } = require('node:child_process');
const { version } = require('@playwright/test/package.json');

const cwd = process.cwd();
const uid = process.getuid ? `${process.getuid()}:${process.getgid()}` : undefined;
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

const args = [
    'run',
    '--rm',
    '--ipc=host',
    ...(process.stdout.isTTY ? ['-t'] : []),
    ...(uid ? ['--user', uid] : []),
    '-e',
    'HOME=/tmp',
    '-e',
    'CI',
    '-v',
    `${cwd}:/work`,
    '-w',
    '/work',
    image,
    'npx',
    'playwright',
    ...process.argv.slice(2),
];

const result = spawnSync('docker', args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
