const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', riskController.getRiskAssessments);
router.get('/summary', riskController.getRiskSummary);
router.post('/assess', authorize('admin', 'manager'), riskController.assessRisk);
router.patch('/:id/status', authorize('admin'), riskController.updateRiskStatus);

module.exports = router;
