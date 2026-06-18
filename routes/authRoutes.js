const express = require('express');
const { register, login } = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middlewares/validatorMiddleware');
const authLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

// Rutas de autenticación
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);

module.exports = router;
