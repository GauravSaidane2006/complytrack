const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { dashboardLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);

router.get('/summary', dashboardLimiter, dashboardController.getDashboardSummary);
router.get('/compliance-health', dashboardLimiter, dashboardController.getComplianceHealth);
router.get('/upcoming-deadlines', dashboardLimiter, dashboardController.getUpcomingDeadlines);

module.exports = router;
