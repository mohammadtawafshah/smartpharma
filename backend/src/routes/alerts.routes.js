const router = require('express').Router();
const ctrl   = require('../controllers/alerts.controller');
const { authenticate } = require('../middleware/auth');

// Get this user's saved alerts
router.get('/',        authenticate, ctrl.getUserAlerts);
router.patch('/:id/read', authenticate, ctrl.markRead);

// Check alerts for a specific drug/herb based on user health profile
router.post('/check',  authenticate, ctrl.checkAlerts);

module.exports = router;
