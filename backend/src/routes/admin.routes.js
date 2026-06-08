const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/dashboard', ctrl.dashboard);
router.get('/reports',   ctrl.reports);
router.get('/users',     ctrl.listUsers);
router.patch('/users/:id/role', ctrl.setUserRole);

// Alert rules management
router.get('/alert-rules',         ctrl.listAlertRules);
router.post('/alert-rules',        ctrl.createAlertRule);
router.put('/alert-rules/:id',     ctrl.updateAlertRule);
router.delete('/alert-rules/:id',  ctrl.deleteAlertRule);

// Interactions management
router.get('/interactions',          ctrl.listInteractions);
router.post('/interactions',         ctrl.createInteraction);
router.put('/interactions/:id',      ctrl.updateInteraction);
router.delete('/interactions/:id',   ctrl.deleteInteraction);

module.exports = router;
