// ============================================================
// routes/tareaRoutes.js - Rutas de gestión de tareas
// Aplica middleware de seguridad antes de cada controlador
// ============================================================

const express           = require('express');
const router            = express.Router();
const TareaController   = require('../controllers/tareaController');
const { verificarSesion, verificarAdmin } = require('../middleware/authMiddleware');

// GET  /tareas/usuarios-disponibles → Usuarios sin tareas pendientes (solo admin)
router.get('/usuarios-disponibles',
  verificarSesion,
  verificarAdmin,
  TareaController.obtenerUsuariosDisponibles
);

// POST /tareas/crear → Crear y asignar una nueva tarea (solo admin)
router.post('/crear',
  verificarSesion,
  verificarAdmin,
  TareaController.crearTarea
);

// GET  /tareas/todas → Ver todas las tareas con su estado (solo admin)
router.get('/todas',
  verificarSesion,
  verificarAdmin,
  TareaController.obtenerTodas
);

// GET  /tareas/mis-tareas → Ver las tareas propias (cualquier usuario logueado)
router.get('/mis-tareas',
  verificarSesion,
  TareaController.obtenerMisTareas
);

// PUT  /tareas/estado/:id → Cambiar el estado de una tarea (solo admin)
router.put('/estado/:id',
  verificarSesion,
  verificarAdmin,
  TareaController.cambiarEstado
);

// DELETE /tareas/eliminar/:id → Eliminar una tarea (solo admin)
router.delete('/eliminar/:id',
  verificarSesion,
  verificarAdmin,
  TareaController.eliminarTarea
);

module.exports = router;
