const express = require('express');
const router = express.Router();
const controller = require('../controllers/sectorPdfController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.get('/', authenticate, apiLimiter, controller.listPdfs);
router.post('/generate', authenticate, apiLimiter, controller.generateAllPdfs);
router.get('/personalized', authenticate, controller.viewPersonalizedPdf);
router.get('/:id/download', controller.downloadPdf);
router.get('/:id', controller.viewPdf);

module.exports = router;
