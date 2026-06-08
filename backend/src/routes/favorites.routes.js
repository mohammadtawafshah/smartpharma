const router = require('express').Router();
const ctrl   = require('../controllers/favorites.controller');
const { authenticate } = require('../middleware/auth');

router.get('/',     authenticate, ctrl.list);
router.post('/',    authenticate, ctrl.add);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;
