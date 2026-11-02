const express = require('express');
const router = express.Router();
const controller = require('../controllers/questionnaireController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);
router.use(apiLimiter);

router.get('/questions', controller.getQuestions);
router.post('/save', controller.saveAnswers);
router.get('/impact', controller.getImpact);

module.exports = router;
