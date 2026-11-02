const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);
router.use(authorize('developer', 'superadmin'));

router.get('/stats', apiLimiter, developerController.getGlobalStats);
router.get('/organizations', apiLimiter, developerController.getAllOrganizations);
router.get('/organizations/:id', apiLimiter, developerController.getOrganizationDetails);
router.get('/compliance', apiLimiter, developerController.getAllComplianceItems);
router.get('/alerts', apiLimiter, developerController.getAllAlerts);
router.get('/pending-verifications', apiLimiter, developerController.getAllPendingVerifications);

module.exports = router;
