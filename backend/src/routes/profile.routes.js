const router = require('express').Router();
const ctrl   = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth');

router.get('/',  authenticate, ctrl.getProfile);
router.put('/',  authenticate, ctrl.updateProfile);

module.exports = router;
