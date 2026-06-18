const { TareaModel } = require('../models/tareaModel');
const UsuarioModel = require('../models/usuarioModel');
const { formatMsToTime } = require('../utils/timeFormatter');

class TaskController {
  // Obtener tareas según el rol
  static async getTasks(req, res) {
    try {
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ error: 'No autorizado' });
      }

      let tasks = [];
      if (req.query.unassigned_extras === 'true') {
        tasks = await TareaModel.findUnassignedExtras();
      } else if (user.role === 'admin') {
        tasks = await TareaModel.findAll();
      } else {
        tasks = await TareaModel.findByCollaborator(user.id);
      }

      // Procesar y formatear la duración para cada tarea
      const processedTasks = tasks.map(task => {
        let liveDurationMs = Number(task.total_duration_ms) || 0;

        // Si la tarea está en progreso, calculamos el tiempo dinámico en tiempo real
        if (task.status === 'In Progress' && task.last_started_at) {
          const now = new Date();
          const lastStarted = new Date(task.last_started_at);
          const elapsed = now.getTime() - lastStarted.getTime();
          liveDurationMs += elapsed;
        }

        return {
          ...task,
          total_duration_ms: liveDurationMs,
          formatted_duration: formatMsToTime(liveDurationMs)
        };
      });

      return res.json(processedTasks);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener tareas' });
    }
  }

  // Crear una nueva tarea (Admin únicamente)
  static async createTask(req, res) {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
      }

      const { title, description, assigned_to, time_limit_minutes, is_extra, complexity } = req.body;
      if (!title || (!assigned_to && !is_extra)) {
        return res.status(400).json({ error: 'El título y el colaborador asignado son requeridos (a menos que sea tarea extra).' });
      }

      const taskId = await TareaModel.create({
        title,
        description,
        assigned_to: assigned_to ? assigned_to : null,
        time_limit_minutes,
        is_extra: !!is_extra,
        complexity
      });

      return res.status(201).json({ message: 'Tarea creada con éxito', taskId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al crear la tarea' });
    }
  }

  // Iniciar tarea
  static async startTask(req, res) {
    try {
      const { id } = req.params;
      await TareaModel.start(id);
      return res.json({ message: 'Tarea iniciada con éxito' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Pausar tarea
  static async pauseTask(req, res) {
    try {
      const { id } = req.params;
      await TareaModel.pause(id);
      return res.json({ message: 'Tarea pausada con éxito' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Finalizar tarea
  static async finalizeTask(req, res) {
    try {
      const { id } = req.params;
      await TareaModel.finalize(id);
      return res.json({ message: 'Tarea finalizada con éxito' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Rechazar tarea por calidad (Admin)
  static async rejectTask(req, res) {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      const { id } = req.params;
      await TareaModel.reject(id);
      return res.json({ message: 'Tarea rechazada y penalización aplicada' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Bloqueo global de tareas (Admin únicamente)
  static async toggleGlobalLock(req, res) {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      const { lock } = req.body;
      await TareaModel.toggleGlobalLock(lock);
      return res.json({ message: `Bloqueo global ${lock ? 'activado' : 'desactivado'} con éxito` });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al modificar el bloqueo global' });
    }
  }

  // Obtener todos los colaboradores (para formulario de asignación)
  static async getCollaborators(req, res) {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      const collaborators = await UsuarioModel.findAllColaboradores();
      return res.json(collaborators);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener colaboradores' });
    }
  }

  // Autoasignar tarea extra
  static async selfAssignTask(req, res) {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'colaborador') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      
      const { id } = req.params;
      await TareaModel.assignToUser(id, user.id);
      return res.json({ message: 'Tarea extra autoasignada con éxito' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = TaskController;
