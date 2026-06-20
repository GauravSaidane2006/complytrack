const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', alertController.getAlerts);
router.get('/unread-count', alertController.getUnreadCount);
router.patch('/:id/read', alertController.markAsRead);
router.patch('/mark-all-read', alertController.markAllAsRead);
router.post('/', authorize('admin'), alertController.createAlert);
router.post('/generate-deadline-alerts', authorize('admin'), alertController.generateDeadlineAlerts);

module.exports = router;
