const express = require('express');
const router = express.Router();
const UpdateClient = require('../../../update-client');
const { authenticate, authorize } = require('../middleware/auth');

// Initialize update client
const updateClient = new UpdateClient({
  mainServerUrl: process.env.MAIN_SERVER_URL || 'http://localhost:5100',
  apiKey: process.env.COMPLYTRACK_API_KEY
});

// Get current update status
router.get('/status', authenticate, async (req, res) => {
  try {
    const pkg = require('../../../package.json');
    const currentVersion = pkg.version || '1.0.0';

    try {
      const updateStatus = await updateClient.checkForUpdates();
      res.json({ currentVersion, mainServerOnline: true, ...updateStatus });
    } catch (error) {
      // Main server unreachable — report gracefully instead of a 500
      const mainServerMonitor = require('../services/mainServerMonitor');
      res.json({
        currentVersion,
        mainServerOnline: false,
        hasUpdate: false,
        updates: [],
        latestVersions: { server: null, client: null, full: null },
        error: error.message,
        monitor: mainServerMonitor.getStatus()
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to check update status', error: error.message });
  }
});

// Check for updates
router.post('/check', authenticate, async (req, res) => {
  try {
    const result = await updateClient.checkForUpdates();
    res.json({ mainServerOnline: true, ...result });
  } catch (error) {
    res.json({
      mainServerOnline: false,
      hasUpdate: false,
      updates: [],
      latestVersions: { server: null, client: null, full: null },
      error: error.message
    });
  }
});

// Apply update (superadmin only)
router.post('/apply', authenticate, authorize('superadmin', 'developer'), async (req, res) => {
  try {
    const { version, component } = req.body;

    // Find the update info
    const updates = await updateClient.checkForUpdates();
    const update = updates.updates.find(u =>
      u.availableVersion === version && u.component === component
    );

    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }

    // Apply the update
    const result = await updateClient.applyUpdate(update);

    res.json({
      message: 'Update applied successfully',
      ...result
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to apply update', error: error.message });
  }
});

// Get changelog
router.get('/changelog', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const changelog = await updateClient.getChangelog(limit);
    res.json(changelog);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch changelog', error: error.message });
  }
});

// Download update file
router.get('/download/:version', authenticate, authorize('superadmin', 'developer'), async (req, res) => {
  try {
    const filePath = await updateClient.downloadUpdate(req.params.version);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Download failed', error: error.message });
  }
});

module.exports = router;
