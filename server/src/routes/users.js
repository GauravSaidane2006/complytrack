const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('superadmin', 'admin'), userController.getUsers);
router.get('/:id', authorize('superadmin', 'admin'), userController.getUser);
router.post('/', authorize('superadmin', 'admin'), userController.createUser);
router.put('/:id', authorize('superadmin', 'admin'), userController.updateUser);
router.delete('/:id', authorize('superadmin', 'admin'), userController.deleteUser);

module.exports = router;
