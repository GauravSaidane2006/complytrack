const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);

router.get('/', apiLimiter, organizationController.getOrganization);
router.put('/', authorize('admin'), apiLimiter, organizationController.updateOrganization);
router.post('/refresh-health-score', authorize('admin'), apiLimiter, organizationController.refreshHealthScore);

module.exports = router;
