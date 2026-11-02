const express = require('express');
const router = express.Router();
const mainServerMonitor = require('../services/mainServerMonitor');

// Public status of the connection to the central Main Server.
// Used by the web client to show a popup when the Main Server is down.
router.get('/status', async (req, res) => {
  const status = mainServerMonitor.getStatus();
  res.json({
    service: 'complytrack-server',
    monitoredUrl: mainServerMonitor.getUrl(),
    monitor: status
  });
});

// Force an immediate re-check (used by the popup's "Retry" button)
router.post('/refresh', async (req, res) => {
  const status = await mainServerMonitor.refresh();
  res.json({ service: 'complytrack-server', monitor: status });
});

module.exports = router;