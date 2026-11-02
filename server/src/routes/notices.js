const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);
router.use(apiLimiter);

const pdfRoles = authorize('admin', 'manager', 'developer', 'superadmin');

router.get('/', noticeController.getNotices);
router.get('/:id', noticeController.getNotice);
router.get('/:id/pdf', pdfRoles, noticeController.viewPDF);
router.get('/:id/download', pdfRoles, noticeController.downloadPDF);
router.patch('/:id/read', noticeController.markRead);
router.patch('/read-all', noticeController.markAllRead);
router.delete('/:id', authorize('admin', 'manager', 'developer', 'superadmin'), noticeController.deleteNotice);

module.exports = router;
