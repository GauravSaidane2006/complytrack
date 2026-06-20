const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/compliance-health', dashboardController.getComplianceHealth);
router.get('/upcoming-deadlines', dashboardController.getUpcomingDeadlines);

module.exports = router;
