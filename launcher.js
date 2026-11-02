const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const BASE_DIR = path.dirname(process.execPath);
const SERVER_DIR = path.join(BASE_DIR, 'server');
const CLIENT_DIR = path.join(BASE_DIR, 'client', 'dist');
const SERVER_ENTRY = path.join(SERVER_DIR, 'src', 'app.js');
const MAIN_SERVER_DIR = path.join(BASE_DIR, 'main-server');
const MAIN_SERVER_ENTRY = path.join(MAIN_SERVER_DIR, 'src', 'app.js');
const MAIN_SERVER_PORT = process.env.MAIN_SERVER_PORT || 5100;
const PORT = process.env.PORT || 5173;
const CLIENT_URL = `http://localhost:${PORT}`;

function log(msg) {
  console.log(`[ComplyTrack] ${msg}`);
}

function findNodeExecutable() {
  try {
    const nodePath = execSync('where node', { encoding: 'utf8' }).trim().split('\n')[0].trim();
    if (nodePath && fs.existsSync(nodePath)) {
      log(`Found Node.js at: ${nodePath}`);
      return nodePath;
    }
  } catch (e) {}

  const candidates = [
    'node.exe',
    'node',
    path.join(process.env.ProgramFiles || '', 'nodejs', 'node.exe'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'nodejs', 'node.exe'),
    path.join(process.env.APPDATA || '', '..', 'Local', 'Programs', 'nodejs', 'node.exe'),
  ];

  for (const candidate of candidates) {
    try {
      if (candidate.includes('/') || candidate.includes('\\')) {
        if (fs.existsSync(candidate)) {
          log(`Found Node.js at: ${candidate}`);
          return candidate;
        }
      } else {
        const resolved = execSync(`where ${candidate}`, { encoding: 'utf8' }).trim().split('\n')[0].trim();
        if (resolved && fs.existsSync(resolved)) {
          log(`Found Node.js at: ${resolved}`);
          return resolved;
        }
      }
    } catch (e) {}
  }

  return null;
}

function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(url, (res) => {
        res.resume();
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Server did not start within 30 seconds'));
        } else {
          setTimeout(check, 1000);
        }
      });
    };
    check();
  });
}

function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  if (platform === 'win32') cmd = `start "" "${url}"`;
  else if (platform === 'darwin') cmd = `open "${url}"`;
  else cmd = `xdg-open "${url}"`;
  execSync(cmd);
}

function pauseAndExit(code) {
  console.log('\nPress any key to exit...');
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.on('data', () => process.exit(code));
}

async function main() {
  log('Starting ComplyTrack...');

  const nodePath = findNodeExecutable();
  if (!nodePath) {
    console.error('[ComplyTrack] ERROR: Node.js is not installed or not found in PATH.');
    console.error('[ComplyTrack] Please install Node.js from https://nodejs.org');
    pauseAndExit(1);
    return;
  }

  if (!fs.existsSync(SERVER_ENTRY)) {
    console.error(`[ComplyTrack] ERROR: Server not found at ${SERVER_ENTRY}`);
    console.error('[ComplyTrack] Make sure the server/ folder is next to ComplyTrack.exe.');
    pauseAndExit(1);
    return;
  }

  if (!fs.existsSync(CLIENT_DIR)) {
    console.error(`[ComplyTrack] ERROR: Client build not found at ${CLIENT_DIR}`);
    console.error('[ComplyTrack] Make sure the client/dist/ folder is next to ComplyTrack.exe.');
    pauseAndExit(1);
    return;
  }

  log(`Node.js:  ${nodePath}`);
  log(`Server:   ${SERVER_DIR}`);
  log(`Client:   ${CLIENT_DIR}`);

  if (fs.existsSync(MAIN_SERVER_ENTRY)) {
    log(`Starting main server on port ${MAIN_SERVER_PORT}...`);
    const mainEnv = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(MAIN_SERVER_PORT),
      MONGODB_URI: process.env.MAIN_SERVER_MONGODB_URI || 'mongodb://localhost:27017/complytrack_main',
      JWT_SECRET: process.env.MAIN_SERVER_JWT_SECRET || 'complytrack_main_server_secret_key_2026',
      CLIENT_URL: CLIENT_URL
    };
    const mainProc = spawn(nodePath, [MAIN_SERVER_ENTRY], {
      cwd: MAIN_SERVER_DIR,
      env: mainEnv,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: false
    });
    mainProc.stdout.on('data', (d) => {
      d.toString().trim().split('\n').forEach(l => { if (l) log(`[MainServer] ${l}`); });
    });
    mainProc.stderr.on('data', (d) => {
      d.toString().trim().split('\n').forEach(l => { if (l) log(`[MainServer] ${l}`); });
    });
    mainProc.on('error', (err) => log(`Main server error: ${err.message}`));
    mainProc.on('close', (code) => log(`Main server exited (${code})`));
  } else {
    log('Main server not found — skipping.');
  }

  log(`Starting server on port ${PORT}...`);

  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(PORT),
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_SECRET: process.env.JWT_SECRET || 'complytrack-desktop-secret-change-in-production',
    JWT_EXPIRES_IN: '7d',
    JWT_REFRESH_EXPIRES_IN: '30d',
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: process.env.EMAIL_PORT || '587',
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@complytrack.in',
    CLIENT_URL: CLIENT_URL,
    UPLOAD_DIR: path.join(SERVER_DIR, 'uploads'),
    MAX_FILE_SIZE: '10485760',
    MAIN_SERVER_URL: process.env.MAIN_SERVER_URL || 'http://localhost:5100',
    COMPLYTRACK_API_KEY: process.env.COMPLYTRACK_API_KEY || '',
    MAIN_SERVER_CHECK_INTERVAL: '15000',
    MAIN_SERVER_HEARTBEAT_INTERVAL: '30000',
    MAIN_SERVER_REQUEST_TIMEOUT: '5000'
  };

  const serverProcess = spawn(nodePath, [SERVER_ENTRY], {
    cwd: SERVER_DIR,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: false
  });

  serverProcess.stdout.on('data', (data) => {
    data.toString().trim().split('\n').forEach(line => {
      if (line) log(`[Server] ${line}`);
    });
  });

  serverProcess.stderr.on('data', (data) => {
    data.toString().trim().split('\n').forEach(line => {
      if (line) log(`[Server] ${line}`);
    });
  });

  serverProcess.on('error', (err) => {
    console.error(`[ComplyTrack] Failed to start server: ${err.message}`);
    pauseAndExit(1);
  });

  serverProcess.on('close', (code) => {
    log(`Server exited with code ${code}`);
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    log('Shutting down...');
    serverProcess.kill('SIGTERM');
    setTimeout(() => process.exit(0), 2000);
  });

  process.on('SIGTERM', () => {
    serverProcess.kill('SIGTERM');
  });

  try {
    await waitForServer(`http://127.0.0.1:${PORT}/api`);
    log('Server is ready!');
    log(`Opening ${CLIENT_URL} in your browser...`);
    openBrowser(CLIENT_URL);
    log('');
    log('========================================');
    log('  ComplyTrack is running!');
    log(`  Open: ${CLIENT_URL}`);
    log('  Press Ctrl+C to stop.');
    log('========================================');
  } catch (err) {
    console.error(`[ComplyTrack] ${err.message}`);
    serverProcess.kill('SIGTERM');
    pauseAndExit(1);
  }
}

main();
