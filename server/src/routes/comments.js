const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.get('/:complianceId', authenticate, apiLimiter, commentController.getComments);
router.post('/:complianceId', authenticate, apiLimiter, commentController.createComment);
router.delete('/:id', authenticate, apiLimiter, commentController.deleteComment);

module.exports = router;
