const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', contractController.getContractStats);
router.get('/', contractController.getContracts);
router.get('/:id', contractController.getContract);
router.post('/', authorize('admin', 'manager'), contractController.createContract);
router.put('/:id', authorize('admin', 'manager'), contractController.updateContract);
router.delete('/:id', authorize('admin'), contractController.deleteContract);

module.exports = router;
