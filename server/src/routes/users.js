const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);
router.get('/company-report', apiLimiter, userController.getCompanyReport);
router.get('/', authorize('superadmin', 'admin'), apiLimiter, userController.getUsers);
router.get('/:id', authorize('superadmin', 'admin'), apiLimiter, userController.getUser);
router.post('/', authorize('superadmin', 'admin'), apiLimiter, userController.createUser);
router.put('/:id', authorize('superadmin', 'admin'), apiLimiter, userController.updateUser);
router.delete('/:id', authorize('superadmin', 'admin'), apiLimiter, userController.deleteUser);

module.exports = router;
