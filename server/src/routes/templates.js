const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplate);
router.post('/', authorize('superadmin', 'admin'), templateController.createTemplate);
router.put('/:id', authorize('superadmin', 'admin'), templateController.updateTemplate);
router.delete('/:id', authorize('superadmin', 'admin'), templateController.deleteTemplate);
router.post('/seed', authorize('superadmin'), templateController.seedTemplates);

module.exports = router;
