const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');
const { reportLimiter } = require('../middleware/rateLimiters');

const pdfRoles = authorize('admin', 'manager', 'developer', 'superadmin');

router.use(authenticate);
router.use(pdfRoles);

router.get('/', reportLimiter, reportController.getReports);
router.get('/:id', reportLimiter, reportController.getReport);
router.post('/generate', reportLimiter, reportController.generateReport);
router.get('/:id/download', reportLimiter, reportController.downloadReport);
router.delete('/:id', authorize('admin', 'developer'), reportLimiter, reportController.deleteReport);

module.exports = router;
