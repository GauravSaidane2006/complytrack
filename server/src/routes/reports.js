const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');
const { reportLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);

router.get('/', reportLimiter, reportController.getReports);
router.get('/:id', reportLimiter, reportController.getReport);
router.post('/generate', authorize('admin', 'manager'), reportLimiter, reportController.generateReport);
router.get('/:id/download', reportLimiter, reportController.downloadReport);
router.delete('/:id', authorize('admin'), reportLimiter, reportController.deleteReport);

module.exports = router;
