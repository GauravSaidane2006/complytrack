const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter, searchLimiter } = require('../middleware/rateLimiters');

router.get('/', authenticate, apiLimiter, complianceController.getComplianceItems);
router.get('/stats', authenticate, apiLimiter, complianceController.getComplianceStats);
router.get('/:id', authenticate, apiLimiter, complianceController.getComplianceItem);
router.post('/', authenticate, apiLimiter, complianceController.createComplianceItem);
router.post('/bulk', authenticate, apiLimiter, complianceController.bulkCreateFromTemplate);
router.put('/:id', authenticate, apiLimiter, complianceController.updateComplianceItem);
router.delete('/:id', authenticate, apiLimiter, complianceController.deleteComplianceItem);
router.patch('/:id/status', authenticate, apiLimiter, complianceController.updateStatus);

module.exports = router;
