const express = require('express');
const router = express.Router();
const controller = require('../controllers/sectorPdfController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

const adminRoles = authorize('admin', 'developer', 'superadmin');

router.use(authenticate);
router.use(apiLimiter);

router.get('/', controller.listPdfs);
router.post('/generate', adminRoles, controller.generateAllPdfs);
router.get('/personalized', controller.viewPersonalizedPdf);
router.get('/:id/download', controller.downloadPdf);
router.get('/:id', controller.viewPdf);

module.exports = router;
