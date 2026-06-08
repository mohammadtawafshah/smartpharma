const router = require('express').Router();
const ctrl   = require('../controllers/search.controller');
const { authenticate } = require('../middleware/auth');

// GET /api/search?q=aspirin&type=drug
// type is optional: 'drug' | 'herb' | 'condition' (default: all)
router.get('/', ctrl.search);

// Save search history — only when user is logged in
router.post('/history', authenticate, ctrl.saveHistory);
router.get('/history',  authenticate, ctrl.getHistory);

module.exports = router;
