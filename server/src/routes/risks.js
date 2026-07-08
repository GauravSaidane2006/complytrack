const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);

router.get('/', apiLimiter, riskController.getRiskAssessments);
router.get('/summary', apiLimiter, riskController.getRiskSummary);
router.post('/assess', authorize('admin', 'manager'), apiLimiter, riskController.assessRisk);
router.patch('/:id/status', authorize('admin'), apiLimiter, riskController.updateRiskStatus);

module.exports = router;
