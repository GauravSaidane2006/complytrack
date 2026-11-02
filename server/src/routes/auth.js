const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/authValidator');
const { registerLimiter, authLimiter, passwordResetLimiter } = require('../middleware/rateLimiters');

router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, passwordResetLimiter, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
