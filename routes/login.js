const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

// Ruta para procesar el inicio de sesión
router.post('/login', AuthController.login);

module.exports = router;
