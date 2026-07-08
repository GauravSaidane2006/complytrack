const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);

router.get('/', apiLimiter, templateController.getTemplates);
router.get('/:id', apiLimiter, templateController.getTemplate);
router.post('/', authorize('superadmin', 'admin'), apiLimiter, templateController.createTemplate);
router.put('/:id', authorize('superadmin', 'admin'), apiLimiter, templateController.updateTemplate);
router.delete('/:id', authorize('superadmin', 'admin'), apiLimiter, templateController.deleteTemplate);
router.post('/seed', authorize('superadmin'), apiLimiter, templateController.seedTemplates);

module.exports = router;
