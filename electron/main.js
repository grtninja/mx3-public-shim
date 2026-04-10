const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app, BrowserWindow, screen } = require('electron');

const WINDOW_TITLE = 'NEXUS CONTROL CENTER: MEMRYX MX3';
const REPO_ROOT = path.resolve(__dirname, '..');
const FRONTEND_ENTRY = path.join(REPO_ROOT, 'src', 'mx3_public_shim', 'frontend', 'index.html');
const STARTUP_LOG = path.join(os.tmpdir(), 'mx3-public-shim-electron.log');

let mainWindow = null;

function logStartup(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  try {
    fs.appendFileSync(STARTUP_LOG, line, 'utf8');
  } catch {}
  // keep logging best-effort; never block app startup on log file permissions
}

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const workArea = display.workArea;
  // First-launch window shape:
  // - centered, roomy, not fullscreen
  // - matches the operator-approved "new user" initial view
  const targetWidth = 1180;
  const targetHeight = 980;
  const width = Math.max(920, Math.min(targetWidth, workArea.width - 80));
  const height = Math.max(760, Math.min(targetHeight, workArea.height - 80));
  const x = workArea.x + Math.max(0, Math.floor((workArea.width - width) / 2));
  const y = workArea.y + Math.max(0, Math.floor((workArea.height - height) / 2));
  logStartup(`creating window; entry=${FRONTEND_ENTRY}; bounds=${width}x${height}@${x},${y}`);
  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: 760,
    minHeight: 620,
    show: false,
    title: WINDOW_TITLE,
    autoHideMenuBar: true,
    backgroundColor: '#09111d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    logStartup('window ready-to-show');
    mainWindow.show();
    mainWindow.focus();
  });
  mainWindow.on('closed', () => {
    logStartup('window closed');
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('did-finish-load', () => {
    logStartup('webContents did-finish-load');
  });
  mainWindow.webContents.on('did-fail-load', (_event, code, description, validatedURL) => {
    logStartup(`webContents did-fail-load code=${code} description=${description} url=${validatedURL}`);
  });
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    logStartup(`render-process-gone reason=${details.reason} exitCode=${details.exitCode}`);
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // This is a local-only control surface. Never allow navigation out of the bundled UI.
    if (!String(url || '').startsWith('file:')) event.preventDefault();
  });

  // Public repo contract: Electron is frontend-only. It must never spawn or mutate the live backend.
  mainWindow.loadFile(FRONTEND_ENTRY).then(() => {
    logStartup('loadFile resolved');
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  }).catch((error) => {
    logStartup(`loadFile rejected: ${error && error.stack ? error.stack : error}`);
  });
}

process.on('uncaughtException', (error) => {
  logStartup(`uncaughtException: ${error && error.stack ? error.stack : error}`);
});
process.on('unhandledRejection', (error) => {
  logStartup(`unhandledRejection: ${error && error.stack ? error.stack : error}`);
});

app.whenReady().then(async () => {
  logStartup('app.whenReady start');
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  logStartup('window-all-closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
