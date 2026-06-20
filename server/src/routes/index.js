const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/compliance', require('./compliance'));
router.use('/templates', require('./templates'));
router.use('/reports', require('./reports'));
router.use('/alerts', require('./alerts'));
router.use('/dashboard', require('./dashboard'));
router.use('/risks', require('./risks'));
router.use('/contracts', require('./contracts'));
router.use('/organization', require('./organization'));

router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = router;
