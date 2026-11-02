const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

let UpdateClient = null;
let updateClient = null;

try {
  UpdateClient = require('../../../update-client');
  updateClient = new UpdateClient({
    mainServerUrl: process.env.MAIN_SERVER_URL || 'http://localhost:5100',
    apiKey: process.env.COMPLYTRACK_API_KEY
  });
} catch (err) {
  console.warn('[UPDATES] update-client module not available:', err.message);
}

function requireUpdateClient(req, res, next) {
  if (!updateClient) {
    return res.status(503).json({
      message: 'Update system is not available. The update module is not installed.',
      error: 'UPDATE_MODULE_MISSING'
    });
  }
  next();
}

router.get('/status', authenticate, async (req, res) => {
  try {
    const pkg = require('../../../package.json');
    const currentVersion = pkg.version || '1.0.0';

    if (!updateClient) {
      return res.json({ currentVersion, mainServerOnline: false, hasUpdate: false, updates: [], latestVersions: { server: null, client: null, full: null }, error: 'Update module not installed' });
    }

    try {
      const updateStatus = await updateClient.checkForUpdates();
      res.json({ currentVersion, mainServerOnline: true, ...updateStatus });
    } catch (error) {
      const mainServerMonitor = require('../services/mainServerMonitor');
      res.json({ currentVersion, mainServerOnline: false, hasUpdate: false, updates: [], latestVersions: { server: null, client: null, full: null }, error: error.message, monitor: mainServerMonitor.getStatus() });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to check update status', error: error.message });
  }
});

router.post('/check', authenticate, async (req, res) => {
  try {
    if (!updateClient) {
      return res.json({ mainServerOnline: false, hasUpdate: false, updates: [], latestVersions: { server: null, client: null, full: null }, error: 'Update module not installed' });
    }
    const result = await updateClient.checkForUpdates();
    res.json({ mainServerOnline: true, ...result });
  } catch (error) {
    res.json({ mainServerOnline: false, hasUpdate: false, updates: [], latestVersions: { server: null, client: null, full: null }, error: error.message });
  }
});

router.post('/apply', authenticate, authorize('superadmin', 'developer'), requireUpdateClient, async (req, res) => {
  const { version, component } = req.body;

  let update;
  try {
    const updates = await updateClient.checkForUpdates();
    update = updates.updates.find(u => u.availableVersion === version && u.component === component);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to check for updates', error: err.message });
  }

  if (!update) {
    return res.status(404).json({ message: 'Update not found' });
  }

  res.json({ message: 'Update is being applied. The server will restart shortly.', version, component });

  setImmediate(async () => {
    try {
      console.log(`\n[UPDATE] Applying update to v${version}...`);
      const result = await updateClient.applyUpdate(update, { skipRestart: true });
      console.log(`[UPDATE] Update completed:`, result);
    } catch (error) {
      console.error('[UPDATE] Apply failed:', error.message);
    }
  });
});

router.get('/changelog', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    if (!updateClient) return res.json([]);
    const changelog = await updateClient.getChangelog(limit);
    res.json(changelog);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch changelog', error: error.message });
  }
});

router.get('/download/:version', authenticate, authorize('superadmin', 'developer'), requireUpdateClient, async (req, res) => {
  try {
    const filePath = await updateClient.downloadUpdate(req.params.version);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Download failed', error: error.message });
  }
});

module.exports = router;
