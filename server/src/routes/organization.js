const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', organizationController.getOrganization);
router.put('/', authorize('admin'), organizationController.updateOrganization);
router.post('/refresh-health-score', authorize('admin'), organizationController.refreshHealthScore);

module.exports = router;
