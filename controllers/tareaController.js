// ============================================================
// controllers/tareaController.js - Lógica de negocio de tareas
// Valida datos, consulta modelos y responde al cliente
// ============================================================

const TareaModel    = require('../models/tareaModel');
const UsuarioModel  = require('../models/usuarioModel');

// Expresión regular: solo permite letras (con tildes), números y espacios
// Se usa para validar título y descripción de las tareas
const PATRON_TEXTO_VALIDO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .,\-\n]+$/;

const TareaController = {

  // GET /tareas/usuarios-disponibles
  // Devuelve la lista de usuarios que no tienen tareas pendientes
  async obtenerUsuariosDisponibles(req, res) {
    try {
      const usuariosDisponibles = await UsuarioModel.obtenerUsuariosDisponibles();
      res.json({ exito: true, usuarios: usuariosDisponibles });
    } catch (error) {
      console.error('Error al obtener usuarios disponibles:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al obtener usuarios disponibles' });
    }
  },

  // POST /tareas/crear - Crear y asignar una nueva tarea
  // Solo el admin puede llegar aquí (el middleware lo garantiza)
  async crearTarea(req, res) {
    const { titulo, descripcion, tiempoSugerido, usuarioAsignadoId } = req.body;
    const adminId = req.session.usuario.id; // ID del admin que crea la tarea

    // ── Validación 1: Campos requeridos ──────────────────────
    if (!titulo || !descripcion || !tiempoSugerido || !usuarioAsignadoId) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'Todos los campos son obligatorios'
      });
    }

    // ── Validación 2: Formato de texto (solo letras y números) ──
    if (!PATRON_TEXTO_VALIDO.test(titulo.trim())) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El título solo puede contener letras, números y espacios'
      });
    }

    if (!PATRON_TEXTO_VALIDO.test(descripcion.trim())) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'La descripción solo puede contener letras, números y espacios'
      });
    }

    // ── Validación 3: Longitudes mínimas y máximas ───────────
    if (titulo.trim().length < 3 || titulo.trim().length > 200) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El título debe tener entre 3 y 200 caracteres'
      });
    }

    if (descripcion.trim().length < 10) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'La descripción debe tener al menos 10 caracteres'
      });
    }

    // ── Validación 4: Verificar que el usuario asignado existe ──
    const usuarioDestino = await UsuarioModel.buscarPorId(usuarioAsignadoId);
    if (!usuarioDestino || usuarioDestino.rol === 'admin') {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El usuario seleccionado no es válido'
      });
    }

    // ── Validación 5: Verificar que el usuario no tiene tareas pendientes ──
    const usuariosDisponibles = await UsuarioModel.obtenerUsuariosDisponibles();
    const estaDisponible = usuariosDisponibles.some(u => u.id === parseInt(usuarioAsignadoId));

    if (!estaDisponible) {
      return res.status(400).json({
        exito:   false,
        mensaje: `${usuarioDestino.nombre} ya tiene una tarea pendiente asignada`
      });
    }

    try {
      // Todas las validaciones pasaron: crear la tarea en la BD
      const nuevaTareaId = await TareaModel.crear({
        titulo:           titulo.trim(),
        descripcion:      descripcion.trim(),
        tiempoSugerido:   tiempoSugerido.trim(),
        usuarioAsignadoId: parseInt(usuarioAsignadoId),
        creadoPorId:       adminId
      });

      return res.status(201).json({
        exito:   true,
        mensaje: `Tarea asignada correctamente a ${usuarioDestino.nombre}`,
        tareaId: nuevaTareaId
      });

    } catch (error) {
      console.error('Error al crear tarea:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error al guardar la tarea' });
    }
  },

  // GET /tareas/todas - Lista todas las tareas (solo admin)
  async obtenerTodas(req, res) {
    try {
      const listaTareas = await TareaModel.obtenerTodas();
      res.json({ exito: true, tareas: listaTareas });
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al obtener las tareas' });
    }
  },

  // GET /tareas/mis-tareas - Lista las tareas del usuario logueado
  async obtenerMisTareas(req, res) {
    try {
      const usuarioId    = req.session.usuario.id;
      const misTareas    = await TareaModel.obtenerPorUsuario(usuarioId);
      res.json({ exito: true, tareas: misTareas });
    } catch (error) {
      console.error('Error al obtener mis tareas:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al obtener tus tareas' });
    }
  },

  // PUT /tareas/estado/:id - Cambiar el estado de una tarea
  // El admin puede cambiar a cualquier estado; el flujo es:
  // pendiente → en_revision → completada
  async cambiarEstado(req, res) {
    const tareaId     = parseInt(req.params.id);
    const { nuevoEstado } = req.body;

    // Lista de estados permitidos
    const estadosValidos = ['pendiente', 'en_revision', 'completada'];

    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({
        exito:   false,
        mensaje: `Estado no válido. Los estados permitidos son: ${estadosValidos.join(', ')}`
      });
    }

    // Verificar que la tarea existe antes de actualizarla
    const tareaExistente = await TareaModel.buscarPorId(tareaId);
    if (!tareaExistente) {
      return res.status(404).json({
        exito:   false,
        mensaje: 'La tarea no fue encontrada'
      });
    }

    try {
      await TareaModel.actualizarEstado(tareaId, nuevoEstado);
      res.json({
        exito:   true,
        mensaje: `Estado de la tarea actualizado a "${nuevoEstado}"`
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al actualizar el estado' });
    }
  },

  // DELETE /tareas/eliminar/:id - Eliminar una tarea (solo admin)
  async eliminarTarea(req, res) {
    const tareaId = parseInt(req.params.id);

    const tareaExistente = await TareaModel.buscarPorId(tareaId);
    if (!tareaExistente) {
      return res.status(404).json({
        exito:   false,
        mensaje: 'La tarea no fue encontrada'
      });
    }

    try {
      await TareaModel.eliminar(tareaId);
      res.json({ exito: true, mensaje: 'Tarea eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      res.status(500).json({ exito: false, mensaje: 'Error al eliminar la tarea' });
    }
  }

};

module.exports = TareaController;
