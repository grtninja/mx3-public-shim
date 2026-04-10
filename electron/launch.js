const path = require('node:path');
const { spawn } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const electronBinary = require('electron');
const launchEnv = { ...process.env };
const frontendOnly = process.argv.includes('--frontend-only');
delete launchEnv.ELECTRON_RUN_AS_NODE;
if (frontendOnly) {
  launchEnv.MX3_PUBLIC_SHIM_FRONTEND_ONLY = '1';
}

const child = spawn(electronBinary, [repoRoot], {
  cwd: repoRoot,
  env: launchEnv,
  stdio: 'ignore',
  windowsHide: true,
  detached: true,
});

let settled = false;

child.on('error', (error) => {
  if (settled) {
    return;
  }
  settled = true;
  console.error(error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (settled) {
    return;
  }
  settled = true;
  process.exit(code ?? 0);
});

setTimeout(() => {
  if (settled) {
    return;
  }
  settled = true;
  child.unref();
  process.exit(0);
}, 4000);
