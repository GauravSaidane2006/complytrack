const express = require('express');
const router = express.Router();
const controller = require('../controllers/complianceSetupController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.get('/options', authenticate, apiLimiter, controller.getComplianceOptions);
router.post('/save', authenticate, apiLimiter, controller.saveComplianceSelection);
router.post('/auto-create', authenticate, apiLimiter, controller.autoCreateCompliances);

module.exports = router;
