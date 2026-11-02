const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

log.initialize({ preload: true });
log.transports.file.level = 'info';
log.transports.console.level = false;
autoUpdater.logger = log;

const isDev = process.argv.includes('--dev');
const isPackaged = app.isPackaged;

if (!isDev) {
  const userDataPath = path.join(app.getPath('userData'), 'ComplyTrack');
  if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });
  app.setPath('userData', userDataPath);
}

let mainWindow = null;
let serverProcess = null;
let serverStatus = 'stopped';

const getServerPath = () => {
  if (isPackaged) {
    return path.join(process.resourcesPath, 'server');
  }
  return path.join(__dirname, '..', '..', '..', 'server');
};

const getClientPath = () => {
  if (isPackaged) {
    return path.join(process.resourcesPath, 'client', 'dist');
  }
  return path.join(__dirname, '..', '..', '..', 'client', 'dist');
};

const getNodeExecutable = () => {
  if (isPackaged) {
    return path.join(process.resourcesPath, 'node.exe');
  }
  return process.execPath;
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    title: 'ComplyTrack',
    icon: path.join(__dirname, '..', 'resources', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1e293b',
      symbolColor: '#ffffff',
      height: 40
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log.error(`Failed to load: ${validatedURL} - ${errorDescription} (${errorCode})`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log.info('Window loaded successfully');
  });

  const clientPath = getClientPath();
  const indexPath = path.join(clientPath, 'index.html');

  log.info(`Client path: ${clientPath}`);
  log.info(`Index path: ${indexPath}`);
  log.info(`Index exists: ${fs.existsSync(indexPath)}`);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      log.error(`Index.html not found at ${indexPath}`);
      dialog.showErrorBox('Error', `Application files not found at ${indexPath}`);
      app.quit();
    }
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

function startServer() {
  if (serverProcess) {
    log.warn('Server already running');
    return;
  }

  const serverPath = getServerPath();
  const entryPoint = path.join(serverPath, 'src', 'app.js');
  const nodeExec = getNodeExecutable();

  if (!fs.existsSync(entryPoint)) {
    const err = `Server entry point not found: ${entryPoint}`;
    log.error(err);
    sendToRenderer('server-status', { status: 'error', message: err });
    return;
  }

  const uploadDir = path.join(serverPath, 'uploads');
  const reportsDir = path.join(serverPath, 'reports');
  const noticesDir = path.join(serverPath, 'notices');
  const sectorPdfsDir = path.join(serverPath, 'sector-pdfs');
  [uploadDir, reportsDir, noticesDir, sectorPdfsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '5000',
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || 'complytrack-desktop-secret-change-in-production',
    JWT_EXPIRES_IN: '7d',
    JWT_REFRESH_EXPIRES_IN: '30d',
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || '587',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@complytrack.in',
    CLIENT_URL: 'http://localhost:5000',
    UPLOAD_DIR: uploadDir,
    MAX_FILE_SIZE: '10485760',
    MAIN_SERVER_URL: process.env.MAIN_SERVER_URL || 'http://localhost:5100',
    COMPLYTRACK_API_KEY: process.env.COMPLYTRACK_API_KEY || '',
    MAIN_SERVER_CHECK_INTERVAL: '15000',
    MAIN_SERVER_HEARTBEAT_INTERVAL: '30000',
    MAIN_SERVER_REQUEST_TIMEOUT: '5000'
  };

  log.info(`Starting server from: ${entryPoint}`);
  serverStatus = 'starting';
  sendToRenderer('server-status', { status: 'starting' });

  serverProcess = spawn(nodeExec, [entryPoint], {
    cwd: serverPath,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  serverProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line) log.info(`[SERVER] ${line}`);
    });
  });

  serverProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line) log.error(`[SERVER] ${line}`);
    });
  });

  serverProcess.on('error', (err) => {
    log.error('Server process error:', err);
    serverStatus = 'error';
    sendToRenderer('server-status', { status: 'error', message: err.message });
    serverProcess = null;
  });

  serverProcess.on('close', (code, signal) => {
    log.info(`Server process exited with code ${code}, signal ${signal}`);
    serverStatus = 'stopped';
    sendToRenderer('server-status', { status: 'stopped' });
    serverProcess = null;
  });

  waitOn({ resources: ['tcp:127.0.0.1:5000'], timeout: 30000 })
    .then(() => {
      serverStatus = 'running';
      sendToRenderer('server-status', { status: 'running' });
      log.info('Server started successfully on port 5000');
    })
    .catch((err) => {
      log.error('Server failed to start:', err);
      serverStatus = 'error';
      sendToRenderer('server-status', { status: 'error', message: 'Server failed to start within 30 seconds' });
      if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
      }
    });
}

function stopServer() {
  if (!serverProcess) return;
  log.info('Stopping server...');
  serverStatus = 'stopping';
  sendToRenderer('server-status', { status: 'stopping' });
  serverProcess.kill('SIGTERM');
  setTimeout(() => {
    if (serverProcess) {
      serverProcess.kill('SIGKILL');
    }
  }, 5000);
}

ipcMain.handle('server:getStatus', () => serverStatus);
ipcMain.handle('server:restart', () => { stopServer(); setTimeout(startServer, 1000); });
ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('app:quit', () => { if (serverProcess) { stopServer(); setTimeout(() => app.quit(), 1000); } else { app.quit(); } });
ipcMain.handle('app:minimize', () => mainWindow?.minimize());
ipcMain.handle('app:maximize', () => { if (mainWindow?.isMaximized()) mainWindow.unmaximize(); else mainWindow?.maximize(); });
ipcMain.handle('app:isMaximized', () => mainWindow?.isMaximized() || false);
ipcMain.handle('app:openDevTools', () => mainWindow?.webContents.openDevTools());

app.whenReady().then(async () => {
  if (!isDev) {
    startServer();
    try {
      await waitOn({ resources: ['tcp:127.0.0.1:5000'], timeout: 30000 });
      log.info('Server is ready, creating window');
    } catch (err) {
      log.error('Server failed to start:', err);
      dialog.showErrorBox('Error', 'Server failed to start within 30 seconds');
      app.quit();
      return;
    }
  }
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (serverProcess) stopServer();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', (event) => {
  if (serverProcess) {
    event.preventDefault();
    stopServer();
    setTimeout(() => app.quit(), 1000);
  }
});

process.on('uncaughtException', (err) => log.error('Uncaught exception:', err));
process.on('unhandledRejection', (reason) => log.error('Unhandled rejection:', reason));