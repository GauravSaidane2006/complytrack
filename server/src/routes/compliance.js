const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createComplianceSchema, updateComplianceSchema, statusUpdateSchema } = require('../validators/complianceValidator');

router.use(authenticate);

router.get('/stats', complianceController.getComplianceStats);
router.get('/', complianceController.getComplianceItems);
router.get('/:id', complianceController.getComplianceItem);
router.post('/', validate(createComplianceSchema), complianceController.createComplianceItem);
router.put('/:id', validate(updateComplianceSchema), complianceController.updateComplianceItem);
router.delete('/:id', authorize('superadmin', 'admin'), complianceController.deleteComplianceItem);
router.patch('/:id/status', validate(statusUpdateSchema), complianceController.updateStatus);
router.post('/bulk-from-template', authorize('superadmin', 'admin'), complianceController.bulkCreateFromTemplate);

module.exports = router;
