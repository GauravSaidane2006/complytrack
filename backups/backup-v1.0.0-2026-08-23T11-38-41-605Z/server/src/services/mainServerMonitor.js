const path = require('path');
const fs = require('fs');

const MAIN_SERVER_URL = (process.env.MAIN_SERVER_URL || 'http://localhost:5100').replace(/\/+$/, '');
const API_KEY = process.env.COMPLYTRACK_API_KEY || '';
const CHECK_INTERVAL_MS = parseInt(process.env.MAIN_SERVER_CHECK_INTERVAL || 15000, 10);
const HEARTBEAT_INTERVAL_MS = parseInt(process.env.MAIN_SERVER_HEARTBEAT_INTERVAL || 30000, 10);
const REQUEST_TIMEOUT_MS = parseInt(process.env.MAIN_SERVER_REQUEST_TIMEOUT || 5000, 10);

const state = {
  online: null,             // null = not checked yet
  reason: 'not-checked',
  checkedAt: null,
  lastOkAt: null,
  lastErrorAt: null,
  latencyMs: null,
  error: null,
  consecutiveFailures: 0,
  mainServerVersion: null
};

let checkTimer = null;
let heartbeatTimer = null;

function readJsonVersion(relativePath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, relativePath), 'utf8'));
    return pkg.version || null;
  } catch {
    return null;
  }
}

function getVersions() {
  return {
    serverVersion: readJsonVersion('../../package.json'),
    clientVersion: readJsonVersion('../../client/package.json')
  };
}

async function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkConnection() {
  const started = Date.now();
  try {
    const res = await timedFetch(`${MAIN_SERVER_URL}/api/health`, {
      headers: { Accept: 'application/json' }
    });

    const latencyMs = Date.now() - started;
    let mainServerVersion = null;
    if (res.ok) {
      try {
        const body = await res.json();
        if (body && typeof body === 'object') mainServerVersion = body.version || null;
      } catch { /* body not json */ }
    }

    if (!res.ok) {
      throw new Error(`Main server health check returned HTTP ${res.status} ${res.statusText}`);
    }

    state.online = true;
    state.reason = 'ok';
    state.checkedAt = new Date();
    state.lastOkAt = new Date();
    state.latencyMs = latencyMs;
    state.error = null;
    state.consecutiveFailures = 0;
    state.mainServerVersion = mainServerVersion;
  } catch (error) {
    state.consecutiveFailures += 1;
    state.online = false;
    state.checkedAt = new Date();
    state.lastErrorAt = new Date();
    state.latencyMs = Date.now() - started;
    state.error =
      error.name === 'AbortError'
        ? 'Main server did not respond in time (request timeout)'
        : error.cause && error.cause.code
          ? `Cannot reach main server (${error.cause.code})`
          : `Cannot reach main server: ${error.message}`;
    if (state.consecutiveFailures < 3) {
      state.reason = 'unreachable';
    } else {
      state.reason = 'down';
    }
  }
  return { ...state };
}

async function sendHeartbeat() {
  if (!API_KEY) {
    if (state.online === true) {
      state.heartbeatWarning = 'COMPLYTRACK_API_KEY not configured - heartbeat not sent';
    }
    return;
  }

  const heartbeatBody = {
    ...getVersions(),
    serverUrl: MAIN_SERVER_URL,
    uptime: Math.round(process.uptime()),
    platform: `${process.platform} ${process.arch}`,
    nodeVersion: process.version
  };

  try {
    const res = await timedFetch(`${MAIN_SERVER_URL}/api/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(heartbeatBody)
    });
    if (!res.ok) {
      state.heartbeatWarning = `Heartbeat rejected by main server (HTTP ${res.status})`;
    } else {
      delete state.heartbeatWarning;
    }
  } catch (error) {
    // Heartbeat failures are expected when the main server is down — health check reports it.
    state.heartbeatWarning = undefined;
  }
}

const mainServerMonitor = {
  getUrl() {
    return MAIN_SERVER_URL;
  },

  getStatus() {
    return { ...state };
  },

  async refresh() {
    return checkConnection();
  },

  start() {
    if (checkTimer) return;
    checkConnection();
    sendHeartbeat();
    checkTimer = setInterval(() => checkConnection(), CHECK_INTERVAL_MS);
    heartbeatTimer = setInterval(() => sendHeartbeat(), HEARTBEAT_INTERVAL_MS);
    if (checkTimer.unref) checkTimer.unref();
    if (heartbeatTimer.unref) heartbeatTimer.unref();
    console.log(`[main-server-monitor] watching ${MAIN_SERVER_URL} (check ${CHECK_INTERVAL_MS}ms, heartbeat ${HEARTBEAT_INTERVAL_MS}ms)`);
  },

  stop() {
    if (checkTimer) { clearInterval(checkTimer); checkTimer = null; }
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  }
};

module.exports = mainServerMonitor;