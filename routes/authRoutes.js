// ============================================================
// routes/authRoutes.js - Rutas de autenticación
// Conecta las URLs con sus controladores correspondientes
// ============================================================

const express        = require('express');
const router         = express.Router();
const AuthController = require('../controllers/authController');
const { verificarSesion } = require('../middleware/authMiddleware');

// POST /auth/login  → Iniciar sesión (no requiere sesión previa)
router.post('/login',  AuthController.login);

// POST /auth/logout → Cerrar sesión (debe estar logueado)
router.post('/logout', verificarSesion, AuthController.logout);

// GET  /auth/me     → Obtener datos del usuario actual
router.get('/me', AuthController.me);

module.exports = router;
