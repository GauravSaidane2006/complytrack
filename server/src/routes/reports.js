const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', reportController.getReports);
router.get('/:id', reportController.getReport);
router.post('/generate', authorize('admin', 'manager'), reportController.generateReport);
router.get('/:id/download', reportController.downloadReport);
router.delete('/:id', authorize('admin'), reportController.deleteReport);

module.exports = router;
