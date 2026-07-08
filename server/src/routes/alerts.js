const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);

router.get('/', apiLimiter, alertController.getAlerts);
router.get('/unread-count', apiLimiter, alertController.getUnreadCount);
router.patch('/:id/read', apiLimiter, alertController.markAsRead);
router.patch('/mark-all-read', apiLimiter, alertController.markAllAsRead);
router.post('/', authorize('admin'), apiLimiter, alertController.createAlert);
router.post('/generate-deadline-alerts', authorize('admin'), apiLimiter, alertController.generateDeadlineAlerts);

module.exports = router;
