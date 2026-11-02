const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter, searchLimiter } = require('../middleware/rateLimiters');
const upload = require('../middleware/upload');

router.get('/', authenticate, apiLimiter, complianceController.getComplianceItems);
router.get('/stats', authenticate, apiLimiter, complianceController.getComplianceStats);
router.get('/:id', authenticate, apiLimiter, complianceController.getComplianceItem);
router.post('/', authenticate, authorize('admin', 'developer', 'superadmin'), apiLimiter, complianceController.createComplianceItem);
router.post('/bulk', authenticate, authorize('admin', 'developer', 'superadmin'), apiLimiter, complianceController.bulkCreateFromTemplate);
router.put('/:id', authenticate, authorize('admin', 'developer', 'superadmin', 'manager', 'user'), apiLimiter, complianceController.updateComplianceItem);
router.delete('/:id', authenticate, authorize('admin', 'developer', 'superadmin', 'manager'), apiLimiter, complianceController.deleteComplianceItem);
router.patch('/:id/status', authenticate, authorize('admin', 'developer', 'superadmin', 'manager', 'user'), apiLimiter, complianceController.updateStatus);
router.patch('/:id/assign', authenticate, authorize('admin', 'manager'), apiLimiter, complianceController.assignUsers);
router.post('/bulk-assign', authenticate, authorize('admin', 'manager'), apiLimiter, complianceController.bulkAssignCompliance);
router.post('/:id/proof', authenticate, apiLimiter, upload.single('proof'), complianceController.uploadProof);

module.exports = router;
