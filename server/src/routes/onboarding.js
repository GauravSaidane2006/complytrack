const express = require('express');
const router = express.Router();
const controller = require('../controllers/onboardingController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.get('/requirements', authenticate, apiLimiter, controller.getOnboardingRequirements);
router.get('/help', apiLimiter, controller.getDocumentHelp);
router.get('/help/:sector/:docType', apiLimiter, controller.getDocumentDetail);
router.get('/industries/:sector', apiLimiter, controller.getAvailableIndustries);

module.exports = router;
