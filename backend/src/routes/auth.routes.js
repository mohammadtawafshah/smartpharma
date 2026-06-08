const router     = require('express').Router();
const { body }   = require('express-validator');
const ctrl       = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', validateRegister, ctrl.register);
router.post('/login',    validateLogin,    ctrl.login);
router.get('/me',        authenticate,     ctrl.me);

module.exports = router;
