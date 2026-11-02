const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/licenseController');

router.use(authenticate);

router.get('/status', ctrl.getStatus);
router.post('/activate', ctrl.activate);
router.post('/validate', ctrl.validate);
router.get('/all', ctrl.getAllLicenses);
router.post('/:id/revoke', ctrl.revoke);

module.exports = router;
