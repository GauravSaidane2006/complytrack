const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticate, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

router.use(authenticate);

router.get('/stats', apiLimiter, contractController.getContractStats);
router.get('/', apiLimiter, contractController.getContracts);
router.get('/:id', apiLimiter, contractController.getContract);
router.post('/', authorize('admin', 'manager', 'developer'), apiLimiter, contractController.createContract);
router.put('/:id', authorize('admin', 'manager', 'developer'), apiLimiter, contractController.updateContract);
router.delete('/:id', authorize('admin', 'developer'), apiLimiter, contractController.deleteContract);

module.exports = router;
