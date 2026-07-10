const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.get('/:id/pdf', noticeController.viewPDF);
router.get('/:id/download', noticeController.downloadPDF);

router.use(authenticate);
router.use(apiLimiter);

router.get('/', noticeController.getNotices);
router.get('/:id', noticeController.getNotice);
router.patch('/:id/read', noticeController.markRead);
router.patch('/read-all', noticeController.markAllRead);
router.delete('/:id', noticeController.deleteNotice);

module.exports = router;
