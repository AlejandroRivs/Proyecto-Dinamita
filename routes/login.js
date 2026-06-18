const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/session', AuthController.getSession);
const AuthController = require('../controllers/authController');

const router = express.Router();

// Ruta para procesar el inicio de sesión
router.post('/login', AuthController.login);

module.exports = router;
